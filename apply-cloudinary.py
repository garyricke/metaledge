#!/usr/bin/env python3
"""Replace local image src references in index.html with optimized Cloudinary URLs."""

import json, re, os

SITE_DIR = os.path.join(os.path.dirname(__file__), "site")
MAP_FILE = os.path.join(os.path.dirname(__file__), "cloudinary-map.json")
HTML_FILE = os.path.join(SITE_DIR, "index.html")

with open(MAP_FILE) as f:
    raw_map = json.load(f)

# Build src-path -> optimized Cloudinary URL
# Insert f_auto,q_auto into the upload URL
def optimize(url):
    return url.replace("/upload/", "/upload/f_auto,q_auto/")

src_map = {}
for local_rel, cdn_url in raw_map.items():
    # local_rel is like "assets/images/projects/foo.jpg"
    src_map[local_rel] = optimize(cdn_url)

with open(HTML_FILE, "r") as f:
    html = f.read()

replaced = 0
for local_path, cdn_url in src_map.items():
    if local_path in html:
        html = html.replace(local_path, cdn_url)
        replaced += 1
        print(f"✓  {local_path}")
        print(f"   → {cdn_url}\n")
    else:
        print(f"–  not found in HTML: {local_path}")

with open(HTML_FILE, "w") as f:
    f.write(html)

print(f"\nReplaced {replaced} image references in index.html")
