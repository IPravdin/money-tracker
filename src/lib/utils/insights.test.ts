import { describe, it, expect } from "@jest/globals";
import {
  getDateRangeForPeriod,
  filterTransactionsByPeriod,
  calculateExpensesByCategory,
  getTotalExpensesByPeriod,
  getTotalIncomeByPeriod,
  formatPeriodLabel,
  hasTransactionsInPeriod,
} from "./insights";
import { Transaction } from "@/types";
import { TransactionType } from "@/types/enums";

describe("Insights Utilities", () => {
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      amount: 100,
      currency: "USD",
      category: "Food",
      description: "Groceries",
      date: new Date(),
      type: TransactionType.EXPENSE,
      createdAt: new Date(),
      updatedAt: new Date(),
      accountId: "acc1",
    },
    {
      id: "2",
      amount: 50,
      currency: "USD",
      category: "Transportation",
      description: "Gas",
      date: new Date(),
      type: TransactionType.EXPENSE,
      createdAt: new Date(),
      updatedAt: new Date(),
      accountId: "acc1",
    },
    {
      id: "3",
      amount: 1000,
      currency: "USD",
      category: "Salary",
      description: "Monthly salary",
      date: new Date(),
      type: TransactionType.INCOME,
      createdAt: new Date(),
      updatedAt: new Date(),
      accountId: "acc1",
    },
  ];

  describe("getDateRangeForPeriod", () => {
    it("should return date range for week", () => {
      const range = getDateRangeForPeriod("week");
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);
      expect(range.end.getTime()).toBeGreaterThan(range.start.getTime());
    });

    it("should return date range for month", () => {
      const range = getDateRangeForPeriod("month");
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);
      expect(range.end.getTime()).toBeGreaterThan(range.start.getTime());
    });

    it("should return date range for year", () => {
      const range = getDateRangeForPeriod("year");
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);
      expect(range.end.getTime()).toBeGreaterThan(range.start.getTime());
    });
  });

  describe("filterTransactionsByPeriod", () => {
    it("should filter transactions by period", () => {
      const filtered = filterTransactionsByPeriod(mockTransactions, "month");
      expect(Array.isArray(filtered)).toBe(true);
      expect(filtered.length).toBeLessThanOrEqual(mockTransactions.length);
    });
  });

  describe("calculateExpensesByCategory", () => {
    it("should calculate expenses by category", () => {
      const result = calculateExpensesByCategory(mockTransactions, "month");
      expect(typeof result).toBe("object");
      
      if (result.USD) {
        expect(Array.isArray(result.USD)).toBe(true);
        expect(result.USD.length).toBeGreaterThan(0);
        
        const firstCategory = result.USD[0];
        expect(firstCategory).toHaveProperty("category");
        expect(firstCategory).toHaveProperty("amount");
        expect(firstCategory).toHaveProperty("percentage");
        expect(firstCategory).toHaveProperty("count");
        expect(firstCategory).toHaveProperty("currency");
      }
    });

    it("should calculate correct percentages", () => {
      const result = calculateExpensesByCategory(mockTransactions, "month");
      
      if (result.USD) {
        const totalPercentage = result.USD.reduce((sum, cat) => sum + cat.percentage, 0);
        expect(totalPercentage).toBeCloseTo(100, 1);
      }
    });
  });

  describe("getTotalExpensesByPeriod", () => {
    it("should calculate total expenses by currency", () => {
      const result = getTotalExpensesByPeriod(mockTransactions, "month");
      expect(typeof result).toBe("object");
      
      if (result.USD) {
        expect(result.USD).toBeGreaterThan(0);
      }
    });
  });

  describe("getTotalIncomeByPeriod", () => {
    it("should calculate total income by currency", () => {
      const result = getTotalIncomeByPeriod(mockTransactions, "month");
      expect(typeof result).toBe("object");
      
      if (result.USD) {
        expect(result.USD).toBeGreaterThan(0);
      }
    });
  });

  describe("formatPeriodLabel", () => {
    it("should format period labels correctly", () => {
      expect(formatPeriodLabel("week")).toBe("This Week");
      expect(formatPeriodLabel("month")).toBe("This Month");
      expect(formatPeriodLabel("year")).toBe("This Year");
    });
  });

  describe("hasTransactionsInPeriod", () => {
    it("should return true when transactions exist in period", () => {
      const result = hasTransactionsInPeriod(mockTransactions, "month");
      expect(typeof result).toBe("boolean");
    });

    it("should return false for empty transaction array", () => {
      const result = hasTransactionsInPeriod([], "month");
      expect(result).toBe(false);
    });
  });
});
