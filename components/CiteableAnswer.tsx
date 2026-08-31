interface CiteableAnswerProps {
  children: React.ReactNode
  title?: string
}

export default function CiteableAnswer({ children, title = 'The quick answer' }: CiteableAnswerProps) {
  return (
    <section className="mb-8 rounded-2xl border border-sky-200 bg-sky-50 p-6" aria-labelledby="quick-answer">
      <h2 id="quick-answer" className="text-2xl font-bold text-slate-900">
        {title}
      </h2>
      <p className="mt-3 leading-relaxed text-slate-700">{children}</p>
    </section>
  )
}
