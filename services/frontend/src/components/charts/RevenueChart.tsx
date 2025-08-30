import type { RevenueTrend } from "@/data/types/Dashboard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface RevenueChartProps {
  chartData: RevenueTrend[];
  lastMonthWithActual: string;
}

export const RevenueChart = ( { chartData, lastMonthWithActual }: RevenueChartProps ) => {

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis 
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            className="text-xs"
          />
          <Tooltip 
            formatter={(value, name) => [
              `$${value?.toLocaleString()}`, 
              name === 'actual' ? 'Actual Revenue' : 'Forecast'
            ]}
            labelFormatter={(label) => `Month: ${label}`}
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '6px'
            }}
          />
          <ReferenceLine x={lastMonthWithActual} stroke="var(--muted-foreground)" strokeDasharray="2 2" />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="var(--primary)" 
            strokeWidth={3}
            dot={{ fill: "var(--primary)", strokeWidth: 2, r: 4 }}
            connectNulls={false}
          />
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="var(--chart-2)" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "var(--chart-2)", strokeWidth: 2, r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};