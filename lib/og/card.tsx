import type { ReactNode } from 'react'

/** Shared 1200x630 frame for result share images (Satori: flexbox only). */
export const OG_SIZE = { width: 1200, height: 630 }

export function OgCard({ eyebrow, title, children, footer }: {
  eyebrow: string
  title: string
  children: ReactNode
  footer?: string
}) {
  return (
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: '#0F172A', color: '#F8FAFC', padding: '56px 64px', fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 30, fontWeight: 700 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: '#0EA5E9', marginRight: 14 }} />
          BroadbandPicker
        </div>
        <div style={{ fontSize: 24, color: '#7DD3FC', letterSpacing: 2, textTransform: 'uppercase' }}>{eyebrow}</div>
      </div>
      <div style={{ display: 'flex', fontSize: 60, fontWeight: 800, marginTop: 40, lineHeight: 1.1 }}>{title}</div>
      <div style={{ display: 'flex', flex: 1, marginTop: 32, marginBottom: 24 }}>{children}</div>
      <div style={{ display: 'flex', fontSize: 24, color: '#94A3B8' }}>
        {footer ?? 'broadbandpicker.co.uk · Independent UK broadband comparison'}
      </div>
    </div>
  )
}

export function OgStat({ label, value, sub, accent = '#F8FAFC' }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', flex: 1, background: '#1E293B',
        borderRadius: 20, padding: '24px 28px', marginRight: 20,
      }}
    >
      <div style={{ display: 'flex', fontSize: 24, color: '#94A3B8' }}>{label}</div>
      <div style={{ display: 'flex', fontSize: 56, fontWeight: 800, color: accent, marginTop: 8 }}>{value}</div>
      {sub ? <div style={{ display: 'flex', fontSize: 22, color: '#CBD5E1', marginTop: 6 }}>{sub}</div> : null}
    </div>
  )
}
