import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// POST /api/accounts/[id]/share - Generate or regenerate view-only share token
export async function POST(
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
    });

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Generate a secure random token
    const shareToken = randomBytes(32).toString("hex");

    // Update account with new share token
    const account = await prisma.account.update({
      where: {
        id,
      },
      data: {
        shareToken,
      },
    });

    return NextResponse.json({ 
      shareToken: account.shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${account.shareToken}`
    });
  } catch (error) {
    console.error("Error generating share token:", error);
    return NextResponse.json(
      { error: "Failed to generate share token" },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id]/share - Revoke view-only share token
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
    });

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Remove share token
    await prisma.account.update({
      where: {
        id,
      },
      data: {
        shareToken: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking share token:", error);
    return NextResponse.json(
      { error: "Failed to revoke share token" },
      { status: 500 }
    );
  }
}
