#!/usr/bin/env python3
"""Upload all site images to Cloudinary and print a replacement map."""

import os, json, glob
import cloudinary
import cloudinary.uploader

CLOUD   = "dsbllwpbh"
KEY     = os.environ.get("CLOUDINARY_API_KEY")
SECRET  = os.environ.get("CLOUDINARY_API_SECRET")
FOLDER  = "metal-edge"

cloudinary.config(cloud_name=CLOUD, api_key=KEY, api_secret=SECRET, secure=True)

SITE_DIR  = os.path.join(os.path.dirname(__file__), "site")
IMAGE_DIR = os.path.join(SITE_DIR, "assets", "images")

EXTS = (".jpg", ".jpeg", ".png", ".webp")

results = {}  # relative src path -> cloudinary URL

files = []
for ext in EXTS:
    files += glob.glob(os.path.join(IMAGE_DIR, "**", f"*{ext}"), recursive=True)
files.sort()

print(f"Found {len(files)} images to upload\n")

for fpath in files:
    rel = os.path.relpath(fpath, SITE_DIR)          # e.g. assets/images/projects/foo.jpg
    # public_id: folder/subfolder-filename (no extension)
    parts = os.path.relpath(fpath, IMAGE_DIR).replace("\\", "/")
    public_id = FOLDER + "/" + os.path.splitext(parts)[0].replace("/", "-")

    print(f"↑  {rel}")
    print(f"   public_id: {public_id}")

    try:
        resp = cloudinary.uploader.upload(
            fpath,
            public_id   = public_id,
            overwrite   = True,
            quality     = "auto",
            fetch_format= "auto",
            folder      = None,   # already embedded in public_id
        )
        url = resp["secure_url"]
        results[rel] = url
        print(f"   ✓  {url}\n")
    except Exception as e:
        print(f"   ✗  ERROR: {e}\n")

# Save map
map_path = os.path.join(os.path.dirname(__file__), "cloudinary-map.json")
with open(map_path, "w") as f:
    json.dump(results, f, indent=2)

print(f"\nDone. Map saved to {map_path}")
