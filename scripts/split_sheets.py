"""
뚝딱로봇 파츠 시트 자동 분할 스크립트
=========================================
입력: public/parts/{category}/{source_file}.png  (N×M 그리드 또는 행별 가변 열)
출력: public/parts/{category}/{prefix}_01.png ~ {prefix}_NN.png (투명 배경)

- 카테고리별로 시트 여러 장 지원 (SHEETS[카테고리] = [cfg, cfg, ...])
- 균등 그리드 (rows + cols) 또는 행마다 다른 열 수 (rows_layout=[n1,n2,...]) 지원
- 각 타일 가장자리에서 flood fill 로 흰색 배경 → 투명
- arms/legs 는 점선 구분선이 있어 border_band 로 제거
- keep_large_components 로 점선 잔여물 제거
- 비어 있는 타일(투명 픽셀만) 은 저장 스킵
- 투명 픽셀 제외한 bounding box 로 trim
"""

import os
import sys
from PIL import Image, ImageDraw
import numpy as np
from scipy import ndimage

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# ─── 시트 구성 ──────────────────────────
# 각 카테고리 = 시트 cfg 리스트
# cfg 필드:
#   file          : public/parts/{category}/ 아래 소스 파일명
#   rows, cols    : 균등 그리드 (또는 아래 rows_layout 로 대체)
#   rows_layout   : [r1_cols, r2_cols, ...] — 행마다 열 개수 다를 때 사용
#   count         : 저장할 최대 파츠 수 (빈 칸 제외 실제 수)
#   prefix        : 출력 파일 prefix (시트마다 고유하게)
#   margin_ratio  : 타일 안쪽으로 잘라낼 비율 (겹침 방지)
#   threshold     : 흰 배경 flood fill 허용 색거리
#   border_band   : 가장자리 N픽셀 강제 투명화 (점선 제거)
SHEETS = {
    "heads": [
        {"file": "1.png", "rows": 5, "cols": 4, "count": 20, "prefix": "head",
         "margin_ratio": 0.02, "threshold": 120, "border_band": 0},
    ],
    "torsos": [
        {"file": "2.png", "rows": 3, "cols": 2, "count": 6, "prefix": "torso",
         "margin_ratio": 0.02, "threshold": 120, "border_band": 0},
        {"file": "몸통2.png", "rows": 3, "cols": 2, "count": 6, "prefix": "torso2",
         "margin_ratio": 0.02, "threshold": 120, "border_band": 0},
    ],
    "arms": [
        {"file": "3.png", "rows": 5, "cols": 2, "count": 10, "prefix": "arm",
         "margin_ratio": 0.02, "threshold": 100, "border_band": 6},
        {"file": "팔1.png", "rows": 5, "cols": 2, "count": 10, "prefix": "arm2",
         "margin_ratio": 0.02, "threshold": 100, "border_band": 6},
        {"file": "팔3.png", "rows": 5, "cols": 2, "count": 10, "prefix": "arm3",
         "margin_ratio": 0.02, "threshold": 100, "border_band": 6},
    ],
    "legs": [
        {"file": "4.png", "rows": 4, "cols": 4, "count": 16, "prefix": "leg",
         "margin_ratio": 0.02, "threshold": 100, "border_band": 4},
        {"file": "다리1.png", "rows": 4, "cols": 2, "count": 8, "prefix": "leg2",
         "margin_ratio": 0.02, "threshold": 100, "border_band": 4},
    ],
    "weapons": [
        {"file": "5.png", "rows": 4, "cols": 2, "count": 8, "prefix": "weapon",
         "margin_ratio": 0.02, "threshold": 120, "border_band": 0},
        # 무기2: 행마다 열 개수 다름 (1행 6 · 2행 6 · 3행 2 · 4행 4 · 5행 4)
        {"file": "무기.png", "rows_layout": [6, 6, 2, 4, 4], "count": 22, "prefix": "weapon2",
         "margin_ratio": 0.02, "threshold": 120, "border_band": 0},
    ],
    "accessories": [
        {"file": "악세서리.png", "rows": 6, "cols": 5, "count": 30, "prefix": "acc",
         "margin_ratio": 0.02, "threshold": 120, "border_band": 0},
    ],
}

BG_THRESHOLD = 600

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
PUBLIC_PARTS = os.path.join(PROJECT_ROOT, "public", "parts")
# A4 원본 시트는 배포 폴더 밖(sheets/)에 둔다 — 아이들이 받을 일이 없는 파일
SHEETS_DIR = os.path.join(PROJECT_ROOT, "sheets")


def clear_border_band(img: Image.Image, band: int) -> Image.Image:
    if band <= 0:
        return img
    img = img.convert("RGBA")
    w, h = img.size
    draw = ImageDraw.Draw(img)
    clear = (0, 0, 0, 0)
    draw.rectangle([0, 0, w, band], fill=clear)
    draw.rectangle([0, h - band, w, h], fill=clear)
    draw.rectangle([0, 0, band, h], fill=clear)
    draw.rectangle([w - band, 0, w, h], fill=clear)
    return img


def make_transparent(img: Image.Image, threshold: int = BG_THRESHOLD, inset: int = 0) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size
    si = max(inset, 0)
    if si >= w // 2 or si >= h // 2:
        return img

    seeds = [
        (si, si),                  (w - 1 - si, si),
        (si, h - 1 - si),          (w - 1 - si, h - 1 - si),
        (w // 2, si),              (w // 2, h - 1 - si),
        (si, h // 2),              (w - 1 - si, h // 2),
    ]
    for seed in seeds:
        x, y = seed
        if not (0 <= x < w and 0 <= y < h):
            continue
        pixel = img.getpixel((x, y))
        if len(pixel) < 3 or pixel[3] == 0:
            continue
        if not all(c > 180 for c in pixel[:3]):
            continue
        try:
            ImageDraw.floodfill(img, seed, (0, 0, 0, 0), thresh=threshold)
        except Exception:
            pass

    return img


def trim_to_content(img: Image.Image) -> Image.Image:
    bbox = img.getbbox()
    if bbox:
        return img.crop(bbox)
    return img


def keep_large_components(img: Image.Image, min_size: int = 500) -> Image.Image:
    arr = np.array(img)
    if arr.shape[2] < 4:
        return img
    alpha = arr[..., 3]
    mask = alpha > 0
    if not mask.any():
        return img
    labeled, num = ndimage.label(mask)
    if num == 0:
        return img
    sizes = ndimage.sum(mask, labeled, index=np.arange(1, num + 1))
    keep_labels = np.where(sizes >= min_size)[0] + 1
    if len(keep_labels) == 0:
        return img
    keep_mask = np.isin(labeled, keep_labels)
    arr[..., 3] = np.where(keep_mask, arr[..., 3], 0).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def tile_is_empty(img: Image.Image) -> bool:
    arr = np.array(img)
    if arr.shape[2] < 4:
        return False
    return arr[..., 3].sum() == 0


def build_tiles(W: int, H: int, cfg: dict):
    """cfg 의 rows/cols 또는 rows_layout 으로부터 (left, top, right, bottom) 리스트 생성"""
    if "rows_layout" in cfg:
        layout = cfg["rows_layout"]
        rows = len(layout)
        tile_h = H // rows
        tiles = []
        for r, col_count in enumerate(layout):
            tile_w = W // col_count
            margin_x = int(tile_w * cfg["margin_ratio"])
            margin_y = int(tile_h * cfg["margin_ratio"])
            for c in range(col_count):
                left = c * tile_w + margin_x
                top = r * tile_h + margin_y
                right = (c + 1) * tile_w - margin_x
                bottom = (r + 1) * tile_h - margin_y
                tiles.append((left, top, right, bottom))
        return tiles

    cols, rows = cfg["cols"], cfg["rows"]
    tile_w = W // cols
    tile_h = H // rows
    margin_x = int(tile_w * cfg["margin_ratio"])
    margin_y = int(tile_h * cfg["margin_ratio"])
    tiles = []
    for r in range(rows):
        for c in range(cols):
            left = c * tile_w + margin_x
            top = r * tile_h + margin_y
            right = (c + 1) * tile_w - margin_x
            bottom = (r + 1) * tile_h - margin_y
            tiles.append((left, top, right, bottom))
    return tiles


def split_sheet(category: str, cfg: dict) -> int:
    src_path = os.path.join(SHEETS_DIR, category, cfg["file"])
    if not os.path.isfile(src_path):
        print(f"  ⚠ 소스 파일 없음: {src_path}")
        return 0

    img = Image.open(src_path).convert("RGBA")
    W, H = img.size
    tiles = build_tiles(W, H, cfg)
    th = cfg.get("threshold", BG_THRESHOLD)

    print(f"[{category}/{cfg['file']}]  원본 {W}×{H}  →  타일 {len(tiles)}개  prefix={cfg['prefix']}")

    count = 0
    idx = 1
    for (left, top, right, bottom) in tiles:
        if idx > cfg["count"]:
            break
        tile = img.crop((left, top, right, bottom))
        tile = make_transparent(tile, threshold=th, inset=0)
        tile = clear_border_band(tile, cfg["border_band"])
        tile = make_transparent(tile, threshold=th, inset=cfg["border_band"] + 1)
        tile = keep_large_components(tile, min_size=500)

        if tile_is_empty(tile):
            print(f"  ⊘ 빈 타일 스킵 (인덱스 {idx})")
            idx += 1
            continue

        tile = trim_to_content(tile)

        out_name = f"{cfg['prefix']}_{idx:02d}.png"
        out_path = os.path.join(PUBLIC_PARTS, category, out_name)
        tile.save(out_path, "PNG", optimize=True)
        print(f"  ✓ {out_name}  ({tile.size[0]}×{tile.size[1]})")
        count += 1
        idx += 1

    return count


def main():
    targets = sys.argv[1:] if len(sys.argv) > 1 else list(SHEETS.keys())
    total = 0
    for category in targets:
        if category not in SHEETS:
            print(f"  ⚠ 알 수 없는 카테고리: {category}")
            continue
        for cfg in SHEETS[category]:
            total += split_sheet(category, cfg)
            print()
    print(f"완료! 총 {total}개 파츠 생성")


if __name__ == "__main__":
    main()
