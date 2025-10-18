import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { SessionData, sessionOptions } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Create session
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    session.userId = user.id;
    session.email = user.email;
    session.name = user.name || undefined;
    session.isLoggedIn = true;
    
    await session.save();
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
    
  } catch (error) {
    console.error("Login error:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}