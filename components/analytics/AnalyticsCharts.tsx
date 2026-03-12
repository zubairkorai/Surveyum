'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

import { useTheme } from '../ThemeProvider';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface ChartDataPoint {
  name: string;
  value: number;
}

interface ChartProps {
  data: ChartDataPoint[];
  type: string;
}

export function AnalyticsChart({ data, type }: ChartProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[300px] w-full bg-gray-50 dark:bg-gray-800/50 animate-pulse rounded-xl" />;
  if (!data || data.length === 0) return <div className="text-gray-400 dark:text-gray-600 text-sm italic">No data available</div>;

  const tooltipStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#f3f4f6' : '#111827',
  };

  const tickStyle = {
    fontSize: 12,
    fill: isDark ? '#9ca3af' : '#6b7280',
  };

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={isDark ? '#111827' : '#fff'} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: isDark ? '#f3f4f6' : '#111827' }} />
            <Legend iconType="circle" />
          </PieChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f3f4f6'} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} />
            <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
            <Tooltip 
              cursor={{ fill: isDark ? '#374151' : '#f9fafb', opacity: 0.4 }}
              contentStyle={tooltipStyle}
              itemStyle={{ color: isDark ? '#f3f4f6' : '#111827' }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
