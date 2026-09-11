import { useState } from "react";
import "./App.css";

type InvoiceItem = {
  name: string;
  price: number;
  taxRate: number;
};

type Invoice = {
  id: string;
  customer: string;
  date: string;
  dueDate: string;
  total: number;
  status: "Unpaid" | "Paid";
};

const initialInvoices: Invoice[] = [
  {
    id: "INV-001",
    customer: "Globex Inc",
    date: "21/06/2025",
    dueDate: "28/06/2025",
    total: 529.5,
    status: "Unpaid",
  },
];

function App() {
  const [customer, setCustomer] = useState("Globex Inc");
  const [invoiceDate, setInvoiceDate] = useState("21-06-2025");
  const [dueDate, setDueDate] = useState("28-06-2025");

  const [item, setItem] = useState<InvoiceItem>({
    name: "",
    price: 0,
    taxRate: 10,
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  const subtotal = items.reduce(
    (sum, currentItem) => sum + Number(currentItem.price || 0),
    0
  );

  const totalTax = items.reduce(
    (sum, currentItem) =>
      sum +
      Number(currentItem.price || 0) *
        (Number(currentItem.taxRate || 0) / 100),
    0
  );

  const grandTotal = subtotal + totalTax;

  const addItem = () => {
    if (!item.name.trim()) return;

    setItems((previous) => [...previous, { ...item }]);

    setItem({
      name: "",
      price: 0,
      taxRate: 10,
    });
  };

  const removeItem = (index: number) => {
    setItems((previous) => previous.filter((_, i) => i !== index));
  };

  const createInvoice = () => {
    if (!customer || items.length === 0) return;

    const newInvoice: Invoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      customer,
      date: invoiceDate.replaceAll("-", "/"),
      dueDate: dueDate.replaceAll("-", "/"),
      total: grandTotal,
      status: "Unpaid",
    };

    setInvoices((previous) => [newInvoice, ...previous]);

    setItems([]);
    setItem({
      name: "",
      price: 0,
      taxRate: 10,
    });
  };

  return (
    <div className="app">
      <div className="invoice-shell">
        <main className="invoice-page">
          <section className="invoice-form">
            <h1>Create New Invoice</h1>

            {/* Customer */}
            <div className="form-group customer-group">
              <label>
                Customer <span>*</span>
              </label>

              <select
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              >
                <option value="Globex Inc">Globex Inc</option>
                <option value="Acme Corporation">Acme Corporation</option>
                <option value="Wayne Enterprises">
                  Wayne Enterprises
                </option>
              </select>
            </div>

            {/* Dates */}
            <div className="date-row">
              <div className="form-group">
                <label>
                  Invoice Date <span>*</span>
                </label>

                <div className="date-input">
                  <input
                    type="text"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />

                  <span className="calendar-icon">▣</span>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Due Date <span>*</span>
                </label>

                <div className="date-input">
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />

                  <span className="calendar-icon">▣</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="items-section">
              <h2>Items</h2>

              <div className="item-header">
                <div>Item Name *</div>
                <div>Price *</div>
                <div>Tax Rate (%) *</div>
              </div>

              <div className="item-input-row">
                <input
                  className="item-name-input"
                  type="text"
                  placeholder="Service or product name"
                  value={item.name}
                  onChange={(e) =>
                    setItem({
                      ...item,
                      name: e.target.value,
                    })
                  }
                />

                <input
                  className="price-input"
                  type="number"
                  min="0"
                  value={item.price}
                  onChange={(e) =>
                    setItem({
                      ...item,
                      price: Number(e.target.value),
                    })
                  }
                />

                <select
                  className="tax-input"
                  value={item.taxRate}
                  onChange={(e) =>
                    setItem({
                      ...item,
                      taxRate: Number(e.target.value),
                    })
                  }
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                  <option value={18}>18%</option>
                  <option value={20}>20%</option>
                </select>

                <button
                  className="remove-button"
                  type="button"
                  onClick={() => {
                    if (item.name.trim()) {
                      setItem({
                        name: "",
                        price: 0,
                        taxRate: 10,
                      });
                    }
                  }}
                >
                  ×
                </button>
              </div>

              {items.length > 0 && (
                <div className="added-items">
                  {items.map((currentItem, index) => (
                    <div className="added-item" key={index}>
                      <div>{currentItem.name}</div>

                      <div>
                        ${Number(currentItem.price).toFixed(2)}
                      </div>

                      <div>{currentItem.taxRate}%</div>

                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="add-item-button"
                onClick={addItem}
              >
                + Add Item
              </button>
            </div>

            {/* Totals */}
            <div className="totals-box">
              <div className="total-row">
                <span>Subtotal:</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>

              <div className="total-row">
                <span>Total Tax:</span>
                <strong>${totalTax.toFixed(2)}</strong>
              </div>

              <div className="grand-total-row">
                <span>Grand Total:</span>
                <strong>${grandTotal.toFixed(2)}</strong>
              </div>
            </div>

            <div className="create-button-wrapper">
              <button
                type="button"
                className="create-button"
                onClick={createInvoice}
              >
                Create Invoice
              </button>
            </div>
          </section>

          {/* Recent invoices */}
          <section className="recent-section">
            <h2>Recent Invoices</h2>

            <div className="invoice-table">
              <div className="table-header">
                <span>INVOICE #</span>
                <span>CUSTOMER</span>
                <span>DATE</span>
                <span>TOTAL</span>
                <span>STATUS</span>
              </div>

              {invoices.map((invoice) => (
                <div className="table-row" key={invoice.id}>
                  <span>{invoice.id}</span>
                  <span>{invoice.customer}</span>
                  <span>{invoice.date}</span>
                  <span>${invoice.total.toFixed(2)}</span>
                  <span>
                    <small
                      className={
                        invoice.status === "Paid"
                          ? "status paid"
                          : "status unpaid"
                      }
                    >
                      {invoice.status}
                    </small>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
