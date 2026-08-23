#!/usr/bin/env python3
"""Generate original, on-brand SVG illustrations for the BroadbandPicker
homepage redesign.

Why SVG illustration rather than stock photography: the visual-design scan
in `docs/home page UX/homepage-visual-design-scan.json` found every
readable UK broadband comparison homepage leans on SVG icons and provider
logos, not lifestyle photo banners (Uswitch alone ships 195 inline SVGs).
Generating original geometric/network-style illustrations matches what's
actually proven in this vertical, uses BroadbandPicker's real brand
colours, and carries no licensing risk the way a stock photo swap would.

Usage:
    python3 scripts/generate_homepage_illustrations.py
"""

from __future__ import annotations

import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "illustrations"

SKY = "#0EA5E9"
SKY_LIGHT = "#7DD3FC"
NAVY = "#0F172A"
GREEN = "#22C55E"
WHITE = "#FFFFFF"


def blob_path(cx: float, cy: float, base_r: float, points: int, seed: int, wobble: float = 0.18) -> str:
    """A smooth, organic blob outline via a seeded random radius per angle,
    drawn as a closed cubic-bezier path through the points."""
    rng = random.Random(seed)
    pts = []
    for i in range(points):
        angle = (2 * math.pi / points) * i
        r = base_r * (1 + rng.uniform(-wobble, wobble))
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))

    def smooth_path(pts):
        d = f"M {pts[0][0]:.1f} {pts[0][1]:.1f} "
        n = len(pts)
        for i in range(n):
            p0 = pts[(i - 1) % n]
            p1 = pts[i]
            p2 = pts[(i + 1) % n]
            p3 = pts[(i + 2) % n]
            c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
            c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
            d += f"C {c1[0]:.1f} {c1[1]:.1f}, {c2[0]:.1f} {c2[1]:.1f}, {p2[0]:.1f} {p2[1]:.1f} "
        return d + "Z"

    return smooth_path(pts)


def write(name: str, svg: str) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUTPUT_DIR / name
    path.write_text(svg.strip() + "\n", encoding="utf-8")
    print(f"Wrote {path.relative_to(ROOT)}")


def hero_network_illustration() -> str:
    """Hero banner illustration: a connectivity network — nodes (homes/
    devices) linked by curved signal lines converging on a central hub,
    on a soft gradient wash. Abstract, not figurative — avoids the
    uncanny-illustrated-people look while still reading as "connectivity"."""
    rng = random.Random(7)
    w, h = 640, 480
    hub = (w * 0.72, h * 0.42)
    nodes = []
    for i in range(9):
        angle = rng.uniform(0, 2 * math.pi)
        dist = rng.uniform(140, 230)
        x = hub[0] + dist * math.cos(angle)
        y = hub[1] + dist * math.sin(angle) * 0.75
        x = max(30, min(w - 30, x))
        y = max(30, min(h - 30, y))
        nodes.append((x, y, rng.uniform(4, 9)))

    lines = []
    for (x, y, _r) in nodes:
        mx, my = (x + hub[0]) / 2, (y + hub[1]) / 2 + rng.uniform(-24, 24)
        lines.append(f'<path d="M {x:.1f} {y:.1f} Q {mx:.1f} {my:.1f} {hub[0]:.1f} {hub[1]:.1f}" '
                      f'stroke="url(#lineGrad)" stroke-width="1.6" fill="none" opacity="0.55" />')

    dots = []
    for (x, y, r) in nodes:
        dots.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="url(#nodeGrad)" opacity="0.9" />')
        dots.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r + 5:.1f}" fill="none" stroke="{SKY_LIGHT}" '
                     f'stroke-width="1" opacity="0.35" />')

    rings = "".join(
        f'<circle cx="{hub[0]:.1f}" cy="{hub[1]:.1f}" r="{28 + i * 22}" fill="none" '
        f'stroke="{SKY_LIGHT}" stroke-width="1" opacity="{0.35 - i * 0.09:.2f}" />'
        for i in range(4)
    )

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="none">
  <defs>
    <radialGradient id="washGrad" cx="72%" cy="42%" r="65%">
      <stop offset="0%" stop-color="{SKY}" stop-opacity="0.22" />
      <stop offset="100%" stop-color="{NAVY}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{SKY_LIGHT}" />
      <stop offset="100%" stop-color="{GREEN}" />
    </linearGradient>
    <radialGradient id="nodeGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="{WHITE}" />
      <stop offset="100%" stop-color="{SKY}" />
    </radialGradient>
    <radialGradient id="hubGrad" cx="35%" cy="35%" r="70%">
      <stop offset="0%" stop-color="{SKY_LIGHT}" />
      <stop offset="55%" stop-color="{SKY}" />
      <stop offset="100%" stop-color="{GREEN}" />
    </radialGradient>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#washGrad)" />
  {rings}
  {"".join(lines)}
  {"".join(dots)}
  <circle cx="{hub[0]:.1f}" cy="{hub[1]:.1f}" r="19" fill="url(#hubGrad)" />
  <circle cx="{hub[0]:.1f}" cy="{hub[1]:.1f}" r="19" fill="none" stroke="{WHITE}" stroke-width="1.5" opacity="0.5" />
</svg>'''


def icon_illustration(name: str, kind: str) -> str:
    """Filled, colourful step icons for 'How BroadbandPicker Works' —
    more illustrated than a thin-stroke line icon, on-brand gradient fill."""
    body = {
        "postcode": f'''
      <circle cx="60" cy="60" r="52" fill="url(#stepGrad)" opacity="0.14" />
      <path d="M60 26c-16 0-28 12-28 27 0 20 28 41 28 41s28-21 28-41c0-15-12-27-28-27z" fill="url(#stepGrad)" />
      <circle cx="60" cy="53" r="12" fill="{WHITE}" />
    ''',
        "compare": f'''
      <circle cx="60" cy="60" r="52" fill="url(#stepGrad)" opacity="0.14" />
      <rect x="28" y="42" width="26" height="40" rx="6" fill="url(#stepGrad)" />
      <rect x="66" y="30" width="26" height="52" rx="6" fill="{SKY_LIGHT}" />
      <rect x="34" y="52" width="14" height="4" rx="2" fill="{WHITE}" />
      <rect x="34" y="62" width="14" height="4" rx="2" fill="{WHITE}" opacity="0.7" />
      <rect x="72" y="40" width="14" height="4" rx="2" fill="{WHITE}" />
      <rect x="72" y="50" width="14" height="4" rx="2" fill="{WHITE}" opacity="0.7" />
      <rect x="72" y="60" width="14" height="4" rx="2" fill="{WHITE}" opacity="0.5" />
    ''',
        "switch": f'''
      <circle cx="60" cy="60" r="52" fill="url(#stepGrad)" opacity="0.14" />
      <circle cx="60" cy="60" r="30" fill="url(#stepGrad)" />
      <path d="M48 60l8 8 16-18" stroke="{WHITE}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    ''',
    }[kind]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <defs>
    <linearGradient id="stepGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{SKY}" />
      <stop offset="100%" stop-color="{GREEN}" />
    </linearGradient>
  </defs>
  {body}
</svg>'''


def blob_decoration(name: str, seed: int, color_a: str, color_b: str) -> str:
    path = blob_path(200, 200, 150, 10, seed)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
  <defs>
    <linearGradient id="blobGrad{seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{color_a}" />
      <stop offset="100%" stop-color="{color_b}" />
    </linearGradient>
  </defs>
  <path d="{path}" fill="url(#blobGrad{seed})" opacity="0.16" />
</svg>'''


def quiz_illustration() -> str:
    """Illustration for the Broadband Match promo section: an abstract
    checklist/matching motif — cards aligning with a checkmark hub."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <defs>
    <linearGradient id="quizGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{SKY_LIGHT}" />
      <stop offset="100%" stop-color="{GREEN}" />
    </linearGradient>
  </defs>
  <rect x="18" y="30" width="70" height="92" rx="10" fill="{NAVY}" opacity="0.5" transform="rotate(-8 53 76)" />
  <rect x="112" y="30" width="70" height="92" rx="10" fill="{NAVY}" opacity="0.35" transform="rotate(8 147 76)" />
  <rect x="58" y="42" width="84" height="108" rx="12" fill="url(#quizGrad)" />
  <rect x="76" y="64" width="48" height="6" rx="3" fill="{WHITE}" opacity="0.85" />
  <rect x="76" y="78" width="34" height="6" rx="3" fill="{WHITE}" opacity="0.6" />
  <circle cx="100" cy="112" r="20" fill="{WHITE}" />
  <path d="M91 112l6 6 12-13" stroke="{GREEN}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>'''


def main() -> None:
    write("hero-network.svg", hero_network_illustration())
    write("icon-postcode.svg", icon_illustration("postcode", "postcode"))
    write("icon-compare.svg", icon_illustration("compare", "compare"))
    write("icon-switch.svg", icon_illustration("switch", "switch"))
    write("blob-sky-green.svg", blob_decoration("blob-sky-green.svg", 3, SKY, GREEN))
    write("blob-green-sky.svg", blob_decoration("blob-green-sky.svg", 11, GREEN, SKY))
    write("quiz-match.svg", quiz_illustration())
    print("Done.")


if __name__ == "__main__":
    main()
