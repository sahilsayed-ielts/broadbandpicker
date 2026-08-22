import coverageData from './postcode-district-coverage.json'

export interface DistrictCoverage {
  district: string
  postcodeArea: string
  sampleSize: number
  gigabitPercent: number | null
  superfastPercent: number | null
  ultrafastPercent: number | null
  belowUsoPercent: number | null
  ngaPercent: number | null
}

interface CoverageFile {
  generatedAt: string
  sourceDataDate: string
  sourceLabel: string
  sourcePage: string
  districts: Record<string, DistrictCoverage>
}

const data = coverageData as CoverageFile

export const districtCoverageGeneratedAt = data.generatedAt
export const districtCoverageSourceDataDate = data.sourceDataDate
export const districtCoverageSourceLabel = data.sourceLabel
export const districtCoverageSourcePage = data.sourcePage

export function getDistrictCoverage(prefix: string): DistrictCoverage | undefined {
  return data.districts[prefix.toUpperCase()]
}

export function getAllDistrictCoveragePrefixes(): string[] {
  return Object.keys(data.districts).map((prefix) => prefix.toLowerCase())
}
