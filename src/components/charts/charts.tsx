"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/types";

const tooltipStyle = {
  backgroundColor: "#0E1014",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "12px",
};

const axisStyle = { fill: "rgba(255,255,255,0.35)", fontSize: 11 };

interface TrendProps {
  data: ChartPoint[];
  color?: string;
  height?: number;
  prefix?: string;
  suffix?: string;
}

export function AreaTrendChart({
  data,
  color = "#C8FF3D",
  height = 240,
  prefix = "",
  suffix = "",
}: TrendProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="igcArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [`${prefix}${value}${suffix}`, "Value"]}
        />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#igcArea)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarTrendChart({
  data,
  color = "#2F6BFF",
  height = 240,
  prefix = "",
  suffix = "",
}: TrendProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [`${prefix}${value}${suffix}`, "Value"]}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineTrendChart({
  data,
  color = "#C8FF3D",
  height = 240,
  prefix = "",
  suffix = "",
}: TrendProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [`${prefix}${value}${suffix}`, "Value"]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ fill: color, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const pieColors = ["#C8FF3D", "#2F6BFF", "#6E97FF", "#8FBF16", "#DDFF8A", "#1B43B3", "#94A3B8"];

export function DonutChart({ data, height = 260 }: { data: ChartPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={58}
          outerRadius={90}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
