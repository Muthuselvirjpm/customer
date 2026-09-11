import { useEffect, useMemo, useState } from "react";
import { getCustomers } from "../db/localforage";
import type { Customer } from "../types/customer";

interface CustomerListProps {
  refreshKey: number;
  onCreateInvoice: (customerId: string) => void;
}

export default function CustomerList({
  refreshKey,
  onCreateInvoice,
}: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>(
    []
  );

  const [search, setSearch] = useState("");

  const [sort, setSort] = useState<
    "az" | "za"
  >("az");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);

      const data = await getCustomers();

      setCustomers(data);

      setLoading(false);
    };

    loadCustomers();
  }, [refreshKey]);

  const filteredCustomers = useMemo(() => {
    const result = customers.filter((customer) => {
      const searchText = search.toLowerCase();

      return (
        customer.name
          .toLowerCase()
          .includes(searchText) ||
        customer.email
          .toLowerCase()
          .includes(searchText)
      );
    });

    result.sort((a, b) => {
      const comparison = a.name.localeCompare(
        b.name
      );

      return sort === "az"
        ? comparison
        : -comparison;
    });

    return result;
  }, [customers, search, sort]);

  if (loading) {
    return <div className="card">Loading customers...</div>;
  }

  return (
    <div className="card">
      <div className="list-header">
        <div>
          <h2>Customers</h2>
          <p>
            {customers.length} customer
            {customers.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="filters">
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search name or email..."
          />

          <select
            value={sort}
            onChange={(e) =>
              setSort(
                e.target.value as "az" | "za"
              )
            }
          >
            <option value="az">Name A-Z</option>
            <option value="za">Name Z-A</option>
          </select>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="empty">
          No customers found.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map(
                (customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>

                    <td>{customer.email}</td>

                    <td>
                      {customer.phone || "-"}
                    </td>

                    <td>
                      {customer.billingAddress.city}
                    </td>

                    <td>
                      <button
                        className="small-button"
                        onClick={() =>
                          onCreateInvoice(
                            customer.id
                          )
                        }
                      >
                        Create Invoice
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}