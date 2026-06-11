'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Search, Filter, Eye, Trash2, Download, RefreshCw, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const STATUS_OPTIONS = ['', 'processed', 'pending_review', 'approved', 'rejected', 'duplicate']

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (search) params.set('vendor', search)
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)
    const data = await api.get(`/api/invoices?${params}`)
    setInvoices(data.invoices || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [status, dateFrom, dateTo])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return
    await api.delete(`/api/invoices/${id}`)
    setInvoices(prev => prev.filter(i => i.id !== id))
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await api.patch(`/api/invoices/${id}`, { status: newStatus })
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
  }

  const filtered = invoices.filter(i =>
    !search || i.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.invoice_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Invoices</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14 }}>{invoices.length} invoices found</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => api.downloadExcel({ status, date_from: dateFrom, date_to: dateTo })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#166534', color: '#86efac', border: '1px solid #15803d', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>
            <Download size={14} /> Export Excel
          </button>
          <button onClick={load} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '6px 12px', flex: 1, minWidth: 200 }}>
            <Search size={14} color="#64748b" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search vendor or invoice #..."
              style={{ background: 'none', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 13, width: '100%' }}
              onKeyDown={e => e.key === 'Enter' && load()}
            />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)}
            style={{ background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', borderRadius: 8, padding: '7px 12px', fontSize: 13, cursor: 'pointer' }}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', borderRadius: 8, padding: '7px 12px', fontSize: 13 }} />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', borderRadius: 8, padding: '7px 12px', fontSize: 13 }} />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>No invoices found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                  {['Invoice #', 'Date', 'Vendor', 'Customer', 'Grand Total', 'Status', 'Confidence', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #1e293b', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{inv.invoice_number || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{inv.invoice_date || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div>{inv.vendor_name || '—'}</div>
                      {inv.vendor_gstin && <div style={{ fontSize: 11, color: '#64748b' }}>{inv.vendor_gstin}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{inv.customer_name || '—'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#22c55e' }}>
                      {inv.grand_total ? `₹${Number(inv.grand_total).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={`badge-${inv.status}`}>{inv.status?.replace('_', ' ')}</span>
                        {!inv.reconciliation_valid && <AlertTriangle size={12} color="#f59e0b" />}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 50, height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${(inv.confidence_score || 0) * 100}%`, height: '100%', background: (inv.confidence_score || 0) > 0.8 ? '#22c55e' : (inv.confidence_score || 0) > 0.6 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span style={{ color: '#94a3b8' }}>{Math.round((inv.confidence_score || 0) * 100)}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/invoices/${inv.id}`}>
                          <button style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}>
                            <Eye size={13} />
                          </button>
                        </Link>
                        <select
                          value={inv.status}
                          onChange={e => handleStatusChange(inv.id, e.target.value)}
                          style={{ background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', borderRadius: 6, padding: '4px 6px', fontSize: 12, cursor: 'pointer' }}
                        >
                          {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                        <button onClick={() => handleDelete(inv.id)}
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
