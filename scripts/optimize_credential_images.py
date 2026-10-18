"""Prepare certificate previews while preserving the supplied originals."""

from pathlib import Path
from PIL import Image, ImageOps


root = Path(__file__).resolve().parents[1]
output = root / "public" / "credentials"
output.mkdir(parents=True, exist_ok=True)

for name in ("database", "innovathon", "onedavnor"):
    source = output / f"{name}.jpg"
    with Image.open(source) as original:
        original = ImageOps.exif_transpose(original).convert("RGB")
        for width in (480, 800, 1200):
            height = round(original.height * width / original.width)
            preview = original.resize((width, height), Image.Resampling.LANCZOS)
            preview.save(output / f"{name}-{width}.webp", "WEBP", quality=90, method=6)
    print(f"{name}: original preserved; 480, 800, and 1200 px previews generated")
