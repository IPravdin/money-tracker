import { AccountType, TransactionType, SharePermission } from "./enums";

export type { AccountType, TransactionType, SharePermission };

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  defaultCurrency: string;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: Date;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
  accountId: string;
  createdById?: string;
  transferId?: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  accountId: string;
}

export interface AccountShare {
  id: string;
  permission: SharePermission;
  createdAt: Date;
  updatedAt: Date;
  accountId: string;
  userId: string;
}

export interface Transfer {
  id: string;
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  exchangeRate?: number;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  sourceAccountId: string;
  targetAccountId: string;
  userId: string;
}