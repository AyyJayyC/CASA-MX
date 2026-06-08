"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";

export { ResponsiveContainer, Tooltip, Legend };

export const PIE_COLORS = [
  "#f59e0b", "#3b82f6", "#10b981", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

export function PieChartView({ data, dataKey, nameKey }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={100} label>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BarChartView({ data, dataKey, xKey, color = PIE_COLORS[0] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartView({ data, lines, xKey }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {lines.map((line) => (
          <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color} name={line.name} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaChartView({ data, areas, xKey }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {areas.map((area) => (
          <Area key={area.key} type="monotone" dataKey={area.key} fill={area.color} stroke={area.color} name={area.name} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
