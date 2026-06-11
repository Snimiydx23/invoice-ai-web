'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Save, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/settings').then(data => {
      if (!data.error) setSettings(data)
      setLoading(false)
    })
  }, [])

  const save = async () => {
    await api.post('/api/settings', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const field = (key: string, label: string, placeholder = '', type = 'text') => (
    <div key={key} style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={settings[key] || ''}
        onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', borderRadius: 8, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box' }}
      />
    </div>
  )

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Settings</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14 }}>Application configuration</p>
        </div>
        <button onClick={save} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {saved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Company</h3>
          {field('company_name', 'Company Name', 'Your Company Pvt Ltd')}
          {field('company_gstin', 'GSTIN', '27AABCU9603R1ZM')}
          {field('company_address', 'Address', 'Raipur, Chhattisgarh')}
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Processing</h3>
          {field('confidence_threshold', 'Confidence Threshold (0.0 - 1.0)', '0.7')}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Auto Reconcile</label>
            <select value={settings.auto_reconcile || 'true'} onChange={e => setSettings(prev => ({ ...prev, auto_reconcile: e.target.value }))}
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', borderRadius: 8, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box' }}>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Duplicate Check</label>
            <select value={settings.duplicate_check || 'true'} onChange={e => setSettings(prev => ({ ...prev, duplicate_check: e.target.value }))}
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', borderRadius: 8, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box' }}>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>AI Configuration</h3>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#94a3b8', border: '1px solid #334155' }}>
            <div>🤖 <strong style={{ color: '#60a5fa' }}>Mistral AI</strong> — pixtral-large-latest model</div>
            <div style={{ marginTop: 6 }}>API Key is set on the Render backend server via environment variable <code style={{ background: '#1e293b', padding: '1px 6px', borderRadius: 4 }}>MISTRAL_API_KEY</code></div>
            <div style={{ marginTop: 6 }}>Render Backend: <code style={{ background: '#1e293b', padding: '1px 6px', borderRadius: 4 }}>{process.env.NEXT_PUBLIC_API_URL || 'Not configured'}</code></div>
          </div>
        </div>
      </div>
    </div>
  )
}
