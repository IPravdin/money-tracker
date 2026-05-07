import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTransactionSchema } from "@/lib/validations/transaction";

// GET /api/transactions - Get all transactions for the authenticated user
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
      account: { userId: string };
      accountId?: string;
    } = {
      account: {
        userId: session.userId,
      },
    };

    if (accountId) {
      whereClause.accountId = accountId;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);

    // Verify that the account belongs to the user
    const account = await prisma.account.findFirst({
      where: {
        id: validatedData.accountId,
        userId: session.userId,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Account not found or access denied" },
        { status: 404 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: validatedData.amount,
        currency: validatedData.currency,
        category: validatedData.category,
        description: validatedData.description,
        date: validatedData.date,
        type: validatedData.type,
        accountId: validatedData.accountId,
        createdById: session.userId,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
