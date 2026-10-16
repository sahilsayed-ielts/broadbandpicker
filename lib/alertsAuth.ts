import { cookies } from 'next/headers'
import crypto from 'crypto'

export const ALERTS_ADMIN_COOKIE = 'bbp_alerts_admin'

function adminSecret(): string | undefined {
  const value = process.env.ALERTS_ADMIN_SECRET
  return value && value.length >= 12 ? value : undefined
}

export function alertsAdminConfigured(): boolean {
  return Boolean(adminSecret())
}

function tokenFor(secret: string): string {
  return crypto.createHmac('sha256', secret).update('broadbandpicker-alerts-admin').digest('hex')
}

export function alertsAdminTokenValid(token: string | undefined): boolean {
  const secret = adminSecret()
  if (!secret || !token) return false
  const expected = tokenFor(secret)
  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function alertsAdminLoginToken(secret: string): string | null {
  const expected = adminSecret()
  if (!expected) return null
  const a = Buffer.from(secret)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  return tokenFor(expected)
}

export async function alertsAdminSession(): Promise<boolean> {
  const jar = await cookies()
  return alertsAdminTokenValid(jar.get(ALERTS_ADMIN_COOKIE)?.value)
}

export function cronAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const a = Buffer.from(token)
  const b = Buffer.from(cronSecret)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
