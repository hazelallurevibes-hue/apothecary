"""Tab icons from the Hazel Allure mark — cream field so the flower reads at 16px."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MARK = ROOT / "frontend/public/brand/hazel-allure-logo.png"
PUB = ROOT / "frontend/public"
BRAND = PUB / "brand"
CREAM = (245, 240, 232, 255)

src = Image.open(MARK).convert("RGBA")
px = src.load()
w, h = src.size
stack = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
seen = set()
while stack:
    x, y = stack.pop()
    if (x, y) in seen or x < 0 or y < 0 or x >= w or y >= h:
        continue
    seen.add((x, y))
    r, g, b, a = px[x, y]
    if r < 28 and g < 28 and b < 28:
        px[x, y] = (r, g, b, 0)
        stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

def square(size, pad_ratio=0.12):
    canvas = Image.new("RGBA", (size, size), CREAM)
    inner = int(size * (1 - pad_ratio * 2))
    mark = src.copy()
    mark.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    x = (size - mark.width) // 2
    y = (size - mark.height) // 2
    canvas.paste(mark, (x, y), mark)
    return canvas.convert("RGB")

for name, size in [
    ("favicon-32.png", 32),
    ("apple-touch-icon.png", 180),
    ("icon-192.png", 192),
    ("icon-512.png", 512),
]:
    out = square(size)
    dest = PUB / name
    out.save(dest, "PNG", optimize=True)
    print("wrote", dest)

# 32px also under brand for cache-busted links
square(32).save(BRAND / "favicon-32.png", "PNG", optimize=True)
square(512).save(BRAND / "icon-512.png", "PNG", optimize=True)
print("ok")
