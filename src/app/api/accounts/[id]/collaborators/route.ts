import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addCollaboratorSchema = z.object({
  email: z.string().email(),
  permission: z.enum(["READ_ONLY", "FULL_ACCESS"]),
});

// GET /api/accounts/[id]/collaborators - Get all collaborators for an account
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
    
    // Check if account exists and user has access (owner or collaborator)
    const account = await prisma.account.findFirst({
      where: {
        id,
        OR: [
          { userId: session.userId },
          { shares: { some: { userId: session.userId } } },
        ],
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Get all collaborators
    const collaborators = await prisma.accountShare.findMany({
      where: {
        accountId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}

// POST /api/accounts/[id]/collaborators - Add a collaborator to an account
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
    const body = await request.json();
    const validatedData = addCollaboratorSchema.parse(body);

    // Check if account exists and belongs to user (only owner can add collaborators)
    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found or you don't have permission" }, { status: 404 });
    }

    // Find user by email
    const collaboratorUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (!collaboratorUser) {
      return NextResponse.json({ error: "User not found. They need to register first." }, { status: 404 });
    }

    // Check if user is trying to add themselves
    if (collaboratorUser.id === session.userId) {
      return NextResponse.json({ error: "Cannot add yourself as a collaborator" }, { status: 400 });
    }

    // Check if collaborator already exists
    const existingShare = await prisma.accountShare.findUnique({
      where: {
        accountId_userId: {
          accountId: id,
          userId: collaboratorUser.id,
        },
      },
    });

    if (existingShare) {
      return NextResponse.json({ error: "User is already a collaborator" }, { status: 400 });
    }

    // Create account share
    const accountShare = await prisma.accountShare.create({
      data: {
        accountId: id,
        userId: collaboratorUser.id,
        permission: validatedData.permission,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ collaborator: accountShare });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add collaborator" },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id]/collaborators - Remove a collaborator from an account
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
    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get("userId");

    if (!collaboratorId) {
      return NextResponse.json({ error: "Collaborator user ID is required" }, { status: 400 });
    }

    // Check if account exists and belongs to user (only owner can remove collaborators)
    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found or you don't have permission" }, { status: 404 });
    }

    // Remove account share
    await prisma.accountShare.delete({
      where: {
        accountId_userId: {
          accountId: id,
          userId: collaboratorId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json(
      { error: "Failed to remove collaborator" },
      { status: 500 }
    );
  }
}
