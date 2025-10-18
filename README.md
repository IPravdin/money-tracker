# Money Tracker

A personal finance management web application built with Next.js 15, TypeScript, and PostgreSQL.

## Features

- Track income and expenses across multiple accounts
- Multi-currency support (USD, EUR, UAH)
- Budget management and tracking
- Account sharing and collaboration
- Visual insights with charts and analytics
- CSV import/export functionality
- Account-to-account transfers

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: iron-session
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State Management**: Zustand + React Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database URL and secrets.

4. Set up the database:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main models:
- **User**: User accounts and authentication
- **Account**: Financial accounts (Personal, Family, Savings, etc.)
- **Transaction**: Income and expense records
- **Budget**: Monthly spending limits by category
- **Transfer**: Account-to-account money transfers
- **AccountShare**: Account sharing and collaboration

## Development

### Database Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is licensed under the MIT License.