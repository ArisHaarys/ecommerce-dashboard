import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
  console.log("LOGIN ATTEMPT:", credentials?.email);

  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  console.log("EMAIL:", credentials.email);
  console.log("PASSWORD:", credentials.password);

  const user = await prisma.user.findUnique({
    where: {
      email: credentials.email,
    },
  });

  console.log("USER FOUND:", user);

  if (!user) {
    return null;
  }

  const validPassword = await compare(
    credentials.password,
    user.password
  );

  console.log("PASSWORD VALID:", validPassword);

  if (!validPassword) {
    return null;
  }

  return {
    id: user.id,
    name: user.nama,
    email: user.email,
    role: user.role,
  };
}
    }),
  ],

  callbacks: {
  jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.role = user.role;
  }

  return token;
},

    session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.role = token.role as string;
  }

  return session;
},
  },
};