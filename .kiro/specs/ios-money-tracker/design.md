# Design Document - Next.js Money Tracker Web App

## Overview

The Money Tracker web application will be built using Next.js 14 with TypeScript, Tailwind CSS for styling, and shadcn/ui for component library. The app follows a modern full-stack architecture with server-side rendering, API routes, and database persistence. The design emphasizes responsive web design patterns while providing robust financial tracking capabilities across multiple accounts and currencies with secure user authentication and data storage.

## Architecture

### Development Setup

The project uses **pnpm** as the package manager. All dependency management, script execution, and workspace operations should use pnpm commands:

- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm lint` - Run linting

**Important**: Do not use npm or yarn commands. The project is configured with pnpm workspaces and requires pnpm for proper dependency resolution and workspace management.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │────│   API Routes    │────│   Database      │
│   Pages/App     │    │   (tRPC/REST)   │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│   Services &    │──────────────┘
                        │   Validation    │
                        └─────────────────┘
```

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Package Manager**: pnpm (required)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: iron-session
- **State Management**: Zustand + React Query (TanStack Query)
- **Charts**: Recharts
- **Form Handling**: React Hook Form + Zod validation
- **Deployment**: Vercel (recommended)

## Components and Interfaces

### Database Schema (Prisma)

#### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  accounts         Account[]
  accountShares    AccountShare[]
  createdTransactions Transaction[] @relation("TransactionCreator")

  @@map("users")
}
```

#### Account Model

```prisma
model Account {
  id              String      @id @default(cuid())
  name            String
  type            AccountType
  defaultCurrency String      @default("USD")
  shareToken      String?     @unique // For view-only sharing
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets      Budget[]
  shares       AccountShare[]

  @@map("accounts")
}

enum AccountType {
  PERSONAL
  FAMILY
  SAVINGS
  BUSINESS
  INVESTMENT
  EMERGENCY_FUND
}
```

#### Transaction Model

```prisma
model Transaction {
  id          String          @id @default(cuid())
  amount      Decimal         @db.Decimal(10, 2)
  currency    String          @default("USD")
  category    String
  description String?
  date        DateTime
  type        TransactionType
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  accountId String
  account   Account @relation(fields: [accountId], references: [id], onDelete: Cascade)

  createdById String?
  createdBy   User?   @relation("TransactionCreator", fields: [createdById], references: [id])

  // Transfer-related fields
  transferId       String?
  transfer         Transfer? @relation(fields: [transferId], references: [id])

  @@map("transactions")
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

#### Budget Model

````prisma
model Budget {
  id           String  @id @default(cuid())
  category     String
  monthlyLimit Decimal @db.Decimal(10, 2)
  currency     String  @default("USD")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  accountId String
  account   Account @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@unique([accountId, category])
  @@map("budgets")
}

#### AccountShare Model
```prisma
model AccountShare {
  id         String    @id @default(cuid())
  permission SharePermission
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  accountId String
  account   Account @relation(fields: [accountId], references: [id], onDelete: Cascade)

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([accountId, userId])
  @@map("account_shares")
}

enum SharePermission {
  READ_ONLY
  FULL_ACCESS
}

#### Transfer Model
```prisma
model Transfer {
  id           String    @id @default(cuid())
  amount       Decimal   @db.Decimal(10, 2)
  sourceCurrency String
  targetCurrency String
  exchangeRate Decimal?  @db.Decimal(10, 6) // Only for cross-currency transfers
  description  String?
  date         DateTime
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  sourceAccountId String
  targetAccountId String

  userId String

  transactions Transaction[]

  @@map("transfers")
}
````

```

### API Layer

#### API Routes Structure
```

/api/
├── auth/
│ ├── login.ts (POST)
│ ├── register.ts (POST)
│ ├── logout.ts (POST)
│ └── me.ts (GET)
├── accounts/
│ ├── route.ts (GET, POST)
│ ├── [id]/
│ │ ├── route.ts (GET, PUT, DELETE)
│ │ ├── share/
│ │ │ └── route.ts (POST, DELETE)
│ │ ├── collaborators/
│ │ │ └── route.ts (GET, POST, DELETE)
│ │ └── export/
│ │ └── route.ts (GET - CSV export)
│ └── shared/
│ └── [token]/
│ └── route.ts (GET - view shared account)
├── transactions/
│ ├── route.ts (GET, POST)
│ ├── [id]/
│ │ └── route.ts (GET, PUT, DELETE)
│ ├── bulk/
│ │ └── route.ts (POST for bulk operations)
│ ├── export/
│ │ └── route.ts (GET - CSV export)
│ └── import/
│ └── route.ts (POST - CSV import)
├── transfers/
│ ├── route.ts (GET, POST)
│ └── [id]/
│ └── route.ts (GET, PUT, DELETE)
└── budgets/
├── route.ts (GET, POST)
└── [id]/
└── route.ts (GET, PUT, DELETE)

```

#### Service Layer

#### DatabaseService
- Manages Prisma client operations
- Provides CRUD operations with proper error handling
- Handles database transactions and rollbacks
- Manages data relationships and constraints

#### CurrencyService
- Manages currency formatting using Intl API
- Provides list of supported currencies
- Handles currency symbol display and localization
- Currency conversion utilities (future enhancement)

#### CategoryService
- Manages predefined and custom categories
- Provides category icons and colors
- Handles category validation and suggestions

#### SharingService
- Manages account sharing and collaboration
- Generates secure share tokens for view-only access
- Handles collaboration invites and permissions
- Validates share access and permissions

#### ImportExportService
- Handles CSV export with filtering options
- Manages CSV import with validation and preview
- Duplicate detection and resolution
- Format validation and error reporting

#### TransferService
- Manages account-to-account transfers
- Handles currency conversion calculations
- Creates linked transactions for transfers
- Validates transfer permissions and account ownership

#### ValidationService
- Zod schemas for all data models
- Form validation logic
- API request/response validation
- Business rule validation

### Client-Side Hooks & State

#### useAccounts (React Query)
- Fetches and caches account data
- Provides account CRUD mutations
- Handles optimistic updates
- Account selection state management

#### useTransactions (React Query)
- Manages transaction data with pagination
- Provides transaction CRUD operations
- Handles filtering, sorting, and search
- Real-time updates with cache invalidation

#### useAddTransaction
- Form state management with React Hook Form
- Real-time validation with Zod
- Handles form submission and error states
- Category and account selection logic

#### useBudgets (React Query)
- Manages budget data and calculations
- Handles budget progress tracking
- Provides budget alert logic
- Budget vs actual spending comparisons

### Application Structure

```

src/
├── app/ (Next.js App Router)
│ ├── layout.tsx
│ ├── page.tsx (Dashboard)
│ ├── login/
│ │ └── page.tsx
│ ├── register/
│ │ └── page.tsx
│ ├── transactions/
│ │ ├── page.tsx
│ │ ├── add/
│ │ │ └── page.tsx
│ │ ├── import/
│ │ │ └── page.tsx
│ │ └── [id]/
│ │ └── page.tsx
│ ├── transfers/
│ │ ├── page.tsx
│ │ ├── add/
│ │ │ └── page.tsx
│ │ └── [id]/
│ │ └── page.tsx
│ ├── budgets/
│ │ ├── page.tsx
│ │ └── add/
│ │ └── page.tsx
│ ├── insights/
│ │ └── page.tsx
│ ├── settings/
│ │ └── page.tsx
│ ├── shared/
│ │ └── [token]/
│ │ └── page.tsx
│ └── api/ (API Routes)
├── components/
│ ├── ui/ (shadcn/ui components)
│ ├── forms/
│ │ ├── AddTransactionForm
│ │ ├── AddAccountForm
│ │ ├── AddBudgetForm
│ │ ├── AddTransferForm
│ │ ├── ImportCSVForm
│ │ └── ShareAccountForm
│ ├── dashboard/
│ │ ├── AccountSelector
│ │ ├── MonthlyOverview
│ │ └── QuickActions
│ ├── transactions/
│ │ ├── TransactionList
│ │ ├── TransactionItem
│ │ ├── TransactionFilters
│ │ ├── ExportButton
│ │ └── ImportPreview
│ ├── transfers/
│ │ ├── TransferList
│ │ ├── TransferItem
│ │ └── ExchangeRateInput
│ ├── sharing/
│ │ ├── ShareDialog
│ │ ├── CollaboratorList
│ │ └── SharedAccountBanner
│ ├── charts/
│ │ ├── SpendingChart
│ │ ├── CategoryBreakdown
│ │ └── BudgetProgress
│ └── layout/
│ ├── Header
│ ├── Sidebar
│ └── MobileNav
├── lib/
│ ├── prisma.ts
│ ├── session.ts
│ ├── auth.ts
│ ├── validations/
│ └── utils/
├── hooks/
│ ├── useAccounts.ts
│ ├── useTransactions.ts
│ └── useBudgets.ts
└── types/
└── index.ts

````

## Data Models

### Transaction Categories
**Predefined Categories:**
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Travel
- Education
- Gifts & Donations
- Personal Care
- Income (for income transactions)

### Account Types
- Personal
- Family
- Savings
- Business
- Investment
- Emergency Fund

### Supported Currencies
Supported currencies for the application:
- USD (US Dollar)
- EUR (Euro)
- UAH (Ukrainian Hryvnia)

## Error Handling

### Data Validation
- Amount validation: Must be positive, non-zero decimal
- Date validation: Cannot be future date for expenses
- Currency validation: Must be supported currency code
- Account validation: Must exist and be accessible

### Error Types
```typescript
enum MoneyTrackerError {
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_DATE = 'INVALID_DATE',
  UNSUPPORTED_CURRENCY = 'UNSUPPORTED_CURRENCY',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  DATA_CORRUPTION = 'DATA_CORRUPTION',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

const ErrorMessages = {
  [MoneyTrackerError.INVALID_AMOUNT]: 'Please enter a valid amount',
  [MoneyTrackerError.INVALID_DATE]: 'Please select a valid date',
  [MoneyTrackerError.UNSUPPORTED_CURRENCY]: 'Currency not supported',
  [MoneyTrackerError.ACCOUNT_NOT_FOUND]: 'Account not found',
  [MoneyTrackerError.DATA_CORRUPTION]: 'Data corruption detected',
  [MoneyTrackerError.STORAGE_ERROR]: 'Storage operation failed'
};
````

### Error Handling Strategy

- Form validation with real-time feedback
- Graceful degradation for data corruption
- User-friendly error messages
- Automatic retry for transient failures
- Data backup and recovery options

## Testing Strategy

### Authentication & Security

#### Authentication Strategy

- iron-session for secure, encrypted session management
- Email/password authentication with secure password hashing
- Session-based authentication with httpOnly cookies
- Protected API routes with session validation middleware
- Automatic session expiration and renewal

#### Session Configuration

```typescript
export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD!,
  cookieName: "money-tracker-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};
```

#### Security Measures

- Input validation with Zod schemas
- SQL injection prevention with Prisma
- CSRF protection with SameSite cookies
- Rate limiting on API endpoints
- Secure password hashing with bcrypt
- Encrypted session data with iron-session

### Unit Testing

- **API Routes**: Test endpoint logic, validation, and error handling
- **Services**: Test business logic, data transformations, and database operations
- **Utilities**: Test currency formatting, date calculations, and validation helpers
- **Components**: Test component rendering, user interactions, and form submissions
- **Hooks**: Test React Query hooks and state management

### Integration Testing

- **Database Operations**: Test Prisma operations with test database
- **API Integration**: Test full request/response cycles
- **Authentication Flow**: Test login, logout, and protected routes
- **Form Submissions**: Test end-to-end form handling

### E2E Testing

- **Critical User Flows**: Registration, login, add transaction, create account, set budget
- **Multi-Account Scenarios**: Test account switching and data isolation
- **Responsive Design**: Test across different screen sizes
- **Currency Handling**: Test multi-currency display and calculations

### Test Data Strategy

- Use separate test database with Docker
- Seed data for consistent testing
- Mock external services and APIs
- Test with various currency and locale settings
- Use Playwright for E2E testing

### Performance Considerations

- **Database Optimization**: Proper indexing and query optimization
- **Caching Strategy**: React Query for client-side caching, Redis for server-side (future)
- **Image Optimization**: Next.js Image component for charts and icons
- **Bundle Optimization**: Code splitting and lazy loading
- **SEO**: Server-side rendering for better performance and SEO

The design ensures scalability, maintainability, and follows Next.js best practices while meeting all specified requirements for multi-account, multi-currency financial tracking with secure user authentication and database storage.
