export interface GuideMetadata {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  publishDate: string
  updatedDate: string
  excerpt: string
  readingTime: number
  category:
    | 'deals-and-pricing'
    | 'switching-and-rights'
    | 'technology-and-speeds'
    | 'providers-and-comparisons'
    | 'use-cases-and-lifestyle'
    | 'affordability'
  keyTakeaways?: string[]
  sources?: { label: string; href: string }[]
}

export const guideCategories = [
  {
    slug: 'deals-and-pricing',
    label: 'Deals and Pricing',
    description: 'Best deals, cheapest packages, bundles, and pricing traps to avoid.',
  },
  {
    slug: 'switching-and-rights',
    label: 'Switching and Rights',
    description: 'Switching rules, contract exits, price rises, and broadband consumer rights.',
  },
  {
    slug: 'technology-and-speeds',
    label: 'Technology and Speeds',
    description: 'Full fibre, FTTC, upload speeds, latency, and how broadband technology works.',
  },
  {
    slug: 'providers-and-comparisons',
    label: 'Providers and Comparisons',
    description: 'Provider rankings, trade-offs, and who each broadband brand is best for.',
  },
  {
    slug: 'use-cases-and-lifestyle',
    label: 'Use Cases and Lifestyle',
    description: 'Broadband for gaming, home working, moving house, and day-to-day needs.',
  },
  {
    slug: 'affordability',
    label: 'Affordability',
    description: 'Social tariffs, budget broadband, and routes to lower monthly bills.',
  },
] as const

export const guides: GuideMetadata[] = [
  {
    slug: 'how-to-switch-broadband-uk',
    title: 'How to Switch Broadband in the UK (2026 Guide)',
    metaTitle: 'How to Switch Broadband UK 2026 | Step-by-Step Guide',
    metaDescription: 'Switching broadband is easier than you think. Our step-by-step guide explains how to switch UK broadband providers, avoid penalties, and get the best deal.',
    publishDate: '2026-01-01',
    updatedDate: '2026-06-01',
    excerpt: 'Switching broadband is easier than ever thanks to Ofcom\'s One Touch Switching rules. Here\'s exactly how to do it without losing connection.',
    readingTime: 7,
    category: 'switching-and-rights',
  },
  {
    slug: 'best-broadband-deals-uk',
    title: 'Best Broadband Deals in the UK Right Now',
    metaTitle: 'Best Broadband Deals UK June 2026 | BroadbandPicker',
    metaDescription: 'Find the best broadband deals available in the UK right now. Updated June 2026. Compare BT, Sky, Virgin Media, EE and more from £17.99/month.',
    publishDate: '2026-01-01',
    updatedDate: '2026-06-01',
    excerpt: 'We\'ve compared every UK broadband deal so you don\'t have to. Here are the best packages available right now, sorted by value.',
    readingTime: 8,
    category: 'deals-and-pricing',
  },
  {
    slug: 'broadband-deals-with-no-mid-contract-price-rise',
    title: 'Broadband Deals With No Mid-Contract Price Rise UK 2026',
    metaTitle: 'Broadband Deals With No Mid-Contract Price Rise | BroadbandPicker',
    metaDescription: 'Looking for broadband without surprise annual increases? Compare UK broadband deals with no mid-contract price rise, fixed-price terms, and more predictable monthly bills.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'Some broadband providers still stand out by offering fixed-price terms or no in-contract rises. Here is how to find the most predictable broadband deals in the UK.',
    readingTime: 8,
    category: 'deals-and-pricing',
    keyTakeaways: [
      'A fixed-price promise only applies for the period and charges stated in the contract, so read the price-change wording before joining.',
      'Compare the total minimum-term cost rather than assuming a deal with no annual rise is automatically cheapest.',
      'Check setup fees, post-contract pricing and address-level availability alongside the advertised monthly price.',
    ],
    sources: [
      {
        label: 'Ofcom rules on clearer telecoms pricing',
        href: 'https://www.theguardian.com/business/2025/jan/17/ofcom-ban-nasty-surprise-mid-contract-telecoms-price-rises',
      },
      {
        label: 'Financial Times coverage of fixed pounds-and-pence telecom price rises',
        href: 'https://www.ft.com/content/fe8db852-d185-42b8-be99-459fa7a2362d',
      },
    ],
  },
  {
    slug: 'best-broadband-and-tv-deals',
    title: 'Best Broadband and TV Deals in the UK for 2026',
    metaTitle: 'Best Broadband and TV Deals UK 2026 | Compare Bundles',
    metaDescription: 'Compare UK broadband and TV bundles from Sky, Virgin Media and EE TV. See the best options for sports, entertainment and flexible streaming.',
    publishDate: '2026-06-21',
    updatedDate: '2026-07-29',
    excerpt: 'The best broadband and TV bundle depends on what you watch, the broadband available at your address, and the full contract cost. Compare the leading UK options.',
    readingTime: 13,
    category: 'deals-and-pricing',
    keyTakeaways: [
      'Sky is our starting point for a TV-first household; Virgin Media stands out for fast broadband plus broad channel bundles where its network is available.',
      'EE TV is the strongest alternative when you want NOW-based entertainment or TNT Sports with broadband and the option to change the TV pack.',
      'Compare the total minimum-term cost—not only the introductory monthly price—and check whether TV, broadband and add-ons have different end dates.',
      'Prices, channels and availability change by address. Our provider facts were checked against official UK sources on 29 July 2026.',
    ],
    sources: [
      {
        label: 'Sky TV and broadband deals',
        href: 'https://www.sky.com/deals?section=tvandbroadband',
      },
      {
        label: 'Virgin Media broadband and TV bundles',
        href: 'https://www.virginmedia.com/broadband/broadband-and-tv',
      },
      {
        label: 'BT and EE TV packages',
        href: 'https://www.bt.com/tv/packages',
      },
      {
        label: 'Ofcom money-saving advice for broadband and pay-TV',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/money-saving-tips-for-phone-broadband-and-pay-tv',
      },
      {
        label: 'Ofcom guidance on switching broadband and bundled TV services',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-broadband-provider',
      },
    ],
  },
  {
    slug: 'broadband-deals-under-20',
    title: 'Broadband Deals Under £20 UK 2026',
    metaTitle: 'Broadband Deals Under £20 UK 2026 | BroadbandPicker',
    metaDescription: 'Looking for broadband deals under £20 per month in the UK? Compare the best budget broadband options, understand the trade-offs, and see when paying slightly more is worth it.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'Broadband under £20 still exists in the UK, but the best cheap deal depends on contract length, setup fees, and whether the package is actually fast enough for your home.',
    readingTime: 7,
    category: 'deals-and-pricing',
    keyTakeaways: [
      'Sub-£20 broadband offers are uncommon and may be limited by location, eligibility or short promotional periods.',
      'Compare setup fees and the full contract cost, not only the headline monthly price.',
      'A slightly dearer package can be better value if it offers enough speed, reliable coverage and clearer price terms.',
    ],
  },
  {
    slug: 'broadband-deals-with-cashback',
    title: 'Broadband Deals With Cashback UK 2026',
    metaTitle: 'Broadband Deals With Cashback UK 2026 | BroadbandPicker',
    metaDescription: 'Compare broadband deals with cashback, gift cards, and switching incentives in the UK. Learn how to judge true value and avoid offers that only look cheap on the surface.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'Cashback broadband deals can look great, but the best offer is not always the one with the biggest gift card. Here is how to compare broadband incentives properly in the UK.',
    readingTime: 8,
    category: 'deals-and-pricing',
    keyTakeaways: [
      'Treat cashback as a reduction in total contract cost, not as guaranteed money in your account on day one.',
      'Check whether the reward is automatic or must be claimed within a deadline after activation.',
      'A lower monthly price may beat a larger reward once setup fees and the entire minimum term are included.',
    ],
  },
  {
    slug: 'broadband-deals-with-no-setup-fee',
    title: 'Broadband Deals With No Setup Fee UK 2026',
    metaTitle: 'Broadband Deals With No Setup Fee UK 2026 | BroadbandPicker',
    metaDescription: 'Compare the best broadband deals with no setup fee in the UK. Find out which providers offer free activation, when setup fees are worth paying, and how to compare the true total cost.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'A no-setup-fee broadband deal can lower your upfront cost, but it does not automatically make the package better value. Here is how to compare free-activation broadband deals properly.',
    readingTime: 7,
    category: 'deals-and-pricing',
    keyTakeaways: [
      'No setup fee lowers the upfront payment but does not necessarily produce the lowest total contract cost.',
      'Check activation, delivery and installation charges because providers may describe upfront fees differently.',
      'Compare speed, contract length and monthly price before choosing an offer solely for free setup.',
    ],
  },
  {
    slug: 'best-rolling-monthly-broadband-deals',
    title: 'Best Rolling Monthly Broadband Deals UK 2026',
    metaTitle: 'Best Rolling Monthly Broadband Deals UK 2026 | BroadbandPicker',
    metaDescription: 'Need short-term broadband with no long contract? Compare the best rolling monthly and flexible broadband deals in the UK, plus when a 12-month contract may still be the smarter option.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'Rolling monthly broadband is ideal when you need flexibility more than the very lowest price. Here are the best short-term broadband options in the UK right now.',
    readingTime: 7,
    category: 'deals-and-pricing',
    keyTakeaways: [
      'Flexible-contract pages are ideal for movers, renters, and short-stay households.',
      'Confirm whether “monthly” means a true 30-day commitment or a longer contract billed each month.',
      'Flexible packages often cost more, so compare the premium with any early-exit charge on a longer deal.',
    ],
  },
  {
    slug: 'full-fibre-broadband-explained',
    title: 'Full Fibre Broadband Explained: Is FTTP Worth It?',
    metaTitle: 'Full Fibre Broadband Explained | BroadbandPicker',
    metaDescription: 'Full fibre (FTTP) broadband delivers speeds up to 1Gbps with no copper wiring. Find out if it\'s available at your address and whether it\'s worth upgrading.',
    publishDate: '2026-01-15',
    updatedDate: '2026-06-01',
    excerpt: 'Full fibre broadband is the fastest, most reliable connection available. But is it available at your address — and is it worth paying more for?',
    readingTime: 9,
    category: 'technology-and-speeds',
  },
  {
    slug: 'broadband-speeds-explained',
    title: 'Broadband Speeds Explained: What Speed Do You Actually Need?',
    metaTitle: 'Broadband Speeds Explained | BroadbandPicker',
    metaDescription: 'Not sure what broadband speed you need? Our guide explains download vs upload speeds, Mbps vs Gbps, and exactly what speed suits your household.',
    publishDate: '2026-01-20',
    updatedDate: '2026-06-01',
    excerpt: 'Mbps, Gbps, download vs upload — broadband jargon is confusing. This guide cuts through it and tells you exactly what speed you need at home.',
    readingTime: 7,
    category: 'technology-and-speeds',
  },
  {
    slug: 'cheapest-broadband-uk',
    title: 'Cheapest Broadband Deals in the UK 2026',
    metaTitle: 'Cheapest Broadband Deals UK 2026 | BroadbandPicker',
    metaDescription: 'Looking for the cheapest broadband in the UK? Compare the lowest-priced deals from every provider. Budget packages from £17.99/month.',
    publishDate: '2026-01-25',
    updatedDate: '2026-06-01',
    excerpt: 'You don\'t need to spend a fortune on broadband. Here are the cheapest deals available in the UK right now — including tips to negotiate an even lower price.',
    readingTime: 6,
    category: 'deals-and-pricing',
  },
  {
    slug: 'best-broadband-for-working-from-home',
    title: 'Best Broadband for Working From Home UK 2026',
    metaTitle: 'Best Broadband for Working From Home | BroadbandPicker',
    metaDescription: 'Working from home? You need fast, reliable broadband with a strong upload speed. Compare the best home office broadband packages in the UK.',
    publishDate: '2026-02-01',
    updatedDate: '2026-06-01',
    excerpt: 'Working from home demands reliable, fast broadband — especially for video calls. Here\'s what to look for and the best packages available right now.',
    readingTime: 8,
    category: 'use-cases-and-lifestyle',
  },
  {
    slug: 'best-broadband-for-students',
    title: 'Best Broadband for Students UK 2026',
    metaTitle: 'Best Broadband for Students UK 2026 | BroadbandPicker',
    metaDescription: 'Looking for student broadband in the UK? Compare the best broadband options for students, renters, and house shares, including flexible contracts and low-cost deals.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'Student broadband is all about flexibility, value, and enough speed for shared streaming, studying, and gaming. Here are the best student broadband options in the UK right now.',
    readingTime: 8,
    category: 'use-cases-and-lifestyle',
    keyTakeaways: [
      'Match the minimum term to the tenancy so the household is not paying after moving out.',
      'The right answer is often a balance between low cost and avoiding long contracts that outlast the tenancy.',
      'Choose an account holder, agree how bills will be split and check what happens if that person leaves early.',
    ],
  },
  {
    slug: 'best-broadband-for-streaming',
    title: 'Best Broadband for Streaming UK 2026',
    metaTitle: 'Best Broadband for Streaming UK 2026 | BroadbandPicker',
    metaDescription: 'Find the best broadband for streaming in the UK, including the speeds you need for Netflix, Disney+, YouTube, and multi-room 4K streaming.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'If your home streams a lot of TV and films, the best broadband is not always the fastest package available. Here is what really matters for smooth streaming in UK households.',
    readingTime: 8,
    category: 'use-cases-and-lifestyle',
    keyTakeaways: [
      'One 4K stream usually needs far less than a gigabit connection; simultaneous use across the household matters more.',
      'Reliable Wi-Fi coverage can make a larger difference than buying the fastest advertised package.',
      'Estimate the number of simultaneous streams, calls and downloads before choosing a speed tier.',
    ],
  },
  {
    slug: 'best-broadband-providers-uk',
    title: 'Best Broadband Providers UK 2026: Ranked and Reviewed',
    metaTitle: 'Best Broadband Providers UK 2026 | Ranked by Speed, Price & Reliability',
    metaDescription: 'We ranked every major UK broadband provider by speed, reliability, complaints, and value. The best UK broadband provider in 2026 is EE for reliability, Community Fibre for satisfaction.',
    publishDate: '2026-06-19',
    updatedDate: '2026-06-19',
    excerpt: 'Not all broadband providers are equal. We ranked every major UK ISP by Ofcom speed data, complaints figures, Trustpilot scores, and price — so you can see at a glance who is actually worth switching to.',
    readingTime: 11,
    category: 'providers-and-comparisons',
  },
  {
    slug: 'broadband-price-rises-2026',
    title: 'Broadband Price Rises 2026: Every Provider Explained',
    metaTitle: 'Broadband Price Rises 2026: Which Providers Are Putting Prices Up?',
    metaDescription: 'BT, Sky, Virgin Media, Vodafone and EE all raised broadband prices in April 2026. Find out how much each provider increased by, your rights, and how to leave without a penalty.',
    publishDate: '2026-06-19',
    updatedDate: '2026-06-19',
    excerpt: 'April 2026 saw the biggest round of UK broadband price rises in years. We break down exactly what every provider is charging, what your rights are, and which providers have no price rises at all.',
    readingTime: 9,
    category: 'switching-and-rights',
    keyTakeaways: [
      'A clearly disclosed annual increase does not normally create an automatic right to leave without a fee.',
      'Contracts signed after January 17, 2025 should show price rises in pounds and pence rather than inflation-linked formulas.',
      'Check the pre-contract summary, the date of the rise and the total minimum-term cost before switching.',
    ],
    sources: [
      {
        label: 'Ofcom rules on clearer telecoms pricing',
        href: 'https://www.theguardian.com/business/2025/jan/17/ofcom-ban-nasty-surprise-mid-contract-telecoms-price-rises',
      },
      {
        label: 'Financial Times coverage of Ofcom pounds-and-pence rules',
        href: 'https://www.ft.com/content/fe8db852-d185-42b8-be99-459fa7a2362d',
      },
    ],
  },
  {
    slug: 'can-i-leave-broadband-early-after-price-rise',
    title: 'Can I Leave Broadband Early After a Price Rise? UK Rules Explained',
    metaTitle: 'Can I Leave Broadband Early After a Price Rise? | BroadbandPicker',
    metaDescription: 'Find out when you can leave your broadband contract early after a price rise in the UK, what Ofcom rules changed, and what steps to take if your bill goes up.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'A broadband price rise does not always mean you can leave penalty-free. Here is when you can, when you cannot, and how to handle the process properly.',
    readingTime: 8,
    category: 'switching-and-rights',
    keyTakeaways: [
      'Your right to leave early depends heavily on when you signed the contract and what price-rise wording was shown at signup.',
      'If an increase was clearly stated in pounds and pence before signup, an exit fee may still apply.',
      'Check your contract and contact the provider before cancelling, then escalate unresolved disputes through its complaints process.',
    ],
    sources: [
      {
        label: 'Ofcom rules on clearer telecoms pricing',
        href: 'https://www.theguardian.com/business/2025/jan/17/ofcom-ban-nasty-surprise-mid-contract-telecoms-price-rises',
      },
      {
        label: 'Financial Times coverage of Ofcom pounds-and-pence rules',
        href: 'https://www.ft.com/content/fe8db852-d185-42b8-be99-459fa7a2362d',
      },
    ],
  },
  {
    slug: 'broadband-without-phone-line',
    title: 'Broadband Without a Phone Line UK 2026: Your Full Options',
    metaTitle: 'Broadband Without a Phone Line UK 2026 | No Landline Needed',
    metaDescription: 'You no longer need a phone line to get broadband in the UK. Full fibre, Virgin Media cable, and 5G home broadband all work without a landline. Compare your options.',
    publishDate: '2026-06-19',
    updatedDate: '2026-06-19',
    excerpt: 'The days of needing a landline to get broadband are over. Here is every way to get broadband in the UK without a phone line — and which providers offer the best deals.',
    readingTime: 7,
    category: 'technology-and-speeds',
  },
  {
    slug: 'best-5g-home-broadband-uk',
    title: 'Best 5G Home Broadband UK 2026',
    metaTitle: 'Best 5G Home Broadband UK 2026 | BroadbandPicker',
    metaDescription: 'Compare the best 5G home broadband options in the UK, including EE, Vodafone, and other fixed wireless alternatives. Learn when 5G broadband is worth it and when full fibre is still the better choice.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: '5G home broadband can be a smart alternative when you want fast setup and no fixed line, but it is not right for every postcode. Here is how to compare UK 5G broadband properly.',
    readingTime: 8,
    category: 'technology-and-speeds',
    keyTakeaways: [
      '5G home broadband can be quick to install, but speed and latency vary with signal strength, congestion and router position.',
      'Check indoor coverage and any data or traffic-management terms before replacing a fixed line.',
      'A full-fibre service is usually more predictable where both technologies are available at a similar price.',
    ],
  },
  {
    slug: 'best-full-fibre-broadband-uk',
    title: 'Best Full Fibre Broadband UK 2026',
    metaTitle: 'Best Full Fibre Broadband UK 2026 | BroadbandPicker',
    metaDescription: 'Compare the best full fibre broadband providers in the UK, including speed, reliability, value, and who each FTTP provider is best for in 2026.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'The best full fibre broadband is not just the fastest package. Here is how to compare UK FTTP providers on speed, value, coverage, and real household fit.',
    readingTime: 9,
    category: 'technology-and-speeds',
    keyTakeaways: [
      'Full fibre runs fibre to the property and usually offers better reliability and upload performance than copper-based broadband.',
      'The best provider depends on address-level availability, total cost, upload speed, service terms and support.',
      'Most households do not need the fastest tier; choose a package based on simultaneous use and large upload requirements.',
    ],
  },
  {
    slug: 'best-broadband-for-gaming-uk',
    title: 'Best Broadband for Gaming UK 2026: Speed, Ping and Providers',
    metaTitle: 'Best Broadband for Gaming UK 2026 | Low Ping, High Speed',
    metaDescription: 'The best broadband for gaming in the UK is full fibre with low latency. We compare ping, speeds, and reliability across BT, EE, Virgin Media, Community Fibre and more.',
    publishDate: '2026-06-19',
    updatedDate: '2026-06-19',
    excerpt: 'Gaming broadband is about low ping first, speed second. We tested and ranked the best UK broadband providers for online gaming based on latency, reliability, and value.',
    readingTime: 9,
    category: 'use-cases-and-lifestyle',
  },
  {
    slug: 'broadband-social-tariffs-uk',
    title: 'Broadband Social Tariffs UK 2026: Who Qualifies and How to Apply',
    metaTitle: 'Broadband Social Tariffs UK 2026 | Cheap Broadband on Benefits',
    metaDescription: 'Over 4 million UK households qualify for a broadband social tariff from £12.50/month. Find out if you are eligible and how to apply — including Universal Credit, Pension Credit and more.',
    publishDate: '2026-06-19',
    updatedDate: '2026-06-19',
    excerpt: 'More than 4 million UK households are entitled to heavily discounted broadband through social tariffs — but 70% have never heard of them. Here is everything you need to know.',
    readingTime: 8,
    category: 'affordability',
    keyTakeaways: [
      'Social tariffs can substantially reduce broadband costs for households receiving qualifying benefits.',
      'Eligibility and prices vary by provider, and some tariffs are limited to customers in covered areas.',
      'Ask whether switching to or leaving a social tariff involves fees, evidence checks or a new minimum term.',
    ],
    sources: [
      {
        label: 'Ofcom pricing and consumer engagement findings reported February 2026',
        href: 'https://www.thesun.co.uk/money/38358029/households-missing-broadband-boost-how-to-claim/',
      },
    ],
  },
  {
    slug: 'broadband-moving-house',
    title: 'Broadband When Moving House UK 2026: Complete Checklist',
    metaTitle: 'Broadband Moving House UK 2026 | Complete Checklist & Guide',
    metaDescription: 'Moving house? Here is exactly what to do about your broadband — when to give notice, how to avoid early termination fees, and how to set up broadband at your new address.',
    publishDate: '2026-06-19',
    updatedDate: '2026-06-19',
    excerpt: 'Sorting broadband when moving house is easier than most people expect — but only if you do things in the right order. Follow our step-by-step checklist to stay connected with no gaps.',
    readingTime: 8,
    category: 'use-cases-and-lifestyle',
  },
  {
    slug: 'best-broadband-for-rural-areas-uk',
    title: 'Best Broadband for Rural Areas UK 2026',
    metaTitle: 'Best Broadband for Rural Areas UK 2026 | BroadbandPicker',
    metaDescription: 'Looking for the best broadband for rural areas in the UK? Compare full fibre, fixed wireless, 4G, and 5G options, plus which providers are best for hard-to-reach homes.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'Rural broadband is not just about finding the fastest provider. It is about choosing the most realistic connection type for your postcode, property, and reliability needs.',
    readingTime: 9,
    category: 'use-cases-and-lifestyle',
    keyTakeaways: [
      'Start with an address-level availability check because neighbouring rural properties can have very different options.',
      'Compare full fibre, fixed wireless, 4G/5G and satellite on reliability, latency, data limits and installation cost.',
      'Do not cancel an existing service until the replacement connection is installed and working reliably.',
    ],
  },
  {
    slug: 'broadband-for-existing-customers',
    title: 'Best Broadband Deals for Existing Customers UK 2026',
    metaTitle: 'Best Broadband Deals for Existing Customers | BroadbandPicker',
    metaDescription: 'Already have broadband and out of contract? Learn how existing customers can get a better deal, when to renegotiate, and when switching is the smarter move.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'Existing broadband customers often pay more than new ones, but that does not mean you have no leverage. Here is how to renegotiate, compare, or switch for a better deal.',
    readingTime: 8,
    category: 'deals-and-pricing',
    keyTakeaways: [
      'Compare the renewal offer with new-customer prices and the total cost of realistic alternatives.',
      'Ask the retention team for its best price, then confirm any new minimum term and annual increases in writing.',
      'If the contract has ended, switching is usually possible without an early termination charge, subject to notice and equipment rules.',
    ],
    sources: [
      {
        label: 'Ofcom-linked contract-end and savings reporting',
        href: 'https://www.theguardian.com/media/2020/feb/14/mobile-broadband-and-pay-tv-customers-could-save-1bn-on-bills-ofcom',
      },
      {
        label: 'Ofcom pricing and consumer engagement findings reported February 2026',
        href: 'https://www.thesun.co.uk/money/38358029/households-missing-broadband-boost-how-to-claim/',
      },
    ],
  },
  {
    slug: 'one-touch-switching-explained',
    title: 'One Touch Switching Explained: How Broadband Switching Works in 2026',
    metaTitle: 'One Touch Switching Explained | BroadbandPicker UK Guide',
    metaDescription: 'One Touch Switching lets most UK households change broadband provider by contacting the new provider only. Learn how it works, who it covers, and when you still need to take extra steps.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'One Touch Switching changed how UK broadband users move between providers. Here is exactly what it covers, what it does not cover, and how to avoid mistakes when you switch.',
    readingTime: 8,
    category: 'switching-and-rights',
    keyTakeaways: [
      'One Touch Switching usually means you contact your new provider, and they coordinate the switch with the old one.',
      'It removes a lot of cancellation friction, but it does not erase early termination charges if you are still in contract.',
      'Check exceptions, expected timelines, equipment returns and any installation requirements before the switch starts.',
    ],
  },
  {
    slug: 'broadband-contract-end-rights',
    title: 'Broadband Contract End Rights UK 2026: What Happens When Your Deal Ends',
    metaTitle: 'Broadband Contract End Rights UK 2026 | BroadbandPicker',
    metaDescription: 'Out of contract on broadband? Learn what happens when your deal ends, how much more you might pay, what notice your provider must give, and the best way to switch or renegotiate.',
    publishDate: '2026-06-21',
    updatedDate: '2026-06-21',
    excerpt: 'When your broadband contract ends, the service does not stop — but the cheap price usually does. Here is what your provider must tell you, what you can do next, and how to avoid overpaying.',
    readingTime: 9,
    category: 'switching-and-rights',
    keyTakeaways: [
      'Most users can keep their service after the contract ends, but usually move onto a more expensive standard tariff.',
      'Compare available deals before negotiating so you know whether the provider’s retention offer is competitive.',
      'Check notice periods and equipment-return rules even when no early termination fee applies.',
    ],
    sources: [
      {
        label: 'Ofcom pricing and consumer engagement findings reported February 2026',
        href: 'https://www.thesun.co.uk/money/38358029/households-missing-broadband-boost-how-to-claim/',
      },
      {
        label: 'Ofcom-linked contract-end and savings reporting',
        href: 'https://www.theguardian.com/media/2020/feb/14/mobile-broadband-and-pay-tv-customers-could-save-1bn-on-bills-ofcom',
      },
    ],
  },
]

export function getGuideBySlug(slug: string): GuideMetadata | undefined {
  return guides.find((g) => g.slug === slug)
}

export function getGuidesByCategory(category: GuideMetadata['category']) {
  return guides.filter((guide) => guide.category === category)
}
