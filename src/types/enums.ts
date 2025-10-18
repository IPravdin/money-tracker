// Enum types for the application
export const AccountType = {
  PERSONAL: 'PERSONAL',
  FAMILY: 'FAMILY',
  SAVINGS: 'SAVINGS',
  BUSINESS: 'BUSINESS',
  INVESTMENT: 'INVESTMENT',
  EMERGENCY_FUND: 'EMERGENCY_FUND',
} as const;

export type AccountType = typeof AccountType[keyof typeof AccountType];

export const TransactionType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const SharePermission = {
  READ_ONLY: 'READ_ONLY',
  FULL_ACCESS: 'FULL_ACCESS',
} as const;

export type SharePermission = typeof SharePermission[keyof typeof SharePermission];

// Helper functions for validation
export const isValidAccountType = (type: string): type is AccountType => {
  return Object.values(AccountType).includes(type as AccountType);
};

export const isValidTransactionType = (type: string): type is TransactionType => {
  return Object.values(TransactionType).includes(type as TransactionType);
};

export const isValidSharePermission = (permission: string): permission is SharePermission => {
  return Object.values(SharePermission).includes(permission as SharePermission);
};