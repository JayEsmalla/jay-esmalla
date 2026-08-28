from pathlib import Path
from shutil import copyfile

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
FINAL = OUTPUT_DIR / "Jay_Factolarin_Esmalla_CV.pdf"
PUBLIC_COPY = ROOT / "public" / "cv.pdf"

INK = colors.HexColor("#111111")
MUTED = colors.HexColor("#4b5563")
ACCENT = colors.HexColor("#6f6759")
RULE = colors.HexColor("#d1d5db")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="Name",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=22,
    leading=24,
    alignment=TA_CENTER,
    textColor=INK,
    spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="Role",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=10,
    leading=13,
    alignment=TA_CENTER,
    textColor=MUTED,
    spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="Contact",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=8.1,
    leading=11,
    alignment=TA_CENTER,
    textColor=MUTED,
    spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="Section",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=9.2,
    leading=11,
    textColor=ACCENT,
    spaceBefore=5,
    spaceAfter=3,
    borderWidth=0,
))
styles.add(ParagraphStyle(
    name="BodySmall",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=8.5,
    leading=11.2,
    textColor=INK,
    spaceAfter=2,
))
styles.add(ParagraphStyle(
    name="EntryTitle",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=9,
    leading=11,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="EntryMeta",
    parent=styles["Normal"],
    fontName="Helvetica-Oblique",
    fontSize=8.1,
    leading=10,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="BulletSmall",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=8.35,
    leading=10.8,
    leftIndent=10,
    firstLineIndent=-6,
    bulletIndent=0,
    textColor=INK,
    spaceAfter=1,
))


def section(title: str):
    return KeepTogether([
        Paragraph(title.upper(), styles["Section"]),
        Table([[""]], colWidths=[7.45 * inch], rowHeights=[0.35], style=TableStyle([
            ("LINEABOVE", (0, 0), (-1, -1), 0.5, RULE),
        ])),
    ])


def bullet(text: str):
    return Paragraph(f"- {text}", styles["BulletSmall"])


def entry(title: str, meta: str, bullets: list[str]):
    rows = [[Paragraph(title, styles["EntryTitle"]), Paragraph(meta, styles["EntryMeta"])]]
    header = Table(rows, colWidths=[5.35 * inch, 2.10 * inch], style=TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    return KeepTogether([header, *[bullet(item) for item in bullets], Spacer(1, 2)])


doc = SimpleDocTemplate(
    str(FINAL),
    pagesize=LETTER,
    rightMargin=0.525 * inch,
    leftMargin=0.525 * inch,
    topMargin=0.40 * inch,
    bottomMargin=0.38 * inch,
    title="Jay Factolarin Esmalla - CV",
    author="Jay Factolarin Esmalla",
    subject="Software developer curriculum vitae",
)

story = [
    Paragraph("JAY FACTOLARIN ESMALLA", styles["Name"]),
    Paragraph("Flutter + React Developer | BS Computer Science, Artificial Intelligence", styles["Role"]),
    Paragraph(
        "Tagum City, Philippines  |  "
        "<link href='mailto:jaesmalla1@gmail.com' color='#4b5563'>jaesmalla1@gmail.com</link>  |  "
        "<link href='https://github.com/JayEsmalla' color='#4b5563'>github.com/JayEsmalla</link>  |  "
        "<link href='https://www.linkedin.com/in/jay-esmalla-1703bb381/' color='#4b5563'>linkedin.com/in/jay-esmalla-1703bb381</link>",
        styles["Contact"],
    ),
    section("Profile"),
    Paragraph(
        "Fourth-year Computer Science student majoring in Artificial Intelligence with hands-on experience building Flutter mobile applications and React/TypeScript web products. Comfortable working across interface design, authentication, databases, real-time features, and maintainable application flows.",
        styles["BodySmall"],
    ),
    section("Experience"),
    entry(
        "Student Assistant - University of Mindanao Tagum College",
        "2023 - Present",
        [
            "Support daily administrative workflows, document handling, records, and student concerns.",
            "Coordinate tasks alongside academic work, strengthening communication, prioritization, and accountability.",
        ],
    ),
    section("Selected Projects"),
    entry(
        "Thryfto - Full-Stack Mobile Developer",
        "Flutter, Dart, Firebase",
        [
            "Built a community thrift marketplace with item listings, image uploads, search and filtering, user profiles, and real-time buyer-seller messaging.",
            "Used Firebase Authentication and Firestore with Cloudinary-backed images to support cross-platform marketplace flows.",
            "Source: github.com/JayEsmalla/thryfto-app",
        ],
    ),
    entry(
        "RimWorks PH - Full-Stack Web Developer",
        "React, TypeScript, Supabase",
        [
            "Developed a custom rim ordering platform with product filters, order configuration snapshots, payment-proof uploads, and customer status tracking.",
            "Implemented a staff portal with role-based access, payment verification, product management, and order history.",
            "Source: github.com/JayEsmalla/rim-works",
        ],
    ),
    entry(
        "LolasKusina - Lead Web Developer and System Architect",
        "PHP, JavaScript, Python, Docker",
        [
            "Created a structured food-package ordering workflow for menu discovery, guest browsing, booking, customer requests, and order history.",
            "Centralized order handling to reduce the communication gaps and mix-ups common in manual catering workflows.",
        ],
    ),
    section("Technical Skills"),
    Table([
        [Paragraph("<b>Mobile</b><br/>Flutter, Dart", styles["BodySmall"]), Paragraph("<b>Frontend</b><br/>React, TypeScript, JavaScript, Tailwind CSS", styles["BodySmall"])],
        [Paragraph("<b>Backend and Data</b><br/>Firebase, Supabase, Node.js, Python, PHP, MySQL", styles["BodySmall"]), Paragraph("<b>Tools</b><br/>Git, GitHub, Docker, Figma", styles["BodySmall"])],
    ], colWidths=[3.72 * inch, 3.73 * inch], style=TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ])),
    section("Education and Certification"),
    entry(
        "BS Computer Science, Major in Artificial Intelligence",
        "2023 - Present",
        ["University of Mindanao Tagum College - Fourth Year"],
    ),
    entry(
        "IT Specialist - Databases",
        "Issued July 2026",
        ["Certiport / CertNexus / Pearson VUE | Credential wBTT6-2FvB | Valid through July 2031"],
    ),
]

doc.build(story)
copyfile(FINAL, PUBLIC_COPY)
print(FINAL)
print(PUBLIC_COPY)
