import { guideCategories, type GuideMetadata } from '@/data/guides'

export type PageHeroAccent = 'sky' | 'cyan' | 'emerald' | 'indigo' | 'fuchsia' | 'amber'

export type PageHeroCta = {
  href: string
  label: string
  variant?: 'primary' | 'secondary'
  external?: boolean
}

export type PageHeroConfig = {
  image: string
  imageAlt: string
  accent: PageHeroAccent
}

export const DEFAULT_GUIDE_CTAS: PageHeroCta[] = [
  { href: '/compare', label: 'Check full fibre at your address', variant: 'primary' },
  { href: '/tools/speed-test', label: 'Test your speed', variant: 'secondary' },
]

const HUB: PageHeroConfig = {
  image: '/guides/heroes/hub.jpg',
  imageAlt: 'A wet British terraced street at dusk with a green roadside fibre cabinet, original BroadbandPicker artwork.',
  accent: 'sky',
}

export const CATEGORY_HEROES: Record<GuideMetadata['category'], PageHeroConfig> = {
  'deals-and-pricing': {
    image: '/guides/heroes/deals.jpg',
    imageAlt: 'A UK kitchen table with household bills, a calculator and a home router, original BroadbandPicker artwork.',
    accent: 'sky',
  },
  'switching-and-rights': {
    image: '/guides/heroes/switching.jpg',
    imageAlt: 'A home router, Ethernet cable and house keys in an open box in a British hallway, original BroadbandPicker artwork.',
    accent: 'amber',
  },
  'technology-and-speeds': {
    image: '/guides/heroes/technology.jpg',
    imageAlt: 'A home router with a yellow Ethernet cable and status lights, original BroadbandPicker artwork.',
    accent: 'cyan',
  },
  'providers-and-comparisons': {
    image: '/guides/heroes/providers.jpg',
    imageAlt: 'Two notebooks on a UK table used to compare broadband quotes, original BroadbandPicker artwork.',
    accent: 'sky',
  },
  'use-cases-and-lifestyle': {
    image: '/guides/heroes/lifestyle.jpg',
    imageAlt: 'A UK living room in the evening with two people using a laptop and tablet, original BroadbandPicker artwork.',
    accent: 'emerald',
  },
  affordability: {
    image: '/guides/heroes/affordability.jpg',
    imageAlt: 'A modest British kitchen with a small home router on the windowsill, original BroadbandPicker artwork.',
    accent: 'amber',
  },
}

const SLUG_HEROES: Record<string, PageHeroConfig> = {
  'gta-6-broadband-uk': {
    image: '/guides/gta-6/banner.jpg',
    imageAlt: 'Neon coastal city at night, original BroadbandPicker artwork for Grand Theft Auto VI launch week. Not official Rockstar key art.',
    accent: 'fuchsia',
  },
  'wifi-7-explained-uk': {
    image: '/guides/wifi-7/banner.jpg',
    imageAlt: 'A UK living room at night with a glowing home router, original BroadbandPicker artwork. Not an official Apple or router-brand photograph.',
    accent: 'cyan',
  },
  'best-broadband-for-streaming': {
    image: '/guides/streaming/banner.jpg',
    imageAlt: 'Four people on a sofa watching a football match on a large living-room television, original BroadbandPicker artwork. Not official Premier League, Sky or Netflix photography.',
    accent: 'emerald',
  },
  'what-broadband-speed-do-i-need': {
    image: '/guides/speed-need/banner.jpg',
    imageAlt: 'A UK living room used as a home office at dusk, with a video call on a laptop, a tablet on the sofa and a television on, original BroadbandPicker artwork.',
    accent: 'indigo',
  },
}

export function hubHero(): PageHeroConfig {
  return HUB
}

export function categoryHero(category: GuideMetadata['category']): PageHeroConfig {
  return CATEGORY_HEROES[category] ?? HUB
}

export function guideHero(guide: GuideMetadata): PageHeroConfig {
  return SLUG_HEROES[guide.slug] ?? categoryHero(guide.category)
}

export function guideHeroKicker(guide: GuideMetadata): string {
  return guideCategories.find((item) => item.slug === guide.category)?.label ?? 'Guide'
}

export function firstSentence(text: string): string {
  const match = text.trim().match(/^[^.!?]+[.!?]/)
  return (match ? match[0] : text).trim()
}

export function absoluteHeroUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `https://broadbandpicker.co.uk${path}`
}
