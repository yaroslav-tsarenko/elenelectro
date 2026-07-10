export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: string | null;
  shippingCost: number;
  trackingNumber: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentStatus: string;
  paymentMethod: string | null;
  notes: string | null;
  items: {
    id: string;
    productName: string;
    productSku: string;
    variantName: string | null;
    quantity: number;
    price: number;
    total: number;
  }[];
  createdAt: string;
  updatedAt: string;
}
