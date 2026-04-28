#!/usr/bin/env bash
# Upload all Metal Edge site images to Cloudinary with auto format + quality optimization
# Usage: CLOUDINARY_CLOUD=yourcloud CLOUDINARY_KEY=xxx CLOUDINARY_SECRET=yyy bash upload-to-cloudinary.sh

set -euo pipefail

CLOUD="${CLOUDINARY_CLOUD:?Set CLOUDINARY_CLOUD}"
KEY="${CLOUDINARY_KEY:?Set CLOUDINARY_KEY}"
SECRET="${CLOUDINARY_SECRET:?Set CLOUDINARY_SECRET}"

SITE_DIR="$(cd "$(dirname "$0")/site" && pwd)"
IMAGE_DIR="$SITE_DIR/assets/images"
FOLDER="metal-edge"

echo "Uploading images from $IMAGE_DIR to Cloudinary cloud: $CLOUD"
echo ""

declare -A UPLOADED  # local path -> cloudinary secure_url

upload_file() {
  local file="$1"
  local public_id

  # Build a clean public_id from the relative path, stripping extension
  public_id=$(realpath --relative-to="$IMAGE_DIR" "$file")
  public_id="${public_id%.*}"                        # remove extension
  public_id="$FOLDER/${public_id//\//-}"             # flatten path with dashes

  echo "→ Uploading: $file"
  echo "  public_id: $public_id"

  # Build signature (timestamp + public_id + api_secret)
  TIMESTAMP=$(date +%s)
  SIG_STRING="folder=$FOLDER&public_id=$public_id&timestamp=$TIMESTAMP$SECRET"
  SIGNATURE=$(echo -n "$SIG_STRING" | openssl dgst -sha1 -hex | awk '{print $2}')

  RESPONSE=$(curl -s \
    -F "file=@$file" \
    -F "api_key=$KEY" \
    -F "timestamp=$TIMESTAMP" \
    -F "signature=$SIGNATURE" \
    -F "public_id=$public_id" \
    -F "folder=$FOLDER" \
    -F "quality=auto" \
    -F "fetch_format=auto" \
    "https://api.cloudinary.com/v1_1/$CLOUD/image/upload")

  URL=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('secure_url','ERROR'))")
  echo "  ✓ $URL"
  echo ""

  UPLOADED["$file"]="$URL"
}

# Upload every jpg, png, svg, webp in assets/images
while IFS= read -r -d '' file; do
  upload_file "$file"
done < <(find "$IMAGE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.svg" -o -iname "*.webp" \) -print0)

# Print a mapping of old local path -> new Cloudinary URL for manual reference
echo ""
echo "============================================================"
echo "UPLOAD MAP (replace local paths in HTML with these URLs)"
echo "============================================================"
for local_path in "${!UPLOADED[@]}"; do
  rel=$(realpath --relative-to="$SITE_DIR" "$local_path")
  echo "$rel  =>  ${UPLOADED[$local_path]}"
done
