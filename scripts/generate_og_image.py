from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-image.jpg"
PORTRAIT = ROOT / "public" / "profile.webp"
DISPLAY_FONT = Path(r"C:\Windows\Fonts\bahnschrift.ttf")
MONO_FONT = Path(r"C:\Windows\Fonts\consola.ttf")

W, H = 1200, 630
BACKGROUND = "#101010"
CARBON = "#080808"
CHALK = "#f3f3f3"
SMOKE = "#9c9c9c"
GRAPHITE = "#2a2a2a"
GOLD = "#6f6759"
GREEN = "#98ff38"


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


canvas = Image.new("RGB", (W, H), BACKGROUND)
draw = ImageDraw.Draw(canvas)

# Structural grid and hairlines mirror the live portfolio.
for x in range(0, W, 60):
    draw.line((x, 0, x, H), fill="#151515", width=1)
for y in range(0, H, 60):
    draw.line((0, y, W, y), fill="#151515", width=1)
draw.rectangle((36, 36, W - 36, H - 36), outline=GRAPHITE, width=1)
draw.line((715, 36, 715, H - 36), fill=GRAPHITE, width=1)

# Portrait panel.
portrait = Image.open(PORTRAIT).convert("RGB")
portrait = ImageOps.fit(portrait, (405, 486), method=Image.Resampling.LANCZOS, centering=(0.5, 0.43))
portrait = ImageEnhance.Contrast(ImageOps.grayscale(portrait)).enhance(1.05).convert("RGB")
canvas.paste(portrait, (755, 75))
draw.rectangle((755, 75, 1160, 561), outline=GRAPHITE, width=1)
draw.rectangle((746, 66, 751, 71), fill=GOLD)

# Availability badge.
draw.rounded_rectangle((76, 78, 423, 116), radius=5, fill="#1a1a1a", outline=GRAPHITE, width=1)
draw.ellipse((94, 94, 102, 102), fill=GREEN)
draw.text((116, 90), "OPEN TO ROLES & COLLABORATION", font=font(MONO_FONT, 14), fill=SMOKE)

draw.text((76, 163), "JAY FACTOLARIN", font=font(DISPLAY_FONT, 60), fill=CHALK)
draw.text((76, 225), "ESMALLA", font=font(DISPLAY_FONT, 60), fill=CHALK)
draw.text((78, 309), "FLUTTER + REACT DEVELOPER", font=font(MONO_FONT, 20), fill=CHALK)

body = [
    "Practical mobile and web products.",
    "Clear interfaces. Dependable systems.",
]
for index, line in enumerate(body):
    draw.text((78, 365 + index * 34), line, font=font(DISPLAY_FONT, 26), fill=SMOKE)

tags = ["FLUTTER", "REACT", "TYPESCRIPT", "AI / CS"]
x = 78
for tag in tags:
    label_font = font(MONO_FONT, 14)
    bbox = draw.textbbox((0, 0), tag, font=label_font)
    width = bbox[2] - bbox[0] + 28
    draw.rounded_rectangle((x, 474, x + width, 510), radius=4, outline=GRAPHITE, width=1)
    draw.text((x + 14, 484), tag, font=label_font, fill=SMOKE)
    x += width + 10

draw.text((78, 548), "TAGUM CITY, PHILIPPINES", font=font(MONO_FONT, 13), fill=GOLD)

canvas.save(OUTPUT, "JPEG", quality=92, optimize=True, progressive=True)
print(OUTPUT)
