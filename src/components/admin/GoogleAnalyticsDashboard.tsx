'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { GADashboardData } from '@/lib/types/google-analytics';

type Props = {
  initialStartDate: string;
  initialEndDate: string;
};

export function GoogleAnalyticsDashboard({ initialStartDate, initialEndDate }: Props) {
  const router = useRouter();
  const [data, setData] = useState<GADashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [activePreset, setActivePreset] = useState<string | null>('30days');

  const presets = [
    { label: 'Last 7 Days', value: '7days', days: 7 },
    { label: 'Last 30 Days', value: '30days', days: 30 },
    { label: 'Last 90 Days', value: '90days', days: 90 },
  ];

  const fetchData = async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/google-analytics?startDate=${start}&endDate=${end}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, []);

  const handlePresetClick = (preset: { value: string; days: number }) => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - preset.days);

    const newStart = pastDate.toISOString().split('T')[0];
    const newEnd = today.toISOString().split('T')[0];

    setStartDate(newStart);
    setEndDate(newEnd);
    setActivePreset(preset.value);
    fetchData(newStart, newEnd);
  };

  const handleApplyDateRange = () => {
    setActivePreset(null);
    fetchData(startDate, endDate);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  if (loading && !data) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => fetchData(startDate, endDate)} />;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Date Range Controls */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex flex-wrap items-end gap-4">
          {/* Presets */}
          <div className="flex gap-2">
            {presets.map(preset => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activePreset === preset.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="h-8 border-l border-gray-300" />

          {/* Custom Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={handleApplyDateRange}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Apply'}
          </button>
        </div>
      </div>

      {/* Core Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Page Views"
          value={data.coreMetrics.pageViews.toLocaleString()}
          icon="eye"
          color="blue"
        />
        <StatCard
          title="Sessions"
          value={data.coreMetrics.sessions.toLocaleString()}
          icon="cursor"
          color="purple"
        />
        <StatCard
          title="Users"
          value={data.coreMetrics.users.toLocaleString()}
          subtitle={`${data.coreMetrics.newUsers.toLocaleString()} new`}
          icon="users"
          color="green"
        />
        <StatCard
          title="Events"
          value={data.coreMetrics.eventCount.toLocaleString()}
          icon="bolt"
          color="orange"
        />
        <StatCard
          title="Avg Session"
          value={formatDuration(data.coreMetrics.avgSessionDuration)}
          subtitle={`${data.coreMetrics.bounceRate.toFixed(1)}% bounce`}
          icon="clock"
          color="yellow"
        />
      </div>

      {/* Traffic Over Time Chart */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Traffic Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.dailyMetrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pageViews" stroke="#3b82f6" name="Page Views" strokeWidth={2} />
            <Line type="monotone" dataKey="sessions" stroke="#8b5cf6" name="Sessions" strokeWidth={2} />
            <Line type="monotone" dataKey="users" stroke="#10b981" name="Users" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Traffic Sources
          </h3>
          {data.trafficSources.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.trafficSources} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="source"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="sessions" fill="#3b82f6" name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No traffic source data available" />
          )}
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Pages
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {data.topPages.slice(0, 10).map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {page.path}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {page.title}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="font-bold text-blue-600">{page.views.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">views</div>
                </div>
              </div>
            ))}
            {data.topPages.length === 0 && (
              <EmptyState message="No page data available" />
            )}
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {data.coreMetrics.engagementRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Engagement Rate
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {data.coreMetrics.bounceRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Bounce Rate
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-green-600">
            {data.coreMetrics.users > 0
              ? ((data.coreMetrics.newUsers / data.coreMetrics.users) * 100).toFixed(1)
              : '0'}%
          </div>
          <div className="text-sm text-gray-600 mt-1">
            New Users
          </div>
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: 'eye' | 'cursor' | 'users' | 'clock' | 'bolt';
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'orange';
};

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    orange: 'from-orange-500 to-orange-600',
  };

  const icons = {
    eye: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    cursor: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
    users: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    clock: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bolt: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium opacity-90">{title}</div>
        <div className="opacity-75">{icons[icon]}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && (
        <div className="text-sm opacity-75 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      <span className="ml-3 text-gray-600">Loading analytics...</span>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <p className="text-red-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-gray-500">
      {message}
    </div>
  );
}
