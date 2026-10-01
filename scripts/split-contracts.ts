/**
 * Spec B2 §4.1: split this package into the public SDK (what the storefront
 * needs) and private admin contracts (what only the dashboard needs).
 *
 *   pnpm tsx scripts/split-contracts.ts [--storefront ../ecomweb-storefront] [--dashboard ../ecomweb-dashboard]
 *
 * Prints the lists and writes the final assignment to
 * scripts/split-contracts.out.json.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { Project, type SourceFile } from "ts-morph";
import { assignUnused, computeSplit, type ImportGraph } from "./split-core";

const ROOT = path.resolve(__dirname, "..");
const BARRELS = new Set(["src/index.ts", "src/types/index.ts"]);

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return path.resolve(i > 0 ? process.argv[i + 1] : path.join(ROOT, fallback));
}

const rel = (sf: SourceFile) => path.relative(ROOT, sf.getFilePath());
const isSdkSource = (file: string) => file.startsWith("src/") && !/\.(spec|test)\.ts$/.test(file);

const sdk = new Project({ tsConfigFilePath: path.join(ROOT, "tsconfig.json") });

// Files that declare `name`, following re-exports (an import through the
// ../../types barrel depends on the file declaring the name, not the barrel).
function declaringFiles(sf: SourceFile, name: string): string[] {
  const decls = sf.getExportedDeclarations().get(name) ?? [];
  return decls.map(d => rel(d.getSourceFile()));
}

const graph: ImportGraph = {};
for (const sf of sdk.getSourceFiles()) {
  const file = rel(sf);
  if (!isSdkSource(file)) continue;
  const deps = new Set<string>();
  const add = (target: SourceFile | undefined, names: string[]) => {
    if (!target || !isSdkSource(rel(target))) return;
    if (!BARRELS.has(rel(target))) return void deps.add(rel(target));
    for (const n of names) for (const f of declaringFiles(target, n)) deps.add(f);
  };
  for (const imp of sf.getImportDeclarations()) {
    add(imp.getModuleSpecifierSourceFile(), imp.getNamedImports().map(n => n.getName()));
  }
  // A barrel's re-exports aren't dependencies; its own imports are
  // (src/index.ts declares createEcomwebSdk, which uses every API class).
  if (!BARRELS.has(file)) {
    for (const exp of sf.getExportDeclarations()) {
      add(exp.getModuleSpecifierSourceFile(), exp.getNamedExports().map(n => n.getName()));
    }
  }
  graph[file] = [...deps].filter(f => f !== file);
}

const exported = sdk.getSourceFileOrThrow(path.join(ROOT, "src/index.ts")).getExportedDeclarations();

function filesImportedBy(appRoot: string, dirs: string[]): string[] {
  const app = new Project({ skipAddingFilesFromTsConfig: true, skipFileDependencyResolution: true });
  for (const dir of dirs) app.addSourceFilesAtPaths(path.join(appRoot, dir, "**/*.{ts,tsx}"));
  const files = new Set<string>();
  const missing = new Set<string>();
  for (const sf of app.getSourceFiles()) {
    if (sf.getFilePath().includes("/node_modules/")) continue;
    for (const imp of sf.getImportDeclarations()) {
      if (imp.getModuleSpecifierValue() !== "@ecomweb/sdk") continue;
      for (const named of imp.getNamedImports()) {
        const name = named.getName();
        const decls = exported.get(name);
        if (!decls?.length) missing.add(name);
        for (const d of decls ?? []) files.add(rel(d.getSourceFile()));
      }
    }
  }
  if (missing.size) console.warn(`${appRoot}: not exported by the SDK: ${[...missing].join(", ")}`);
  return [...files];
}

const storefront = arg("storefront", "../ecomweb-storefront");
const dashboard = arg("dashboard", "../ecomweb-dashboard");
const split = computeSplit({
  graph,
  storefrontFiles: filesImportedBy(storefront, ["app", "components", "lib", "hooks", "contexts", "scripts", "packages"]),
  dashboardFiles: filesImportedBy(dashboard, ["app", "components", "lib", "hooks"]),
});

// Barrels are rewritten by hand in both packages, not moved.
for (const list of Object.values(split)) {
  for (const barrel of BARRELS) if (list.includes(barrel)) list.splice(list.indexOf(barrel), 1);
}

for (const [label, files] of Object.entries(split)) {
  console.log(`\n${label.toUpperCase()} (${files.length})`);
  for (const f of files) console.log(`  ${f}`);
}
const final = assignUnused(split);
console.log(`\nFINAL: ${final.public.length} public, ${final.contract.length} contract`);
writeFileSync(path.join(__dirname, "split-contracts.out.json"), JSON.stringify(final, null, 2) + "\n");
