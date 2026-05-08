import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/accounts/shared/[token] - Get account data via share token (view-only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find account by share token
    const account = await prisma.account.findUnique({
      where: {
        shareToken: token,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        transactions: {
          orderBy: {
            date: "desc",
          },
          include: {
            createdBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        budgets: true,
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Invalid or expired share link" }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error("Error fetching shared account:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared account" },
      { status: 500 }
    );
  }
}
