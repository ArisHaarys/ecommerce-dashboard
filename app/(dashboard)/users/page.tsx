import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  createUser,
  deleteUser,
} from "@/lib/actions/user-actions";

export default async function UsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: {
      nama: "asc",
    },
  });

return (
  <div className="space-y-6">
    <h1 className="text-2xl font-semibold">
      Manajemen User
    </h1>

    {/* FORM TAMBAH USER */}

    <form
      action={createUser}
      className="grid gap-4 md:grid-cols-5 border p-4 rounded-lg"
    >
      <input
        name="nama"
        placeholder="Nama"
        className="border p-2 rounded"
        required
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        className="border p-2 rounded"
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        className="border p-2 rounded"
        required
      />

      <select
        name="role"
        className="border p-2 rounded"
      >
        <option value="ADMIN">ADMIN</option>
        <option value="KARYAWAN">KARYAWAN</option>
      </select>

      <button
        type="submit"
        className="bg-black text-white rounded px-4"
      >
        Tambah User
      </button>
    </form>

    {/* TABEL USER */}

    <table className="w-full text-sm">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Email</th>
          <th>Role</th>
          <th>Aksi</th>
        </tr>
      </thead>

      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.nama}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>

            <td>
              <form
                action={deleteUser.bind(
                  null,
                  user.id
                )}
              >
                <button
                  type="submit"
                  className="text-red-500"
                >
                  Hapus
                </button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}