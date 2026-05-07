import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTransferSchema } from "@/lib/validations/transfer";
import { TransactionType } from "@/types/enums";
import { Decimal } from "@prisma/client/runtime/library";

// GET /api/transfers - Get all transfers for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    // Build where clause
    const whereClause: {
      userId: string;
      OR?: Array<{ sourceAccountId: string } | { targetAccountId: string }>;
    } = {
      userId: session.userId,
    };

    // If accountId is provided, filter transfers where the account is either source or target
    if (accountId) {
      whereClause.OR = [
        { sourceAccountId: accountId },
        { targetAccountId: accountId },
      ];
    }

    const transfers = await prisma.transfer.findMany({
      where: whereClause,
      include: {
        transactions: {
          include: {
            account: {
              select: {
                id: true,
                name: true,
                type: true,
                defaultCurrency: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Enrich transfers with source and target account information
    const enrichedTransfers = await Promise.all(
      transfers.map(async (transfer) => {
        const sourceAccount = await prisma.account.findUnique({
          where: { id: transfer.sourceAccountId },
          select: {
            id: true,
            name: true,
            type: true,
            defaultCurrency: true,
          },
        });

        const targetAccount = await prisma.account.findUnique({
          where: { id: transfer.targetAccountId },
          select: {
            id: true,
            name: true,
            type: true,
            defaultCurrency: true,
          },
        });

        return {
          ...transfer,
          sourceAccount,
          targetAccount,
        };
      })
    );

    return NextResponse.json({ transfers: enrichedTransfers });
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}

// POST /api/transfers - Create a new transfer
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTransferSchema.parse(body);

    // Verify that both accounts belong to the user
    const [sourceAccount, targetAccount] = await Promise.all([
      prisma.account.findFirst({
        where: {
          id: validatedData.sourceAccountId,
          userId: session.userId,
        },
      }),
      prisma.account.findFirst({
        where: {
          id: validatedData.targetAccountId,
          userId: session.userId,
        },
      }),
    ]);

    if (!sourceAccount) {
      return NextResponse.json(
        { error: "Source account not found or access denied" },
        { status: 404 }
      );
    }

    if (!targetAccount) {
      return NextResponse.json(
        { error: "Target account not found or access denied" },
        { status: 404 }
      );
    }

    // Check if currencies are different and exchange rate is required
    const isCrossCurrency =
      sourceAccount.defaultCurrency !== targetAccount.defaultCurrency;

    if (isCrossCurrency && !validatedData.exchangeRate) {
      return NextResponse.json(
        {
          error:
            "Exchange rate is required for transfers between different currencies",
        },
        { status: 400 }
      );
    }

    // Calculate target amount
    const sourceAmount = validatedData.amount;
    const targetAmount = isCrossCurrency
      ? validatedData.amount * (validatedData.exchangeRate || 1)
      : validatedData.amount;

    // Create transfer and transactions in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the transfer record
      const transfer = await tx.transfer.create({
        data: {
          amount: new Decimal(validatedData.amount),
          sourceCurrency: sourceAccount.defaultCurrency,
          targetCurrency: targetAccount.defaultCurrency,
          exchangeRate: validatedData.exchangeRate
            ? new Decimal(validatedData.exchangeRate)
            : null,
          description: validatedData.description,
          date: validatedData.date,
          sourceAccountId: validatedData.sourceAccountId,
          targetAccountId: validatedData.targetAccountId,
          userId: session.userId,
        },
      });

      // Create expense transaction in source account
      const expenseTransaction = await tx.transaction.create({
        data: {
          amount: new Decimal(sourceAmount),
          currency: sourceAccount.defaultCurrency,
          category: "Transfer",
          description: validatedData.description || `Transfer to ${targetAccount.name}`,
          date: validatedData.date,
          type: TransactionType.EXPENSE,
          accountId: validatedData.sourceAccountId,
          createdById: session.userId,
          transferId: transfer.id,
        },
      });

      // Create income transaction in target account
      const incomeTransaction = await tx.transaction.create({
        data: {
          amount: new Decimal(targetAmount),
          currency: targetAccount.defaultCurrency,
          category: "Transfer",
          description: validatedData.description || `Transfer from ${sourceAccount.name}`,
          date: validatedData.date,
          type: TransactionType.INCOME,
          accountId: validatedData.targetAccountId,
          createdById: session.userId,
          transferId: transfer.id,
        },
      });

      return {
        transfer,
        expenseTransaction,
        incomeTransaction,
      };
    });

    // Fetch the complete transfer with all relations
    const completeTransfer = await prisma.transfer.findUnique({
      where: { id: result.transfer.id },
      include: {
        transactions: {
          include: {
            account: {
              select: {
                id: true,
                name: true,
                type: true,
                defaultCurrency: true,
              },
            },
          },
        },
      },
    });

    // Add source and target account info
    const enrichedTransfer = {
      ...completeTransfer,
      sourceAccount,
      targetAccount,
    };

    return NextResponse.json({ transfer: enrichedTransfer }, { status: 201 });
  } catch (error) {
    console.error("Error creating transfer:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
