
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { SupportedCaliber } from '@/types/inventory';

interface AmmunitionUsageDataPoint {
  name: SupportedCaliber | string;
  'Kullanılan': number;
  'Mevcut Stok': number; // Added new field for stock
}

interface AmmunitionUsageSummaryChartProps {
  data: AmmunitionUsageDataPoint[];
}

const chartConfig = {
  'Kullanılan': {
    label: 'Kullanılan Miktar',
    color: 'hsl(var(--chart-1))',
  },
  'Mevcut Stok': { // New configuration for stock
    label: 'Mevcut Stok',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;


export function AmmunitionUsageSummaryChart({ data }: AmmunitionUsageSummaryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/50 rounded-md">
        <span suppressHydrationWarning>Fişek kullanım ve stok verisi bulunamadı.</span>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value.toLocaleString('tr-TR')}`} // Added localeString for better readability
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
            content={<ChartTooltipContent />} 
          />
          <Legend 
            content={({ payload }) => {
                if (!payload) return null;
                return (
                <div className="flex items-center justify-center gap-4 pt-3">
                    {payload.map((entry) => (
                    <div
                        key={entry.value}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                        <span
                        className="h-2 w-2 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: entry.color }}
                        />
                        {chartConfig[entry.value as keyof typeof chartConfig]?.label || entry.value}
                    </div>
                    ))}
                </div>
                );
            }}
            />
          <Bar dataKey="Kullanılan" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Mevcut Stok" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
