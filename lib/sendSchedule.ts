/** Evidence-led weekly send slot. Vercel Cron is UTC only. */

export const WEEKLY_SEND = {
  dayName: 'Tuesday',
  cron: '0 9 * * 2',
  utcHour: 9,
  utcMinute: 0,
  london: '10:00 UK in BST, 09:00 UK in GMT',
  path: '/api/newsletter/send',
} as const

export function nextWeeklySendLabel(now = new Date()): string {
  const next = new Date(now)
  const day = next.getUTCDay()
  const tuesday = 2
  let add = (tuesday - day + 7) % 7
  next.setUTCHours(WEEKLY_SEND.utcHour, WEEKLY_SEND.utcMinute, 0, 0)
  if (add === 0 && now >= next) add = 7
  next.setUTCDate(next.getUTCDate() + add)
  return next.toISOString()
}
