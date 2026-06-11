// Render backend URL - apna actual URL .env.local mein set karo
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://invoice-ai-web-server-1.onrender.com"

export const api = {
  base: API_BASE,

  async get(path: string) {
    const res = await fetch(`${API_BASE}${path}`)
    return res.json()
  },

  async post(path: string, data: any) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async patch(path: string, data: any) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async delete(path: string) {
    const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' })
    return res.json()
  },

  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_BASE}/api/extract`, {
      method: 'POST',
      body: formData,
    })
    return res.json()
  },

  async downloadExcel(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    const res = await fetch(`${API_BASE}/api/reports/excel${query}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice_report_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }
}
