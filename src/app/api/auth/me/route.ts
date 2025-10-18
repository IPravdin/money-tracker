import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
    
  } catch (error) {
    console.error("Get current user error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}