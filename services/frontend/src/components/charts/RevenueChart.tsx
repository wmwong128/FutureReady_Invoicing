import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export const RevenueChart = () => {
// Mock Data
  const data = [
    { month: "Sep", actual: 38000, forecast: null, confidence_upper: null, confidence_lower: null },
    { month: "Oct", actual: 42000, forecast: null, confidence_upper: null, confidence_lower: null },
    { month: "Nov", actual: 39000, forecast: null, confidence_upper: null, confidence_lower: null },
    { month: "Dec", actual: 45000, forecast: null, confidence_upper: null, confidence_lower: null },
    { month: "Jan", actual: 41000, forecast: null, confidence_upper: null, confidence_lower: null },
    { month: "Feb", actual: null, forecast: 47000, confidence_upper: 52000, confidence_lower: 42000 },
    { month: "Mar", actual: null, forecast: 49000, confidence_upper: 55000, confidence_lower: 43000 },
    { month: "Apr", actual: null, forecast: 52000, confidence_upper: 59000, confidence_lower: 45000 },
    { month: "May", actual: null, forecast: 48000, confidence_upper: 56000, confidence_lower: 40000 },
  ];

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis 
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            className="text-xs"
          />
          <Tooltip 
            formatter={(value, name) => [
              `$${value?.toLocaleString()}`, 
              name === 'actual' ? 'Actual Revenue' : 
              name === 'forecast' ? 'Forecast' :
              name === 'confidence_upper' ? 'Upper Bound' : 'Lower Bound'
            ]}
            labelFormatter={(label) => `Month: ${label}`}
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '6px'
            }}
          />
          <ReferenceLine x="Jan" stroke="var(--muted-foreground)" strokeDasharray="2 2" />
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
          <Line 
            type="monotone" 
            dataKey="confidence_upper" 
            stroke="var(--chart-2)" 
            strokeWidth={1}
            strokeOpacity={0.4}
            dot={false}
            connectNulls={false}
          />
          <Line 
            type="monotone" 
            dataKey="confidence_lower" 
            stroke="var(--chart-2)" 
            strokeWidth={1}
            strokeOpacity={0.4}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};