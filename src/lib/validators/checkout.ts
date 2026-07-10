import { z } from "zod";

export const checkoutContactSchema = z.object({
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
});

export const checkoutShippingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export const cardSchema = z.object({
  number: z.string().min(13, "Card number is too short").max(19, "Card number is too long").refine((val) => {
    const clean = val.replace(/\s+/g, "");
    const isVisa = /^4/.test(clean);
    const isMaster = /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(clean);
    return isVisa || isMaster;
  }, "Only VISA or Mastercard cards are accepted"),
  holder: z.string().min(1, "Card holder name is required"),
  expiryMonth: z.string().length(2, "Must be 2 digits (e.g. 05)"),
  expiryYear: z.string().length(4, "Must be 4 digits (e.g. 2034)"),
  cvv: z.string().min(3, "CVV is too short").max(4, "CVV is too long"),
});

export const checkoutSchema = z.object({
  contact: checkoutContactSchema,
  shipping: checkoutShippingSchema,
  shippingMethod: z.string().min(1, "Shipping method is required"),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
