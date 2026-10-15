from pathlib import Path
from PIL import Image, ImageOps
import json

root = Path('public')
output = root / 'projects'
output.mkdir(exist_ok=True)
sources = {
    'aralytics': 'aralytics-portfolio.png',
    'lakbai': 'lakbai-portfolio-landscape.png',
    'prism': 'prism.png',
    'thryfto': 'thryfto.png',
    'lolas-kusina': 'lolas-kusina-auth-gate.webp',
    'simulation-comlab-v3': 'comlab-egress.png',
}
report = []
for project, name in sources.items():
    source = root / name
    with Image.open(source) as original:
        original = ImageOps.exif_transpose(original)
        for width in (480, 800, 1200):
            height = round(original.height * width / original.width)
            resized = original.resize((width, height), Image.Resampling.LANCZOS)
            destination = output / f'{project}-{width}.webp'
            resized.save(destination, 'WEBP', quality=88, method=6)
        report.append({'project': project, 'original_bytes': source.stat().st_size, 'preview_800_bytes': (output / f'{project}-800.webp').stat().st_size})
print(json.dumps(report, indent=2))
