import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionData, defaultSession, sessionOptions } from "./session";

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }
  
  return session;
}

export async function logout() {
  const session = await getSession();
  session.destroy();
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    return null;
  }
  
  return {
    id: session.userId,
    email: session.email,
    name: session.name,
  };
}