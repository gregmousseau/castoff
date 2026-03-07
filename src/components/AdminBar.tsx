'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface AdminBarProps {
  operators: { slug: string; business_name: string }[]
  currentSlug?: string
}

export default function AdminBar({ operators, currentSlug }: AdminBarProps) {
  const router = useRouter()
  const [selectedSlug, setSelectedSlug] = useState(currentSlug || '')

  const handleSwitch = (slug: string) => {
    setSelectedSlug(slug)
    // Navigate to dashboard with operator query param
    router.push(`/dashboard?operator=${slug}`)
  }

  return (
    <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between text-sm">
      <span className="font-medium text-gray-300">Admin Mode</span>
      <div className="flex items-center gap-3">
        <label htmlFor="operator-switch" className="text-gray-400">
          Viewing as:
        </label>
        <select
          id="operator-switch"
          value={selectedSlug}
          onChange={(e) => handleSwitch(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-teal-500"
        >
          {operators.map(op => (
            <option key={op.slug} value={op.slug}>
              {op.business_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
