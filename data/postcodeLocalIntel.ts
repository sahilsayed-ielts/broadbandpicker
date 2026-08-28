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
  M1: {
    neighbourhoods: 'Piccadilly, the Northern Quarter and Ancoats',
    altnetParagraphs: [
      "Manchester city centre has some of the best full-fibre availability of any UK postcode district. Openreach's full-fibre build across Greater Manchester now passes more than 85% of premises, ahead of the roughly 82% national average, and CityFibre's independent network reaches much of the city centre and inner suburbs — usually sold under a retail partner's name such as Vodafone Pro Broadband or Zen Internet rather than as \"CityFibre\" itself.",
      "Virgin Media's cable network covers around two-thirds of the wider region with speeds up to 1,130 Mbps, and Manchester was one of the first cities in Virgin Media's national £3bn network upgrade programme. Hyperoptic has also wired many of M1's high-rise apartment blocks directly, offering symmetric 1,000 Mbps packages that can undercut whole-city networks on price — but only inside buildings it has specifically connected, so check your exact block rather than assuming borough-wide coverage.",
    ],
    speedGuidanceNote:
      "M1's dense full-fibre coverage means gigabit packages are realistic and often only a few pounds more than a mid-tier plan — worth comparing before defaulting to a cheaper superfast deal.",
    sources: [
      {
        label: 'Fusion Fibre Group: Broadband Coverage in Greater Manchester',
        href: 'https://www.fusionfibregroup.co.uk/blog/broadband-coverage-greater-manchester',
        note: 'Independent comparison of Openreach, CityFibre and Virgin Media full-fibre coverage across Greater Manchester.',
      },
      {
        label: "Virgin Media: Manchester and the £3bn ultrafast rollout",
        href: 'https://www.virginmedia.com/corporate/media-centre/press-releases/manchester-first-city-to-benefit-from-3bn-ultrafast-rollout',
        note: "Virgin Media press material on Manchester's role in its national network upgrade programme.",
      },
      {
        label: 'CompareFibre: Best Broadband in Manchester',
        href: 'https://comparefibre.co.uk/guides/broadband-in-manchester',
        note: 'Local network and provider breakdown for Manchester postcode districts, including Hyperoptic building coverage.',
      },
    ],
  },
  NG1: {
    neighbourhoods: 'the city centre, Lace Market and the areas bordering Sneinton',
    altnetParagraphs: [
      "CityFibre is around two-thirds of the way through a £117 million full-fibre build covering Nottingham, with full-city completion targeted for 2027. Where the network is live, it is sold through several retail providers rather than CityFibre directly — Vodafone's Pro II package uses it to offer speeds up to 2.2 Gbps, and TalkTalk, Zen Internet, Air Broadband and Gigabit Networks all sell packages over the same infrastructure.",
      "Because the build is still underway, coverage within NG1 is uneven: some streets already have full fibre live while CityFibre's construction teams are still working through others, including areas just outside the city centre such as Basford, Hyson Green and the Arboretum. Virgin Media's own network also reaches parts of Nottingham with Gig2 (2 Gbps) packages. Always run an address-level check rather than assuming city-centre-wide availability.",
    ],
    speedGuidanceNote:
      "Because NG1's full-fibre build is still being completed street by street, it's worth re-checking availability even if a previous check came back negative — new sections of the CityFibre network go live throughout the year.",
    sources: [
      {
        label: "CityFibre: latest milestone in Nottingham's full fibre rollout",
        href: 'https://cityfibre.com/news/cityfibre-celebrates-latest-milestone-in-nottinghams-full-fibre-rollout',
        note: "CityFibre's own progress update on its £117m Nottingham build and 2027 completion target.",
      },
      {
        label: 'Fibre Provider: CityFibre £117m Nottingham rollout progress',
        href: 'https://fibreprovider.net/news/cityfibre-provides-progress-update-ps117m-nottingham-rollout',
        note: 'Independent trade coverage of build progress and retail partners live on the Nottingham network.',
      },
      {
        label: 'T3: Vodafone Pro II speeds up to 2.2 Gbps',
        href: 'https://www.t3.com/news/vodafones-5-star-broadband-can-hit-22gbps-promises-to-be-its-fastest-ever',
        note: "Coverage of Vodafone's fastest residential package, sold over the CityFibre network in cities including Nottingham.",
      },
    ],
  },
  RG1: {
    neighbourhoods: 'the town centre, Reading station and West Reading',
    altnetParagraphs: [
      'Reading has one of the most complete full-fibre builds of any UK town. CityFibre finished the primary build of its £58 million "Reading Gigabit City" network in 2025, taking its infrastructure past 97,000 homes and covering an estimated 98% of homes and most businesses in Reading and the surrounding area. Openreach has separately made full fibre available to roughly 215,000 Berkshire properties as part of its national £15bn programme.',
      'toob expanded onto CityFibre\'s Berkshire network in April 2025, adding Reading, Bracknell, Maidenhead and Slough to its footprint and giving residents another full-fibre retail option alongside Vodafone, TalkTalk, Zen Internet and other CityFibre-based providers. With this much infrastructure competing for the same properties, RG1 residents comparing deals should expect multiple genuinely full-fibre options rather than a single provider by default.',
    ],
    speedGuidanceNote:
      "With CityFibre's build largely complete and Openreach also active locally, RG1 residents typically have a genuine choice of full-fibre networks, not just one — it's worth comparing at least two providers on different infrastructure before choosing.",
    sources: [
      {
        label: 'ISPreview: CityFibre finishes primary £58m FTTP rollout in Reading',
        href: 'https://www.ispreview.co.uk/index.php/2025/05/cityfibre-uk-finish-primary-58m-fttp-broadband-rollout-in-reading.html',
        note: "Trade press confirmation that CityFibre's Reading build passed 97,000 homes in 2025.",
      },
      {
        label: "CityFibre: Reading's digital future — £58m full-fibre investment",
        href: 'https://cityfibre.com/news/readings-digital-future-kick-started-with-58m-full-fibre-investment',
        note: "CityFibre's own announcement of the Reading Gigabit City investment.",
      },
      {
        label: 'Insider Media: CityFibre completes primary build in Reading',
        href: 'https://www.insidermedia.com/news/south-east/cityfibre-completes-primary-build-in-reading-extends-network-to-97000-homes',
        note: 'Regional business press coverage of the completed Reading full-fibre build and total homes passed.',
      },
    ],
  },
  CT1: {
    neighbourhoods: 'the city centre, St Martins and the Northgate/Sturry Road area',
    altnetParagraphs: [
      "Canterbury's full-fibre position is behind many comparably sized towns. As of the most recent published Openreach rollout updates, only Ramsgate and Broadstairs in Kent were part of Openreach's active Fibre First build programme — Canterbury itself was not yet included, though residents can register interest on Openreach's Fibre First site to help build the case for local investment. This is consistent with CT1's own Ofcom coverage figures below, where superfast (30 Mbps+) availability is close to universal but gigabit-capable full-fibre availability lags behind.",
      'That said, full fibre is not entirely absent from CT1. CityFibre\'s national network, sold via retail partners including Vodafone, reaches over 60 UK cities, though its coverage remains concentrated in specific streets rather than borough-wide. There is also at least one bespoke local scheme: Kingsbrook Park, a newer residential development on the edge of Canterbury, has its own dedicated community gigabit fibre partnership built specifically for that estate, separate from the wider CT1 network. Always check by exact address rather than assuming citywide full-fibre coverage.',
    ],
    speedGuidanceNote:
      "Because CT1's full-fibre coverage is patchy compared with FTTC/cable, it's worth checking whether a full-fibre package is actually orderable at your address before ruling out a strong superfast deal — in much of Canterbury, FTTC is still the realistic upper limit.",
    sources: [
      {
        label: 'Compare Broadband Packages: July 2026 update on Openreach full-fibre roll-out',
        href: 'https://comparebroadbandpackages.co.uk/guides/news/exclusive-july-2026-update-openreach-full-fibre-roll/',
        note: "Tracks which Kent towns are inside Openreach's active Fibre First build, confirming Canterbury was not yet included at time of writing.",
      },
      {
        label: 'Kingsbrook Park Canterbury Community Fibre',
        href: 'https://www.kingsbrookparkfibre.org/',
        note: 'Dedicated community gigabit fibre partnership serving the Kingsbrook Park development on the edge of Canterbury.',
      },
      {
        label: 'CompareFibre: CityFibre network explained',
        href: 'https://comparefibre.co.uk/guides/cityfibre',
        note: "Explains CityFibre's wholesale model and its retail partners, plus the urban-concentrated nature of its UK coverage.",
      },
    ],
  },
  RM1: {
    neighbourhoods: 'the town centre, Romford station and neighbouring parts of Harold Wood and Gidea Park',
    altnetParagraphs: [
      "As part of Greater London, RM1 sits within Community Fibre's core operating area — the altnet has grown to around 429,000 customers UK-wide (as of January 2026) with a footprint concentrated in London and pockets of the South East, and it is worth checking specifically for RM1 alongside the mainstream Openreach-based providers.",
      "Coverage across the wider Havering borough is not uniform. Local reporting has flagged that some neighbouring areas, including South Hornchurch and Rainham, risked being bypassed by the borough's fastest network upgrades even as central Romford benefited — a reminder that an RM1 postcode does not guarantee the same network access as a neighbouring one just a mile or two away. Always confirm with an address-level checker rather than relying on borough-wide news coverage.",
    ],
    speedGuidanceNote:
      "Because Havering's rollout has been uneven street by street, treat any full-fibre availability you find for a neighbouring RM postcode as informative but not conclusive for RM1 itself.",
    sources: [
      {
        label: 'ISPreview: CommunityFibre restarts UK FTTP rollout',
        href: 'https://www.ispreview.co.uk/index.php/2026/05/full-fibre-broadband-network-communityfibre-may-restart-uk-fttp-rollout.html',
        note: "Reports Community Fibre's customer base and rollout plans as of 2026, relevant to its London-concentrated footprint including Havering.",
      },
      {
        label: 'Romford Recorder: South Hornchurch and Rainham may miss out on upgrade',
        href: 'https://www.romfordrecorder.co.uk/news/21463821.south-hornchurch-rainham-may-miss-revolutionary-upgrade/',
        note: 'Local reporting on uneven full-fibre rollout progress across Havering, illustrating why coverage varies within the borough.',
      },
    ],
  },
}

export function getPostcodeLocalIntel(prefix: string): PostcodeLocalIntel | undefined {
  return postcodeLocalIntel[prefix.toUpperCase()]
}
