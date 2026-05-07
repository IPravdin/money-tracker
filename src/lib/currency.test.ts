import { describe, it, expect } from "@jest/globals";
import {
  getCurrencySymbol,
  getCurrencyName,
  getSupportedCurrencies,
  formatCurrency,
  formatCurrencyCompact,
  groupByCurrency,
  formatMultipleCurrencies,
  isSupportedCurrency,
  validateCurrency,
  CURRENCY_INFO,
} from "./currency";

describe("Currency Service", () => {
  describe("getCurrencySymbol", () => {
    it("should return correct symbol for USD", () => {
      expect(getCurrencySymbol("USD")).toBe("$");
    });

    it("should return correct symbol for EUR", () => {
      expect(getCurrencySymbol("EUR")).toBe("€");
    });

    it("should return correct symbol for UAH", () => {
      expect(getCurrencySymbol("UAH")).toBe("₴");
    });

    it("should return currency code for unsupported currency", () => {
      expect(getCurrencySymbol("GBP")).toBe("GBP");
    });
  });

  describe("getCurrencyName", () => {
    it("should return correct name for USD", () => {
      expect(getCurrencyName("USD")).toBe("US Dollar");
    });

    it("should return correct name for EUR", () => {
      expect(getCurrencyName("EUR")).toBe("Euro");
    });

    it("should return correct name for UAH", () => {
      expect(getCurrencyName("UAH")).toBe("Ukrainian Hryvnia");
    });

    it("should return currency code for unsupported currency", () => {
      expect(getCurrencyName("GBP")).toBe("GBP");
    });
  });

  describe("getSupportedCurrencies", () => {
    it("should return all supported currencies", () => {
      const currencies = getSupportedCurrencies();
      expect(currencies).toHaveLength(3);
      expect(currencies.map((c) => c.code)).toEqual(["USD", "EUR", "UAH"]);
    });

    it("should return currency info with all required fields", () => {
      const currencies = getSupportedCurrencies();
      currencies.forEach((currency) => {
        expect(currency).toHaveProperty("code");
        expect(currency).toHaveProperty("symbol");
        expect(currency).toHaveProperty("name");
        expect(currency).toHaveProperty("locale");
      });
    });
  });

  describe("formatCurrency", () => {
    it("should format USD correctly", () => {
      const result = formatCurrency(1234.56, "USD");
      expect(result).toMatch(/\$1,234\.56/);
    });

    it("should format EUR correctly", () => {
      const result = formatCurrency(1234.56, "EUR");
      expect(result).toMatch(/€1,234\.56/);
    });

    it("should format UAH correctly", () => {
      const result = formatCurrency(1234.56, "UAH");
      expect(result).toMatch(/₴1,234\.56/);
    });

    it("should handle negative amounts", () => {
      const result = formatCurrency(-1234.56, "USD");
      expect(result).toMatch(/-\$1,234\.56/);
    });

    it("should show sign when requested", () => {
      const positive = formatCurrency(1234.56, "USD", { showSign: true });
      const negative = formatCurrency(-1234.56, "USD", { showSign: true });
      expect(positive).toMatch(/\+\$1,234\.56/);
      expect(negative).toMatch(/-\$1,234\.56/);
    });

    it("should respect custom fraction digits", () => {
      const result = formatCurrency(1234.5, "USD", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      expect(result).toMatch(/\$1,235/);
    });

    it("should handle zero amount", () => {
      const result = formatCurrency(0, "USD");
      expect(result).toMatch(/\$0\.00/);
    });
  });

  describe("formatCurrencyCompact", () => {
    it("should format large amounts compactly", () => {
      const result = formatCurrencyCompact(1500, "USD");
      expect(result).toMatch(/\$1\.5K/);
    });

    it("should format millions compactly", () => {
      const result = formatCurrencyCompact(1500000, "USD");
      expect(result).toMatch(/\$1\.5M/);
    });

    it("should handle small amounts", () => {
      const result = formatCurrencyCompact(50, "USD");
      expect(result).toMatch(/\$50/);
    });
  });

  describe("groupByCurrency", () => {
    it("should group transactions by currency", () => {
      const transactions = [
        { amount: 100, currency: "USD", id: "1" },
        { amount: 200, currency: "USD", id: "2" },
        { amount: 150, currency: "EUR", id: "3" },
      ];

      const groups = groupByCurrency(transactions);
      expect(groups).toHaveLength(2);

      const usdGroup = groups.find((g) => g.currency === "USD");
      const eurGroup = groups.find((g) => g.currency === "EUR");

      expect(usdGroup).toBeDefined();
      expect(usdGroup?.total).toBe(300);
      expect(usdGroup?.count).toBe(2);

      expect(eurGroup).toBeDefined();
      expect(eurGroup?.total).toBe(150);
      expect(eurGroup?.count).toBe(1);
    });

    it("should handle empty array", () => {
      const groups = groupByCurrency([]);
      expect(groups).toHaveLength(0);
    });

    it("should handle single currency", () => {
      const transactions = [
        { amount: 100, currency: "USD", id: "1" },
        { amount: 200, currency: "USD", id: "2" },
      ];

      const groups = groupByCurrency(transactions);
      expect(groups).toHaveLength(1);
      expect(groups[0].currency).toBe("USD");
      expect(groups[0].total).toBe(300);
    });

    it("should sort groups by currency code", () => {
      const transactions = [
        { amount: 100, currency: "USD", id: "1" },
        { amount: 150, currency: "EUR", id: "2" },
        { amount: 200, currency: "UAH", id: "3" },
      ];

      const groups = groupByCurrency(transactions);
      expect(groups.map((g) => g.currency)).toEqual(["EUR", "UAH", "USD"]);
    });
  });

  describe("formatMultipleCurrencies", () => {
    it("should format multiple currency groups", () => {
      const groups = [
        { currency: "USD", total: 1234.56, count: 2 },
        { currency: "EUR", total: 987.65, count: 1 },
      ];

      const result = formatMultipleCurrencies(groups);
      expect(result).toContain("USD");
      expect(result).toContain("EUR");
      expect(result).toContain(",");
    });

    it("should handle custom separator", () => {
      const groups = [
        { currency: "USD", total: 1234.56, count: 2 },
        { currency: "EUR", total: 987.65, count: 1 },
      ];

      const result = formatMultipleCurrencies(groups, { separator: " | " });
      expect(result).toContain(" | ");
    });

    it("should hide currency code when requested", () => {
      const groups = [
        { currency: "USD", total: 1234.56, count: 2 },
      ];

      const result = formatMultipleCurrencies(groups, { showCurrencyCode: false });
      expect(result).not.toContain("USD");
    });

    it("should handle empty groups", () => {
      const result = formatMultipleCurrencies([]);
      expect(result).toBe("");
    });
  });

  describe("isSupportedCurrency", () => {
    it("should return true for supported currencies", () => {
      expect(isSupportedCurrency("USD")).toBe(true);
      expect(isSupportedCurrency("EUR")).toBe(true);
      expect(isSupportedCurrency("UAH")).toBe(true);
    });

    it("should return false for unsupported currencies", () => {
      expect(isSupportedCurrency("GBP")).toBe(false);
      expect(isSupportedCurrency("JPY")).toBe(false);
      expect(isSupportedCurrency("")).toBe(false);
    });
  });

  describe("validateCurrency", () => {
    it("should return valid currency as-is", () => {
      expect(validateCurrency("USD")).toBe("USD");
      expect(validateCurrency("EUR")).toBe("EUR");
      expect(validateCurrency("UAH")).toBe("UAH");
    });

    it("should normalize to uppercase", () => {
      expect(validateCurrency("usd")).toBe("USD");
      expect(validateCurrency("eur")).toBe("EUR");
    });

    it("should return default for invalid currency", () => {
      expect(validateCurrency("GBP")).toBe("USD");
      expect(validateCurrency("INVALID")).toBe("USD");
    });

    it("should return default for null/undefined", () => {
      expect(validateCurrency(null)).toBe("USD");
      expect(validateCurrency(undefined)).toBe("USD");
    });

    it("should use custom default", () => {
      expect(validateCurrency("INVALID", "EUR")).toBe("EUR");
      expect(validateCurrency(null, "UAH")).toBe("UAH");
    });
  });

  describe("CURRENCY_INFO", () => {
    it("should have info for all supported currencies", () => {
      expect(CURRENCY_INFO.USD).toBeDefined();
      expect(CURRENCY_INFO.EUR).toBeDefined();
      expect(CURRENCY_INFO.UAH).toBeDefined();
    });

    it("should have correct structure for each currency", () => {
      Object.values(CURRENCY_INFO).forEach((info) => {
        expect(info).toHaveProperty("code");
        expect(info).toHaveProperty("symbol");
        expect(info).toHaveProperty("name");
        expect(info).toHaveProperty("locale");
      });
    });
  });
});
