import localforage from "localforage";
import type { Customer } from "../types/customer";
import type { Invoice } from "../types/invoice";

const customerStore = localforage.createInstance({
  name: "customer-billing-app",
  storeName: "customers",
});

const invoiceStore = localforage.createInstance({
  name: "customer-billing-app",
  storeName: "invoices",
});

// --------------------
// Customer Functions
// --------------------

export const saveCustomer = async (
  customer: Customer
): Promise<Customer> => {
  await customerStore.setItem(customer.id, customer);
  return customer;
};

export const getCustomers = async (): Promise<Customer[]> => {
  const customers: Customer[] = [];

  await customerStore.iterate<Customer, void>((customer) => {
    customers.push(customer);
  });

  return customers;
};

export const getCustomerById = async (
  id: string
): Promise<Customer | null> => {
  const customer = await customerStore.getItem<Customer>(id);
  return customer;
};

export const emailExists = async (
  email: string,
  excludeCustomerId?: string
): Promise<boolean> => {
  const customers = await getCustomers();

  return customers.some(
    (customer) =>
      customer.email.toLowerCase() === email.toLowerCase() &&
      customer.id !== excludeCustomerId
  );
};

// --------------------
// Invoice Functions
// --------------------

export const saveInvoice = async (
  invoice: Invoice
): Promise<Invoice> => {
  await invoiceStore.setItem(invoice.id, invoice);
  return invoice;
};

export const getInvoices = async (): Promise<Invoice[]> => {
  const invoices: Invoice[] = [];

  await invoiceStore.iterate<Invoice, void>((invoice) => {
    invoices.push(invoice);
  });

  return invoices;
};

export const getInvoicesByCustomer = async (
  customerId: string
): Promise<Invoice[]> => {
  const invoices = await getInvoices();

  return invoices
    .filter((invoice) => invoice.customerId === customerId)
    .sort(
      (a, b) =>
        new Date(b.invoiceDate).getTime() -
        new Date(a.invoiceDate).getTime()
    );
};