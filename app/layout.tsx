import type { Metadata } from "next";
import { MobileNav, Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "E-Commerce Tools",
  description: "Modern admin dashboard for commerce operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 text-zinc-950">
  <AuthProvider>
    <div className="flex min-h-screen">

      {/* <Sidebar /> */}
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <Topbar />
        <main className="flex-1 px-4 py-6 lg:px-6">
          {children}
        </main>
      </div>

      {/* 
<div className="fixed inset-x-0 bottom-0 z-20 lg:hidden">
  <MobileNav />
</div>
*/}
      <div className="fixed inset-x-0 bottom-0 z-20 lg:hidden">
        <MobileNav />
      </div>
    </div>
  </AuthProvider>
</body>
    </html>
  );
}
