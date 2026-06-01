import type { Category, BaseQueryParams } from "../../types";

export interface CategoryQueryParams extends BaseQueryParams {
  name?: string;
  is_active?: boolean;
  parent_id?: number | null;
}

export type { Category };
