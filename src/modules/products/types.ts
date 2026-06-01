import type {
  Product,
  ProductWithVariants,
  ProductVariant,
  VariantOption,
  VariantOptionValue,
  Category,
  ProductImage,
  ProductVideo,
  ProductReviewStats,
  PromotionWithDiscount,
} from "../../types";

export interface SeoMetadata {
  meta_title: string | null;
  meta_description: string | null;
}

export interface WithSeoMetadata {
  seo_metadata?: SeoMetadata | null;
}

export interface PromotionData extends PromotionWithDiscount {
  final_price?: number;
  min_final_price?: number;
  max_final_price?: number;
}

export interface ProductService {
  id: number;
  store_id: number;
  name: string;
  description?: string | null;
  icon_url?: string | null;
  redirection_url?: string | null;
  sort_index?: number | null;
  assigned_at?: string;
}

export interface ProductAttribute {
  id: number;
  product_id: number;
  group?: string | null;
  name: string;
  value: string;
  sort_index?: number | null;
}

export interface ProductQueryParams {
  include_category?: boolean;
  include_variants?: boolean;
  include_inventory?: boolean;
  include_combinations?: boolean;
  include_promotion?: boolean;
  include_review_stats?: boolean;
  include_services?: boolean;
  include_attributes?: boolean;
  include_seo_metadata?: boolean;
  include_videos?: boolean;
}

export type ProductDetail = Product & {
  variants: (ProductVariant & {
    combinations: Array<{
      option: VariantOption;
      value: VariantOptionValue;
    }>;
    promotions?: PromotionData[];
    promotion_price?: number;
  })[];
} & {
  categories: Category[];
  promotions?: PromotionData[];
  min_promotion_price?: number;
  max_promotion_price?: number;
  review_stats?: ProductReviewStats | null;
  services?: ProductService[];
  attributes?: ProductAttribute[];
} & WithSeoMetadata;

export type {
  Product,
  ProductWithVariants,
  ProductVariant,
  VariantOption,
  VariantOptionValue,
  ProductImage,
  ProductVideo,
};
