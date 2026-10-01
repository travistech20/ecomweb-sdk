import { describe, expect, it } from "vitest";
import { assignUnused, computeSplit } from "./split-core";

describe("computeSplit", () => {
  const graph = {
    "src/a.ts": ["src/b.ts"],
    "src/b.ts": [],
    "src/c.ts": ["src/b.ts"],
    "src/d.ts": ["src/c.ts"],
    "src/unused.ts": [],
  };

  it("makes storefront-used files and their imports public, dashboard-only files contracts", () => {
    const split = computeSplit({
      graph,
      storefrontFiles: ["src/a.ts"],
      dashboardFiles: ["src/a.ts", "src/c.ts"],
    });
    expect(split.public).toEqual(["src/a.ts", "src/b.ts"]);
    expect(split.contract).toEqual(["src/c.ts"]);
    expect(split.unused).toEqual(["src/d.ts", "src/unused.ts"]);
  });

  it("keeps a dashboard-only file public when a public file imports it", () => {
    const split = computeSplit({
      graph: { ...graph, "src/a.ts": ["src/b.ts", "src/c.ts"] },
      storefrontFiles: ["src/a.ts"],
      dashboardFiles: ["src/c.ts"],
    });
    expect(split.public).toEqual(["src/a.ts", "src/b.ts", "src/c.ts"]);
    expect(split.contract).toEqual([]);
  });

  it("pulls a contract file's dependencies that are not public into contracts", () => {
    const split = computeSplit({
      graph: { "src/c.ts": ["src/e.ts"], "src/e.ts": [], "src/a.ts": [] },
      storefrontFiles: ["src/a.ts"],
      dashboardFiles: ["src/c.ts"],
    });
    expect(split.contract).toEqual(["src/c.ts", "src/e.ts"]);
  });
});

describe("assignUnused", () => {
  it("keeps unused client code public and moves unused schemas to contracts", () => {
    expect(
      assignUnused({
        public: ["src/a.ts"],
        contract: ["src/types/c.ts"],
        unused: ["src/modules/auth/token-storage.ts", "src/core/stringify.ts", "src/types/user.ts"],
      })
    ).toEqual({
      public: ["src/a.ts", "src/core/stringify.ts", "src/modules/auth/token-storage.ts"],
      contract: ["src/types/c.ts", "src/types/user.ts"],
    });
  });
});
