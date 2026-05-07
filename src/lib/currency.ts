/**
 * Currency Service
 * Provides comprehensive currency support including formatting, symbols, and display logic
 */

import { SUPPORTED_CURRENCIES } from "./validations/account";

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Currency metadata including symbol and display information
 */
export interface CurrencyInfo {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  locale: string;
}

/**
 * Currency information for all supported currencies
 */
export const CURRENCY_INFO: Record<SupportedCurrency, CurrencyInfo> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "en-US",
  },
  UAH: {
    code: "UAH",
    symbol: "₴",
    name: "Ukrainian Hryvnia",
    locale: "uk-UA",
  },
};

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: string): string {
  const currencyInfo = CURRENCY_INFO[currency as SupportedCurrency];
  return currencyInfo?.symbol || currency;
}

/**
 * Get currency name for a given currency code
 */
export function getCurrencyName(currency: string): string {
  const currencyInfo = CURRENCY_INFO[currency as SupportedCurrency];
  return currencyInfo?.name || currency;
}

/**
 * Get all supported currencies with their information
 */
export function getSupportedCurrencies(): CurrencyInfo[] {
  return Object.values(CURRENCY_INFO);
}

/**
 * Format amount with currency using Intl.NumberFormat
 * @param amount - The numeric amount to format
 * @param currency - The currency code (USD, EUR, UAH)
 * @param options - Additional formatting options
 */
export function formatCurrency(
  amount: number,
  currency: string,
  options?: {
    showSign?: boolean;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const {
    showSign = false,
    locale,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options || {};

  const currencyInfo = CURRENCY_INFO[currency as SupportedCurrency];
  const formatLocale = locale || currencyInfo?.locale || "en-US";

  try {
    const formatter = new Intl.NumberFormat(formatLocale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });

    const formattedAmount = formatter.format(Math.abs(amount));
    
    if (showSign) {
      return amount >= 0 ? `+${formattedAmount}` : `-${formattedAmount}`;
    }
    
    return amount >= 0 ? formattedAmount : `-${formattedAmount}`;
  } catch (error) {
    // Fallback if Intl.NumberFormat fails
    const symbol = getCurrencySymbol(currency);
    const formattedNumber = Math.abs(amount).toFixed(maximumFractionDigits);
    const result = `${symbol}${formattedNumber}`;
    
    if (showSign) {
      return amount >= 0 ? `+${result}` : `-${result}`;
    }
    
    return amount >= 0 ? result : `-${result}`;
  }
}

/**
 * Format amount with compact notation (e.g., $1.2K, $1.5M)
 */
export function formatCurrencyCompact(
  amount: number,
  currency: string,
  locale?: string
): string {
  const currencyInfo = CURRENCY_INFO[currency as SupportedCurrency];
  const formatLocale = locale || currencyInfo?.locale || "en-US";

  try {
    const formatter = new Intl.NumberFormat(formatLocale, {
      style: "currency",
      currency: currency,
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });

    return formatter.format(amount);
  } catch (error) {
    // Fallback to regular formatting
    return formatCurrency(amount, currency, { locale });
  }
}

/**
 * Group amounts by currency
 * Useful for displaying mixed-currency summaries
 */
export interface CurrencyGroup {
  currency: string;
  total: number;
  count: number;
  transactions?: Array<{ amount: number; [key: string]: any }>;
}

export function groupByCurrency<T extends { amount: number; currency: string }>(
  items: T[]
): CurrencyGroup[] {
  const groups = new Map<string, CurrencyGroup>();

  items.forEach((item) => {
    const existing = groups.get(item.currency);
    if (existing) {
      existing.total += item.amount;
      existing.count += 1;
      existing.transactions?.push(item);
    } else {
      groups.set(item.currency, {
        currency: item.currency,
        total: item.amount,
        count: 1,
        transactions: [item],
      });
    }
  });

  return Array.from(groups.values()).sort((a, b) => 
    a.currency.localeCompare(b.currency)
  );
}

/**
 * Format multiple currency groups for display
 * Example: "$1,234.56 USD, €987.65 EUR"
 */
export function formatMultipleCurrencies(
  groups: CurrencyGroup[],
  options?: {
    separator?: string;
    showCurrencyCode?: boolean;
  }
): string {
  const { separator = ", ", showCurrencyCode = true } = options || {};

  return groups
    .map((group) => {
      const formatted = formatCurrency(group.total, group.currency);
      return showCurrencyCode ? `${formatted} ${group.currency}` : formatted;
    })
    .join(separator);
}

/**
 * Check if a currency is supported
 */
export function isSupportedCurrency(currency: string): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency);
}

/**
 * Validate and normalize currency code
 * Returns the currency if valid, otherwise returns default (USD)
 */
export function validateCurrency(
  currency: string | undefined | null,
  defaultCurrency: SupportedCurrency = "USD"
): SupportedCurrency {
  if (!currency) return defaultCurrency;
  
  const upperCurrency = currency.toUpperCase();
  return isSupportedCurrency(upperCurrency) ? upperCurrency : defaultCurrency;
}
