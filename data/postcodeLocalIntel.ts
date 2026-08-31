export interface PostcodeLocalIntelSource {
  label: string
  href: string
  note: string
}

export interface PostcodeLocalIntel {
  neighbourhoods: string
  altnetParagraphs: string[]
  speedGuidanceNote: string
  sources: PostcodeLocalIntelSource[]
}

// Hand-researched, sourced local network intelligence for specific postcode
// districts. Deliberately NOT a mapping for all districts — only add an entry
// once the rollout facts below have been independently verified, otherwise
// the page falls back to the shared generic template.
export const postcodeLocalIntel: Record<string, PostcodeLocalIntel> = {
  BS1: {
    neighbourhoods: 'the Old City, Harbourside, Redcliffe, Broadmead and Temple Quarter',
    altnetParagraphs: [
      "BS1 should be assessed separately from Bristol-wide coverage. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 344 BS1 postcode units and records 69.6% gigabit-capable availability, 73.4% ultrafast availability and 79% superfast availability. Openreach separately reported in February 2026 that its Full Fibre network reached more than 165,000 Bristol homes and businesses, or over 75% of properties across the wider city. The populations and dates differ, so the figures are reported separately rather than combined.",
      "BS1 includes flats, converted buildings and mixed residential and commercial streets where network access can change from one property to the next. Openreach asks for a complete address before showing whether Full Fibre is available, while the GOV.UK checker warns that supplier plans change and its processed address status cannot be guaranteed as completely accurate. Check the house or flat number with every suitable network before treating a Bristol city-centre package as orderable.",
    ],
    speedGuidanceNote:
      "BS1's district snapshot has a meaningful gap between superfast and gigabit-capable availability. Keep an orderable 30 to 80 Mbps package on the shortlist if the building cannot yet receive full fibre or cable, and compare the provider's personalised estimate rather than relying on a Bristol-wide average.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 BS1 gigabit, ultrafast, superfast and below-USO coverage aggregation across 344 residential postcode units.',
      },
      {
        label: 'Openreach: Bristol Full Fibre update',
        href: 'https://www.openreach.com/news/thousands-in-bristol-yet-to-benefit-from-major-broadband-upgrade/',
        note: 'Primary network statement reporting more than 165,000 Bristol premises reached, over 75% of properties across the wider city, in February 2026.',
      },
      {
        label: 'GOV.UK gigabit broadband availability checker',
        href: 'https://www.gov.uk/guidance/check-your-gigabit-broadband-availability',
        note: 'Government address checker for available or planned gigabit service, with an explicit warning that supplier plans and processed address status can change.',
      },
      {
        label: 'FindBroadband: broadband deals in Bristol',
        href: 'https://www.findbroadbanddeals.com/broadband/in/south-west/bristol',
        note: 'Independent city-wide comparison used to corroborate the address-checking task and to keep its Bristol-wide coverage population separate from the BS1 district evidence.',
      },
    ],
  },
  M1: {
    neighbourhoods: 'Piccadilly, the Northern Quarter and Ancoats',
    altnetParagraphs: [
      "M1 should not be judged by a Manchester-wide full-fibre percentage. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 193 postcode units in M1 and records 65% gigabit-capable availability, 65% ultrafast availability and 86% superfast availability. The independent PlainBroadband compilation reports 86.7% full-fibre coverage across the much larger Manchester local-authority area in Spring 2026. These populations and dates differ, so the figures are reported separately rather than combined.",
      "M1 includes dense apartment blocks where the network entering one building may not serve the next. Virgin Media says its Manchester availability can differ from one street to another, including around the Northern Quarter, while Openreach requires the postcode and selected address before it reports whether Full Fibre is orderable, coming soon or planned. Check the complete address with each shortlisted network before treating any M1 broadband package as available.",
    ],
    speedGuidanceNote:
      "M1 has a meaningful gigabit coverage gap in the district data. Compare a gigabit plan where it is orderable, but keep a superfast option on the shortlist for buildings that do not yet have an FTTP or cable connection.",
    sources: [
      {
        label: 'Ofcom broadband and mobile coverage checker',
        href: 'https://checker.ofcom.org.uk/en-gb/broadband-coverage',
        note: 'Regulator checker explaining predicted fixed-broadband availability, speed categories and why a property result may differ from an area figure.',
      },
      {
        label: 'Virgin Media broadband in Manchester',
        href: 'https://www.virginmedia.com/broadband/manchester',
        note: 'Provider page confirming that Manchester availability can vary street by street and must be checked by postcode.',
      },
      {
        label: 'PlainBroadband: Manchester broadband coverage',
        href: 'https://plainbroadband.co.uk/authority/manchester/',
        note: 'Independent compilation of Ofcom Spring 2026 data for Manchester local authority. Its 86.7% figure covers a different population from M1 and is not substituted for the district result.',
      },
    ],
  },
  NG1: {
    neighbourhoods: 'the city centre, Lace Market and the areas bordering Sneinton',
    altnetParagraphs: [
      "NG1 should be assessed separately from Nottingham-wide coverage. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 299 NG1 postcode units and records 63.9% gigabit-capable, 67.8% ultrafast and 82.7% superfast availability. Openreach reported in August 2025 that its own full-fibre network had reached about 70% of properties across Nottingham. These figures cover different populations and dates, so they are reported separately rather than combined.",
      "The NG1 internet market includes retailers using Openreach, Virgin Media where its network reaches the property, and building or street-specific alternatives. Openreach says availability can differ even within one street because of engineering, access routes and landlord permissions. Ofcom also warns that its displayed speeds are network predictions and actual property availability can differ. Check the complete address with at least two suitable providers before treating any package as orderable.",
    ],
    speedGuidanceNote:
      "NG1's district figures show a meaningful gap between superfast and gigabit-capable availability. Keep a well-priced superfast option on the shortlist if the chosen building cannot yet order full fibre or cable.",
    sources: [
      {
        label: 'Ofcom broadband availability checker',
        href: 'https://checker.ofcom.org.uk/en-gb/broadband-coverage',
        note: 'Regulator checker explaining predicted broadband availability, speed categories and property-level limitations.',
      },
      {
        label: 'Openreach: broadband boost for over 100,000 Nottingham properties',
        href: 'https://www.openreach.com/news/broadband-boost-for-over-100000-nottingham-homes-and-businesses/',
        note: 'Primary network update reporting 107,000 Nottingham homes and businesses reached and about 70% citywide coverage in August 2025.',
      },
      {
        label: 'Nottinghamshire County Council: getting connected',
        href: 'https://www.nottinghamshire.gov.uk/business-community/digital-connectivity/where-and-when',
        note: 'Government guidance to check postcode availability and compare speed, usage, contract, bundles and offers before ordering.',
      },
    ],
  },
  RG1: {
    neighbourhoods: 'the town centre, Reading station and West Reading',
    altnetParagraphs: [
      'CityFibre said in May 2025 that its primary Reading build was complete and ready for service to more than 97,000 homes, covering about 98% of homes and most businesses in Reading and surrounding areas. That wider build figure is not an RG1 measurement. The Ofcom-derived district snapshot separately records 90.6% gigabit-capable availability across 915 sampled RG1 postcode units in July 2024, so the two populations and dates are reported separately.',
      'Openreach reported in July 2024 that more than 43,000 Reading homes and businesses could order its Full Fibre service, while its April 2025 Berkshire update reported around 215,000 properties across the county. CityFibre lists Vodafone, TalkTalk, Giganet and Zen among retailers on its Reading network, and toob also sells Reading service through CityFibre. RG1 residents should compare retailers on more than one available network, then confirm the complete address.',
    ],
    speedGuidanceNote:
      "With CityFibre's primary Reading build complete and Openreach also active locally, compare providers on at least two available networks where the RG1 address has that choice.",
    sources: [
      {
        label: "CityFibre: Reading primary build completes",
        href: 'https://cityfibre.com/news/reading-becomes-one-of-the-uks-best-connected-towns-as-cityfibres-primary-build-completes',
        note: "Primary network statement that the Reading build was ready for service to more than 97,000 homes in May 2025, covering about 98% of homes in Reading and surrounding areas.",
      },
      {
        label: 'Openreach: Full Fibre reaching more Reading homes',
        href: 'https://www.openreach.com/news/full-fibre-broadband-reaching-more-reading-homes/',
        note: 'Primary network update reporting more than 43,000 Reading homes and businesses able to order Openreach Full Fibre in July 2024.',
      },
      {
        label: 'Switchity: Reading broadband coverage and deals',
        href: 'https://switchity.co.uk/broadband-areas/reading/',
        note: 'Independent comparison page reporting Reading-wide coverage from ThinkBroadband Labs and demonstrating why exact-address deal checking is still required.',
      },
    ],
  },
  CT1: {
    neighbourhoods: 'the city centre, St Martins and the Northgate/Sturry Road area',
    altnetParagraphs: [
      "CT1 should be assessed separately from Canterbury-wide coverage. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 714 CT1 postcode units and records 61.7% gigabit-capable availability, 61.7% ultrafast availability and 99% superfast availability. Switchity reports a newer Canterbury-wide full-fibre figure from ThinkBroadband Labs, but that covers a different area, population and date, so the figures are reported separately rather than combined.",
      "Openreach's checker reports Full Fibre availability for a selected property rather than guaranteeing service from a town name. Ofcom gives the same warning: area predictions and the fastest network speed shown may differ from what one property can order or receive. Check the complete CT1 address with each shortlisted provider, especially for a flat or converted building where access and installation permissions can affect the result.",
    ],
    speedGuidanceNote:
      "CT1's district snapshot shows a meaningful gap between superfast and gigabit-capable availability. Keep a well-priced superfast package on the shortlist if the property cannot order full fibre or cable, and compare the provider's personalised estimate rather than the postcode average.",
    sources: [
      {
        label: 'Ofcom broadband availability checker',
        href: 'https://checker.ofcom.org.uk/en-gb/broadband-coverage',
        note: 'Regulator checker defining speed categories and explaining that predicted network availability and actual property results can differ.',
      },
      {
        label: 'Openreach fibre availability checker and build guidance',
        href: 'https://www.openreach.com/broadband-network/fibre-availability',
        note: 'Primary network guidance explaining address-level checker results and how Full Fibre build plans work.',
      },
      {
        label: 'Switchity: Canterbury broadband coverage and deals',
        href: 'https://switchity.co.uk/broadband-areas/canterbury/',
        note: 'Independent comparison page with Canterbury-wide ThinkBroadband coverage, current deal-table patterns and an explicit exact-address limitation.',
      },
    ],
  },
  RM1: {
    neighbourhoods: 'the town centre, Romford station and neighbouring parts of Harold Wood and Gidea Park',
    altnetParagraphs: [
      "RM1 should be assessed separately from wider Romford or London coverage. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 416 RM1 postcode units and records 79.8% gigabit-capable, 84.6% ultrafast and 96.3% superfast availability. These percentages describe network reach at that date, not an orderable package or measured speed for every property.",
      "Openreach says Full Fibre availability can differ between neighbouring properties because network construction happens in stages and engineering, access routes or landlord permissions can affect the result. Ofcom also warns that its checker shows predicted network availability and that actual service at a property may differ. Check the complete RM1 address with each suitable network before choosing a package.",
    ],
    speedGuidanceNote:
      "Because Havering's rollout has been uneven street by street, treat any full-fibre availability you find for a neighbouring RM postcode as informative but not conclusive for RM1 itself.",
    sources: [
      {
        label: 'Ofcom broadband availability checker',
        href: 'https://checker.ofcom.org.uk/en-gb/broadband-coverage',
        note: 'Regulator checker defining broadband speed categories and explaining that predicted network availability and actual property results can differ.',
      },
      {
        label: 'GOV.UK gigabit broadband availability checker',
        href: 'https://www.gov.uk/guidance/check-your-gigabit-broadband-availability',
        note: 'Government address checker for England and Wales, with a warning that supplier plans change and processed address status is not guaranteed to be completely accurate.',
      },
    ],
  },
}

export function getPostcodeLocalIntel(prefix: string): PostcodeLocalIntel | undefined {
  return postcodeLocalIntel[prefix.toUpperCase()]
}
