import type { ContentPage as BaseContentPage } from "../../types";

export interface SeoMetadata {
  meta_title: string | null;
  meta_description: string | null;
}

export interface WithSeoMetadata {
  seo_metadata?: SeoMetadata | null;
}

export type ContentPage = BaseContentPage & WithSeoMetadata;
