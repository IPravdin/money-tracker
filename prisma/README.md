# Database Setup

This directory contains the Prisma schema and migrations for the Money Tracker application.

## Schema Overview

The database includes the following models:

### Core Models
- **User**: User accounts with authentication
- **Account**: Financial accounts (Personal, Family, Savings, etc.)
- **Transaction**: Income and expense records
- **Budget**: Monthly spending limits by category
- **Transfer**: Money transfers between accounts
- **AccountShare**: Sharing permissions for collaborative accounts

### Enums
- **AccountType**: PERSONAL, FAMILY, SAVINGS, BUSINESS, INVESTMENT, EMERGENCY_FUND
- **TransactionType**: INCOME, EXPENSE
- **SharePermission**: READ_ONLY, FULL_ACCESS

## Key Features

### Multi-Currency Support
- Each account has a default currency (USD, EUR, UAH supported)
- Transactions can override the account currency
- Transfers support cross-currency with exchange rates

### Account Sharing
- View-only sharing via secure tokens
- Full collaboration with user invites
- Permission-based access control

### Data Relationships
- Users can have multiple accounts
- Accounts contain transactions and budgets
- Transfers link transactions across accounts
- Proper cascade deletes for data integrity

## Running Migrations

To apply migrations to your database:

```bash
# Generate Prisma client
npm run db:generate

# Apply migrations (requires running PostgreSQL)
npm run db:migrate

# Push schema changes without migrations (development)
npm run db:push

# Open Prisma Studio
npm run db:studio
```

## Database Requirements

- PostgreSQL 12+
- Set DATABASE_URL in your .env file
- Example: `DATABASE_URL="postgresql://username:password@localhost:5432/money_tracker"`