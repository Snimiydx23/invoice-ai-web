'use client'
import { useState, useRef } from 'react'
import { api } from '@/lib/api'
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

type FileResult = {
  file: File
  status: 'pending' | 'processing' | 'success' | 'error' | 'duplicate'
  data?: any
  error?: string
  invoiceId?: string
}

export default function UploadPage() {
  const [files, setFiles] = useState<FileResult[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter(f =>
      ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff', 'image/webp', 'image/bmp'].includes(f.type) ||
      f.name.match(/\.(pdf|png|jpg|jpeg|tiff|tif|webp|bmp)$/i)
    )
    setFiles(prev => [...prev, ...arr.map(f => ({ file: f, status: 'pending' as const }))])
  }

  const processAll = async () => {
    const pending = files.filter(f => f.status === 'pending')
    for (const item of pending) {
      setFiles(prev => prev.map(f => f.file === item.file ? { ...f, status: 'processing' } : f))
      try {
        const result = await api.uploadFile(item.file)
        if (result.is_duplicate) {
          setFiles(prev => prev.map(f => f.file === item.file
            ? { ...f, status: 'duplicate', error: result.error }
            : f))
        } else if (result.success) {
          setFiles(prev => prev.map(f => f.file === item.file
            ? { ...f, status: 'success', data: result.data, invoiceId: result.invoice_id }
            : f))
        } else {
          setFiles(prev => prev.map(f => f.file === item.file
            ? { ...f, status: 'error', error: result.error || 'Extraction failed' }
            : f))
        }
      } catch (e: any) {
        setFiles(prev => prev.map(f => f.file === item.file
          ? { ...f, status: 'error', error: e.message }
          : f))
      }
    }
  }

  const removeFile = (file: File) => setFiles(prev => prev.filter(f => f.file !== file))

  const hasPending = files.some(f => f.status === 'pending')
  const hasProcessing = files.some(f => f.status === 'processing')

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Upload Invoice</h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14 }}>Upload PDF or image invoices for AI extraction with Mistral</p>
      </div>

      {/* Drop Zone */}
      <div
        className="card"
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        style={{
          border: `2px dashed ${dragging ? '#3b82f6' : '#334155'}`,
          borderRadius: 16, padding: 48, textAlign: 'center',
          cursor: 'pointer', marginBottom: 20,
          background: dragging ? 'rgba(59,130,246,0.05)' : 'transparent',
          transition: 'all 0.2s'
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef} type="file" multiple hidden
          accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif,.webp,.bmp"
          onChange={e => e.target.files && addFiles(e.target.files)}
        />
        <Upload size={40} color={dragging ? '#3b82f6' : '#475569'} style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
          {dragging ? 'Drop files here' : 'Drag & drop invoices here'}
        </div>
        <div style={{ color: '#94a3b8', fontSize: 13 }}>or click to browse • PDF, PNG, JPG, TIFF supported</div>
      </div>

      {/* Action Bar */}
      {files.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <button
            className="btn-primary"
            onClick={processAll}
            disabled={!hasPending || hasProcessing}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {hasProcessing ? <><Loader size={14} className="animate-spin" /> Processing...</> : <><Upload size={14} /> Process {files.filter(f => f.status === 'pending').length} Files</>}
          </button>
          <button onClick={() => setFiles([])} style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>
            Clear All
          </button>
          <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 4 }}>
            {files.filter(f => f.status === 'success').length} done •{' '}
            {files.filter(f => f.status === 'error').length} failed •{' '}
            {files.filter(f => f.status === 'duplicate').length} duplicates
          </span>
        </div>
      )}

      {/* File List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {files.map(({ file, status, data, error, invoiceId }) => (
          <div key={file.name + file.size} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileText size={18} color="#94a3b8" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>

              {/* Status */}
              {status === 'pending' && <span style={{ fontSize: 12, color: '#94a3b8', background: '#1e293b', padding: '3px 10px', borderRadius: 99, border: '1px solid #334155' }}>Pending</span>}
              {status === 'processing' && <span style={{ fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}><Loader size={12} /> Processing...</span>}
              {status === 'success' && <CheckCircle size={18} color="#22c55e" />}
              {status === 'error' && <AlertCircle size={18} color="#ef4444" />}
              {status === 'duplicate' && <AlertTriangle size={18} color="#a855f7" />}

              <button onClick={() => removeFile(file)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
                <X size={14} />
              </button>
            </div>

            {/* Success details */}
            {status === 'success' && data && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#0f172a', borderRadius: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {data.vendor?.name && <span><span style={{ color: '#64748b' }}>Vendor:</span> {data.vendor.name}</span>}
                  {data.invoice?.invoice_number && <span><span style={{ color: '#64748b' }}>Invoice #:</span> {data.invoice.invoice_number}</span>}
                  {data.invoice?.invoice_date && <span><span style={{ color: '#64748b' }}>Date:</span> {data.invoice.invoice_date}</span>}
                  {data.totals?.grand_total && <span><span style={{ color: '#64748b' }}>Total:</span> <strong style={{ color: '#22c55e' }}>₹{Number(data.totals.grand_total).toLocaleString('en-IN')}</strong></span>}
                  <span><span style={{ color: '#64748b' }}>Confidence:</span> {Math.round((data.metadata?.confidence_score || 0) * 100)}%</span>
                  {!data.reconciliation?.is_valid && <span style={{ color: '#f59e0b' }}>⚠ Reconciliation issues found</span>}
                </div>
                {invoiceId && (
                  <Link href={`/invoices/${invoiceId}`} style={{ color: '#60a5fa', fontSize: 12, textDecoration: 'none', marginTop: 6, display: 'inline-block' }}>
                    View Invoice →
                  </Link>
                )}
              </div>
            )}

            {/* Error */}
            {(status === 'error' || status === 'duplicate') && error && (
              <div style={{ marginTop: 8, fontSize: 12, color: status === 'duplicate' ? '#c084fc' : '#fca5a5', padding: '6px 10px', background: '#0f172a', borderRadius: 6 }}>
                {status === 'duplicate' ? '⚠ Duplicate: ' : '✗ '}{error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
