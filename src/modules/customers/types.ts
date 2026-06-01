export interface Customer {
  id: number;
  store_id: number;
  email: string;
  name: string;
  phone?: string | null;
  avatar_url?: string | null;
  user_id?: string | null;
  status: "active" | "inactive";
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  first_order_date?: string;
  last_order_date?: string;
  total_orders?: number;
  total_spent?: number;
  avg_order_value?: number;
}

export interface UpsertCustomerForAuthPayload {
  email: string;
  name: string;
  phone?: string | null;
  avatar_url?: string | null;
}
