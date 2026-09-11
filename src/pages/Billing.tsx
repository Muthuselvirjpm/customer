import { useEffect, useState } from "react";

import InvoiceForm from "../components/InvoiceForm";
import InvoiceList from "../components/InvoiceList";

import {
  getCustomers,
} from "../db/localforage";

import type { Customer } from "../types/customer";

interface BillingProps {
  selectedCustomerId?: string;
}

export default function Billing({
  selectedCustomerId,
}: BillingProps) {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState(selectedCustomerId || "");

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [showForm, setShowForm] =
    useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      const data = await getCustomers();

      setCustomers(data);

      if (
        selectedCustomerId &&
        data.some(
          (customer) =>
            customer.id ===
            selectedCustomerId
        )
      ) {
        setSelectedCustomer(
          selectedCustomerId
        );
      }
    };

    loadCustomers();
  }, [selectedCustomerId]);

  const handleInvoiceSaved = () => {
    setRefreshKey((value) => value + 1);
    setShowForm(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Billing</h1>
          <p>
            Create invoices and view customer
            billing history.
          </p>
        </div>

        <button
          className="primary"
          onClick={() =>
            setShowForm(!showForm)
          }
        >
          {showForm
            ? "Close Form"
            : "+ Create Invoice"}
        </button>
      </div>

      <div className="card">
        <div className="form-group">
          <label>
            Select Customer
          </label>

          <select
            value={selectedCustomer}
            onChange={(e) =>
              setSelectedCustomer(
                e.target.value
              )
            }
          >
            <option value="">
              Select a customer
            </option>

            {customers.map((customer) => (
              <option
                key={customer.id}
                value={customer.id}
              >
                {customer.name} -{" "}
                {customer.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <InvoiceForm
          customers={customers}
          selectedCustomerId={
            selectedCustomer
          }
          onSaved={handleInvoiceSaved}
        />
      )}

      {selectedCustomer && (
        <InvoiceList
          customerId={selectedCustomer}
          refreshKey={refreshKey}
        />
      )}
    </div>
  );
}