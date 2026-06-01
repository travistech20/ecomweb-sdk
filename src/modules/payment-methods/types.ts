export interface BankAccount {
  id: number;
  store_id: number;
  label: string;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  qr_payload?: string | null;
  is_active: boolean;
}

export interface PaymentMethod {
  id: number;
  store_id: number;
  payment_method: string;
  display_name: string;
  description?: string | null;
  is_enabled: boolean;
  sort_order: number;
  settings?: any;
  bank_accounts?: BankAccount[];
}
