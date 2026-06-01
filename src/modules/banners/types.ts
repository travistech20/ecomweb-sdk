import type { Banner, BaseQueryParams } from "../../types";

export type { Banner };

export interface BannerQueryParams extends BaseQueryParams {
  is_active?: boolean;
  title?: string;
  sort?:
    | "id"
    | "position"
    | "title"
    | "created_at"
    | "updated_at"
    | "is_active";
}
