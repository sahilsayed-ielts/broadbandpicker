#!/usr/bin/env python3
"""Post BroadbandPicker social queue items when artworks are supplied.

Reads the single-sheet plan (social-plan-all.csv), matches files you drop in
docs/social media manager/artworks/, and publishes via official APIs.

Supported with a still image:
  X, LinkedIn, Facebook Page, Instagram feed (Business account)

Needs a video file (.mp4 / .mov), not a ChatGPT still:
  TikTok, YouTube, Instagram Reels

Nothing is published unless you pass --live. Default is a dry run.

Usage:
    python3 scripts/plan_social_media_strategy.py --post
    python3 scripts/plan_social_media_strategy.py --post --live --platform x --limit 1
    python3 scripts/post_social.py --live --date 2026-08-31

Credentials (env or docs/social media manager/.env.social):
    X_API_KEY  X_API_SECRET  X_ACCESS_TOKEN  X_ACCESS_TOKEN_SECRET
    LINKEDIN_ACCESS_TOKEN  LINKEDIN_AUTHOR_URN
    FACEBOOK_PAGE_ID  FACEBOOK_PAGE_ACCESS_TOKEN
    INSTAGRAM_BUSINESS_ID  INSTAGRAM_ACCESS_TOKEN
    SOCIAL_PUBLIC_BASE_URL   (optional; Instagram can also reuse a Facebook upload)

Artwork filenames (any of these):
    X-001__instagram__feed.png
    X-001_instagram_feed.png
    X-001-instagram.png
    X-001_instagram.png
    X-001.png
Or a CSV manifest in the artworks folder:
    idea_id,platform,format,file
"""

from __future__ import annotations

import argparse
import base64
import csv
import hashlib
import hmac
import json
import mimetypes
import os
import re
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote, urlencode, urlparse

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "social media manager"
ARTWORK_DIR = OUT_DIR / "artworks"
QUEUE_CSV = OUT_DIR / "social-plan-all.csv"
LOG_CSV = OUT_DIR / "posting-log.csv"
ENV_FILE = OUT_DIR / ".env.social"

POSTABLE_SECTIONS = {"LAUNCH 14 DAYS", "FIRST 9 IG GRID", "CALENDAR"}
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
VIDEO_EXT = {".mp4", ".mov", ".m4v"}
STATIC_PLATFORMS = {"x", "instagram", "facebook", "linkedin"}
VIDEO_PLATFORMS = {"tiktok", "youtube"}

LOG_FIELDS = [
    "posted_at", "dry_run", "section", "date", "platform", "format", "idea_id",
    "title", "artwork", "status", "posted_url", "error",
]


def load_dotenv(path: Path) -> None:
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("'").strip('"')
        os.environ.setdefault(key, value)


def env(*names: str) -> str:
    for name in names:
        value = os.environ.get(name, "").strip()
        if value:
            return value
    return ""


def requests_mod():
    import requests
    return requests


# ---------------------------------------------------------------------------
# Queue + artwork matching
# ---------------------------------------------------------------------------


def read_queue(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        raise FileNotFoundError(
            f"No queue at {path}. Run python3 scripts/plan_social_media_strategy.py first."
        )
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def write_queue(path: Path, rows: list[dict[str, str]]) -> None:
    if not rows:
        return
    fieldnames = list(rows[0].keys())
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def append_log(row: dict[str, str]) -> None:
    exists = LOG_CSV.is_file()
    LOG_CSV.parent.mkdir(parents=True, exist_ok=True)
    with LOG_CSV.open("a", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=LOG_FIELDS)
        if not exists:
            writer.writeheader()
        writer.writerow({key: row.get(key, "") for key in LOG_FIELDS})


def load_manifest(folder: Path) -> list[dict[str, str]]:
    for name in ("manifest.csv", "artwork-manifest.csv"):
        path = folder / name
        if path.is_file():
            with path.open(encoding="utf-8", newline="") as handle:
                return list(csv.DictReader(handle))
    return []


def index_artworks(folder: Path) -> list[dict[str, str]]:
    folder.mkdir(parents=True, exist_ok=True)
    indexed: list[dict[str, str]] = []
    for item in load_manifest(folder):
        rel = (item.get("file") or item.get("path") or "").strip()
        if not rel:
            continue
        path = (folder / rel).resolve() if not Path(rel).is_absolute() else Path(rel)
        indexed.append({
            "idea_id": (item.get("idea_id") or "").strip(),
            "platform": (item.get("platform") or "").strip().lower(),
            "format": (item.get("format") or "").strip().lower(),
            "path": str(path),
        })
    pattern = re.compile(
        r"^(?P<id>X-\d+)(?:(?:__|_|-)(?P<platform>[a-z]+)(?:(?:__|_|-)(?P<fmt>[a-z0-9 +]+))?)?$",
        re.I,
    )
    for path in sorted(folder.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXT | VIDEO_EXT:
            continue
        if path.name.startswith("."):
            continue
        match = pattern.match(path.stem)
        if not match:
            continue
        indexed.append({
            "idea_id": match.group("id").upper(),
            "platform": (match.group("platform") or "").lower(),
            "format": (match.group("fmt") or "").lower().replace(" ", ""),
            "path": str(path),
        })
    return indexed


def score_match(job: dict[str, str], art: dict[str, str]) -> int:
    if art["idea_id"].upper() != (job.get("idea_id") or "").upper():
        return -1
    score = 10
    job_platform = (job.get("platform") or "").lower()
    job_fmt = re.sub(r"[^a-z0-9]", "", (job.get("format") or "").lower())
    art_fmt = re.sub(r"[^a-z0-9]", "", art.get("format") or "")
    if art.get("platform"):
        if art["platform"] != job_platform:
            return -1
        score += 40
    if art_fmt:
        if art_fmt in job_fmt or job_fmt in art_fmt:
            score += 20
        else:
            score -= 5
    return score


def match_artwork(job: dict[str, str], catalogue: list[dict[str, str]]) -> Path | None:
    best: tuple[int, str] | None = None
    for art in catalogue:
        score = score_match(job, art)
        if score < 0:
            continue
        if best is None or score > best[0]:
            best = (score, art["path"])
    return Path(best[1]) if best else None


def is_video(path: Path) -> bool:
    return path.suffix.lower() in VIDEO_EXT


def platform_needs_video(platform: str, fmt: str) -> bool:
    platform = platform.lower()
    fmt = fmt.lower()
    if platform in VIDEO_PLATFORMS:
        return True
    if platform == "instagram" and any(word in fmt for word in ("reel", "tiktok")):
        return True
    return False


def fit_x_text(caption: str, limit: int = 275) -> str:
    text = re.sub(r"\n{3,}", "\n\n", caption).strip()
    if len(text) <= limit:
        return text
    url = ""
    found = re.search(r"https://\S+", text)
    if found:
        url = found.group(0).rstrip(".,)")
    first = text.split("\n", 1)[0].strip()
    if url and len(first) + len(url) + 2 <= limit:
        leftover = limit - len(url) - 2
        return f"{first[:leftover].rstrip()}\n\n{url}"
    return text[: limit - 1].rstrip() + "…"


def ig_caption(caption: str) -> str:
    return caption[:2180].rstrip()


# ---------------------------------------------------------------------------
# Publishers
# ---------------------------------------------------------------------------


def oauth1_header(
    method: str,
    url: str,
    consumer_key: str,
    consumer_secret: str,
    token: str,
    token_secret: str,
    extra: dict[str, str] | None = None,
) -> str:
    params = {
        "oauth_consumer_key": consumer_key,
        "oauth_nonce": uuid.uuid4().hex,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": str(int(time.time())),
        "oauth_token": token,
        "oauth_version": "1.0",
    }
    sign_params = dict(params)
    if extra:
        sign_params.update(extra)
    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    from urllib.parse import parse_qsl
    for key, value in parse_qsl(parsed.query, keep_blank_values=True):
        sign_params[key] = value
    encoded = "&".join(
        f"{quote(str(key), safe='')}={quote(str(value), safe='')}"
        for key, value in sorted(sign_params.items(), key=lambda item: item[0])
    )
    base = "&".join([method.upper(), quote(base_url, safe=""), quote(encoded, safe="")])
    key = f"{quote(consumer_secret, safe='')}&{quote(token_secret, safe='')}"
    digest = hmac.new(key.encode(), base.encode(), hashlib.sha1).digest()
    params["oauth_signature"] = base64.b64encode(digest).decode()
    return "OAuth " + ", ".join(
        f'{quote(key, safe="")}="{quote(value, safe="")}"'
        for key, value in sorted(params.items())
    )


def post_x(job: dict[str, str], artwork: Path, seed_comment: bool) -> str:
    key = env("X_API_KEY", "TWITTER_API_KEY")
    secret = env("X_API_SECRET", "TWITTER_API_SECRET")
    token = env("X_ACCESS_TOKEN", "TWITTER_ACCESS_TOKEN")
    token_secret = env("X_ACCESS_TOKEN_SECRET", "TWITTER_ACCESS_TOKEN_SECRET")
    if not all([key, secret, token, token_secret]):
        raise RuntimeError("Missing X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_TOKEN_SECRET")
    req = requests_mod()
    media_id = None
    if artwork.suffix.lower() in IMAGE_EXT | VIDEO_EXT:
        upload = "https://upload.twitter.com/1.1/media/upload.json"
        header = oauth1_header("POST", upload, key, secret, token, token_secret)
        mime = mimetypes.guess_type(str(artwork))[0] or "application/octet-stream"
        with artwork.open("rb") as handle:
            response = req.post(
                upload,
                headers={"Authorization": header},
                files={"media": (artwork.name, handle, mime)},
                timeout=60,
            )
        if not response.ok:
            raise RuntimeError(f"X media upload {response.status_code}: {response.text[:400]}")
        media_id = str(response.json().get("media_id_string") or response.json().get("media_id") or "")
    payload: dict[str, Any] = {"text": fit_x_text(job.get("caption_paste") or job.get("hook") or "")}
    if media_id:
        payload["media"] = {"media_ids": [media_id]}
    tweets = "https://api.x.com/2/tweets"
    header = oauth1_header("POST", tweets, key, secret, token, token_secret)
    response = req.post(tweets, headers={"Authorization": header, "Content-Type": "application/json"}, json=payload, timeout=60)
    if not response.ok:
        raise RuntimeError(f"X tweet {response.status_code}: {response.text[:400]}")
    tweet_id = str(response.json().get("data", {}).get("id") or "")
    url = f"https://x.com/i/web/status/{tweet_id}" if tweet_id else ""
    if seed_comment and tweet_id:
        comment = (job.get("first_comment_paste") or "").strip()
        if comment:
            reply_header = oauth1_header("POST", tweets, key, secret, token, token_secret)
            req.post(
                tweets,
                headers={"Authorization": reply_header, "Content-Type": "application/json"},
                json={"text": fit_x_text(comment, 270), "reply": {"in_reply_to_tweet_id": tweet_id}},
                timeout=30,
            )
    return url


def post_linkedin(job: dict[str, str], artwork: Path) -> str:
    token = env("LINKEDIN_ACCESS_TOKEN")
    author = env("LINKEDIN_AUTHOR_URN", "LINKEDIN_ORGANIZATION_URN")
    if not token or not author:
        raise RuntimeError("Missing LINKEDIN_ACCESS_TOKEN and LINKEDIN_AUTHOR_URN (urn:li:organization:ID or urn:li:person:ID)")
    req = requests_mod()
    headers = {
        "Authorization": f"Bearer {token}",
        "Linkedin-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
    }
    init = req.post(
        "https://api.linkedin.com/rest/images?action=initializeUpload",
        headers=headers,
        json={"initializeUploadRequest": {"owner": author}},
        timeout=30,
    )
    if not init.ok:
        raise RuntimeError(f"LinkedIn init upload {init.status_code}: {init.text[:400]}")
    value = init.json().get("value") or {}
    upload_url = value.get("uploadUrl")
    image_urn = value.get("image")
    if not upload_url or not image_urn:
        raise RuntimeError(f"LinkedIn upload init missing URL: {init.text[:400]}")
    with artwork.open("rb") as handle:
        put = req.put(
            upload_url,
            data=handle,
            headers={"Authorization": f"Bearer {token}", "Content-Type": mimetypes.guess_type(str(artwork))[0] or "image/png"},
            timeout=60,
        )
    if not put.ok:
        raise RuntimeError(f"LinkedIn image PUT {put.status_code}: {put.text[:400]}")
    caption = (job.get("caption_paste") or job.get("hook") or "")[:2900]
    post = req.post(
        "https://api.linkedin.com/rest/posts",
        headers=headers,
        json={
            "author": author,
            "commentary": caption,
            "visibility": "PUBLIC",
            "distribution": {"feedDistribution": "MAIN_FEED", "targetEntities": [], "thirdPartyDistributionChannels": []},
            "lifecycleState": "PUBLISHED",
            "isReshareDisabledByAuthor": False,
            "content": {"media": {"id": image_urn}},
        },
        timeout=30,
    )
    if not post.ok:
        raise RuntimeError(f"LinkedIn post {post.status_code}: {post.text[:400]}")
    post_id = post.headers.get("x-restli-id") or image_urn
    return f"https://www.linkedin.com/feed/update/{post_id}"


def post_facebook(job: dict[str, str], artwork: Path) -> str:
    page_id = env("FACEBOOK_PAGE_ID")
    token = env("FACEBOOK_PAGE_ACCESS_TOKEN", "INSTAGRAM_ACCESS_TOKEN")
    if not page_id or not token:
        raise RuntimeError("Missing FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN")
    req = requests_mod()
    with artwork.open("rb") as handle:
        response = req.post(
            f"https://graph.facebook.com/v21.0/{page_id}/photos",
            data={"caption": job.get("caption_paste") or job.get("hook") or "", "access_token": token, "published": "true"},
            files={"source": (artwork.name, handle, mimetypes.guess_type(str(artwork))[0] or "image/png")},
            timeout=60,
        )
    if not response.ok:
        raise RuntimeError(f"Facebook photo {response.status_code}: {response.text[:400]}")
    data = response.json()
    post_id = data.get("post_id") or data.get("id")
    return f"https://www.facebook.com/{post_id}" if post_id else ""


def facebook_unpublished_image_url(artwork: Path, token: str, page_id: str) -> str:
    req = requests_mod()
    with artwork.open("rb") as handle:
        uploaded = req.post(
            f"https://graph.facebook.com/v21.0/{page_id}/photos",
            data={"published": "false", "temporary": "true", "access_token": token},
            files={"source": (artwork.name, handle, mimetypes.guess_type(str(artwork))[0] or "image/png")},
            timeout=60,
        )
    if not uploaded.ok:
        raise RuntimeError(f"Facebook unpublished photo {uploaded.status_code}: {uploaded.text[:400]}")
    photo_id = uploaded.json().get("id")
    meta = req.get(
        f"https://graph.facebook.com/v21.0/{photo_id}",
        params={"fields": "images", "access_token": token},
        timeout=30,
    )
    if not meta.ok:
        raise RuntimeError(f"Facebook photo meta {meta.status_code}: {meta.text[:400]}")
    images = meta.json().get("images") or []
    if not images:
        raise RuntimeError("Facebook returned no image URL for Instagram to fetch.")
    images_sorted = sorted(images, key=lambda row: int(row.get("width") or 0), reverse=True)
    return str(images_sorted[0].get("source") or "")


def post_instagram(job: dict[str, str], artwork: Path, seed_comment: bool) -> str:
    ig_id = env("INSTAGRAM_BUSINESS_ID", "IG_USER_ID")
    token = env("INSTAGRAM_ACCESS_TOKEN", "FACEBOOK_PAGE_ACCESS_TOKEN")
    if not ig_id or not token:
        raise RuntimeError("Missing INSTAGRAM_BUSINESS_ID and INSTAGRAM_ACCESS_TOKEN")
    public_base = env("SOCIAL_PUBLIC_BASE_URL").rstrip("/")
    image_url = ""
    if public_base:
        image_url = f"{public_base}/{quote(artwork.name)}"
    else:
        page_id = env("FACEBOOK_PAGE_ID")
        if not page_id:
            raise RuntimeError(
                "Instagram Graph API needs a public HTTPS image URL. Set SOCIAL_PUBLIC_BASE_URL "
                "(file live on the web) or FACEBOOK_PAGE_ID so we can upload an unpublished photo first."
            )
        image_url = facebook_unpublished_image_url(artwork, token, page_id)
    req = requests_mod()
    caption = ig_caption(job.get("caption_paste") or job.get("hook") or "")
    fmt = (job.get("format") or "").lower()
    payload = {"image_url": image_url, "caption": caption, "access_token": token}
    if "story" in fmt:
        payload["media_type"] = "STORIES"
    create = req.post(f"https://graph.facebook.com/v21.0/{ig_id}/media", data=payload, timeout=60)
    if not create.ok:
        raise RuntimeError(f"Instagram container {create.status_code}: {create.text[:400]}")
    creation_id = create.json().get("id")
    publish = req.post(
        f"https://graph.facebook.com/v21.0/{ig_id}/media_publish",
        data={"creation_id": creation_id, "access_token": token},
        timeout=60,
    )
    if not publish.ok:
        raise RuntimeError(f"Instagram publish {publish.status_code}: {publish.text[:400]}")
    media_id = publish.json().get("id")
    if seed_comment and media_id:
        comment = (job.get("first_comment_paste") or "").strip()
        if comment:
            req.post(
                f"https://graph.facebook.com/v21.0/{media_id}/comments",
                data={"message": comment[:300], "access_token": token},
                timeout=30,
            )
    return f"https://www.instagram.com/p/{media_id}/" if media_id else ""


def post_job(job: dict[str, str], artwork: Path, seed_comment: bool) -> str:
    platform = (job.get("platform") or "").lower()
    fmt = job.get("format") or ""
    if platform_needs_video(platform, fmt) and not is_video(artwork):
        raise RuntimeError(
            f"{platform} {fmt} needs a video file (.mp4/.mov). A still from ChatGPT cannot be posted as a Reel/TikTok/Short."
        )
    if platform == "x":
        return post_x(job, artwork, seed_comment)
    if platform == "linkedin":
        return post_linkedin(job, artwork)
    if platform == "facebook":
        return post_facebook(job, artwork)
    if platform == "instagram":
        return post_instagram(job, artwork, seed_comment)
    if platform in VIDEO_PLATFORMS:
        raise RuntimeError(
            f"{platform} posting is not wired yet — TikTok/YouTube need a creator app, OAuth, and a video. "
            "Use the caption from the sheet and upload the .mp4 in the native app for now."
        )
    raise RuntimeError(f"No publisher for platform {platform!r}")


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------


def credentials_status() -> dict[str, str]:
    return {
        "x": "ready" if env("X_API_KEY") and env("X_ACCESS_TOKEN") else "missing X_API_KEY + X_ACCESS_TOKEN (+ secrets)",
        "linkedin": "ready" if env("LINKEDIN_ACCESS_TOKEN") and env("LINKEDIN_AUTHOR_URN") else "missing LINKEDIN_ACCESS_TOKEN + LINKEDIN_AUTHOR_URN",
        "facebook": "ready" if env("FACEBOOK_PAGE_ID") and env("FACEBOOK_PAGE_ACCESS_TOKEN") else "missing FACEBOOK_PAGE_ID + FACEBOOK_PAGE_ACCESS_TOKEN",
        "instagram": "ready" if env("INSTAGRAM_BUSINESS_ID") and (env("INSTAGRAM_ACCESS_TOKEN") or env("FACEBOOK_PAGE_ACCESS_TOKEN")) else "missing INSTAGRAM_BUSINESS_ID + token",
        "tiktok": "not wired (needs video + TikTok Content Posting API)",
        "youtube": "not wired (needs video + YouTube Data API)",
    }


def select_jobs(rows: list[dict[str, str]], args: argparse.Namespace) -> list[dict[str, str]]:
    wanted_sections = POSTABLE_SECTIONS if args.include_calendar else {"LAUNCH 14 DAYS", "FIRST 9 IG GRID"}
    selected: list[dict[str, str]] = []
    for row in rows:
        if (row.get("section") or "") not in wanted_sections:
            continue
        if (row.get("status") or "").lower() in {"posted", "done", "live"}:
            continue
        platform = (row.get("platform") or "").lower()
        if not platform:
            continue
        if args.platform and platform != args.platform.lower():
            continue
        if args.idea and (row.get("idea_id") or "").upper() != args.idea.upper():
            continue
        if args.date and (row.get("date") or "") != args.date:
            continue
        selected.append(row)
    if args.limit and args.limit > 0:
        selected = selected[: args.limit]
    return selected


def run_posting(args: argparse.Namespace) -> int:
    load_dotenv(ENV_FILE)
    load_dotenv(ROOT / ".env.social")
    ARTWORK_DIR.mkdir(parents=True, exist_ok=True)
    queue_path = Path(args.queue) if getattr(args, "queue", None) else QUEUE_CSV
    artwork_dir = Path(args.artworks) if getattr(args, "artworks", None) else ARTWORK_DIR
    rows = read_queue(queue_path)
    catalogue = index_artworks(artwork_dir)
    jobs = select_jobs(rows, args)
    creds = credentials_status()

    print(f"Queue: {queue_path}")
    print(f"Artworks: {artwork_dir} ({len(catalogue)} matched files)")
    print("API credentials:")
    for platform, status in creds.items():
        print(f"  {platform}: {status}")
    print(f"Jobs selected: {len(jobs)}  live={bool(args.live)}")
    if not jobs:
        print("Nothing to post. Check --date / --platform / --idea, or add Not posted rows.")
        return 0

    posted = 0
    skipped = 0
    failed = 0
    for job in jobs:
        artwork = match_artwork(job, catalogue)
        platform = (job.get("platform") or "").lower()
        fmt = job.get("format") or ""
        idea = job.get("idea_id") or ""
        title = job.get("title") or ""
        if artwork is None:
            skipped += 1
            print(f"SKIP  no artwork  {platform:10} {idea:6} {title}")
            append_log({
                "posted_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "dry_run": str(not args.live),
                "section": job.get("section", ""),
                "date": job.get("date", ""),
                "platform": platform,
                "format": fmt,
                "idea_id": idea,
                "title": title,
                "artwork": "",
                "status": "skipped",
                "posted_url": "",
                "error": "no matching artwork",
            })
            continue
        if platform_needs_video(platform, fmt) and not is_video(artwork):
            skipped += 1
            print(f"SKIP  needs video  {platform:10} {idea:6} {artwork.name}")
            continue
        if not args.live:
            print(f"DRY   would post  {platform:10} {idea:6} {artwork.name}")
            print(f"      caption: {(job.get('caption_paste') or job.get('hook') or '')[:110].replace(chr(10), ' / ')}")
            append_log({
                "posted_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "dry_run": "True",
                "section": job.get("section", ""),
                "date": job.get("date", ""),
                "platform": platform,
                "format": fmt,
                "idea_id": idea,
                "title": title,
                "artwork": str(artwork),
                "status": "dry-run",
                "posted_url": "",
                "error": "",
            })
            continue
        try:
            url = post_job(job, artwork, seed_comment=args.seed_comment)
        except Exception as exc:  # noqa: BLE001 — keep going through the queue
            failed += 1
            print(f"FAIL  {platform:10} {idea:6} {exc}")
            append_log({
                "posted_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "dry_run": "False",
                "section": job.get("section", ""),
                "date": job.get("date", ""),
                "platform": platform,
                "format": fmt,
                "idea_id": idea,
                "title": title,
                "artwork": str(artwork),
                "status": "failed",
                "posted_url": "",
                "error": str(exc)[:500],
            })
            continue
        posted += 1
        job["status"] = "Posted"
        job["posted_url"] = url
        print(f"POST  {platform:10} {idea:6} {url}")
        append_log({
            "posted_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "dry_run": "False",
            "section": job.get("section", ""),
            "date": job.get("date", ""),
            "platform": platform,
            "format": fmt,
            "idea_id": idea,
            "title": title,
            "artwork": str(artwork),
            "status": "posted",
            "posted_url": url,
            "error": "",
        })

    if args.live:
        write_queue(queue_path, rows)
    print(f"Done. posted={posted} skipped={skipped} failed={failed} live={bool(args.live)}")
    if not args.live:
        print("This was a dry run. Add --live to actually publish.")
    return 1 if failed else 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Post BroadbandPicker social queue items from supplied artworks.")
    parser.add_argument("--queue", default=str(QUEUE_CSV))
    parser.add_argument("--artworks", default=str(ARTWORK_DIR))
    parser.add_argument("--platform", default="", help="x | instagram | facebook | linkedin")
    parser.add_argument("--idea", default="", help="e.g. X-001")
    parser.add_argument("--date", default="", help="YYYY-MM-DD from the plan")
    parser.add_argument("--limit", type=int, default=0, help="Max jobs this run. 0 = all matches.")
    parser.add_argument("--include-calendar", action="store_true", help="Also post the later CALENDAR rows, not just launch.")
    parser.add_argument("--seed-comment", action="store_true", default=True, help="Post the first-comment ask after the main post (X/IG).")
    parser.add_argument("--no-seed-comment", action="store_false", dest="seed_comment")
    parser.add_argument("--live", action="store_true", help="Actually publish. Without this flag, dry run only.")
    return parser


def main() -> int:
    return run_posting(build_parser().parse_args())


if __name__ == "__main__":
    raise SystemExit(main())
