export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export type InvoiceStatus = "paid" | "unpaid";

export interface Invoice {
  id: string;
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  total: number;
  status: InvoiceStatus;
  createdAt: string;
}