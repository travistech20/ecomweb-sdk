import { stringify } from "../../core/stringify";
import type { IHttpClient } from "../../core/types";
import { unwrap, unwrapOrNull } from "../../core/response";
import type { PaginatedResponse } from "../../types";
import type {
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogPostQueryParams,
  BlogCategoryQueryParams,
  BlogTagQueryParams,
} from "./types";

export class BlogApi {
  constructor(
    private publicHttp: IHttpClient,
    private authHttp: IHttpClient
  ) {}

  async getPosts(
    storeRef: string,
    query: Partial<BlogPostQueryParams> = {}
  ): Promise<PaginatedResponse<BlogPost>> {
    const qsStr = stringify(query);
    const res = await this.publicHttp.get<PaginatedResponse<BlogPost>>(
      `/public/stores/${storeRef}/blog/posts${qsStr ? "?" + qsStr : ""}`
    );
    return unwrap(res);
  }

  async getPostBySlug(
    storeRef: string,
    slug: string,
    options: {
      incrementView?: boolean;
      include_seo_metadata?: boolean;
      include_products?: boolean;
    } = {}
  ): Promise<BlogPost | null> {
    const query = stringify({
      increment_view: options.incrementView,
      include_seo_metadata: options.include_seo_metadata,
      include_products: options.include_products,
    });
    const res = await this.publicHttp.get<BlogPost>(
      `/public/stores/${storeRef}/blog/posts/slug/${encodeURIComponent(slug)}${query ? `?${query}` : ""}`
    );
    return unwrapOrNull(res);
  }

  async getCategories(
    storeRef: string,
    query: BlogCategoryQueryParams = {}
  ): Promise<PaginatedResponse<BlogCategory>> {
    const qsStr = stringify(query);
    const res = await this.publicHttp.get<PaginatedResponse<BlogCategory>>(
      `/public/stores/${storeRef}/blog/categories${qsStr ? "?" + qsStr : ""}`
    );
    return unwrap(res);
  }

  async getTags(
    storeRef: string,
    query: BlogTagQueryParams = {}
  ): Promise<PaginatedResponse<BlogTag>> {
    const qsStr = stringify(query);
    const res = await this.publicHttp.get<PaginatedResponse<BlogTag>>(
      `/public/stores/${storeRef}/blog/tags${qsStr ? "?" + qsStr : ""}`
    );
    return unwrap(res);
  }

  async getPostComments(storeRef: string, postId: number): Promise<any[]> {
    const res = await this.publicHttp.get<any[]>(
      `/public/stores/${storeRef}/blog/posts/${postId}/comments`
    );
    return unwrap(res);
  }

  async getPostCommentsAuth(storeRef: string, postId: number): Promise<any[]> {
    const res = await this.authHttp.get<any[]>(
      `/public/stores/${storeRef}/blog/posts/${postId}/comments`
    );
    return unwrap(res);
  }

  async submitComment(
    storeRef: string,
    postId: number,
    data: {
      author_name: string;
      content: string;
      author_website?: string;
      parent_comment_id?: number;
    }
  ): Promise<any> {
    const res = await this.authHttp.post<any>(
      `/public/stores/${storeRef}/blog/posts/${postId}/comments`,
      data
    );
    return unwrap(res);
  }
}
