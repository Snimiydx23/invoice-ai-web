'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { ArrowLeft, CheckCircle, AlertTriangle, Building2, User, FileText, Package } from 'lucide-react'
import Link from 'next/link'

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/invoices/${params.id}`).then(data => {
      setInvoice(data)
      setLoading(false)
    })
  }, [params.id])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
  if (!invoice || invoice.error) return <div style={{ padding: 40, color: '#f87171' }}>Invoice not found</div>

  const issues = (() => {
    try { return JSON.parse(invoice.reconciliation_issues || '[]') } catch { return [] }
  })()

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/invoices" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <div style={{ width: 1, height: 20, background: '#334155' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          Invoice {invoice.invoice_number || '#' + invoice.id.slice(0, 8)}
        </h1>
        <span className={`badge-${invoice.status}`}>{invoice.status?.replace('_', ' ')}</span>
        {invoice.reconciliation_valid
          ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#22c55e' }}><CheckCircle size={13} /> Reconciled</span>
          : <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#f59e0b' }}><AlertTriangle size={13} /> Reconciliation Issues</span>
        }
      </div>

      {/* Reconciliation Issues */}
      {issues.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: '#fcd34d', marginBottom: 8, fontSize: 13 }}>⚠ Reconciliation Issues</div>
          {issues.map((issue: any, i: number) => (
            <div key={i} style={{ fontSize: 12, color: '#fde68a', marginBottom: 4 }}>
              [{issue.severity?.toUpperCase()}] {issue.message}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Vendor */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
            <Building2 size={14} /> VENDOR
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{invoice.vendor_name || '—'}</div>
          {invoice.vendor_gstin && <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>GSTIN: {invoice.vendor_gstin}</div>}
          {invoice.vendor_address && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{invoice.vendor_address}</div>}
        </div>

        {/* Customer */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
            <User size={14} /> CUSTOMER
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{invoice.customer_name || '—'}</div>
          {invoice.customer_gstin && <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>GSTIN: {invoice.customer_gstin}</div>}
          {invoice.customer_address && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{invoice.customer_address}</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, marginBottom: 16 }}>
        {/* Invoice Meta */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
            <FileText size={14} /> INVOICE DETAILS
          </div>
          {[
            ['Invoice Number', invoice.invoice_number],
            ['Invoice Date', invoice.invoice_date],
            ['Due Date', invoice.due_date],
            ['PO Number', invoice.po_number],
            ['Filename', invoice.filename],
            ['Confidence', `${Math.round((invoice.confidence_score || 0) * 100)}%`],
          ].map(([label, value]) => value ? (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>{label}</span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ) : null)}
        </div>

        {/* Totals */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
            ₹ TOTALS
          </div>
          {[
            ['Subtotal', invoice.subtotal],
            ['CGST', invoice.cgst_total],
            ['SGST', invoice.sgst_total],
            ['IGST', invoice.igst_total],
            ['Tax Total', invoice.tax_total],
          ].map(([label, val]) => val != null ? (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>{label}</span>
              <span>₹{Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          ) : null)}
          <div style={{ borderTop: '1px solid #334155', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
            <span style={{ fontWeight: 700 }}>Grand Total</span>
            <span style={{ fontWeight: 700, color: '#22c55e' }}>₹{Number(invoice.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {invoice.currency}</span>
          </div>
        </div>
      </div>

      {/* Line Items */}
      {invoice.items?.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
            <Package size={14} /> LINE ITEMS ({invoice.items.length})
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#0f172a' }}>
                  {['#', 'Description', 'HSN', 'Qty', 'Unit', 'Rate', 'Tax%', 'CGST', 'SGST', 'IGST', 'Total'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item: any, i: number) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>{i + 1}</td>
                    <td style={{ padding: '10px 14px', maxWidth: 200 }}>{item.description || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.hsn_code || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{item.quantity || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{item.unit || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{item.rate ? `₹${Number(item.rate).toFixed(2)}` : '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{item.tax_percent ? `${item.tax_percent}%` : '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{item.cgst_amount ? `₹${Number(item.cgst_amount).toFixed(2)}` : '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{item.sgst_amount ? `₹${Number(item.sgst_amount).toFixed(2)}` : '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{item.igst_amount ? `₹${Number(item.igst_amount).toFixed(2)}` : '—'}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#22c55e' }}>{item.total_amount ? `₹${Number(item.total_amount).toFixed(2)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
