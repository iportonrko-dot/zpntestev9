/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  MASTER = "master",
  ADMIN = "admin",
  OPERATOR = "operator"
}

export enum PlanType {
  BRONZE = "Bronze",
  SILVER = "Prata",
  GOLD = "Ouro"
}

export interface Company {
  id: string;
  name: string;
  document: string; // CNPJ / CPF
  active: boolean;
  plan: PlanType;
  subscriptionPrice: number;
  subscriptionStatus: "active" | "blocked";
  expirationDate: string;
  createdAt: string;
}

export interface User {
  id: string;
  companyId: string | null; // null for Master Admin
  username: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  forcePasswordReset: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  companyId: string;
  name: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  email: string;
  document: string; // CPF / CNPJ
  createdAt: string;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  barcode: string;
  price: number;
  purchasePrice: number;
  stock: number;
  minStock: number;
  categoryId: string;
  supplierId: string;
  expirationDate?: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  companyId: string;
  productId: string;
  productName: string;
  type: "in" | "out";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string; // "Venda", "Compra", "Ajuste", "Devolução", "Perda"
  userId: string;
  userName: string;
  description: string;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  companyId: string;
  type: "income" | "expense";
  category: string; // "Venda", "Compra", "Aluguel", "Salários", "Impostos", etc.
  amount: number;
  status: "paid" | "pending";
  dueDate: string;
  paymentDate?: string;
  description: string;
  invoiceId?: string; // e.g. connected to purchase/sale
  createdAt: string;
}

export interface AuditLog {
  id: string;
  companyId: string | null;
  userId: string;
  userName: string;
  action: string; // e.g. "Criação de Produto", "Entrada de Estoque", "Login"
  ip: string;
  details: string;
  createdAt: string;
}

export interface PendingConfirmation {
  id: string;
  type: "stock_entry" | "sale";
  products: {
    productId?: string;
    productName: string;
    quantity: number;
    price?: number;
    purchasePrice?: number;
    categoryId?: string;
    supplierId?: string;
  }[];
  supplierName?: string;
  description?: string;
  rawResponse: string;
}
