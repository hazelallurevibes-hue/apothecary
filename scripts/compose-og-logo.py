"""1200x630 OG card: Hazel Allure logo + wordmark + apothecary.hazelallure.com."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
MARK = ROOT / "frontend/public/brand/hazel-allure-logo.png"
OUT = ROOT / "frontend/public/brand/og-lockup.png"

W, H = 1200, 630
PLUM = (45, 18, 48, 255)
GOLD = (201, 162, 39, 255)
CREAM = (245, 240, 232, 255)

img = Image.new("RGBA", (W, H), PLUM)
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse((-60, -80, 540, 720), fill=(74, 25, 66, 110))
img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(36)))
draw = ImageDraw.Draw(img)

logo = Image.open(MARK).convert("RGBA")
# drop near-black background
px = logo.load()
pw, ph = logo.size
stack = [(0, 0), (pw - 1, 0), (0, ph - 1), (pw - 1, ph - 1)]
seen = set()
while stack:
    x, y = stack.pop()
    if (x, y) in seen or x < 0 or y < 0 or x >= pw or y >= ph:
        continue
    seen.add((x, y))
    r, g, b, a = px[x, y]
    if r < 28 and g < 28 and b < 28:
        px[x, y] = (r, g, b, 0)
        stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

logo = logo.resize((300, 300), Image.Resampling.LANCZOS)
img.paste(logo, (80, (H - 300) // 2), logo)

def font(size, bold=False):
    names = [
        "C:/Windows/Fonts/georgia.ttf" if not bold else "C:/Windows/Fonts/georgiab.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for n in names:
        p = Path(n)
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()

x = 420
draw.text((x, 155), "Hazel Allure", font=font(58, True), fill=CREAM)
draw.text((x, 240), "Wellness with intention. Shop with spirit.", font=font(24, False), fill=GOLD)
draw.text((x, 320), "apothecary.hazelallure.com", font=font(28, True), fill=CREAM)
draw.rectangle((x, 380, x + 320, 384), fill=GOLD)
draw.text((x, 410), "WOMAN-OWNED APOTHECARY", font=font(20, True), fill=GOLD)

img.convert("RGB").save(OUT, "PNG", optimize=True)
print("wrote", OUT)
