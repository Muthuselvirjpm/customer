import { z } from "zod";

export const addressSchema = z.object({
  address: z
    .string()
    .trim()
    .min(3, "Address is required"),

  city: z
    .string()
    .trim()
    .min(2, "City is required"),

  state: z
    .string()
    .trim()
    .min(2, "State is required"),

  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be 6 digits"),

  country: z
    .string()
    .trim()
    .min(2, "Country is required"),
});

export const customerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters"),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address"),

    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s()]{10,15}$/, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),

    billingAddress: addressSchema,

    shippingAddress: addressSchema,

    sameAsBilling: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.sameAsBilling) {
      const billing = data.billingAddress;
      const shipping = data.shippingAddress;

      const same =
        billing.address === shipping.address &&
        billing.city === shipping.city &&
        billing.state === shipping.state &&
        billing.pincode === shipping.pincode &&
        billing.country === shipping.country;

      if (!same) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shippingAddress"],
          message:
            "Shipping address must match billing address when enabled",
        });
      }
    }
  });

export type CustomerFormData = z.infer<typeof customerSchema>;