import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export default async function LogsPage() {
  await requireAdmin();

  const logs = await prisma.activityLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Activity Log
      </h1>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Description</th>
            <th>Tanggal</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.userName}</td>
              <td>{log.action}</td>
              <td>{log.description}</td>
              <td>
                {new Date(log.createdAt).toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}