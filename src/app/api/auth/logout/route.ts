import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    // Destroy the session
    session.destroy();
    
    return NextResponse.json({ message: "Logged out successfully" });
    
  } catch (error) {
    console.error("Logout error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}