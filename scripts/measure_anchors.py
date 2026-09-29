"""
뚝딱로봇 파츠 앵커 자동 추정 + parts.generated.js 생성
=========================================================
각 카테고리의 파츠 PNG 를 픽셀 단위로 분석하여 앵커 좌표를 산출.

앵커 추정 공식 (자유 배치 모드 전환 후에도 호환용으로 유지):
  heads    : connector = bottom-center
  torsos   : anchors.head = top-center, anchors.arms = 어깨 라인, anchors.hip = bottom-center
  arms     : connector = top-center, hand.left/right = 좌/우 절반 bottom-center
  legs     : connector = top-center
  weapons  : grip = centroid
  accessories : size 만 측정

출력:
  src/data/parts.generated.js
"""

import sys
from pathlib import Path
from PIL import Image
import numpy as np

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
PUBLIC_PARTS = PROJECT_ROOT / "public" / "parts"
OUTPUT_JS = PROJECT_ROOT / "src" / "data" / "parts.generated.js"

# ─── 카테고리별 소스 (여러 시트 → 같은 카테고리로 병합, 이름 번호는 누적) ──
CATEGORIES = [
    {"key": "heads", "label": "머리", "sources": [
        {"prefix": "head", "count": 20},
    ]},
    {"key": "torsos", "label": "몸통", "sources": [
        {"prefix": "torso",  "count": 6},
        {"prefix": "torso2", "count": 6},
    ]},
    {"key": "arms", "label": "팔", "sources": [
        {"prefix": "arm",  "count": 10},
        {"prefix": "arm2", "count": 10},
        {"prefix": "arm3", "count": 10},
    ]},
    {"key": "legs", "label": "다리", "sources": [
        {"prefix": "leg",  "count": 16},
        {"prefix": "leg2", "count": 8},
    ]},
    {"key": "weapons", "label": "무기", "sources": [
        {"prefix": "weapon",  "count": 8},
        {"prefix": "weapon2", "count": 22},
    ]},
    {"key": "accessories", "label": "악세서리", "sources": [
        {"prefix": "acc", "count": 30},
    ]},
]


def load_mask(path: Path):
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    mask = arr[..., 3] > 0
    return mask, (img.width, img.height)


def top_center(mask: np.ndarray):
    rows = np.where(mask.any(axis=1))[0]
    if len(rows) == 0:
        return None
    y = int(rows[0])
    cols = np.where(mask[y])[0]
    x = int((int(cols[0]) + int(cols[-1])) / 2)
    return (x, y)


def bottom_center(mask: np.ndarray):
    rows = np.where(mask.any(axis=1))[0]
    if len(rows) == 0:
        return None
    y = int(rows[-1])
    cols = np.where(mask[y])[0]
    x = int((int(cols[0]) + int(cols[-1])) / 2)
    return (x, y)


def centroid(mask: np.ndarray):
    ys, xs = np.where(mask)
    if len(ys) == 0:
        return None
    return (int(xs.mean()), int(ys.mean()))


def shoulder_anchor(mask: np.ndarray):
    h, w = mask.shape
    top_h = max(int(h * 0.4), 1)
    widths = mask[:top_h].sum(axis=1)
    if widths.max() == 0:
        return (w // 2, int(h * 0.15))
    y = int(np.argmax(widths))
    cols = np.where(mask[y])[0]
    if len(cols) == 0:
        return (w // 2, y)
    x = int((int(cols[0]) + int(cols[-1])) / 2)
    return (x, y)


def half_bottom_center(mask: np.ndarray, side: str):
    h, w = mask.shape
    half = mask.copy()
    if side == "left":
        half[:, w // 2:] = False
    else:
        half[:, :w // 2] = False
    return bottom_center(half)


def build_head(path, part_id, name):
    mask, size = load_mask(path)
    conn = bottom_center(mask) or (size[0] // 2, size[1] - 1)
    return {
        "id": part_id, "name": name,
        "image": f"/parts/heads/{path.stem}.webp",
        "size": {"w": size[0], "h": size[1]},
        "connector": {"x": conn[0], "y": conn[1]},
    }


def build_torso(path, part_id, name):
    mask, size = load_mask(path)
    head = top_center(mask) or (size[0] // 2, 0)
    hip  = bottom_center(mask) or (size[0] // 2, size[1] - 1)
    arms = shoulder_anchor(mask)
    return {
        "id": part_id, "name": name,
        "image": f"/parts/torsos/{path.stem}.webp",
        "size": {"w": size[0], "h": size[1]},
        "anchors": {
            "head": {"x": head[0], "y": head[1]},
            "arms": {"x": arms[0], "y": arms[1]},
            "hip":  {"x": hip[0],  "y": hip[1]},
        },
    }


def build_arm(path, part_id, name):
    mask, size = load_mask(path)
    conn = top_center(mask) or (size[0] // 2, 0)
    hl = half_bottom_center(mask, "left")  or (size[0] // 4, size[1] - 1)
    hr = half_bottom_center(mask, "right") or (size[0] * 3 // 4, size[1] - 1)
    return {
        "id": part_id, "name": name,
        "image": f"/parts/arms/{path.stem}.webp",
        "size": {"w": size[0], "h": size[1]},
        "connector": {"x": conn[0], "y": conn[1]},
        "hand": {
            "left":  {"x": hl[0], "y": hl[1]},
            "right": {"x": hr[0], "y": hr[1]},
        },
    }


def build_leg(path, part_id, name):
    mask, size = load_mask(path)
    conn = top_center(mask) or (size[0] // 2, 0)
    return {
        "id": part_id, "name": name,
        "image": f"/parts/legs/{path.stem}.webp",
        "size": {"w": size[0], "h": size[1]},
        "connector": {"x": conn[0], "y": conn[1]},
    }


def build_weapon(path, part_id, name):
    mask, size = load_mask(path)
    grip = centroid(mask) or (size[0] // 2, size[1] // 2)
    return {
        "id": part_id, "name": name,
        "image": f"/parts/weapons/{path.stem}.webp",
        "size": {"w": size[0], "h": size[1]},
        "grip": {"x": grip[0], "y": grip[1]},
    }


def build_accessory(path, part_id, name):
    _, size = load_mask(path)
    return {
        "id": part_id, "name": name,
        "image": f"/parts/accessories/{path.stem}.webp",
        "size": {"w": size[0], "h": size[1]},
    }


BUILDERS = {
    "heads":       build_head,
    "torsos":      build_torso,
    "arms":        build_arm,
    "legs":        build_leg,
    "weapons":     build_weapon,
    "accessories": build_accessory,
}


def to_js(value, indent: int = 0) -> str:
    pad = "  " * indent
    if isinstance(value, dict):
        items = [f"{k}: {to_js(v)}" for k, v in value.items()]
        return "{ " + ", ".join(items) + " }"
    if isinstance(value, list):
        lines = ["["]
        for item in value:
            lines.append(pad + "  " + to_js(item, indent + 1) + ",")
        lines.append(pad + "]")
        return "\n".join(lines)
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        escaped = value.replace("\\", "\\\\").replace("'", "\\'")
        return f"'{escaped}'"
    if value is None:
        return "null"
    return str(value)


def main():
    generated = {}

    for cat in CATEGORIES:
        key = cat["key"]
        cat_dir = PUBLIC_PARTS / key
        builder = BUILDERS[key]
        items = []
        running_num = 1
        for src in cat["sources"]:
            prefix = src["prefix"]
            count = src["count"]
            for idx in range(1, count + 1):
                # 배포용은 WebP. PNG 가 새로 들어왔으면 PNG 를 읽는다 (재생성 뒤 WebP 변환 필요)
                filename = f"{prefix}_{idx:02d}.png"
                path = cat_dir / filename
                if not path.is_file():
                    filename = f"{prefix}_{idx:02d}.webp"
                    path = cat_dir / filename
                if not path.is_file():
                    # 빈 타일 등으로 생성 안 된 경우 — 조용히 스킵
                    continue
                part_id = f"{prefix}_{idx:02d}"
                name = f"{cat['label']} {running_num}"
                try:
                    data = builder(path, part_id, name)
                    items.append(data)
                    running_num += 1
                except Exception as e:
                    print(f"  ⚠ {filename} 처리 실패: {e}")
        generated[key] = items
        print(f"[{key}] {len(items)}개 등록")

    lines = [
        "// ⚠ 자동 생성 파일 — scripts/measure_anchors.py 로 재생성",
        "// 각 파츠 앵커 좌표가 픽셀 단위 분석으로 산출됨.",
        "// 수동 조정이 필요하면 이 파일을 직접 수정하지 말고 partsData.js 에 override 레이어를 두는 것을 권장.",
        "",
        "export const GENERATED_PARTS = {",
    ]
    for cat in CATEGORIES:
        key = cat["key"]
        items = generated.get(key, [])
        lines.append(f"  {key}: [")
        for item in items:
            lines.append("    " + to_js(item) + ",")
        lines.append("  ],")
    lines.append("};")
    lines.append("")

    OUTPUT_JS.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n✓ 생성됨: {OUTPUT_JS.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()
