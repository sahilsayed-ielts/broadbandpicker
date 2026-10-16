# Artworks drop folder

Put ChatGPT stills (and later videos) here. The poster matches them to the Social plan queue.

## Filename

Any of these work:

```
X-001__instagram__feed.png
X-001_instagram_feed.png
X-001-instagram.png
X-001_instagram.png
X-001.png
```

`X-001.png` is used for every platform that still needs that idea. Prefer the platform in the name so Instagram and X can have different crops.

Also accepted: `.jpg` `.webp` `.gif` for stills; `.mp4` `.mov` for Reels / TikTok / Shorts.

Optional `manifest.csv` in this folder:

```
idea_id,platform,format,file
X-001,instagram,feed,loyalty-hostage.png
X-001,x,tweet,loyalty-hostage-wide.png
```

## Then

```bash
python3 scripts/plan_social_media_strategy.py --post
python3 scripts/plan_social_media_strategy.py --post --live --platform x --limit 1
```
