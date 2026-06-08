import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return session;
}