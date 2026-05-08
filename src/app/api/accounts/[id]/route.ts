import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateAccountSchema } from "@/lib/validations/account";

// GET /api/accounts/[id] - Get a specific account
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
    
    // Check if user owns the account or has shared access
    const account = await prisma.account.findFirst({
      where: {
        id,
        OR: [
          { userId: session.userId },
          { shares: { some: { userId: session.userId } } },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            transactions: true,
            budgets: true,
            shares: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Determine user's permission level
    const isOwner = account.userId === session.userId;
    const userShare = account.shares.find(share => share.userId === session.userId);
    const permission = isOwner ? "OWNER" : userShare?.permission || null;

    return NextResponse.json({ 
      account,
      permission,
      isOwner,
    });
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
}

// PUT /api/accounts/[id] - Update a specific account
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
    const validatedData = updateAccountSchema.parse(body);

    // Check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const account = await prisma.account.update({
      where: {
        id,
      },
      data: validatedData,
    });

    return NextResponse.json({ account });
  } catch (error) {
    console.error("Error updating account:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id] - Delete a specific account
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
    // Check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if account has transactions
    if (existingAccount._count.transactions > 0) {
      return NextResponse.json(
        { error: "Cannot delete account with existing transactions" },
        { status: 400 }
      );
    }

    // Check if this is the user's last account
    const totalAccounts = await prisma.account.count({
      where: {
        userId: session.userId,
      },
    });

    if (totalAccounts <= 1) {
      return NextResponse.json(
        { error: "Cannot delete your last account" },
        { status: 400 }
      );
    }

    await prisma.account.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}