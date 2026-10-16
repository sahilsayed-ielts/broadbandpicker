/** Stable id for a deal row. Shared by the browser (saved deals) and the server (price-drop alerts). */
export function dealId(providerSlug: string, packageName: string): string {
  return `${providerSlug}::${packageName}`
}
