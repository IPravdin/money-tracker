"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CategoryData } from "@/lib/utils/insights";
import { getCurrencySymbol } from "@/lib/validations/account";

interface ExpensesPieChartProps {
  data: CategoryData[];
  currency: string;
}

// Color palette for categories
const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#6366f1", // indigo
];

export function ExpensesPieChart({ data, currency }: ExpensesPieChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.category,
      value: item.amount,
      percentage: item.percentage,
    }));
  }, [data]);

  const currencySymbol = getCurrencySymbol(currency);

  // Custom label for pie chart
  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {currencySymbol}
            {data.value.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.payload.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No expense data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value, entry: any) => (
            <span className="text-sm">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
