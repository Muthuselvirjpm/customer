import { z } from "zod";

const invoiceItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required"),

  quantity: z
    .number()
    .min(1, "Quantity must be at least 1"),

  price: z
    .number()
    .min(0.01, "Price must be greater than 0"),
});

export const invoiceSchema = z
  .object({
    customerId: z
      .string()
      .min(1, "Please select a customer"),

    invoiceDate: z
      .string()
      .min(1, "Invoice date is required"),

    dueDate: z
      .string()
      .min(1, "Due date is required"),

    items: z
      .array(invoiceItemSchema)
      .min(1, "At least one item is required"),

    status: z.enum(["paid", "unpaid"]),
  })
  .superRefine((data, ctx) => {
    if (data.dueDate < data.invoiceDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "Due date cannot be before invoice date",
      });
    }
  });

export type InvoiceFormData = z.infer<typeof invoiceSchema>;