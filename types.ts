export interface Product {
  id:string;
  name: string;
  price: number;
  stock: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  date: string; // ISO string
  items: SaleItem[];
  total: number;
  tax: number;
}

export interface CartItem extends Product {
  quantity: number;
}

// FIX: Add missing User and UserRole types for the Admin component.
export type UserRole = 'cashier' | 'owner';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
}
