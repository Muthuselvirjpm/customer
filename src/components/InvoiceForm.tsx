import { useMemo } from "react";
import {
  useFieldArray,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  invoiceSchema,
  type InvoiceFormData,
} from "../schemas/invoiceSchema";

import {
  getCustomers,
  saveInvoice,
} from "../db/localforage";

import type { Customer } from "../types/customer";
import type { Invoice } from "../types/invoice";

interface InvoiceFormProps {
  customers: Customer[];
  selectedCustomerId?: string;
  onSaved: () => void;
}

export default function InvoiceForm({
  customers,
  selectedCustomerId,
  onSaved,
}: InvoiceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: selectedCustomerId || "",
      invoiceDate: new Date()
        .toISOString()
        .split("T")[0],
      dueDate: new Date()
        .toISOString()
        .split("T")[0],
      status: "unpaid",
      items: [
        {
          description: "",
          quantity: 1,
          price: 0,
        },
      ],
    },
  });

  const { fields, append, remove } =
    useFieldArray({
      control,
      name: "items",
    });

  const items = watch("items");

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity =
        Number(item.quantity) || 0;

      const price =
        Number(item.price) || 0;

      return sum + quantity * price;
    }, 0);
  }, [items]);

  const onSubmit = async (
    data: InvoiceFormData
  ) => {
    const invoice: Invoice = {
      id: `INV-${Date.now()}`,
      customerId: data.customerId,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      items: data.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      total,
      status: data.status,
      createdAt: new Date().toISOString(),
    };

    await saveInvoice(invoice);

    onSaved();
  };

  return (
    <div className="card">
      <h2>Create Invoice</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <div className="form-group">
            <label>Customer</label>

            <select
              {...register("customerId")}
            >
              <option value="">
                Select customer
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

            {errors.customerId && (
              <p className="error">
                {errors.customerId.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Invoice Date</label>

            <input
              type="date"
              {...register("invoiceDate")}
            />

            {errors.invoiceDate && (
              <p className="error">
                {errors.invoiceDate.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Due Date</label>

            <input
              type="date"
              {...register("dueDate")}
            />

            {errors.dueDate && (
              <p className="error">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Status</label>

            <select {...register("status")}>
              <option value="unpaid">
                Unpaid
              </option>

              <option value="paid">
                Paid
              </option>
            </select>
          </div>
        </div>

        <h3>Invoice Items</h3>

        {fields.map((field, index) => {
          const itemError =
            errors.items?.[index];

          const quantity =
            Number(items[index]?.quantity) || 0;

          const price =
            Number(items[index]?.price) || 0;

          const subtotal =
            quantity * price;

          return (
            <div
              className="invoice-item"
              key={field.id}
            >
              <div className="form-group">
                <label>Description</label>

                <input
                  {...register(
                    `items.${index}.description`
                  )}
                  placeholder="Web Development"
                />

                {itemError?.description && (
                  <p className="error">
                    {
                      itemError.description
                        .message
                    }
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  min="1"
                  {...register(
                    `items.${index}.quantity`,
                    {
                      valueAsNumber: true,
                    }
                  )}
                />

                {itemError?.quantity && (
                  <p className="error">
                    {
                      itemError.quantity
                        .message
                    }
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Price</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register(
                    `items.${index}.price`,
                    {
                      valueAsNumber: true,
                    }
                  )}
                />

                {itemError?.price && (
                  <p className="error">
                    {itemError.price.message}
                  </p>
                )}
              </div>

              <div className="subtotal">
                <span>Subtotal</span>
                <strong>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </strong>
              </div>

              {fields.length > 1 && (
                <button
                  type="button"
                  className="danger"
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          className="secondary"
          onClick={() =>
            append({
              description: "",
              quantity: 1,
              price: 0,
            })
          }
        >
          + Add Item
        </button>

        <div className="invoice-total">
          <span>Total</span>

          <strong>
            ₹
            {total.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </strong>
        </div>

        <div className="button-row">
          <button
            type="submit"
            className="primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}