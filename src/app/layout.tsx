import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Invoice AI System',
  description: 'AI-powered invoice processing with Mistral AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
