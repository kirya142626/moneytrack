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
import { formatCompactMoney, formatMoney } from "@/lib/money";
import type { CategorySlice, SeriesPoint } from "@/lib/finance";

const INCOME = "#0e9f6e";
const EXPENSE = "#f43f5e";
const NEUTRAL = "#94a3b8";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--mt-border)",
  background: "var(--mt-raised)",
  boxShadow: "0 12px 32px rgba(10,25,18,0.12)",
  fontSize: 12,
  padding: "10px 12px",
  color: "var(--mt-text)",
};

const axisTick = { fill: "var(--mt-muted)", fontSize: 11 };

export function CashflowChart({
  data,
  currency,
  height = 260,
  showNet = false,
}: {
  data: SeriesPoint[];
  currency: string;
  height?: number;
  showNet?: boolean;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="mt-income-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={INCOME} stopOpacity={0.18} />
              <stop offset="100%" stopColor={INCOME} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mt-expense-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={EXPENSE} stopOpacity={0.14} />
              <stop offset="100%" stopColor={EXPENSE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--mt-border)" strokeDasharray="3 5" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            minTickGap={22}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            width={62}
            tickFormatter={(value: number) => formatCompactMoney(value, currency)}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "var(--mt-muted)", fontSize: 11, marginBottom: 4 }}
            itemStyle={{ fontSize: 12 }}
            formatter={(value, name) => [formatMoney(Number(value), currency), String(name)]}
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Доходы"
            stroke={INCOME}
            strokeWidth={2}
            fill="url(#mt-income-fill)"
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Расходы"
            stroke={EXPENSE}
            strokeWidth={2}
            fill="url(#mt-expense-fill)"
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
          {showNet ? (
            <Line type="monotone" dataKey="net" name="Баланс" stroke={NEUTRAL} strokeWidth={1.5} dot={false} />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDonut({
  slices,
  currency,
  height = 220,
  centerLabel = "Расходы",
}: {
  slices: CategorySlice[];
  currency: string;
  height?: number;
  centerLabel?: string;
}) {
  const total = slices.reduce((sum, s) => sum + s.amount, 0);
  const data = slices.length > 0 ? slices : [{ categoryId: null, name: "Нет данных", color: "#e2e8f0", icon: "", amount: 1, share: 1, count: 0 }];
  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            innerRadius="63%"
            outerRadius="88%"
            paddingAngle={2}
            cornerRadius={5}
            stroke="none"
          >
            {data.map((slice, index) => (
              <Cell key={`${slice.name}-${index}`} fill={slices.length ? slice.color : "#e6ebe8"} />
            ))}
          </Pie>
          {slices.length ? (
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => [formatMoney(Number(value), currency), String(name)]}
            />
          ) : null}
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">{centerLabel}</span>
        <span className="mt-0.5 text-[17px] font-semibold tracking-tight text-ink tabular">
          {slices.length ? formatMoney(total, currency) : "—"}
        </span>
      </div>
    </div>
  );
}

export function MonthlyBars({
  data,
  currency,
  height = 260,
}: {
  data: { label: string; income: number; expense: number; net: number }[];
  currency: string;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke="var(--mt-border)" strokeDasharray="3 5" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} dy={6} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            width={62}
            tickFormatter={(value: number) => formatCompactMoney(value, currency)}
          />
          <Tooltip
            cursor={{ fill: "var(--mt-surface-muted)", opacity: 0.6 }}
            contentStyle={tooltipStyle}
            labelStyle={{ color: "var(--mt-muted)", fontSize: 11, marginBottom: 4 }}
            formatter={(value, name) => [formatMoney(Number(value), currency), String(name)]}
          />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 12, color: "var(--mt-muted)", paddingTop: 8 }}
          />
          <Bar dataKey="income" name="Доходы" fill={INCOME} radius={[4, 4, 0, 0]} maxBarSize={18} />
          <Bar dataKey="expense" name="Расходы" fill={EXPENSE} radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparisonChart({
  data,
  currency,
  height = 280,
}: {
  data: { label: string; current: number; previous: number }[];
  currency: string;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--mt-border)" strokeDasharray="3 5" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} dy={6} minTickGap={18} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            width={62}
            tickFormatter={(value: number) => formatCompactMoney(value, currency)}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "var(--mt-muted)", fontSize: 11, marginBottom: 4 }}
            formatter={(value, name) => [formatMoney(Number(value), currency), String(name)]}
          />
          <Legend
            iconType="plainline"
            wrapperStyle={{ fontSize: 12, color: "var(--mt-muted)", paddingTop: 8 }}
          />
          <Line
            type="monotone"
            dataKey="current"
            name="Текущий период"
            stroke={INCOME}
            strokeWidth={2.2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="previous"
            name="Предыдущий период"
            stroke={NEUTRAL}
            strokeWidth={1.8}
            strokeDasharray="5 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({
  data,
  positive = true,
  height = 40,
}: {
  data: { value: number }[];
  positive?: boolean;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={positive ? "spark-green" : "spark-red"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={positive ? INCOME : EXPENSE} stopOpacity={0.22} />
              <stop offset="100%" stopColor={positive ? INCOME : EXPENSE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={positive ? INCOME : EXPENSE}
            strokeWidth={1.6}
            fill={positive ? "url(#spark-green)" : "url(#spark-red)"}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
