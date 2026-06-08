export type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export type DashboardMetric = {
  label: string;
  value: string;
  helper: string;
};

export type ChartPoint = {
  name: string;
  omzet?: number;
  biaya?: number;
  leads?: number;
};
