export interface Address {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  billingAddress: Address;
  shippingAddress: Address;
  createdAt: string;
}