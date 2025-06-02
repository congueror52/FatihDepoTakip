
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { MonthlyUsageDataPoint } from '@/lib/actions/inventory.actions'; // Assuming this type is exported
import { useMemo } from 'react';

interface MonthlyScenarioUsageChartProps {
  data: MonthlyUsageDataPoint[];
}

const buildChartConfig = (data: MonthlyUsageDataPoint[]): ChartConfig => {
  const config: ChartConfig = {};
  if (!data || data.length === 0) return config;

  const scenarioKeys = Object.keys(data[0] || {}).filter(key => key !== 'month');
  
  scenarioKeys.forEach((scenarioName, index) => {
    config[scenarioName] = {
      label: scenarioName,
      color: `hsl(var(--chart-${(index % 5) + 1}))`, // Cycle through chart-1 to chart-5
    };
  });
  return config;
};


export function MonthlyScenarioUsageChart({ data }: MonthlyScenarioUsageChartProps) {
  const chartConfig = useMemo(() => buildChartConfig(data), [data]);
  const scenarioKeys = useMemo(() => Object.keys(data[0] || {}).filter(key => key !== 'month'), [data]);

  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground bg-muted/50 rounded-md">
        <span suppressHydrationWarning>Aylık senaryo bazlı kullanım verisi bulunamadı.</span>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="month" 
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
            tickFormatter={(value) => `${value.toLocaleString('tr-TR')}`}
            allowDecimals={false}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={<ChartTooltipContent indicator="line" />} 
          />
          <ChartLegend content={<ChartLegendContent />} />
          {scenarioKeys.map((scenarioName) => (
            <Line
              key={scenarioName}
              type="monotone"
              dataKey={scenarioName}
              stroke={chartConfig[scenarioName]?.color || `hsl(var(--chart-${(scenarioKeys.indexOf(scenarioName) % 5) + 1}))`}
              strokeWidth={2}
              dot={{ r: 4, fill: chartConfig[scenarioName]?.color }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

