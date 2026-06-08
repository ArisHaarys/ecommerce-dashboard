import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth-guard";

export default async function SettingsPage() {
  await requireAdmin(); 
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Setting</h1>
        <p className="text-sm text-zinc-500">Area konfigurasi toko, pengguna, dan preferensi aplikasi.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">Modul setting siap dikembangkan untuk profil toko, role pengguna, dan integrasi marketplace.</p>
        </CardContent>
      </Card>
    </div>
  );
}
