import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './AnalyticsDashboard.css';

const analyticsData = [
  { day: 'Mon', impressions: 2400, engagement: 400, clicks: 120 },
  { day: 'Tue', impressions: 1398, engagement: 300, clicks: 80 },
  { day: 'Wed', impressions: 9800, engagement: 2000, clicks: 650 },
  { day: 'Thu', impressions: 3908, engagement: 2780, clicks: 310 },
  { day: 'Fri', impressions: 4800, engagement: 1890, clicks: 420 },
  { day: 'Sat', impressions: 3800, engagement: 2390, clicks: 300 },
  { day: 'Sun', impressions: 4300, engagement: 3490, clicks: 510 },
];

export default function AnalyticsDashboard() {
  const [metric, setMetric] = useState('impressions');

  // Dynamic titles and labels based on the selected metric filter
  const getMetricTitle = () => {
    switch (metric) {
      case 'engagement':
        return 'Engagement';
      case 'clicks':
        return 'Link Clicks';
      case 'impressions':
      default:
        return 'Impressions';
    }
  };

  return (
    <div style={{ padding: '0', color: 'var(--c-dark)', backgroundColor: 'var(--c-cream)', minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', letterSpacing: '0.1em', color: 'var(--c-taupe)', textTransform: 'uppercase', fontWeight: '700' }}>PERFORMANCE METRICS</span>
          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--c-dark)', letterSpacing: '-0.02em' }}>Interactive Analytics</h2>
          <p style={{ fontSize: '14px', color: 'var(--c-taupe)', marginTop: '4px', margin: 0, fontWeight: '500' }}>
            Real-time engagement trends and campaign performance metrics.
          </p>
        </div>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          style={{
            backgroundColor: 'var(--c-white)',
            border: '1px solid var(--c-taupe-20)',
            color: 'var(--c-dark)',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '6px',
            padding: '8px 14px',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 1px 3px var(--c-dark-10)',
          }}
        >
          <option value="impressions">Filter: Impressions</option>
          <option value="engagement">Filter: Engagement</option>
          <option value="clicks">Filter: Clicks</option>
        </select>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { title: 'Total Impressions', val: '30.4K', change: '+12.5%' },
          { title: 'Total Engagements', val: '12.8K', change: '+8.2%' },
          { title: 'Link Clicks', val: '2,390', change: '+15.1%' },
          { title: 'New Followers', val: '+850', change: '+5.4%' },
        ].map((kpi, i) => (
          <div
            key={i}
            style={{
              backgroundColor: 'var(--c-white)',
              border: '1px solid var(--c-taupe-20)',
              borderRadius: '8px',
              padding: '18px 20px',
              boxShadow: '0 2px 4px var(--c-dark-10)',
            }}
          >
            <p style={{ fontSize: '11px', color: 'var(--c-taupe)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace', fontWeight: '700' }}>{kpi.title}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--c-dark)' }}>{kpi.val}</span>
              <span style={{ fontSize: '13px', color: '#4f6f52', fontWeight: '700' }}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Line Chart */}
        <div style={{ backgroundColor: 'var(--c-white)', border: '1px solid var(--c-taupe-20)', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px var(--c-dark-10)' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--c-dark)', margin: '0 0 20px 0' }}>
            Daily {getMetricTitle()} Trend
          </p>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8cdbd" />
                <XAxis dataKey="day" stroke="#58554e" fontSize={12} tickLine={false} />
                <YAxis stroke="#58554e" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#f7f0e5', borderColor: '#d8cdbd', color: '#27251f', fontSize: '12px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(39,37,31,0.1)' }} />
                <Line type="monotone" dataKey={metric} stroke="#27251f" strokeWidth={2.5} dot={{ fill: '#27251f', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div style={{ backgroundColor: 'var(--c-white)', border: '1px solid var(--c-taupe-20)', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px var(--c-dark-10)' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--c-dark)', margin: '0 0 20px 0' }}>
            Daily {getMetricTitle()} Distribution
          </p>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8cdbd" />
                <XAxis dataKey="day" stroke="#58554e" fontSize={12} tickLine={false} />
                <YAxis stroke="#58554e" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#f7f0e5', borderColor: '#d8cdbd', color: '#27251f', fontSize: '12px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(39,37,31,0.1)' }} />
                <Bar dataKey={metric} fill="#27251f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}