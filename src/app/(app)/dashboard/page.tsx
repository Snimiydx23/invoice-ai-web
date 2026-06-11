'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { FileText, TrendingUp, AlertTriangle, CheckCircle, Upload, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  processed: '#22c55e',
  pending_review: '#f59e0b',
  approved: '#3b82f6',
  rejected: '#ef4444',
  duplicate: '#a855f7',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.get('/api/dashboard')
      setStats(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const statCards = stats ? [
    { label: 'Total Invoices', value: stats.total_invoices, icon: FileText, color: '#3b82f6' },
    { label: 'Total Value', value: `₹${Number(stats.total_value || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: '#22c55e' },
    { label: "Today's Invoices", value: stats.today_count, icon: Upload, color: '#f59e0b' },
    { label: 'Avg Confidence', value: `${Math.round((stats.avg_confidence || 0) * 100)}%`, icon: CheckCircle, color: '#a855f7' },
  ] : []

  const pieData = stats?.status_breakdown
    ? Object.entries(stats.status_breakdown).map(([name, value]) => ({ name, value }))
    : []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Dashboard</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14 }}>Invoice AI System Overview</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <Link href="/upload">
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Upload size={14} /> Upload Invoice
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 24 }}>
            {/* Weekly Trend */}
            <div className="card">
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Weekly Trend</h3>
              {stats?.weekly_trend?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.weekly_trend}>
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No data yet</div>
              )}
            </div>

            {/* Status Distribution */}
            <div className="card">
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Status Distribution</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name] || '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No data yet</div>
              )}
            </div>
          </div>

          {/* Top Vendors */}
          {stats?.top_vendors?.length > 0 && (
            <div className="card">
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Top Vendors</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {stats.top_vendors.map((v: any) => (
                  <div key={v.name} style={{ background: '#0f172a', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{v.count} invoices</div>
                    <div style={{ fontSize: 12, color: '#22c55e' }}>₹{Number(v.total || 0).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
