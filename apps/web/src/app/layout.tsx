import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ATP Match Predictor',
  description: 'Predict ATP tennis matches using historical data and machine learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
