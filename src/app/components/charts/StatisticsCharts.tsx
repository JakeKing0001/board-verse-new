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
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#d1d5db'} />
        <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? '#374151' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            color: darkMode ? '#ffffff' : '#000000',
          }}
        />
        <Line type="monotone" dataKey="partite" stroke={darkMode ? '#60a5fa' : '#3b82f6'} strokeWidth={3} name="Partite" />
        <Line type="monotone" dataKey="vittorie" stroke={darkMode ? '#34d399' : '#10b981'} strokeWidth={3} name="Vittorie" />
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
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? '#374151' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
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
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#d1d5db'} />
        <XAxis dataKey="day" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? '#374151' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            color: darkMode ? '#ffffff' : '#000000',
          }}
        />
        <Bar dataKey="partite" fill={darkMode ? '#8b5cf6' : '#7c3aed'} radius={[4, 4, 0, 0]} name="Partite" />
      </BarChart>
    </ResponsiveContainer>
  );
});
