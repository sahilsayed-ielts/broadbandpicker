'use client'

import { useState } from 'react'
import type { FAQItem } from '@/types'

interface FAQAccordionProps {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex justify-between items-center px-6 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
          >
            <span className="font-semibold text-slate-900 pr-4">{item.question}</span>
            <svg
              className={`flex-shrink-0 w-5 h-5 text-sky-500 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="px-6 py-4 bg-slate-50 text-slate-700 leading-relaxed text-sm">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
