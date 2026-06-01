import type { IHttpClient } from "../../core/types";
import { unwrapOrNull } from "../../core/response";
import type { Address, CreateAddressDto, UpdateAddressDto } from "./types";

export class AddressesApi {
  constructor(private http: IHttpClient) {}

  async list(storeRef: string): Promise<Address[] | null> {
    const res = await this.http.get<Address[]>(
      `/tenant/stores/${storeRef}/customers/address`
    );
    return unwrapOrNull(res);
  }

  async getById(storeRef: string, addressId: number): Promise<Address | null> {
    const res = await this.http.get<Address>(
      `/tenant/stores/${storeRef}/customers/address/${addressId}`
    );
    return unwrapOrNull(res);
  }

  async create(
    storeRef: string,
    data: CreateAddressDto
  ): Promise<Address | null> {
    const res = await this.http.post<Address>(
      `/tenant/stores/${storeRef}/customers/address`,
      data
    );
    return unwrapOrNull(res);
  }

  async update(
    storeRef: string,
    addressId: number,
    data: UpdateAddressDto
  ): Promise<Address | null> {
    const res = await this.http.patch<Address>(
      `/tenant/stores/${storeRef}/customers/address/${addressId}`,
      data
    );
    return unwrapOrNull(res);
  }

  async delete(storeRef: string, addressId: number): Promise<boolean> {
    const res = await this.http.delete(
      `/tenant/stores/${storeRef}/customers/address/${addressId}`
    );
    return res.success;
  }

  async setDefault(
    storeRef: string,
    addressId: number
  ): Promise<Address | null> {
    const res = await this.http.patch<Address>(
      `/tenant/stores/${storeRef}/customers/address/${addressId}/set-default`
    );
    return unwrapOrNull(res);
  }
}
