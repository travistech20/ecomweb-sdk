export interface Address {
  id: number;
  customer_id: number;
  label?: string;
  recipient_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  ward: string;
  ward_name?: string;
  district?: string;
  city?: string;
  province: string;
  province_name?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressDto {
  label?: string;
  recipient_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  ward: string;
  district?: string;
  city?: string;
  province: string;
  postal_code?: string;
  country: string;
  is_default?: boolean;
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> {}
