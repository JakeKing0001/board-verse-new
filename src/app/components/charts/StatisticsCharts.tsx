"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

interface ProgressData {
  month: string;
  partite: number;
  vittorie: number;
}

interface PerformanceData {
  name: string;
  value: number;
  color: string;
}

interface WeeklyData {
  day: string;
  partite: number;
}

export const ProgressChart = React.memo(function ProgressChart({
  data,
  darkMode,
}: {
  data: ProgressData[];
  darkMode: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
        <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
        <YAxis allowDecimals={false} stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? '#374151' : '#ffffff',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
            color: darkMode ? '#ffffff' : '#000000',
          }}
        />
        <Line type="monotone" dataKey="partite" stroke={darkMode ? '#38bdf8' : '#0284c7'} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Partite" />
        <Line type="monotone" dataKey="vittorie" stroke={darkMode ? '#34d399' : '#059669'} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Vittorie" />
      </LineChart>
    </ResponsiveContainer>
  );
});

export const PerformancePieChart = React.memo(function PerformancePieChart({
  data,
  darkMode,
}: {
  data: PerformanceData[];
  darkMode: boolean;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const pieData = total > 0
    ? data
    : [{ name: 'Nessun dato', value: 1, color: darkMode ? '#334155' : '#e2e8f0' }];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={pieData} cx="50%" cy="50%" innerRadius={66} outerRadius={98} paddingAngle={total > 0 ? 3 : 0} dataKey="value" stroke="none">
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? '#374151' : '#ffffff',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
            color: darkMode ? '#ffffff' : '#000000',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
});

export const WeeklyActivityChart = React.memo(function WeeklyActivityChart({
  data,
  darkMode,
}: {
  data: WeeklyData[];
  darkMode: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={270}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
        <XAxis dataKey="day" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
        <YAxis allowDecimals={false} stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? '#374151' : '#ffffff',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
            color: darkMode ? '#ffffff' : '#000000',
          }}
        />
        <Bar dataKey="partite" fill={darkMode ? '#34d399' : '#059669'} radius={[7, 7, 0, 0]} name="Partite" />
      </BarChart>
    </ResponsiveContainer>
  );
});
