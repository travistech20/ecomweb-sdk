export interface UrlRedirect {
  id: string;
  store_id: number;
  source_path: string;
  destination_path: string;
  redirect_type: number;
  is_active: boolean;
  source_type: string;
  created_at: string;
  updated_at: string;
}
