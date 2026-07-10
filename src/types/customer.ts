export interface Customer {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}
