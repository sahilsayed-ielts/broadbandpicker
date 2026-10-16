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
  GU1: {
    neighbourhoods: 'Guildford town centre, Stoke, Slyfield, Merrow and Burpham',
    altnetParagraphs: [
      "GU1 should be assessed separately from Guildford borough as a whole. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 775 GU1 postcode units and records 83.1% gigabit-capable, 87.3% ultrafast and 99.5% superfast availability. These figures describe network reach at that date, not a measured household speed or an orderable package for every property.",
      "Guildford is also an early location for faster XGS-PON services. EE announced in August 2026 that its 2.3 Gbps and 8 Gbps Advanced Full Fibre plans had launched in Guildford, Woking and surrounding areas using Openreach technology. Eligibility remains address-specific, so the launch does not mean every GU1 home can order either tier. Check the complete address and compare the guaranteed speed, upload speed, equipment and full contract cost before paying for a multi-gigabit plan.",
    ],
    speedGuidanceNote:
      "GU1's district snapshot shows that superfast service is nearly universal while a material minority of sampled postcode units were not gigabit-capable. We would start with an orderable 100 to 300 Mbps full-fibre plan for a busy household, then pay for gigabit or multi-gigabit service only when simultaneous use, large transfers and compatible home networking justify it.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 GU1 gigabit, ultrafast and superfast coverage aggregation across 775 residential postcode units.',
      },
      {
        label: 'EE: Advanced Full Fibre launch in Guildford and Woking',
        href: 'https://newsroom.ee.co.uk/ee-becomes-first-major-uk-provider-to-offer-8gbps-speeds-on-advanced-full-fibre-broadband-using-xgs-pon-technology/',
        note: 'Primary provider announcement for the August 2026 launch of address-limited 2.3 Gbps and 8 Gbps services using Openreach XGS-PON technology.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
      {
        label: 'FindBroadband: broadband deals in Guildford',
        href: 'https://www.findbroadbanddeals.com/broadband/in/south-east/guildford',
        note: 'Independent corroboration of the address-led comparison task, wider-Guildford coverage limitations and current deal-table conventions.',
      },
    ],
  },
  BN1: {
    neighbourhoods: 'central Brighton, Preston, Withdean, Patcham, Hollingbury, Coldean, Falmer and Stanmer',
    altnetParagraphs: [
      "BN1 should be assessed separately from Brighton and Hove as a whole. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 1,367 BN1 postcode units and records 82.5% gigabit-capable, 84.6% ultrafast and 96.6% superfast availability. Openreach separately reported in February 2026 that its Full Fibre network reached more than 90,000 Brighton and Hove homes and businesses, around 63% of properties across the wider city. The populations, networks and dates differ, so the figures are reported separately rather than combined.",
      "BN1 includes terraced streets, converted houses, student homes and blocks of flats where one network may reach only part of a building or street. Openreach requires a selected address before showing whether Full Fibre is available, while Brighton & Hove City Council says CityFibre's city rollout has been partial. Check the complete house or flat number with every suitable network before treating a Brighton package as orderable.",
    ],
    speedGuidanceNote:
      "BN1's district snapshot shows strong superfast coverage but a meaningful gap before gigabit-capable service. We would start with an orderable 100 to 300 Mbps full-fibre plan for a busy shared home, but keep a lower-cost 30 to 80 Mbps option if it meets the household need or the building cannot receive full fibre.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 BN1 gigabit, ultrafast, superfast and below-USO coverage aggregation across 1,367 residential postcode units.',
      },
      {
        label: 'Openreach: Brighton and Hove Full Fibre update',
        href: 'https://www.openreach.com/news/thousands-in-brighton-and-hove-yet-to-benefit-from-major-broadband-upgrade/',
        note: 'Primary network statement reporting more than 90,000 Brighton and Hove homes and businesses reached, around 63% of properties across the wider city, in February 2026.',
      },
      {
        label: 'Brighton & Hove City Council: full fibre and 5G connectivity',
        href: 'https://www.brighton-hove.gov.uk/city-regeneration/regeneration-information-residents-and-business-owners/full-fibre-broadband-and-5g-connectivity',
        note: 'Local-government account of the CityFibre rollout and the named parts of Brighton where service had launched, supporting the warning that city-wide rollout does not guarantee one BN1 address.',
      },
      {
        label: 'Choose: broadband in Brighton & Hove',
        href: 'https://www.choose.co.uk/broadband/guide/broadband-in-brighton/',
        note: 'Independent comparison corroborating the presence of Openreach, Virgin Media, CityFibre and smaller networks, and the need to check the complete address.',
      },
    ],
  },
  NE1: {
    neighbourhoods: 'the Quayside, Grainger Town, Haymarket and the area around Newcastle Central station',
    altnetParagraphs: [
      "NE1 should be assessed separately from Newcastle-wide coverage. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 230 NE1 postcode units and records 62.8% gigabit-capable availability, 68.1% ultrafast availability and 79.8% superfast availability. Switchity reports 90.29% full-fibre and 94.60% gigabit coverage across wider Newcastle using ThinkBroadband Labs data checked in August 2026. The populations, dates and measures differ, so the figures are reported separately rather than combined.",
      "NE1 contains flats, converted buildings and mixed residential and commercial streets where network access can change from one property to the next. Openreach requires a selected address before reporting Full Fibre availability, and Ofcom describes its results as predicted network availability. Check the complete house or flat number with each suitable network before treating a Newcastle package as orderable.",
    ],
    speedGuidanceNote:
      "NE1's district snapshot has a meaningful gap between superfast and gigabit-capable availability. Keep an orderable 30 to 80 Mbps package on the shortlist if the building cannot receive full fibre or cable, and compare the provider's personalised estimate rather than a Newcastle-wide average.",
    sources: [
      {
        label: 'Ofcom broadband availability checker',
        href: 'https://checker.ofcom.org.uk/en-gb/broadband-coverage',
        note: 'Regulator checker explaining predicted fixed-broadband availability, speed categories and why a property result can differ from an area figure.',
      },
      {
        label: 'Openreach fibre availability checker',
        href: 'https://www.openreach.com/fibre-checker',
        note: 'Primary network checker requiring a complete address for current and planned Openreach Full Fibre availability.',
      },
      {
        label: 'Newcastle City Council: telecommunications and digital infrastructure',
        href: 'https://newcastle.gov.uk/services/planning-building-and-development/apply-planning-permission/Telecommunications-and-Digital-Infrastructure-Delivery',
        note: 'Local-government policy confirming that high-quality digital infrastructure is a Newcastle priority and that building integration affects delivery.',
      },
      {
        label: 'Switchity: Newcastle broadband coverage and deals',
        href: 'https://switchity.co.uk/broadband-areas/newcastle/',
        note: 'Independent city-wide comparison reporting ThinkBroadband Labs coverage and demonstrating why exact-address checking is required; its wider population is kept separate from NE1.',
      },
    ],
  },
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
  HA1: {
    neighbourhoods: 'Harrow town centre, Harrow on the Hill, North Harrow, Northwick Park and northern parts of Sudbury',
    altnetParagraphs: [
      "HA1 should be assessed separately from the whole London Borough of Harrow. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 807 HA1 postcode units and records 79.2% gigabit-capable, 79.2% ultrafast and 95.9% superfast availability. Harrow Council separately reports 58% full-fibre availability across the whole borough using Ofcom Spring 2024 data. The areas, dates and measures differ, so the figures are reported separately rather than combined.",
      "Harrow Council identifies Openreach as the network used by most broadband providers and names Community Fibre and Hyperoptic as separate infrastructure providers to check. Virgin Media also checks its own network by full address. Results can differ between neighbouring homes and between flats in one building, so a search for HA1 4BH or HA1 3AN still needs the house or flat number before any deal is treated as orderable.",
    ],
    speedGuidanceNote:
      "HA1's district snapshot shows that superfast service is widespread but about one fifth of sampled postcode units were not gigabit-capable in July 2024. We would start with an orderable 100 to 300 Mbps full-fibre plan for a busy household, then compare its full contract cost with a cheaper 30 to 80 Mbps service if the faster tier would add little practical value.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 HA1 gigabit, ultrafast, superfast and below-USO coverage aggregation across 807 residential postcode units.',
      },
      {
        label: "Harrow Council: Harrow's digital infrastructure",
        href: 'https://www.harrow.gov.uk/council/harrow%E2%80%99s-digital-infrastructure',
        note: 'Local-government evidence for borough-wide Spring 2024 full-fibre availability, the distinction between FTTC and FTTP, and the Openreach, Community Fibre and Hyperoptic networks to check. Its borough figure is kept separate from HA1.',
      },
      {
        label: 'Openreach fibre availability guidance',
        href: 'https://www.openreach.com/broadband-network/fibre-availability',
        note: 'Primary network guidance confirming that the fibre checker gives the best option currently available at a complete address and that build plans can change because of engineering and access constraints.',
      },
      {
        label: 'Broadbandchoice: broadband deals in Harrow',
        href: 'https://www.broadbandchoice.co.uk/compare/broadband/harrow/',
        note: 'Independent commercial corroboration of the postcode-led deal task, current comparison fields and the need to confirm address availability before ordering.',
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
  SE1: {
    neighbourhoods: 'Borough, Bankside, London Bridge, Waterloo, South Bank, Bermondsey and Elephant and Castle',
    altnetParagraphs: [
      "SE1 should be assessed separately from the wider Southwark borough. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 1,467 SE1 postcode units and records 82.6% gigabit-capable, 82.6% ultrafast and 94.2% superfast availability. Southwark Council and Openreach separately announced a £20 million, five-year Full Fibre partnership in March 2022 covering more than 35,000 homes and businesses borough-wide, but named Rotherhithe and Bermondsey, not central SE1, as the first priority areas. The populations, dates and named areas differ, so the figures are reported separately rather than combined.",
      "Coverage inside SE1 is uneven between its older housing stock around Borough and Bankside and the newer riverside developments near London Bridge. Hyperoptic's own network pages list Elephant and Castle (SE1) as a covered area, and Openreach and Virgin Media both operate in the district, but a provider's borough-wide or SE1-wide listing does not confirm one street, converted building or flat. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "SE1's district snapshot shows superfast service close to universal, with a real but smaller gap before gigabit-capable service. We would start with an orderable 100 to 300 Mbps full-fibre plan for a typical Borough or Bankside flat, then pay for gigabit service only where simultaneous use, large uploads or a shared household justify the extra cost.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 SE1 gigabit, ultrafast and superfast coverage aggregation across 1,467 residential postcode units.',
      },
      {
        label: 'Southwark Council: Southwark Council and Openreach work together to bring ultrafast broadband to the borough',
        href: 'https://www.southwark.gov.uk/news/2022/southwark-council-and-openreach-work-together-bring-ultrafast-broadband-borough',
        note: 'Local-authority evidence for the March 2022 £20 million, five-year Full Fibre partnership across more than 35,000 Southwark homes and businesses. Names Rotherhithe and Bermondsey, not central SE1, as first-phase areas, so kept separate from the SE1 coverage figures above.',
      },
      {
        label: 'Hyperoptic: full fibre broadband in Southwark',
        href: 'https://www.hyperoptic.com/southwark/',
        note: 'Primary provider source listing Elephant and Castle (SE1) among the Southwark areas its full-fibre network covers, alongside its own address checker and customer-review evidence.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  E1: {
    neighbourhoods: 'Whitechapel, Spitalfields, Aldgate, Stepney and part of Wapping',
    altnetParagraphs: [
      "E1 should be assessed separately from the wider Tower Hamlets borough. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 1,285 E1 postcode units and records 70.1% gigabit-capable, 70% ultrafast and 89% superfast availability, a lower gigabit-capable rate than several other central London districts modelled on this site. These figures describe network reach at that date, not an orderable package or measured speed for every property.",
      "E1 has a large share of converted Victorian terraces and warehouse conversions around Whitechapel and Spitalfields alongside newer blocks near Aldgate, where one network can reach some flats in a building and not others. Hyperoptic's own coverage pages list Whitechapel among the Tower Hamlets areas its full-fibre network reaches, and EE sells broadband over the Openreach network that covers most of the district, but neither confirms one specific building. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "E1's district snapshot shows strong superfast coverage but a more meaningful gigabit-capable gap than nearby districts. We would start with an orderable 100 to 300 Mbps full-fibre plan for a typical Whitechapel or Spitalfields flat, and check gigabit availability address by address rather than assuming it based on a neighbouring building.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 E1 gigabit, ultrafast and superfast coverage aggregation across 1,285 residential postcode units.',
      },
      {
        label: 'Hyperoptic: full fibre broadband in Hackney and Tower Hamlets',
        href: 'https://www.hyperoptic.com/broadband/london/hackney/',
        note: 'Primary provider source listing Whitechapel among the Tower Hamlets areas its full-fibre network covers, alongside Bethnal Green and Bow.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  UB1: {
    neighbourhoods: 'Southall town centre, Southall Broadway, Norwood Green and Little India',
    altnetParagraphs: [
      "UB1 should be assessed separately from the wider London Borough of Ealing. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 552 UB1 postcode units and records 83% gigabit-capable, 83.8% ultrafast and 99.7% superfast availability. Virgin Media separately announced in February 2023 that more than 20,000 additional Southall homes had connected to its gigabit cable network, describing the available speeds as several times the then-local Ealing average. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "A separate wholesale full-fibre network built by FW Networks also passes homes and businesses in Southall, sold on to residents through smaller retail providers such as Hey!Broadband rather than through the major names most UK comparison sites, including BroadbandPicker's own dataset, track directly. A Southall-wide rollout announcement, whichever network makes it, does not confirm service at one specific address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "UB1's district snapshot shows superfast service is close to universal and gigabit-capable coverage is strong for an outer-London district, largely on the back of Virgin Media's confirmed cable expansion. We would start with an orderable full-fibre or gigabit-cable plan where it is genuinely available at the address, keeping a lower-speed option if it meets the household need at materially lower cost.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 UB1 gigabit, ultrafast and superfast coverage aggregation across 552 residential postcode units.',
      },
      {
        label: 'Virgin Media O2: more than 20,000 Southall homes connected to gigabit network',
        href: 'https://news.virginmediao2.co.uk/more-than-20000-southall-homes-now-connected-to-virgin-media-o2s-gigabit-network/',
        note: 'Primary provider press release, dated 17 February 2023, for the Southall gigabit cable rollout figure used above. Kept dated and separate from the Ofcom July 2024 district figure.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  EN1: {
    neighbourhoods: 'Enfield Town, Enfield Lock, Enfield Highway and Enfield Wash',
    altnetParagraphs: [
      "EN1 should be assessed separately from the wider London Borough of Enfield, which some sites quote at around 94% ultrafast coverage for the whole borough rather than the EN1 district specifically. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 824 EN1 postcode units and records 89.3% gigabit-capable, 89.3% ultrafast and 98.6% superfast availability. Openreach separately confirmed on 24 March 2026 that it had agreed to upgrade more than 1,500 flats and apartments across over 50 Enfield buildings to full fibre initially, with thousands more planned. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "Openreach was explicit that its flats-and-apartments upgrade is not automatic: once full fibre is available at a building, a resident still has to contact a broadband provider and place an order to get connected, rather than assuming service arrives on its own. Community Fibre and Hyperoptic are also reported active in parts of the wider Enfield area on their own separate networks. A borough-wide or Enfield-wide rollout mention does not confirm coverage at one specific EN1 address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "EN1's district snapshot shows strong superfast and gigabit-capable coverage for an outer-London district, reinforced by Openreach's confirmed flats-and-apartments upgrade. We would start with an orderable full-fibre plan where it is genuinely available at the address, keeping a lower-speed option if it meets the household need at materially lower cost.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 EN1 gigabit, ultrafast and superfast coverage aggregation across 824 residential postcode units.',
      },
      {
        label: 'Openreach: broadband upgrade for thousands of Enfield flats and apartments',
        href: 'https://www.openreach.com/news/broadband-upgrade-for-thousands-of-enfield-flats-and-apartments/',
        note: 'Primary network operator press release, dated 24 March 2026, for the confirmed 1,500+ flats and 50+ buildings full-fibre upgrade figure used above.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  NW1: {
    neighbourhoods: 'Camden Town, Regent\'s Park, Primrose Hill, King\'s Cross and part of Somers Town',
    altnetParagraphs: [
      "NW1 should be assessed separately from the wider London Borough of Camden, reported at around 95% ultrafast coverage for the whole borough as of 2025 rather than the NW1 district specifically. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 1,201 NW1 postcode units and records 88.7% gigabit-capable, 88.7% ultrafast and 96.6% superfast availability. Virgin Media, Hyperoptic and Community Fibre each operate their own separate full-fibre networks in parts of Camden, alongside Openreach retailers. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "G.Network, a full-fibre altnet with infrastructure passing over 420,000 premises across central London, was put into administration in January 2026 after its then-owner ran into financial difficulty, with around 106 staff made redundant during the process. It exited administration debt-free on 25 March 2026 following a restructuring, with co-founder David Sangster returning as chief executive. BroadbandPicker does not currently include G.Network in its NW1 provider comparison; a resident considering it should check current coverage and contract terms directly given the recent restructuring, rather than assuming standard commercial terms apply. Check the complete house or flat number with each network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "NW1's district snapshot shows strong superfast and gigabit-capable coverage typical of inner London, with three separate full-fibre altnets (Virgin Media, Hyperoptic, Community Fibre) alongside Openreach retailers. We would start with an orderable full-fibre plan from an established network where it is genuinely available at the address, keeping a lower-speed option if it meets the household need at materially lower cost.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 NW1 gigabit, ultrafast and superfast coverage aggregation across 1,201 residential postcode units.',
      },
      {
        label: 'Capacity: G.Network exits administration debt-free',
        href: 'https://capacityglobal.com/news/gnetwork-exits-administration/',
        note: 'Industry press report, dated 25 March 2026, confirming G.Network\'s exit from administration, its central London footprint (420,000+ premises passed) and David Sangster\'s return as CEO.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  W5: {
    neighbourhoods: 'Ealing Broadway, Ealing Common, Castle Bar and part of West Ealing',
    altnetParagraphs: [
      "W5 should be assessed separately from the wider London Borough of Ealing. Vodafone confirmed on 2 September 2025 that it could now provide full fibre broadband, running on Community Fibre's network, to 37,000 homes across the whole borough at speeds of up to 2.2 Gbps -- a borough-wide figure, not W5-specific. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 863 W5 postcode units and records 87.4% gigabit-capable, 87.4% ultrafast and 98.6% superfast availability. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "Community Fibre and Virgin Media each operate their own separate full-fibre and gigabit-cable networks in parts of Ealing, alongside Openreach retailers including Vodafone's own resale of the Community Fibre network. Hey!Broadband, a separate named full-fibre operator, is also reported active in parts of Ealing through its own network, though not currently in BroadbandPicker's W5 provider comparison. A borough-wide or Ealing-wide rollout mention does not confirm coverage at one specific W5 address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "W5's district snapshot shows strong superfast and gigabit-capable coverage for an inner-west-London district, reinforced by Vodafone's confirmed Community Fibre-based expansion across the wider borough. We would start with an orderable full-fibre plan where it is genuinely available at the address, keeping a lower-speed option if it meets the household need at materially lower cost.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 W5 gigabit, ultrafast and superfast coverage aggregation across 863 residential postcode units.',
      },
      {
        label: 'Ealing.News: Vodafone brings full fibre broadband to 37,000 Ealing homes',
        href: 'https://www.ealing.news/news/vodafone-brings-full-fibre-broadband-to-37000-ealing-homes/',
        note: 'Local news report, dated 2 September 2025, for the confirmed 37,000-home, 2.2 Gbps Vodafone/Community Fibre borough-wide full-fibre figure used above.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  SO14: {
    neighbourhoods: 'Southampton City Centre, St Mary\'s, Northam and part of Chapel',
    altnetParagraphs: [
      "SO14 should be assessed separately from wider Southampton-wide figures. Openreach confirmed on 3 November 2025 that more than 10,000 Southampton properties could already access full fibre broadband over its network, with thousands more due to be upgraded as engineering work continues across the city, though it did not give a precise figure for that next phase. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 631 SO14 postcode units and records 87.2% gigabit-capable, 88.6% ultrafast and 94.5% superfast availability. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "toob, a separate full-fibre operator, chose Southampton as the first city for its own self-built network and now serves over 125,000 customers across the UK, alongside Openreach retailers and Virgin Media's own gigabit-cable network. A city-wide rollout announcement or a national customer total does not confirm coverage at one specific SO14 address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "SO14's district snapshot shows strong superfast and gigabit-capable coverage, reinforced by toob's own full-fibre network (Southampton was its first city) and Openreach's confirmed full-fibre upgrade. We would start with an orderable full-fibre plan where it is genuinely available at the address, keeping a lower-speed option if it meets the household need at materially lower cost.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 SO14 gigabit, ultrafast and superfast coverage aggregation across 631 residential postcode units.',
      },
      {
        label: 'Openreach: bringing full fibre broadband to more Southampton homes',
        href: 'https://www.openreach.com/news/openreach-bringing-full-fibre-broadband-to-more-southampton-homes/',
        note: 'Primary network operator press release, dated 3 November 2025, for the confirmed 10,000+ properties full-fibre figure used above.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  LU1: {
    neighbourhoods: 'Luton town centre, Bury Park, High Town and part of Biscot',
    altnetParagraphs: [
      "LU1 should be assessed separately from wider Luton-wide figures. CityFibre confirmed on 29 May 2024 that more than 35,000 Luton premises were ready for service on its full-fibre network, offering speeds up to 2.5 Gbps and sold through Vodafone, TalkTalk and smaller retailers including IDNet, Cuckoo and Zen. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 755 LU1 postcode units and records 92.4% gigabit-capable, 93.3% ultrafast and 98.2% superfast availability. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "Openreach separately reported on 14 April 2025 that 60,000 Luton homes and businesses could already upgrade to full fibre, yet fewer than one in five had actually done so, since an upgrade is not automatic and a resident must place an order with a provider to get connected. IDNet, Cuckoo and Zen are not currently in BroadbandPicker's LU1 provider comparison. A borough-wide or Luton-wide rollout mention does not confirm coverage at one specific LU1 address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "LU1's district snapshot shows strong superfast and gigabit-capable coverage, reinforced by CityFibre's confirmed full-fibre rollout, though Openreach's own findings show many eligible homes have not yet switched. We would start with an orderable full-fibre plan where it is genuinely available at the address, keeping a lower-speed option if it meets the household need at materially lower cost.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 LU1 gigabit, ultrafast and superfast coverage aggregation across 755 residential postcode units.',
      },
      {
        label: 'CityFibre: over 35,000 homes in Luton among the best connected in the UK',
        href: 'https://cityfibre.com/news/over-35-000-homes-in-luton-among-the-best-connected-in-the-uk',
        note: 'Primary network operator press release, dated 29 May 2024, for the confirmed 35,000+ premises full-fibre figure used above.',
      },
      {
        label: 'Openreach: thousands in Luton missing out on Full Fibre',
        href: 'https://www.openreach.com/news/thousands-in-luton-missing-out-on-full-fibre/',
        note: 'Primary network operator press release, dated 14 April 2025, for the 60,000-property availability figure and the low-uptake finding used above.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  L1: {
    neighbourhoods: 'Liverpool city centre, the Ropewalks, Chinatown and part of the Baltic Triangle',
    altnetParagraphs: [
      "L1 should be assessed separately from wider Liverpool-wide figures. Netomnia, trading as YouFibre, confirmed on 11 February 2025 that its full-fibre network had passed 110,000 Liverpool premises, with an additional 80,000 planned to reach 190,000 by 2026, including ongoing work in Sefton Park, Stoneycroft and Aintree. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 254 L1 postcode units and records 59.8% gigabit-capable, 61.5% ultrafast and 71.3% superfast availability, noticeably lower than several other city-centre districts covered on this site. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "YouFibre is not currently in BroadbandPicker's L1 provider comparison, and its own guidance is explicit that coverage varies street by street rather than area by area, so two addresses a short distance apart can have different options. A city-wide rollout announcement does not confirm coverage at one specific L1 address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "L1's district snapshot shows meaningfully lower gigabit-capable and ultrafast coverage than several other UK city-centre districts covered on this site, even as YouFibre continues expanding street by street nearby. We would check both Openreach/Virgin Media availability and YouFibre's own postcode lookup separately before assuming any single network reaches a specific address, then compare total contract cost.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 L1 gigabit, ultrafast and superfast coverage aggregation across 254 residential postcode units.',
      },
      {
        label: 'ISPreview: Netomnia to expand 10Gbps FTTP broadband rollout in Liverpool',
        href: 'https://www.ispreview.co.uk/index.php/2025/02/netomnia-to-expand-10gbps-fttp-broadband-rollout-in-liverpool-uk.html',
        note: 'Independent industry press report, dated 11 February 2025, for the 110,000-premises-passed and 190,000-by-2026 figures used above.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  LS2: {
    neighbourhoods: 'Leeds city centre, the Merrion area, Woodhouse and part of the Northern Quarter',
    altnetParagraphs: [
      "LS2 should be assessed separately from city-wide Leeds figures. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 191 LS2 postcode units and records 79.3% gigabit-capable, 81.4% ultrafast and 87.8% superfast availability. CCS Leeds, a local full-fibre altnet, states on its own website that it has built a network reaching LS1, LS2, LS7, LS9, LS10, LS11, LS12, LS14 and LS15, with services launching across the city 'from April', though it does not give a specific year for that launch or any dated coverage percentage. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "Stream Networks, a second named full-fibre operator, separately states its gigabit-capable network extends to more than 700 postcodes across Leeds and surrounding areas, again without a dated coverage percentage. Neither CCS Leeds nor Stream Networks is currently in BroadbandPicker's LS2 provider comparison. A Leeds-wide rollout mention does not confirm coverage at one specific LS2 address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "LS2's district snapshot shows solid superfast and gigabit-capable coverage for a city-centre district, with two named local full-fibre altnets, CCS Leeds and Stream Networks, also active nearby though undated and outside BroadbandPicker's own provider comparison. We would start with an orderable full-fibre plan from a listed provider where it is genuinely available, then separately check CCS Leeds' and Stream Networks' own coverage tools before assuming either reaches a specific address.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 LS2 gigabit, ultrafast and superfast coverage aggregation across 191 residential postcode units.',
      },
      {
        label: 'CCS Leeds: Leeds Fibre Broadband',
        href: 'https://www.ccsleeds.co.uk/broadband/leeds-fibre-broadband',
        note: 'First-party network operator page, listing LS2 among its served postcodes; no dated coverage percentage is given.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  B1: {
    neighbourhoods: 'Birmingham city centre, the Colmore Business District, Jewellery Quarter and part of Digbeth',
    altnetParagraphs: [
      "B1 should be assessed separately from wider Birmingham-wide figures, such as a reported 86% of Birmingham premises able to order full fibre as of September 2025. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 182 B1 postcode units and records 74.0% gigabit-capable, 77.7% ultrafast and 90.1% superfast availability. CityFibre's Birmingham footprint, unlike its citywide coverage in some other UK cities, is concentrated in specific outer zones around Gravelly Hill, Erdington (B23), Acocks Green (B27) and Tyseley (B25), not Birmingham city centre itself. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "Birmingham city centre is instead served mainly by comprehensive Openreach full fibre and Virgin Media, plus a notable Hyperoptic presence in apartment buildings around New Street and other city-centre developments. Hyperoptic is not currently in BroadbandPicker's B1 provider comparison. A city-wide rollout percentage does not confirm coverage at one specific B1 address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "B1's district snapshot shows solid superfast and gigabit-capable coverage for a city-centre district, with a notable Hyperoptic presence in specific apartment buildings alongside the national providers listed here. We would start with an orderable full-fibre plan from a listed provider, then separately check Hyperoptic's own building-level coverage if the property is a city-centre apartment block.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 B1 gigabit, ultrafast and superfast coverage aggregation across 182 residential postcode units.',
      },
      {
        label: 'BroadbandSwitch.uk: Birmingham broadband deals 2026',
        href: 'https://broadbandswitch.uk/birmingham-broadband-deals.html',
        note: 'Independent comparison guide, dated 28 April 2026, for the CityFibre outer-zone coverage detail and the B1 city-centre Openreach/Virgin Media/Hyperoptic description used above.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  CV1: {
    neighbourhoods: 'Coventry city centre, Hillfields, the Butts and part of Spon End',
    altnetParagraphs: [
      "CV1 should be assessed separately from city-wide Coventry figures. Openreach confirmed on 7 March 2025 that more than 125,000 homes and businesses across Coventry were eligible for full fibre, covering around 80% of properties city-wide, with an explicit reminder from its Midlands Regional Director, Kasam Hussain, that upgrades do not happen automatically and a resident must place an order. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 515 CV1 postcode units and records 91.5% gigabit-capable, 91.4% ultrafast and 96.2% superfast availability. The populations, dates and methodologies differ, so the figures are reported separately rather than combined.",
      "toob, a full-fibre altnet partnered with CityFibre, has also recently arrived in the West Midlands, with some Coventry areas already taking orders and others still in build or design phases according to its own website. toob is not currently in BroadbandPicker's CV1 provider comparison. A city-wide rollout percentage does not confirm coverage at one specific CV1 address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "CV1's district snapshot shows strong superfast and gigabit-capable coverage for a city-centre district, reinforced by Openreach's confirmed city-wide full-fibre eligibility figures. We would start with an orderable full-fibre plan from a listed provider where it is genuinely available, then separately check toob's own coverage tool given its recent West Midlands arrival.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 CV1 gigabit, ultrafast and superfast coverage aggregation across 515 residential postcode units.',
      },
      {
        label: 'Openreach: full fibre broadband in Coventry',
        href: 'https://www.openreach.com/news-and-opinion/2025/full-fibre-broadband-coventry',
        note: 'Primary network operator press release, dated 7 March 2025, for the confirmed 125,000+ properties and 80% city-wide full-fibre eligibility figures used above.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  L8: {
    neighbourhoods: 'Toxteth, Dingle and part of the Georgian Quarter',
    altnetParagraphs: [
      "L8 should be assessed separately from wider Liverpool-wide figures. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 649 L8 postcode units and records 80.8% gigabit-capable, 86.3% ultrafast and 98.7% superfast availability. Virgin Media is not listed as available in this district in BroadbandPicker's own data. Giant, a Liverpool-founded ISP operating its own LCR Connect symmetric network, states that properties on L1, L2, L3 and L8 sub-exchanges are typically ready to light on its network, alongside CityFibre, Hyperoptic and other named local altnets reported active in parts of Liverpool. None of these is currently in BroadbandPicker's L8 provider comparison. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "One independent guide, updated 28 April 2026, specifically flags that L8 Toxteth and parts of neighbouring Dingle have older Victorian housing stock with variable internal cabling, recommending a check before assuming gigabit-class speeds are achievable throughout a property even where the street itself is gigabit-capable. This is a genuinely useful, address-level caution rather than a reason to rule out full fibre altogether. A citywide rollout mention does not confirm coverage, or achievable in-property speed, at one specific L8 address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "L8's district snapshot shows solid superfast coverage but comparatively lower gigabit-capable coverage than several other city-centre districts on this site, compounded by a genuine risk that older Victorian housing stock limits achievable in-property speed even on a gigabit-capable street. We would check both Openreach availability and Giant's or another named local altnet's own coverage tool, then ask specifically about internal wiring before ordering the fastest available tier.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 L8 gigabit, ultrafast and superfast coverage aggregation across 649 residential postcode units.',
      },
      {
        label: 'BroadbandSwitch.uk: Liverpool broadband deals',
        href: 'https://broadbandswitch.uk/liverpool-broadband-deals.html',
        note: 'Independent comparison guide, dated 28 April 2026, for the L8/Toxteth Victorian-housing-stock caution and named local-altnet list used above.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  G1: {
    neighbourhoods: 'Glasgow city centre, Merchant City, the Broomielaw and part of the Trongate',
    altnetParagraphs: [
      "G1 should be assessed separately from citywide Glasgow investment figures. CityFibre has committed around £270 million to building a separate full-fibre network across Glasgow, but an independent report dated 21 May 2025 found that private, unadopted roads in some Glasgow-area streets have delayed connections, since these roads require separate legal access agreements that can be difficult and costly to negotiate. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 154 G1 postcode units and records 68.1% gigabit-capable, 71.8% ultrafast and 86.4% superfast availability, noticeably lower than several other city-centre districts covered on this site. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "CityFibre is not currently in BroadbandPicker's G1 provider comparison. The private-roads friction reported in May 2025 affected specific outer Glasgow streets rather than G1 city centre itself, but it illustrates that a large citywide investment figure does not guarantee every street is connected on the original timeline. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "G1's district snapshot shows meaningfully lower gigabit-capable coverage than several other UK city-centre districts covered on this site, and CityFibre's citywide rollout has faced genuine, reported access delays in some areas. We would check Openreach and Virgin Media availability for the specific address, then separately confirm CityFibre's own coverage tool before assuming any network is ready to order.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 G1 gigabit, ultrafast and superfast coverage aggregation across 154 residential postcode units.',
      },
      {
        label: 'ISPreview: private roads hamper CityFibre\'s FTTP broadband rollout in Glasgow',
        href: 'https://www.ispreview.co.uk/index.php/2025/05/private-roads-hamper-cityfibres-fttp-broadband-rollout-in-glasgow.html',
        note: 'Independent industry press report, dated 21 May 2025, for the £270 million citywide investment figure and the private-roads access-delay finding used above.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  BS3: {
    neighbourhoods: 'Bedminster, North Street and part of Southville',
    altnetParagraphs: [
      "BS3 should be assessed separately from BS31 (Keynsham), a genuinely different postcode district despite the similar-looking code, and from Bristol-wide or constituency-level figures. An independent guide, dated 28 April 2026, reports that CityFibre has partial coverage in parts of Bedminster, sold through Vodafone, TalkTalk, Zen Internet and other retailers, though the exact share of BS3 covered is not broken down separately. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 851 BS3 postcode units and records 94.0% gigabit-capable, 94.0% ultrafast and 98.4% superfast availability. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "CityFibre itself is not currently in BroadbandPicker's BS3 provider comparison, though Vodafone and TalkTalk, already in BroadbandPicker's own list, can sell over it where it reaches the property. Truespeed and YouFibre, two other named full-fibre altnets active in other parts of Bristol, are not confirmed as covering Bedminster specifically. A Bristol-wide or constituency-level rollout percentage does not confirm coverage at one specific BS3 address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "BS3's district snapshot shows strong superfast and gigabit-capable coverage for an inner-city district, reinforced by CityFibre's partial presence sold through Vodafone and TalkTalk, both already in BroadbandPicker's provider comparison. We would start with an orderable full-fibre plan from a listed provider where it is genuinely available, and always confirm the exact BS3 address rather than a similar-looking BS31 one.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 BS3 gigabit, ultrafast and superfast coverage aggregation across 851 residential postcode units.',
      },
      {
        label: 'BroadbandSwitch.uk: Bristol broadband deals 2026',
        href: 'https://broadbandswitch.uk/bristol-broadband-deals.html',
        note: 'Independent comparison guide, dated 28 April 2026, for the CityFibre partial-Bedminster-coverage and named-retailer detail used above.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  OX1: {
    neighbourhoods: 'Oxford city centre, St Ebbe\'s, Grandpont and part of Osney',
    altnetParagraphs: [
      "OX1 should be assessed separately from citywide Oxford figures. Openreach confirmed on 14 October 2025 that its full-fibre network had reached more than 23,000 Oxford homes, backed by a £6.9 million investment, though fewer than 15% of eligible properties had actually upgraded, since an upgrade is not automatic and a resident must place an order. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 516 OX1 postcode units and records 64.0% gigabit-capable, 69.3% ultrafast and 94.4% superfast availability, reflecting that full-fibre coverage in Oxford is reported to be less comprehensive than some comparable UK cities. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "YouFibre, Gigaclear and Hyperoptic are also reported active in parts of Oxford through their own separate networks, though none is currently in BroadbandPicker's OX1 provider comparison. A citywide rollout figure or low-uptake finding does not confirm coverage, or the lack of it, at one specific OX1 address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "OX1's district snapshot shows a meaningful gap between superfast coverage (94.4%) and gigabit-capable coverage (64.0%), consistent with reports that full-fibre availability in Oxford lags some comparable UK cities even as Openreach continues its confirmed rollout. We would check Openreach and Virgin Media availability for the specific address, then separately confirm YouFibre's, Gigaclear's or Hyperoptic's own coverage tools before assuming any full-fibre network is ready to order.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 OX1 gigabit, ultrafast and superfast coverage aggregation across 516 residential postcode units.',
      },
      {
        label: 'Openreach: broadband boost for 23,000 Oxford properties',
        href: 'https://www.openreach.com/news/broadband-boost-for-23000-oxford-properties/',
        note: 'Primary network operator press release, dated 14 October 2025, for the confirmed 23,000-home, £6.9 million investment and sub-15% uptake figures used above.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  LS1: {
    neighbourhoods: 'Leeds city centre, the Calls, Holbeck Urban Village and part of Little Germany',
    altnetParagraphs: [
      "LS1 should be assessed separately from neighbouring LS2, even though both are Leeds city-centre districts. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers only 113 LS1 postcode units and records 63.2% gigabit-capable, 63.2% ultrafast and 66.7% superfast availability, meaningfully lower than LS2's 79.3% gigabit-capable and 87.8% superfast figures over a larger 191-unit sample. Giant, a named ISP, separately states that LS1 has CityFibre coverage alongside Openreach full fibre, both offering symmetric speeds up to 1 Gbps, a genuinely LS1-specific claim not reflected in the lower Ofcom sample figure. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "CityFibre and Giant are not currently in BroadbandPicker's LS1 provider comparison. A citywide Leeds agreement, such as CityFibre's Gigafast partnership with Vodafone confirmed back in August 2020 across multiple UK cities, describes a much older milestone and a larger area than the LS1 postcode district's current position. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "LS1's district snapshot shows a smaller Ofcom sample and lower gigabit-capable coverage than neighbouring LS2, even though Giant separately reports genuine CityFibre presence in LS1 offering symmetric gigabit speeds. We would check Openreach and Virgin Media availability for the specific address, then separately confirm Giant's or another CityFibre retailer's own coverage tool before assuming a full-fibre network is ready to order.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 LS1 gigabit, ultrafast and superfast coverage aggregation across 113 residential postcode units, and the comparable LS2 figures across 191 units.',
      },
      {
        label: 'Giant: broadband in Leeds',
        href: 'https://giant.net.uk/broadband/leeds',
        note: 'First-party ISP page stating that LS1 has CityFibre coverage alongside Openreach full fibre, both offering symmetric speeds up to 1 Gbps.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  CF10: {
    neighbourhoods: 'Cardiff city centre, Cathays, Butetown and part of Cardiff Bay',
    altnetParagraphs: [
      "CF10 should be assessed separately from Wales-wide figures, such as a reported June 2026 statistic that more than half of those in Wales who can get Openreach full fibre have upgraded. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 311 CF10 postcode units and records 83.8% gigabit-capable, 84.8% ultrafast and 93.1% superfast availability. Two dated, named infrastructure projects also serve Cardiff city centre specifically: a business-focused \"hypercity network\" confirmed on 16 January 2026 by Cardiff Council, the Welsh Government and infrastructure provider Elevate, offering gigabit and up to 10 Gbps speeds across large parts of the city centre; and Ffeibr, a Welsh operator, confirmed on 2 April 2026 that it was extending fibre developed with Transport for Wales into Cardiff city centre and down to Cardiff Bay. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "Both the hypercity network and Ffeibr's extension are primarily business-focused infrastructure rather than residential broadband, and neither is currently in BroadbandPicker's CF10 provider comparison. Ogi, a named Welsh full-fibre altnet, is also reported active in parts of Cardiff. A citywide or Wales-wide figure does not confirm coverage at one specific CF10 residential address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "CF10's district snapshot shows strong superfast and gigabit-capable coverage for a city-centre district, alongside genuinely dated business-focused full-fibre infrastructure projects (the hypercity network, Ffeibr's Transport for Wales extension) that residential switchers should not assume applies to their own household broadband. We would start with an orderable full-fibre plan from a listed provider, then separately check Ogi's own coverage tool.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 CF10 gigabit, ultrafast and superfast coverage aggregation across 311 residential postcode units.',
      },
      {
        label: 'Business News Wales: a connectivity reset for Cardiff city centre businesses',
        href: 'https://businessnewswales.com/a-connectivity-reset-for-cardiff-city-centre-businesses/',
        note: 'Independent business press article, dated 16 January 2026, describing Cardiff\'s hypercity network built with Cardiff Council, the Welsh Government and Elevate.',
      },
      {
        label: 'Telecompaper: Transport for Wales extends fibre network into Cardiff city centre',
        href: 'https://www.telecompaper.com/news/transport-for-wales-extends-fibre-network-into-cardiff-city-centre--1567170',
        note: 'Independent industry press report, dated 2 April 2026, confirming Ffeibr\'s extension of Transport for Wales fibre into Cardiff city centre and Cardiff Bay.',
      },
    ],
  },
  SG1: {
    neighbourhoods: 'Stevenage town centre, Old Town and part of Bedwell',
    altnetParagraphs: [
      "SG1 should be assessed separately from wider Stevenage-wide figures, and from the same district's own figures at different points in time. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 1,045 SG1 postcode units and records 89.8% gigabit-capable, 89.8% ultrafast and 99.7% superfast availability. Independent industry monitoring separately found that Openreach's own full-fibre coverage across the Stevenage council area dropped from 62.66% to 52.61% by 6 February 2026, a fall of just over 10 percentage points, after Openreach paused installations in areas with difficult ducting. Stevenage was identified as a particularly affected town partly because large parts of it were built in the 1960s and 1970s with direct-buried copper lead-ins to individual homes rather than the ducting modern fibre installation typically needs. The populations, dates and measurement methods differ, so the figures are reported separately rather than combined.",
      "A separate independent guide, dated May 2026 and sourced from ThinkBroadband Labs, reports town-wide Stevenage figures of 94.68% gigabit-capable and 62.27% full fibre (FTTP) across 40,981 premises -- a different date and dataset again to both the Ofcom SG1 figure and the reported Openreach installation-pause finding. A town-wide or historical figure does not confirm coverage, or its current live status, at one specific SG1 address. Check the complete house or flat number, and confirm the order is genuinely live, before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "SG1's district snapshot shows strong Ofcom-derived coverage as of July 2024, but a real, dated, reported Openreach full-fibre installation pause since then means some SG1 addresses may no longer be able to order full fibre that was previously available. We would confirm the live order status directly with the provider rather than relying on any single coverage snapshot, and keep a reliable lower-speed option available as a fallback.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 SG1 gigabit, ultrafast and superfast coverage aggregation across 1,045 residential postcode units.',
      },
      {
        label: 'thinkbroadband: ten point drop in Openreach full fibre coverage in Stevenage',
        href: 'https://www.thinkbroadband.com/news/ten-point-drop-in-openreach-full-fibre-coverage-in-stevenage',
        note: 'Independent industry press report confirming Openreach\'s full-fibre coverage in the Stevenage council area fell from 62.66% to 52.61% by 6 February 2026 due to a pause in installations affected by difficult ducting.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
  LE1: {
    neighbourhoods: 'Leicester city centre, the Cultural Quarter, St George\'s and part of Highfields',
    altnetParagraphs: [
      "LE1 should be assessed separately from wider Leicester-wide figures, and from newer editions of the same regulator dataset. BroadbandPicker's aggregation of Ofcom's July 2024 residential postcode records covers 375 LE1 postcode units and records 70.4% gigabit-capable, 70.9% ultrafast and 95.9% superfast availability. toob, a full-fibre altnet, confirmed on 15 October 2024 that it had launched services to tens of thousands of homes in Leicester using CityFibre's network, alongside Luton and Cambridge on the same day. The populations, dates and networks differ, so the figures are reported separately rather than combined.",
      "toob is not currently in BroadbandPicker's LE1 provider comparison. One competitor site separately cites Ofcom's Connected Nations 2025 report, a newer edition than BroadbandPicker's July 2024 aggregation, with different average speed bands for the same area; different editions of the same regulator dataset can genuinely show different figures. A citywide rollout announcement does not confirm coverage at one specific LE1 address. Check the complete house or flat number with each suitable network before treating a package as orderable.",
    ],
    speedGuidanceNote:
      "LE1's district snapshot shows a meaningful gap between superfast (95.9%) and gigabit-capable (70.4%) coverage, with toob's CityFibre-based launch offering a genuine full-fibre alternative in parts of the city not reflected in the Ofcom sample. We would check Openreach and Virgin Media availability for the specific address, then separately confirm toob's own coverage tool before assuming full fibre is orderable.",
    sources: [
      {
        label: 'Ofcom Connected Nations 2024 postcode coverage data',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024',
        note: 'Regulator dataset used for the July 2024 LE1 gigabit, ultrafast and superfast coverage aggregation across 375 residential postcode units.',
      },
      {
        label: 'Telecompaper: toob launches services on CityFibre network in Luton, Leicester, Cambridge',
        href: 'https://www.telecompaper.com/news/toob-launches-services-on-cityfibre-network-in-luton-leicester-camnbridge--1515707',
        note: 'Independent industry press report, dated 15 October 2024, confirming toob\'s launch on CityFibre\'s network in Leicester among three named cities.',
      },
      {
        label: 'Ofcom: choose the right broadband for your needs',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-broadband',
        note: 'Regulator guidance on checking address availability, choosing speed and comparing total contract cost before switching.',
      },
    ],
  },
}

export function getPostcodeLocalIntel(prefix: string): PostcodeLocalIntel | undefined {
  return postcodeLocalIntel[prefix.toUpperCase()]
}
