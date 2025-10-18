import { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  email?: string;
  name?: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD!,
  cookieName: "money-tracker-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "lax",
  },
};

declare module "iron-session" {
  interface IronSessionData {
    user?: SessionData;
  }
}