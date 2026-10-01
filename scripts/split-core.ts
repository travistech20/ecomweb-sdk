/** SDK-internal import graph: file → files it imports (repo-relative). */
export type ImportGraph = Record<string, string[]>;

export interface SplitInput {
  graph: ImportGraph;
  /** SDK files declaring something the storefront imports. */
  storefrontFiles: string[];
  /** SDK files declaring something the dashboard imports. */
  dashboardFiles: string[];
}

export interface Split {
  public: string[];
  contract: string[];
  unused: string[];
}

function closure(graph: ImportGraph, seeds: Iterable<string>, skip: Set<string>): Set<string> {
  const seen = new Set<string>();
  const stack = [...seeds];
  while (stack.length) {
    const file = stack.pop()!;
    if (seen.has(file) || skip.has(file)) continue;
    seen.add(file);
    stack.push(...(graph[file] ?? []));
  }
  return seen;
}

/**
 * Spec B2 §4.1: public = what the storefront imports plus everything those
 * files import; contract = what only the dashboard reaches; unused = the rest.
 */
export function computeSplit({ graph, storefrontFiles, dashboardFiles }: SplitInput): Split {
  const pub = closure(graph, storefrontFiles, new Set());
  const contract = closure(graph, dashboardFiles, pub);
  const all = new Set([...Object.keys(graph), ...Object.values(graph).flat()]);
  const unused = [...all].filter(f => !pub.has(f) && !contract.has(f));
  return {
    public: [...pub].sort(),
    contract: [...contract].sort(),
    unused: unused.sort(),
  };
}

/**
 * Files neither app imports: client code (src/core, src/modules) stays in the
 * public SDK; unused schemas (src/types) follow the spec's "otherwise
 * contract" rule.
 */
export function assignUnused(split: Split): { public: string[]; contract: string[] } {
  const isSchema = (f: string) => f.startsWith("src/types/");
  return {
    public: [...split.public, ...split.unused.filter(f => !isSchema(f))].sort(),
    contract: [...split.contract, ...split.unused.filter(isSchema)].sort(),
  };
}
