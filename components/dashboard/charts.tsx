"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint } from "@/lib/types";

export function SalesChart({ data }: { data: ChartPoint[] }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-72 min-h-72 rounded-md bg-zinc-50" />;

  return (
    <div className="h-72 min-h-72 min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={320} minHeight={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => new Intl.NumberFormat("id-ID").format(Number(value))} />
          <Bar dataKey="omzet" fill="#18181b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdsChart({ data }: { data: ChartPoint[] }) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-72 min-h-72 rounded-md bg-zinc-50" />;

  return (
    <div className="h-72 min-h-72 min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={320} minHeight={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => new Intl.NumberFormat("id-ID").format(Number(value))} />
          <Bar dataKey="biaya" fill="#0f766e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="leads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
