import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  Settings,
  Warehouse,
} from "lucide-react";

function getNavigation(role?: string) {
  const navigation = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/produk", label: "Produk", icon: Boxes },
    { href: "/pesanan", label: "Pesanan", icon: ClipboardList },
    { href: "/stok", label: "Riwayat Stok", icon: Warehouse },
  ];

  const userRole = role?.toUpperCase();
  
  if (role === "ADMIN") {
    navigation.push(
      { href: "/iklan", label: "Rekap Iklan", icon: Megaphone },
      { href: "/settings", label: "Setting", icon: Settings }
    );
  }

  return navigation;
}

export async function Sidebar() {
  const session = await getServerSession(authOptions);
  const navigation = getNavigation(session?.user?.role);

  console.log("ROLE SIDEBAR:", session?.user?.role);
  console.log("SESSION:", session);
  console.log("ROLE:", session?.user?.role);

  return (
    <aside className="hidden w-64 border-r border-zinc-200 bg-white lg:block">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <BarChart3 size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-950">
              E-Commerce Tools
            </p>
            <p className="text-xs text-zinc-500">
              Admin Workspace
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const navigation = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/produk", label: "Produk", icon: Boxes },
    { href: "/pesanan", label: "Pesanan", icon: ClipboardList },
    { href: "/stok", label: "Riwayat Stok", icon: Warehouse },
  ];

  return (
    <nav className="grid grid-cols-4 border-t border-zinc-200 bg-white lg:hidden">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center gap-1 px-1 py-2 text-[11px] text-zinc-600"
        >
          <item.icon size={17} />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}