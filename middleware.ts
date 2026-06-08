export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/",
    "/produk/:path*",
    "/pesanan/:path*",
    "/stok/:path*",
    "/iklan/:path*",
    "/settings/:path*",
  ],
};