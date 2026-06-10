import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createLog(
  action: string,
  description: string
) 

{
  const session = await getServerSession(authOptions);

  await prisma.activityLog.create({
    data: {
      userId: session?.user?.id,
      userName: session?.user?.name || "Unknown",
      action,
      description,
    },
  });
}