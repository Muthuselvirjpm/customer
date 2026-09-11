import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  customerSchema,
  type CustomerFormData,
} from "../schemas/customerSchema";

import {
  emailExists,
  saveCustomer,
} from "../db/localforage";

import type { Customer } from "../types/customer";

interface CustomerFormProps {
  onSaved: () => void;
}

const emptyAddress = {
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export default function CustomerForm({
  onSaved,
}: CustomerFormProps) {
  const [step, setStep] = useState(1);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      billingAddress: emptyAddress,
      shippingAddress: emptyAddress,
      sameAsBilling: false,
    },
  });

  const sameAsBilling = watch("sameAsBilling");

  const billingAddress = watch("billingAddress");

  const checkEmail = async () => {
    const email = watch("email");

    if (!email) {
      return false;
    }

    setCheckingEmail(true);

    try {
      const exists = await emailExists(email);

      if (exists) {
        setError("email", {
          type: "manual",
          message: "A customer with this email already exists",
        });

        return false;
      }

      return true;
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      const valid = await trigger([
        "name",
        "email",
        "phone",
      ]);

      if (!valid) {
        return;
      }

      const emailValid = await checkEmail();

      if (!emailValid) {
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      const valid = await trigger([
        "billingAddress",
        "shippingAddress",
      ]);

      if (!valid) {
        return;
      }

      setStep(3);
    }
  };

  const copyBillingToShipping = () => {
    if (sameAsBilling) {
      setValue(
        "shippingAddress.address",
        billingAddress.address
      );

      setValue(
        "shippingAddress.city",
        billingAddress.city
      );

      setValue(
        "shippingAddress.state",
        billingAddress.state
      );

      setValue(
        "shippingAddress.pincode",
        billingAddress.pincode
      );

      setValue(
        "shippingAddress.country",
        billingAddress.country
      );
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    setSuccess("");

    const exists = await emailExists(data.email);

    if (exists) {
      setError("email", {
        type: "manual",
        message: "A customer with this email already exists",
      });

      setStep(1);
      return;
    }

    const customer: Customer = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      billingAddress: data.billingAddress,
      shippingAddress: data.shippingAddress,
      createdAt: new Date().toISOString(),
    };

    await saveCustomer(customer);

    setSuccess("Customer created successfully!");

    setTimeout(() => {
      onSaved();
    }, 700);
  };

  return (
    <div className="card">
      <div className="steps">
        <div className={step === 1 ? "step active" : "step"}>
          1. Personal
        </div>

        <div className={step === 2 ? "step active" : "step"}>
          2. Address
        </div>

        <div className={step === 3 ? "step active" : "step"}>
          3. Review
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <section>
            <h2>Personal Information</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>

                <input
                  {...register("name")}
                  placeholder="John Smith"
                />

                {errors.name && (
                  <p className="error">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  {...register("email")}
                  placeholder="john@example.com"
                  onBlur={async () => {
                    await trigger("email");

                    if (!errors.email) {
                      await checkEmail();
                    }
                  }}
                />

                {checkingEmail && (
                  <p className="info">
                    Checking email...
                  </p>
                )}

                {errors.email && (
                  <p className="error">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Phone</label>

                <input
                  {...register("phone")}
                  placeholder="9876543210"
                />

                {errors.phone && (
                  <p className="error">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="button-row">
              <button
                type="button"
                className="primary"
                onClick={handleNext}
              >
                Next →
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2>Address Information</h2>

            <h3>Billing Address</h3>

            <AddressFields
              prefix="billingAddress"
              register={register}
              errors={errors}
            />

            <div className="checkbox-row">
              <input
                type="checkbox"
                {...register("sameAsBilling")}
                onChange={(e) => {
                  setValue(
                    "sameAsBilling",
                    e.target.checked
                  );

                  if (e.target.checked) {
                    copyBillingToShipping();
                  }
                }}
              />

              <label>
                Shipping address same as billing
              </label>
            </div>

            <h3>Shipping Address</h3>

            <AddressFields
              prefix="shippingAddress"
              register={register}
              errors={errors}
            />

            {errors.shippingAddress && (
              <p className="error">
                {errors.shippingAddress.message}
              </p>
            )}

            <div className="button-row">
              <button
                type="button"
                className="secondary"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>

              <button
                type="button"
                className="primary"
                onClick={handleNext}
              >
                Review →
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2>Review Customer</h2>

            <div className="review">
              <h3>Personal Information</h3>

              <p>
                <strong>Name:</strong>{" "}
                {watch("name")}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {watch("email")}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {watch("phone") || "Not provided"}
              </p>

              <h3>Billing Address</h3>

              <p>
                {watch("billingAddress.address")}
                <br />
                {watch("billingAddress.city")},{" "}
                {watch("billingAddress.state")}
                <br />
                {watch("billingAddress.pincode")}
                <br />
                {watch("billingAddress.country")}
              </p>

              <h3>Shipping Address</h3>

              <p>
                {watch("shippingAddress.address")}
                <br />
                {watch("shippingAddress.city")},{" "}
                {watch("shippingAddress.state")}
                <br />
                {watch("shippingAddress.pincode")}
                <br />
                {watch("shippingAddress.country")}
              </p>
            </div>

            {success && (
              <p className="success">{success}</p>
            )}

            <div className="button-row">
              <button
                type="button"
                className="secondary"
                onClick={() => setStep(2)}
              >
                ← Back
              </button>

              <button
                type="submit"
                className="primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : "Create Customer"}
              </button>
            </div>
          </section>
        )}
      </form>
    </div>
  );
}

interface AddressFieldsProps {
  prefix:
    | "billingAddress"
    | "shippingAddress";

  register: ReturnType<
    typeof useForm<CustomerFormData>
  >["register"];

  errors: ReturnType<
    typeof useForm<CustomerFormData>
  >["formState"]["errors"];
}

function AddressFields({
  prefix,
  register,
  errors,
}: AddressFieldsProps) {
  const addressErrors =
    errors[prefix];

  return (
    <div className="form-grid">
      <div className="form-group full">
        <label>Address</label>

        <input
          {...register(`${prefix}.address`)}
          placeholder="Street address"
        />

        {addressErrors?.address && (
          <p className="error">
            {addressErrors.address.message}
          </p>
        )}
      </div>

      <div className="form-group">
        <label>City</label>

        <input
          {...register(`${prefix}.city`)}
          placeholder="Chennai"
        />

        {addressErrors?.city && (
          <p className="error">
            {addressErrors.city.message}
          </p>
        )}
      </div>

      <div className="form-group">
        <label>State</label>

        <input
          {...register(`${prefix}.state`)}
          placeholder="Tamil Nadu"
        />

        {addressErrors?.state && (
          <p className="error">
            {addressErrors.state.message}
          </p>
        )}
      </div>

      <div className="form-group">
        <label>Pincode</label>

        <input
          {...register(`${prefix}.pincode`)}
          placeholder="600001"
        />

        {addressErrors?.pincode && (
          <p className="error">
            {addressErrors.pincode.message}
          </p>
        )}
      </div>

      <div className="form-group">
        <label>Country</label>

        <input
          {...register(`${prefix}.country`)}
          placeholder="India"
        />

        {addressErrors?.country && (
          <p className="error">
            {addressErrors.country.message}
          </p>
        )}
      </div>
    </div>
  );
}