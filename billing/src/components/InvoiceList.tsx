import { useEffect, useState } from "react";
import {
  getInvoicesByCustomer,
} from "../db/localforage";

import type { Invoice } from "../types/invoice";

interface InvoiceListProps {
  customerId: string;
  refreshKey: number;
}

export default function InvoiceList({
  customerId,
  refreshKey,
}: InvoiceListProps) {
  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true);

      const data =
        await getInvoicesByCustomer(
          customerId
        );

      setInvoices(data);

      setLoading(false);
    };

    loadInvoices();
  }, [customerId, refreshKey]);

  if (loading) {
    return (
      <div className="card">
        Loading invoices...
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Customer Invoices</h2>

      {invoices.length === 0 ? (
        <div className="empty">
          No invoices found for this customer.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.id}</td>

                  <td>
                    {formatDate(
                      invoice.invoiceDate
                    )}
                  </td>

                  <td>
                    {formatDate(
                      invoice.dueDate
                    )}
                  </td>

                  <td>
                    ₹
                    {invoice.total.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </td>

                  <td>
                    <span
                      className={
                        invoice.status === "paid"
                          ? "badge paid"
                          : "badge unpaid"
                      }
                    >
                      {invoice.status === "paid"
                        ? "Paid"
                        : "Unpaid"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatDate(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-IN");
}