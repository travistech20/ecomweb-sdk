import { describe, expect, it } from "vitest";

import type { IHttpClient } from "../../core/types";
import { SearchApi } from "./api";

function recordingHttp() {
  const urls: string[] = [];
  const http = {
    async get(url: string) {
      urls.push(url);
      return { success: true, data: {} };
    },
  } as unknown as IHttpClient;
  return { http, urls };
}

describe("SearchApi", () => {
  it("calls the storefront search routes under public/stores/:storeRef", async () => {
    const { http, urls } = recordingHttp();
    const api = new SearchApi(http);

    await api.searchCatalog("abc12345", {} as never);
    await api.autocompleteCatalog("abc12345", { q: "ao" } as never);
    await api.searchBlog("abc12345", {} as never);

    expect(urls).toEqual([
      "/public/stores/abc12345/search/catalog",
      "/public/stores/abc12345/search/catalog/autocomplete?q=ao",
      "/public/stores/abc12345/search/blog",
    ]);
  });
});
