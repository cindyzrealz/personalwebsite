#!/usr/bin/env python3
"""
Batch-process carving images into a thumbnail and a full-size JPEG.

For each source image in the target directory (excluding any existing
*-thumb.* / *-full.* outputs), this produces two files in the same folder:

  <slug>-thumb.jpg   square 600x600 center-crop, under 200 KB
  <slug>-full.jpg    longest edge 1600 px, under ~1 MB

The slug is looked up from SLUGS below (source filename -> slug). Any source
file not in SLUGS falls back to a naive ASCII slug derived from its filename
(and is skipped with a warning if that yields nothing, e.g. for CJK names).

Usage:
  python3 process_carving_images.py [DIR]

DIR defaults to assets/images/carving/Odyssey (relative to the project root).
Requires: Pillow  ->  pip3 install Pillow
"""

import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

THUMB_SIZE = 600
THUMB_MAX_KB = 200
FULL_MAX_EDGE = 1600
FULL_MAX_KB = 1000

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp", ".bmp"}

# Edit this map to change the slug for any source image.
SLUGS = {
    "万里赴戎机": "wan-li-fu-rong-ji",
    "不亦乐乎": "bu-yi-le-hu",
    "倾国倾城": "qing-guo-qing-cheng",
    "八面玲珑": "ba-mian-ling-long",
    "向死而生": "xiang-si-er-sheng",
    "奥德赛": "ao-de-sai",
    "故国神游": "gu-guo-shen-you",
    "无名之辈": "wu-ming-zhi-bei",
    "杜鹃啼血": "du-juan-ti-xue",
    "桃花源": "tao-hua-yuan",
    "牺牲": "xi-sheng",
    "陌上桑": "mo-shang-sang",

    # Dragon — the Nine Sons of the Dragon (龙生九子) plus the Dragon King
    "嘲风": "chao-feng",
    "囚牛": "qiu-niu",
    "狴犴": "bi-an",
    "狻猊": "suan-ni",
    "睚眦": "ya-zi",
    "蒲牢": "pu-lao",
    "螭吻": "chi-wen",
    "负屃": "fu-xi",
    "霸下": "ba-xia",
    "龙王": "long-wang",

    # Lunar Months — the elegant names of the twelve months (十二月份雅称)
    "十二月份雅称": "shi-er-yue-fen-ya-cheng",
    "孟春": "meng-chun",
    "花朝": "hua-zhao",
    "辰月": "chen-yue",
    "槐序": "huai-xu",
    "荷月": "he-yue",
    "霜序": "shuang-xu",
    "桂月": "gui-yue",
    "孟秋": "meng-qiu",
    "孟冬": "meng-dong",
    "嘉平": "jia-ping",
    "龙潜": "long-qian",

    # Dunhuang
    "一花一世界": "yi-hua-yi-shi-jie",
    "三兔共耳": "san-tu-gong-er",
    "丝绸盛景": "si-chou-sheng-jing",
    "九色鹿": "jiu-se-lu",
    "敦煌": "dunhuang",
    "敦煌行": "dunhuang-xing",
    "月牙泉": "yue-ya-quan",
    "涅槃": "nie-pan",
    "玉门关": "yu-men-guan",
    "莫高窟": "mo-gao-ku",
    "藏经洞": "cang-jing-dong",
    "飞天": "fei-tian",
}


def slug_for(stem: str) -> str:
    if stem in SLUGS:
        return SLUGS[stem]
    slug = stem.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
    return slug


def save_jpeg_under(img: Image.Image, path: Path, max_kb: int) -> None:
    """Save a JPEG, lowering quality stepwise until it fits under max_kb."""
    img = img.convert("RGB")
    quality = 90
    while quality >= 40:
        img.save(path, "JPEG", quality=quality, optimize=True)
        if path.stat().st_size <= max_kb * 1024:
            return
        quality -= 5
    # One final save at the floor quality so we always write *something*.
    img.save(path, "JPEG", quality=40, optimize=True)


def make_thumb(img: Image.Image, path: Path) -> None:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    square = img.crop((left, top, left + side, top + side))
    square = square.resize((THUMB_SIZE, THUMB_SIZE), Image.LANCZOS)
    save_jpeg_under(square, path, THUMB_MAX_KB)


def make_full(img: Image.Image, path: Path) -> None:
    img = img.copy()
    img.thumbnail((FULL_MAX_EDGE, FULL_MAX_EDGE), Image.LANCZOS)
    save_jpeg_under(img, path, FULL_MAX_KB)


def main() -> None:
    directory = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("assets/images/carving/Odyssey")
    if not directory.is_dir():
        sys.exit(f"Not a directory: {directory}")

    sources = []
    for p in sorted(directory.iterdir()):
        if p.suffix.lower() not in IMAGE_EXTS:
            continue
        if p.stem.endswith("-thumb") or p.stem.endswith("-full"):
            continue
        sources.append(p)

    if not sources:
        print(f"No source images found in {directory}")
        return

    for p in sources:
        slug = slug_for(p.stem)
        if not slug:
            print(f"  !! skipped (no slug for CJK name): {p.name}")
            continue
        thumb = directory / f"{slug}-thumb.jpg"
        full = directory / f"{slug}-full.jpg"
        try:
            img = ImageOps.exif_transpose(Image.open(p))
            make_thumb(img, thumb)
            make_full(img, full)
            tkb = thumb.stat().st_size // 1024
            fkb = full.stat().st_size // 1024
            print(f"  {p.name} -> {thumb.name} ({tkb} KB), {full.name} ({fkb} KB)")
        except Exception as exc:  # keep going on a bad file
            print(f"  !! failed on {p.name}: {exc}")


if __name__ == "__main__":
    main()
