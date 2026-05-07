/**
 * Currency Integration Test
 * This file verifies that all currency components can be imported and used together
 * Run this file to ensure the currency system is properly integrated
 */

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
  type SupportedCurrency,
  type CurrencyInfo,
  type CurrencyGroup,
} from "./currency";

import { SUPPORTED_CURRENCIES } from "./validations/account";

/**
 * Test basic currency operations
 */
export function testCurrencyOperations() {
  console.log("Testing Currency Operations...\n");

  // Test 1: Get currency symbols
  console.log("1. Currency Symbols:");
  SUPPORTED_CURRENCIES.forEach((currency) => {
    console.log(`   ${currency}: ${getCurrencySymbol(currency)}`);
  });

  // Test 2: Get currency names
  console.log("\n2. Currency Names:");
  SUPPORTED_CURRENCIES.forEach((currency) => {
    console.log(`   ${currency}: ${getCurrencyName(currency)}`);
  });

  // Test 3: Format amounts
  console.log("\n3. Formatted Amounts:");
  const testAmount = 1234.56;
  SUPPORTED_CURRENCIES.forEach((currency) => {
    console.log(`   ${currency}: ${formatCurrency(testAmount, currency)}`);
  });

  // Test 4: Compact formatting
  console.log("\n4. Compact Formatting:");
  const largeAmount = 1500000;
  SUPPORTED_CURRENCIES.forEach((currency) => {
    console.log(`   ${currency}: ${formatCurrencyCompact(largeAmount, currency)}`);
  });

  // Test 5: Currency validation
  console.log("\n5. Currency Validation:");
  console.log(`   USD is supported: ${isSupportedCurrency("USD")}`);
  console.log(`   GBP is supported: ${isSupportedCurrency("GBP")}`);
  console.log(`   Validate "usd": ${validateCurrency("usd")}`);
  console.log(`   Validate "invalid": ${validateCurrency("invalid")}`);

  console.log("\n✅ All currency operations completed successfully!");
}

/**
 * Test currency grouping
 */
export function testCurrencyGrouping() {
  console.log("\nTesting Currency Grouping...\n");

  // Sample transactions
  const transactions = [
    { id: "1", amount: 100, currency: "USD" },
    { id: "2", amount: 200, currency: "USD" },
    { id: "3", amount: 150, currency: "EUR" },
    { id: "4", amount: 50, currency: "EUR" },
    { id: "5", amount: 1000, currency: "UAH" },
  ];

  // Group by currency
  const groups = groupByCurrency(transactions);

  console.log("Grouped Transactions:");
  groups.forEach((group) => {
    console.log(`   ${group.currency}: ${formatCurrency(group.total, group.currency)} (${group.count} transactions)`);
  });

  // Format multiple currencies
  const formatted = formatMultipleCurrencies(groups);
  console.log(`\nFormatted: ${formatted}`);

  console.log("\n✅ Currency grouping completed successfully!");
}

/**
 * Test currency info
 */
export function testCurrencyInfo() {
  console.log("\nTesting Currency Info...\n");

  const currencies = getSupportedCurrencies();
  console.log(`Total supported currencies: ${currencies.length}\n`);

  currencies.forEach((currency) => {
    console.log(`${currency.code}:`);
    console.log(`   Symbol: ${currency.symbol}`);
    console.log(`   Name: ${currency.name}`);
    console.log(`   Locale: ${currency.locale}`);
  });

  console.log("\n✅ Currency info test completed successfully!");
}

/**
 * Run all tests
 */
export function runAllCurrencyTests() {
  console.log("=".repeat(60));
  console.log("CURRENCY SYSTEM INTEGRATION TEST");
  console.log("=".repeat(60));

  try {
    testCurrencyOperations();
    testCurrencyGrouping();
    testCurrencyInfo();

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL TESTS PASSED!");
    console.log("=".repeat(60));
    return true;
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ TEST FAILED!");
    console.error("=".repeat(60));
    console.error(error);
    return false;
  }
}

// Export for use in other files
export default {
  testCurrencyOperations,
  testCurrencyGrouping,
  testCurrencyInfo,
  runAllCurrencyTests,
};
