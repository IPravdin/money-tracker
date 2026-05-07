import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTransferSchema } from "@/lib/validations/transfer";
import { Decimal } from "@prisma/client/runtime/library";

// GET /api/transfers/[id] - Get a specific transfer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const transfer = await prisma.transfer.findFirst({
      where: {
        id,
        userId: session.userId,
      },
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

    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    // Fetch source and target account details
    const [sourceAccount, targetAccount] = await Promise.all([
      prisma.account.findUnique({
        where: { id: transfer.sourceAccountId },
        select: {
          id: true,
          name: true,
          type: true,
          defaultCurrency: true,
        },
      }),
      prisma.account.findUnique({
        where: { id: transfer.targetAccountId },
        select: {
          id: true,
          name: true,
          type: true,
          defaultCurrency: true,
        },
      }),
    ]);

    const enrichedTransfer = {
      ...transfer,
      sourceAccount,
      targetAccount,
    };

    return NextResponse.json({ transfer: enrichedTransfer });
  } catch (error) {
    console.error("Error fetching transfer:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfer" },
      { status: 500 }
    );
  }
}

// PUT /api/transfers/[id] - Update a transfer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTransferSchema.parse(body);

    // Verify that the transfer belongs to the user
    const existingTransfer = await prisma.transfer.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        transactions: true,
      },
    });

    if (!existingTransfer) {
      return NextResponse.json(
        { error: "Transfer not found or access denied" },
        { status: 404 }
      );
    }

    // Get account currencies to check if exchange rate update is valid
    const [sourceAccount, targetAccount] = await Promise.all([
      prisma.account.findUnique({
        where: { id: existingTransfer.sourceAccountId },
        select: { defaultCurrency: true },
      }),
      prisma.account.findUnique({
        where: { id: existingTransfer.targetAccountId },
        select: { defaultCurrency: true },
      }),
    ]);

    const isCrossCurrency =
      sourceAccount?.defaultCurrency !== targetAccount?.defaultCurrency;

    // If updating amount or exchange rate, recalculate target amount
    const newAmount = validatedData.amount ?? existingTransfer.amount.toNumber();
    const newExchangeRate =
      validatedData.exchangeRate !== undefined
        ? validatedData.exchangeRate
        : existingTransfer.exchangeRate?.toNumber();

    // Validate exchange rate for cross-currency transfers
    if (isCrossCurrency && validatedData.amount && !newExchangeRate) {
      return NextResponse.json(
        {
          error:
            "Exchange rate is required for transfers between different currencies",
        },
        { status: 400 }
      );
    }

    const targetAmount = isCrossCurrency && newExchangeRate
      ? newAmount * newExchangeRate
      : newAmount;

    // Update transfer and transactions in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the transfer record
      const transfer = await tx.transfer.update({
        where: { id },
        data: {
          ...(validatedData.amount !== undefined && {
            amount: new Decimal(validatedData.amount),
          }),
          ...(validatedData.description !== undefined && {
            description: validatedData.description,
          }),
          ...(validatedData.date !== undefined && {
            date: validatedData.date,
          }),
          ...(validatedData.exchangeRate !== undefined && {
            exchangeRate: validatedData.exchangeRate
              ? new Decimal(validatedData.exchangeRate)
              : null,
          }),
        },
      });

      // Update related transactions if amount, date, or description changed
      if (
        validatedData.amount !== undefined ||
        validatedData.date !== undefined ||
        validatedData.description !== undefined
      ) {
        // Find expense and income transactions
        const expenseTransaction = existingTransfer.transactions.find(
          (t) => t.accountId === existingTransfer.sourceAccountId
        );
        const incomeTransaction = existingTransfer.transactions.find(
          (t) => t.accountId === existingTransfer.targetAccountId
        );

        if (expenseTransaction) {
          await tx.transaction.update({
            where: { id: expenseTransaction.id },
            data: {
              ...(validatedData.amount !== undefined && {
                amount: new Decimal(newAmount),
              }),
              ...(validatedData.date !== undefined && {
                date: validatedData.date,
              }),
              ...(validatedData.description !== undefined && {
                description: validatedData.description,
              }),
            },
          });
        }

        if (incomeTransaction) {
          await tx.transaction.update({
            where: { id: incomeTransaction.id },
            data: {
              ...(validatedData.amount !== undefined && {
                amount: new Decimal(targetAmount),
              }),
              ...(validatedData.date !== undefined && {
                date: validatedData.date,
              }),
              ...(validatedData.description !== undefined && {
                description: validatedData.description,
              }),
            },
          });
        }
      }

      return transfer;
    });

    // Fetch the complete updated transfer
    const completeTransfer = await prisma.transfer.findUnique({
      where: { id: result.id },
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
    const [sourceAccountInfo, targetAccountInfo] = await Promise.all([
      prisma.account.findUnique({
        where: { id: existingTransfer.sourceAccountId },
        select: {
          id: true,
          name: true,
          type: true,
          defaultCurrency: true,
        },
      }),
      prisma.account.findUnique({
        where: { id: existingTransfer.targetAccountId },
        select: {
          id: true,
          name: true,
          type: true,
          defaultCurrency: true,
        },
      }),
    ]);

    const enrichedTransfer = {
      ...completeTransfer,
      sourceAccount: sourceAccountInfo,
      targetAccount: targetAccountInfo,
    };

    return NextResponse.json({ transfer: enrichedTransfer });
  } catch (error) {
    console.error("Error updating transfer:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update transfer" },
      { status: 500 }
    );
  }
}

// DELETE /api/transfers/[id] - Delete a transfer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify that the transfer belongs to the user
    const existingTransfer = await prisma.transfer.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        transactions: true,
      },
    });

    if (!existingTransfer) {
      return NextResponse.json(
        { error: "Transfer not found or access denied" },
        { status: 404 }
      );
    }

    // Delete transfer and related transactions in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete related transactions
      await tx.transaction.deleteMany({
        where: {
          transferId: id,
        },
      });

      // Delete the transfer
      await tx.transfer.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transfer:", error);
    return NextResponse.json(
      { error: "Failed to delete transfer" },
      { status: 500 }
    );
  }
}
