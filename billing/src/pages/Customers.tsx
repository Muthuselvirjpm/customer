import { useState } from "react";
import CustomerForm from "../components/CustomerForm";
import CustomerList from "../components/CustomerList";

interface CustomersProps {
  onCreateInvoice: (
    customerId: string
  ) => void;
}

export default function Customers({
  onCreateInvoice,
}: CustomersProps) {
  const [refreshKey, setRefreshKey] =
    useState(0);

  const [showForm, setShowForm] =
    useState(false);

  const handleSaved = () => {
    setRefreshKey((value) => value + 1);
    setShowForm(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>
            Manage your customer information.
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
            : "+ Create Customer"}
        </button>
      </div>

      {showForm && (
        <CustomerForm
          onSaved={handleSaved}
        />
      )}

      <CustomerList
        refreshKey={refreshKey}
        onCreateInvoice={onCreateInvoice}
      />
    </div>
  );
}