import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAccountSchema } from "@/lib/validations/account";

// GET /api/accounts - Get all accounts for the authenticated user (owned + shared)
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get owned accounts
    const ownedAccounts = await prisma.account.findMany({
      where: {
        userId: session.userId,
      },
      include: {
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
            shares: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get shared accounts (where user is a collaborator)
    const sharedAccounts = await prisma.account.findMany({
      where: {
        shares: {
          some: {
            userId: session.userId,
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        shares: {
          where: {
            userId: session.userId,
          },
          select: {
            permission: true,
          },
        },
        _count: {
          select: {
            shares: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ 
      ownedAccounts,
      sharedAccounts,
      accounts: [...ownedAccounts, ...sharedAccounts] // Combined list for backward compatibility
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

// POST /api/accounts - Create a new account
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAccountSchema.parse(body);

    // Check if this is the user's first account
    const existingAccountsCount = await prisma.account.count({
      where: {
        userId: session.userId,
      },
    });

    const account = await prisma.account.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        defaultCurrency: validatedData.defaultCurrency,
        userId: session.userId,
      },
    });

    return NextResponse.json({ 
      account,
      isFirstAccount: existingAccountsCount === 0 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating account:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}