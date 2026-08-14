"""
Reviews the World Businesses for Sale Awin affiliate programme and scores
how well it fits BroadbandPicker's audience (UK residential/home broadband
shoppers) before any promotion work goes ahead.

Run: python3 review_world_businesses_for_sale.py
Writes: world_businesses_for_sale_programme.json (structured programme data + fit assessment)
"""

import json
from pathlib import Path

PROGRAMME = {
    "programme_name": "World Businesses for Sale Affiliate Programme",
    "advertiser": "World Businesses for Sale",
    "advertiser_description": (
        "Global marketplace for buying and selling businesses, from boutique "
        "hotels in Bali to SaaS startups in Berlin. Connects entrepreneurs "
        "with business-for-sale opportunities worldwide."
    ),
    "network": "Awin",
    "commission": {
        "structure": "Leads and conversions",
        "rate": "Generous commission rates (exact rate card not disclosed in outreach message — request from contact before launch)",
        "notes": "Also offers tenancy budgets and custom campaigns for larger partners.",
    },
    "fast_facts": {
        "cookie_window_standard": "30 days",
        "cookie_window_creators": "60 days",
        "average_order_value_gbp": 1500,
        "conversion_potential": "Global buyer interest described as high-converting",
        "validation_speed": "Fast validation",
        "payment_reliability": "Reliable payments",
        "affiliate_support": "Dedicated affiliate support",
    },
    "ideal_partner_profile": [
        "Business, finance, travel & lifestyle influencers",
        "Entrepreneurship bloggers and content creators",
        "Investment / career-change vloggers and YouTubers",
        "Business & finance media / editorial platforms",
        "Voucher & cashback partners",
    ],
    "regions": ["United Kingdom"],
    "contact": {
        "name": "Shah Chowdhury",
        "email": "sales@worldbusinessesforsale.com",
        "phone": "+44 0121 818 6200",
    },
}


def assess_fit(programme: dict) -> dict:
    """
    Scores audience overlap between this programme and BroadbandPicker.
    BroadbandPicker's core audience is UK residential/home broadband
    shoppers (switching, deals, speed, postcode availability) — not
    business buyers/sellers. Score is deliberately conservative.
    """
    target_audience = programme["ideal_partner_profile"]
    broadbandpicker_audience = "UK residential/home broadband shoppers"

    direct_overlap = False  # no line in target_audience matches broadband shoppers
    adjacent_overlap = (
        "Home-based business owners and people relocating for a business "
        "(buying/selling/setting up premises) also need residential or "
        "small-business broadband — this is the only legitimate bridge."
    )

    score = 2  # out of 10 — low direct fit, non-zero adjacent fit
    recommendation = (
        "Do not promote broadly (banners, homepage, footer-wide). Restrict to "
        "narrow, contextually honest placements inside small-business/home-office "
        "broadband content, where a reader relocating or changing business "
        "circumstances plausibly cares. Treat as a low-volume, high-AOV "
        "long-tail placement, not a core revenue line."
    )

    return {
        "target_audience": target_audience,
        "broadbandpicker_audience": broadbandpicker_audience,
        "direct_audience_overlap": direct_overlap,
        "adjacent_bridge": adjacent_overlap,
        "fit_score_out_of_10": score,
        "recommendation": recommendation,
    }


def main():
    output = {
        "programme": PROGRAMME,
        "fit_assessment": assess_fit(PROGRAMME),
    }

    out_path = Path(__file__).parent / "world_businesses_for_sale_programme.json"
    out_path.write_text(json.dumps(output, indent=2))

    print(f"Programme: {PROGRAMME['programme_name']}")
    print(f"Commission: {PROGRAMME['commission']['structure']} — {PROGRAMME['commission']['rate']}")
    print(f"Cookie window: {PROGRAMME['fast_facts']['cookie_window_standard']} "
          f"({PROGRAMME['fast_facts']['cookie_window_creators']} for creators)")
    print(f"AOV: £{PROGRAMME['fast_facts']['average_order_value_gbp']}")
    print()
    print(f"Fit score: {output['fit_assessment']['fit_score_out_of_10']}/10")
    print(f"Recommendation: {output['fit_assessment']['recommendation']}")
    print()
    print(f"Written to {out_path}")


if __name__ == "__main__":
    main()
