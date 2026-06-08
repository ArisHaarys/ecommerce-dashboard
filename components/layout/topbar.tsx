import { Bell, Search, UserCircle } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function Topbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur lg:px-6">
      <div className="w-full max-w-md">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            size={18}
          />
          <input
            placeholder="Cari produk, invoice, campaign..."
            className="h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-10 pr-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white"
          />
        </label>
      </div>

      <div className="ml-4 flex items-center gap-2">
        <button className="flex size-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
          <Bell size={18} />
        </button>

        <button className="flex h-10 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
          <UserCircle size={18} />

          <div className="hidden sm:flex flex-col items-start">
            <span>{session?.user?.name}</span>

            <span className="text-xs text-zinc-500">
              {session?.user?.role}
            </span>
          </div>
        </button>

        <LogoutButton />
      </div>
    </header>
  );
}