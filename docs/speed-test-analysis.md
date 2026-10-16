# Speed test analysis

Generated 2026-09-16T15:56:17.198211+00:00.

This is a measurement and product-gap review. It does not promise Google rank 1.

## What rank-1 UK checkers actually do

### Ookla Speedtest
Usual Google UK rank 1 for internet speed test. https://www.speedtest.net/

- Picks a nearby dedicated test server by ping, not the page origin.
- Uses several parallel TCP connections to fill the pipe after slow start.
- Reports a weighted high-percentile speed (modified trimean / 90th-percentile style), not bytes/total-time.
- Measures idle latency, then download, then upload; can show loaded latency and experience ratings.

### thinkbroadband
Long-running UK specialist checker. https://www.thinkbroadband.com/speedtest

- UK-hosted test aimed at ADSL through gigabit FTTP.
- Runs about 20 to 60 seconds so the line can saturate.
- Tells people to use Ethernet when diagnosing a fault.
- Logs results for national statistics; treats the number as an indication, not a line certificate.

### Uswitch
High-ranking UK comparison-site checker. https://www.uswitch.com/broadband/speedtest/

- HTTPS download of a small probe, then a larger payload sized to the connection.
- Upload uses several packets at once to fill upload capacity.
- UK servers; result is a snapshot, then a compare-deals next step.

### Cloudflare
Anycast quality test used as a professional benchmark. https://speed.cloudflare.com/

- Measures unloaded and loaded latency, download, upload and packet loss.
- Uses Cloudflare's edge so the server is close to the user.
- Saturates with concurrent transfers rather than one short file.

## Why a short single-file test under-reads

TCP slow start means the first megabyte never uses the full path. A 10 MB single stream on a 500 Mbps or gigabit line can finish before the window opens, so bytes/time looks like 40 to 150 Mbps. Ookla, Cloudflare and Uswitch fill the path with several connections and score the saturated period, not the whole transfer.

## Current code gaps

- PASS: Multi-connection download and upload
- PASS: Discard TCP slow-start samples
- PASS: 90th percentile or trimean headline speed
- PASS: Content-Encoding identity on the download payload
- PASS: Loaded latency during download
- PASS: UK region (lhr1)
- PASS: Ping is sequential with warmup, not 5 overlapping batches
- PASS: Download is no longer a single 10 MB file

## Endpoint lab

- **ping**: {"status": 204, "cache_control": "no-store, no-transform", "samples_ms": [205.6, 205.7, 223.9, 102.1, 593.4, 107.8], "median_ms": 205.64999999999998, "passed": true}
- **download_1mb**: {"status": 200, "bytes": 1048576, "elapsed_s": 0.648, "single_stream_mbps": 12.95, "content_encoding": "identity", "cache_control": "no-store, no-transform", "vercel_id": "lhr1::lhr1::p646p-1789574179520-b9f1365a9f63", "entropy_first_64k": 7.9972, "compressible": false, "passed": true}
- **upload_1mb**: {"status": 200, "elapsed_s": 0.751, "cache_control": "no-store, no-transform", "passed": true}

## Required product method

1. Warmup ping, then 8 to 12 sequential pings. Headline ping is the median. Jitter is the mean consecutive difference.
2. Download with several parallel streams for about 8 seconds. Discard the first 2 seconds. Headline is the 90th percentile of the remaining samples.
3. During the last seconds of download, measure loaded ping (bufferbloat).
4. Upload the same way with several parallel posts.
5. Host the test in London. Use incompressible payloads and `Cache-Control: no-store, no-transform`.
6. Tell the user this is the path to our UK server, not an Ofcom-accredited line test. Ethernet still beats Wi-Fi.

