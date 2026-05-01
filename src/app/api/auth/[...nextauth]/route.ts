import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import { getOAuthProviderConfigs } from "@/lib/app-config";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function buildAuth() {
  const oauth = await getOAuthProviderConfigs();

  return NextAuth({
    trustHost: true,
    session: { strategy: "jwt" },
    pages: { signIn: "/login", error: "/login" },
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) return null;
          const { email, password } = parsed.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password) return null;
          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;
          return { id: user.id, email: user.email, name: user.name, image: user.image };
        },
      }),
      ...(oauth.google ? [Google(oauth.google)] : []),
      ...(oauth.github ? [GitHub(oauth.github)] : []),
    ],
    callbacks: {
      async signIn({ user, account }) {
        if (account?.provider !== "credentials" && user.email) {
          const existing = await prisma.user.findUnique({ where: { email: user.email } });
          if (!existing) {
            const created = await prisma.user.create({
              data: { email: user.email, name: user.name, image: user.image },
            });
            await prisma.userPreferences.create({ data: { userId: created.id } });
            user.id = created.id;
          } else {
            user.id = existing.id;
          }
        }
        return true;
      },
      async jwt({ token, user }) {
        if (user) token.id = user.id;
        return token;
      },
      async session({ session, token }) {
        if (token.id) session.user.id = token.id as string;
        return session;
      },
    },
  });
}

export async function GET(req: NextRequest) {
  const { handlers } = await buildAuth();
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  const { handlers } = await buildAuth();
  return handlers.POST(req);
}
