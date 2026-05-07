import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBudgetSchema } from "@/lib/validations/budget";

// GET /api/budgets - Get all budgets for the authenticated user
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

    const budgets = await prisma.budget.findMany({
      where: whereClause,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

// POST /api/budgets - Create a new budget
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBudgetSchema.parse(body);

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

    // Check if a budget already exists for this category in this account
    const existingBudget = await prisma.budget.findUnique({
      where: {
        accountId_category: {
          accountId: validatedData.accountId,
          category: validatedData.category,
        },
      },
    });

    if (existingBudget) {
      return NextResponse.json(
        { error: "A budget for this category already exists in this account" },
        { status: 409 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        category: validatedData.category,
        monthlyLimit: validatedData.monthlyLimit,
        currency: validatedData.currency,
        accountId: validatedData.accountId,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}
