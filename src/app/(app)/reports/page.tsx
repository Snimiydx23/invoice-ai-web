'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { Download, FileSpreadsheet } from 'lucide-react'

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const downloadExcel = async () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    if (status) params.status = status
    await api.downloadExcel(params)
    setLoading(false)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Reports</h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14 }}>Export invoice data as Excel reports</p>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileSpreadsheet size={20} color="#22c55e" />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Excel Report</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Multi-sheet Excel with invoice data & summary</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Date From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Date To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Status Filter</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }}>
              <option value="">All Status</option>
              <option value="processed">Processed</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <button onClick={downloadExcel} disabled={loading} className="btn-primary"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px' }}>
          <Download size={15} />
          {loading ? 'Generating...' : 'Download Excel Report'}
        </button>
      </div>
    </div>
  )
}
