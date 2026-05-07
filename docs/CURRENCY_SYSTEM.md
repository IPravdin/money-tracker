# Multi-Currency Support System

## Overview

The Money Tracker application provides comprehensive multi-currency support for USD, EUR, and UAH. This document describes the currency system architecture, components, and usage patterns.

## Supported Currencies

- **USD** - US Dollar ($)
- **EUR** - Euro (€)
- **UAH** - Ukrainian Hryvnia (₴)

## Architecture

### Core Currency Service (`/src/lib/currency.ts`)

The currency service provides centralized currency utilities:

#### Key Functions

1. **`getCurrencySymbol(currency: string): string`**
   - Returns the currency symbol for a given currency code
   - Example: `getCurrencySymbol("USD")` returns `"$"`

2. **`getCurrencyName(currency: string): string`**
   - Returns the full currency name
   - Example: `getCurrencyName("EUR")` returns `"Euro"`

3. **`formatCurrency(amount: number, currency: string, options?): string`**
   - Formats amounts using Intl.NumberFormat API
   - Supports custom locales and fraction digits
   - Example: `formatCurrency(1234.56, "USD")` returns `"$1,234.56"`

4. **`formatCurrencyCompact(amount: number, currency: string): string`**
   - Formats large amounts with compact notation
   - Example: `formatCurrencyCompact(1500, "USD")` returns `"$1.5K"`

5. **`groupByCurrency(items: Array): CurrencyGroup[]`**
   - Groups transactions by currency
   - Returns array of currency groups with totals and counts

6. **`formatMultipleCurrencies(groups: CurrencyGroup[]): string`**
   - Formats multiple currency groups for display
   - Example: `"$1,234.56 USD, €987.65 EUR"`

7. **`validateCurrency(currency: string, defaultCurrency?): SupportedCurrency`**
   - Validates and normalizes currency codes
   - Returns default currency if invalid

### UI Components

#### CurrencyPicker (`/src/components/ui/currency-picker.tsx`)

Reusable currency selector component with proper symbols and names.

```tsx
<CurrencyPicker
  value={currency}
  onChange={(value) => setCurrency(value)}
  label="Currency"
  showLabel={true}
/>
```

#### CurrencyAmount (`/src/components/ui/currency-display.tsx`)

Display a single currency amount with proper formatting.

```tsx
<CurrencyAmount
  amount={1234.56}
  currency="USD"
  showSign={true}
/>
```

#### MultiCurrencySummary (`/src/components/ui/currency-display.tsx`)

Display transaction summaries with mixed currencies.

```tsx
<MultiCurrencySummary
  items={transactions}
  title="Total Expenses"
  showCounts={true}
/>
```

#### MixedCurrencySummary (`/src/components/dashboard/MixedCurrencySummary.tsx`)

Dashboard component for displaying mixed-currency transaction summaries.

```tsx
<MixedCurrencySummary
  transactions={transactions}
  type={TransactionType.EXPENSE}
  title="Monthly Expenses"
/>
```

## Features

### 1. Per-Account Default Currency

Each account has a default currency setting that:
- Is selected when creating an account
- Defaults to USD if not specified
- Can be changed in account settings
- Applies only to new transactions (existing transactions keep their original currency)

**Implementation:**
- Database: `Account.defaultCurrency` field
- Forms: `AddAccountForm`, `EditAccountForm` with currency picker
- Validation: Enforced via Zod schema in `/src/lib/validations/account.ts`

### 2. Per-Transaction Currency

Each transaction can have its own currency:
- Defaults to the account's default currency
- Can be changed when creating/editing a transaction
- Stored independently in the database
- Displayed with proper currency symbol in lists and details

**Implementation:**
- Database: `Transaction.currency` field
- Forms: `AddTransactionForm`, `EditTransactionForm` with currency picker
- Display: `TransactionItem` component with formatted amounts

### 3. Currency Formatting with Intl API

All currency formatting uses the Intl.NumberFormat API for:
- Proper currency symbols
- Locale-specific formatting
- Thousands separators
- Decimal precision
- Fallback handling for unsupported currencies

**Example:**
```typescript
formatCurrency(1234.56, "USD") // "$1,234.56"
formatCurrency(1234.56, "EUR") // "€1,234.56"
formatCurrency(1234.56, "UAH") // "₴1,234.56"
```

### 4. Mixed-Currency Views

When displaying summaries with multiple currencies:
- Transactions are grouped by currency
- Each currency group shows its total
- Single currency displays prominently
- Multiple currencies display as a list
- Inline format available for compact display

**Example Display:**

Single currency:
```
Total Expenses
$1,234.56
5 transactions
```

Multiple currencies:
```
Total Expenses
USD    $1,234.56 (3)
EUR    €987.65 (2)
```

### 5. Currency Change Handling

When changing an account's default currency:
- Only affects new transactions
- Existing transactions keep their original currency
- User is informed via UI message
- No automatic conversion occurs

**Implementation:**
- `EditAccountForm` displays a note: "This will only affect new transactions. Existing transactions will keep their original currency."
- Database maintains historical currency data
- No data migration required

### 6. Currency Display in Lists

Transaction lists show:
- Amount with currency symbol
- Proper formatting based on transaction type (income/expense)
- Sign indicators (+/-)
- Color coding (green for income, red for expense)

**Implementation:**
- `TransactionItem` component
- `formatTransactionAmount` utility function
- Consistent formatting across all views

## Usage Examples

### Creating an Account with Currency

```typescript
const account = await createAccount({
  name: "European Savings",
  type: AccountType.SAVINGS,
  defaultCurrency: "EUR"
});
```

### Adding a Transaction with Custom Currency

```typescript
const transaction = await createTransaction({
  amount: 100,
  currency: "UAH", // Override account default
  category: "Food & Dining",
  type: TransactionType.EXPENSE,
  accountId: account.id,
  date: new Date()
});
```

### Displaying Mixed-Currency Summary

```tsx
function ExpenseSummary({ transactions }) {
  return (
    <MultiCurrencySummary
      items={transactions.filter(t => t.type === TransactionType.EXPENSE)}
      title="Total Expenses"
      description="All expenses this month"
      showCounts={true}
    />
  );
}
```

### Grouping Transactions by Currency

```typescript
const groups = groupByCurrency(transactions);
// Returns: [
//   { currency: "EUR", total: 987.65, count: 2 },
//   { currency: "UAH", total: 2500, count: 3 },
//   { currency: "USD", total: 1234.56, count: 5 }
// ]
```

## Database Schema

### Account Table
```prisma
model Account {
  id              String      @id @default(cuid())
  name            String
  type            String
  defaultCurrency String      @default("USD")
  // ... other fields
}
```

### Transaction Table
```prisma
model Transaction {
  id          String          @id @default(cuid())
  amount      Decimal
  currency    String          @default("USD")
  // ... other fields
}
```

## Testing

Unit tests are provided in `/src/lib/currency.test.ts` covering:
- Currency symbol retrieval
- Currency name retrieval
- Currency formatting with various options
- Compact formatting
- Grouping by currency
- Multi-currency formatting
- Currency validation
- Edge cases and error handling

Run tests with:
```bash
pnpm test src/lib/currency.test.ts
```

## Requirements Mapping

This implementation satisfies the following requirements:

- **7.1**: Account default currency selection (USD, EUR, UAH) ✓
- **7.2**: Per-transaction currency with account default ✓
- **7.3**: Currency symbol display using Intl API ✓
- **7.4**: Mixed-currency summaries grouped by currency ✓
- **7.5**: Clear currency indication in lists and details ✓
- **7.6**: Currency changes affect only new transactions ✓

## Future Enhancements

Potential improvements for future versions:
1. Currency conversion with exchange rates
2. Additional currency support
3. Historical exchange rate tracking
4. Multi-currency budget support
5. Currency preference per user
6. Automatic currency detection based on location

## Migration Notes

No database migration is required as the currency fields already exist in the schema:
- `Account.defaultCurrency` (default: "USD")
- `Transaction.currency` (default: "USD")

Existing data will continue to work with the new currency system.
