import brandData from './partner-brand-options.json'

export interface PartnerBrandOption {
  slug: string
  name: string
}

interface BrandOptionsFile {
  generatedAt: string
  brands: PartnerBrandOption[]
}

const data = brandData as BrandOptionsFile

export function getPartnerBrandOptions(): PartnerBrandOption[] {
  return data.brands
}
