import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateBudgetSchema } from "@/lib/validations/budget";

// GET /api/budgets/[id] - Get a specific budget
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        account: {
          userId: session.userId,
        },
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

    if (!budget) {
      return NextResponse.json(
        { error: "Budget not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ budget });
  } catch (error) {
    console.error("Error fetching budget:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget" },
      { status: 500 }
    );
  }
}

// PUT /api/budgets/[id] - Update a budget
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify that the budget belongs to the user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        account: {
          userId: session.userId,
        },
      },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Budget not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateBudgetSchema.parse(body);

    // If category is being updated, check for conflicts
    if (validatedData.category && validatedData.category !== existingBudget.category) {
      const conflictingBudget = await prisma.budget.findUnique({
        where: {
          accountId_category: {
            accountId: existingBudget.accountId,
            category: validatedData.category,
          },
        },
      });

      if (conflictingBudget) {
        return NextResponse.json(
          { error: "A budget for this category already exists in this account" },
          { status: 409 }
        );
      }
    }

    const budget = await prisma.budget.update({
      where: {
        id: params.id,
      },
      data: validatedData,
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

    return NextResponse.json({ budget });
  } catch (error) {
    console.error("Error updating budget:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 }
    );
  }
}

// DELETE /api/budgets/[id] - Delete a budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify that the budget belongs to the user
    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        account: {
          userId: session.userId,
        },
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Budget not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 }
    );
  }
}
