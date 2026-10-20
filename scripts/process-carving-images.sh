#!/usr/bin/env bash
# process-carving-images.sh
#
# Batch-processes carving photos for the web gallery.
#
# Layout: assets/images/carving/<Collection>/<source>.jpg
#   - Each subfolder name = a collection = a filter tab on /carving/.
#     ("All" is just the union of every subfolder.)
#   - For every source image it writes, into that same subfolder:
#       <slug>-thumb.jpg  600x600 square, <200KB
#       <slug>-full.jpg   <=1600px longest edge, <1MB (never upscaled)
#
# Usage: bash scripts/process-carving-images.sh [assets/images/carving]

set -u

ROOT="${1:-assets/images/carving}"
THUMB_PX=600
FULL_PX=1600
THUMB_MAX=204800     # bytes (200 KB)
FULL_MAX=1048576     # bytes (1 MB)

command -v sips >/dev/null 2>&1 || { echo "sips not found (needs macOS)" >&2; exit 1; }

# Encode $1 -> $2 as JPEG, dropping quality until <= $3 bytes.
encode_under() {
  local src="$1" out="$2" max="$3" q sz
  for q in 88 80 72 64 56 48 40; do
    sips -s format jpeg -s formatOptions "$q" "$src" --out "$out" >/dev/null 2>&1
    sz=$(stat -f%z "$out" 2>/dev/null || echo 0)
    [ "$sz" -le "$max" ] && return 0
  done
}

for dir in "$ROOT"/*/; do
  [ -d "$dir" ] || continue
  for img in "$dir"*.jpg "$dir"*.jpeg "$dir"*.png "$dir"*.JPG "$dir"*.JPEG "$dir"*.PNG; do
    [ -f "$img" ] || continue
    base=$(basename "$img")
    case "$base" in *-thumb.*|*-full.*) continue;; esac   # skip our own outputs

    slug=$(printf '%s' "${base%.*}" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-')
    slug=${slug#-}; slug=${slug%-}

    w=$(sips -g pixelWidth  "$img" 2>/dev/null | awk '/pixelWidth/{print $2}')
    h=$(sips -g pixelHeight "$img" 2>/dev/null | awk '/pixelHeight/{print $2}')
    { [ -n "$w" ] && [ -n "$h" ]; } || continue

    thumb="${dir}${slug}-thumb.jpg"
    full="${dir}${slug}-full.jpg"
    tmp="/tmp/${slug}-tmp.png"

    # Thumbnail: square -> 600 (center-crop to square first if not already).
    if [ "$w" -eq "$h" ]; then
      sips -Z "$THUMB_PX" "$img" --out "$tmp" >/dev/null 2>&1
    else
      s=$([ "$w" -lt "$h" ] && echo "$w" || echo "$h")
      sips -c "$s" "$s" "$img" --out "$tmp" >/dev/null 2>&1
      sips -Z "$THUMB_PX" "$tmp" --out "$tmp" >/dev/null 2>&1
    fi
    encode_under "$tmp" "$thumb" "$THUMB_MAX"

    # Full: downscale only if the longest edge exceeds 1600 (never upscale).
    long=$([ "$w" -gt "$h" ] && echo "$w" || echo "$h")
    if [ "$long" -gt "$FULL_PX" ]; then
      sips -Z "$FULL_PX" "$img" --out "$tmp" >/dev/null 2>&1
      encode_under "$tmp" "$full" "$FULL_MAX"
    else
      encode_under "$img" "$full" "$FULL_MAX"
    fi

    tw=$(sips -g pixelWidth "$thumb" 2>/dev/null | awk '/pixelWidth/{print $2}')
    fw=$(sips -g pixelWidth "$full"  2>/dev/null | awk '/pixelWidth/{print $2}')
    ts=$(stat -f%z "$thumb" 2>/dev/null || echo 0)
    fs=$(stat -f%z "$full"  2>/dev/null || echo 0)
    printf '%-16s  thumb %4d KB @%spx   full %5d KB @%spx\n' \
      "$slug" $((ts/1024)) "$tw" $((fs/1024)) "$fw"
    rm -f "$tmp"
  done
done

echo "Done."
