import type { NextAuthOptions, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { isDbDisabled } from "./config";
import { getDb } from "./mongodb";

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin123";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = String(credentials.username).trim();
        const password = String(credentials.password).trim();
        const envUsername = process.env.ADMIN_USERNAME || DEFAULT_USERNAME;
        const envPassword = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

        if (!isDbDisabled()) {
          try {
            const bcrypt = await import("bcrypt");
            const db = await getDb();
            const collection = db.collection("AdminUser");
            const adminCount = await collection.countDocuments();

            if (adminCount === 0) {
              if (username.toLowerCase() === envUsername.toLowerCase() && password === envPassword) {
                const passwordHash = await bcrypt.default.hash(envPassword, 10);
                const created = await collection.insertOne({
                  username: envUsername,
                  passwordHash,
                  name: "Administrator",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
                if (created.insertedId) {
                  return { id: created.insertedId.toString(), name: "Administrator" } as User;
                }
              }
            } else {
              const user = await collection.findOne({ username });
              if (user) {
                const ok = await bcrypt.default.compare(password, user.passwordHash).catch(() => false);
                if (ok) {
                  return { id: user._id.toString(), name: user.name ?? "Administrator" } as User;
                }
              }
            }
          } catch (error) {
            console.error("Database auth error:", error);
          }
        }

        if (username.toLowerCase() === envUsername.toLowerCase() && password === envPassword) {
          return {
            id: "admin",
            name: "Administrator",
            email: "admin@example.com",
          } as User;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "next-notis-app-secret-key-2024",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string; name?: string | null }).id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
};
