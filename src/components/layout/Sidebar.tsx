'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Upload, BarChart2, Settings, Zap } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/upload', icon: Upload, label: 'Upload Invoice' },
  { href: '/invoices', icon: FileText, label: 'Invoices' },
  { href: '/reports', icon: BarChart2, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: '#1e293b',
      borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column',
      padding: '24px 0', flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>Invoice AI</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Mistral Powered</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = path === href || path.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: active ? '#60a5fa' : '#94a3b8',
                fontWeight: active ? 600 : 400, fontSize: 14,
                transition: 'all 0.15s',
                cursor: 'pointer',
                border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <Icon size={16} />
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0 20px', fontSize: 11, color: '#475569' }}>
        Invoice AI v2.0
      </div>
    </aside>
  )
}
