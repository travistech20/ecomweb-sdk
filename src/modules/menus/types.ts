export type StoreMenuItem = {
  id: number;
  menu_id: number;
  parent_id?: number | null;
  label: string;
  entity_type?: string | null;
  entity_id?: string | null;
  entity_slug?: string | null;
  custom_url?: string | null;
  target?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  children?: StoreMenuItem[];
};

export type StoreMenu = {
  id: number;
  store_id: number;
  name: string;
  ref: string;
  created_at?: string;
  updated_at?: string;
  menu_items?: StoreMenuItem[];
};
