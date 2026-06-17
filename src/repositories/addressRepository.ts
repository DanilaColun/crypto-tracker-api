export interface Address {
  id: number;
  chain: string;
  address: string;
}

export interface NewAddress {
  chain: string;
  address: string;
}

export interface AddressRepository {
  findAll(): Promise<Address[]>;
  findById(id: number): Promise<Address | null>;
  create(address: NewAddress): Promise<Address>;
  update(id: number, address: NewAddress): Promise<Address | null>;
  remove(id: number): Promise<boolean>;
  exists(chain: string, address: string): Promise<boolean>;
}
