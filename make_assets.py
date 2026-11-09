"""Builds the social card (site/og.png) and the favicon set for the YN-1 site.

Run from anywhere: python3 make_assets.py
Needs Pillow. Fonts are in fonts/ (SIL OFL); the card draws from site/iso.png, the favicons from site/photos/portrait.jpg.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

S = Path(__file__).resolve().parent
F = S / "fonts"
OUT = S / "site"

VOID = (6, 16, 32)
VOID_MARK = (43, 74, 122)
SHEET = (27, 74, 136)
SHEET_DEEP = (22, 61, 113)
INK = (238, 244, 255)
INK_DIM = (184, 201, 230)
HAIR = (238, 244, 255, 87)
RED = (255, 171, 122)


def archivo(size, wght, wdth):
    f = ImageFont.truetype(str(F / "archivo-variable.ttf"), size)
    f.set_variation_by_axes([wght, wdth])
    return f


def mono(size):
    return ImageFont.truetype(str(F / "martian-mono-400.ttf"), size)


def spaced(d, xy, text, font, fill, tracking=0.0, anchor="la"):
    """Draw text with letter-spacing (in ems)."""
    x, y = xy
    em = font.size
    if anchor.startswith("r"):
        total = sum(d.textlength(c, font=font) + tracking * em for c in text) - tracking * em
        x -= total
        anchor = "l" + anchor[1]
    for c in text:
        d.text((x, y), c, font=font, fill=fill, anchor=anchor)
        x += d.textlength(c, font=font) + tracking * em
    return x


def og():
    W, H, SC = 1200, 630, 2           # draw at 2x, downsample for clean lines
    w, h = W * SC, H * SC
    im = Image.new("RGB", (w, h), VOID)
    d = ImageDraw.Draw(im, "RGBA")

    # drafting crosses in the void
    for x in range(30 * SC, w, 60 * SC):
        for y in range(30 * SC, h, 60 * SC):
            s = 4 * SC
            d.line([(x - s, y), (x + s, y)], fill=VOID_MARK + (150,), width=SC)
            d.line([(x, y - s), (x, y + s)], fill=VOID_MARK + (150,), width=SC)

    # the sheet
    m = 34 * SC
    sx0, sy0, sx1, sy1 = m, m, w - m, h - m
    d.rectangle([sx0 + 10 * SC, sy0 + 16 * SC, sx1 + 10 * SC, sy1 + 16 * SC], fill=(0, 0, 0, 90))
    d.rectangle([sx0, sy0, sx1, sy1], fill=SHEET)
    p = 12 * SC
    bx0, by0, bx1, by1 = sx0 + p, sy0 + p, sx1 - p, sy1 - p
    d.rectangle([bx0 - 5 * SC, by0 - 5 * SC, bx1 + 5 * SC, by1 + 5 * SC], outline=HAIR, width=SC)
    d.rectangle([bx0, by0, bx1, by1], outline=INK, width=int(1.5 * SC))

    # zone markers along the top edge
    zf = mono(8 * SC)
    for i in range(8):
        zx = bx0 + (bx1 - bx0) * (i + 0.5) / 8
        d.text((zx, by0 - 3 * SC), str(i + 1), font=zf, fill=INK_DIM, anchor="md")

    # title block
    tb_h = 50 * SC
    ty = by1 - tb_h
    d.rectangle([bx0, ty, bx1, by1], fill=SHEET_DEEP)
    d.line([(bx0, ty), (bx1, ty)], fill=INK, width=int(1.5 * SC))
    cols = [("Project", "YN-1 workstation", 2.2), ("Title", "General arrangement", 2.2),
            ("Drawn", "R. Herrera", 1.4), ("Site", "ricardoherrera.co", 2.2), ("Sheet", "01 / 06", 0.9)]
    tot = sum(c[2] for c in cols)
    x = bx0
    small, strong = mono(8 * SC), archivo(16 * SC, 600, 82)
    for i, (lab, val, wt) in enumerate(cols):
        cw = (bx1 - bx0) * wt / tot
        if i:
            d.line([(x, ty), (x, by1)], fill=HAIR, width=SC)
        spaced(d, (x + 10 * SC, ty + 10 * SC), lab.upper(), small, INK_DIM, 0.12)
        spaced(d, (x + 10 * SC, ty + 22 * SC), val.upper(), strong, INK, 0.04)
        x += cw

    # drawing on the left
    iso = Image.open(OUT / "iso.png").convert("RGBA")
    iso = iso.crop(iso.getbbox())
    area_w, area_h = 560 * SC, (ty - by0) - 40 * SC
    k = min(area_w / iso.width, area_h / iso.height)
    iso = iso.resize((int(iso.width * k), int(iso.height * k)), Image.LANCZOS)
    ix = bx0 + 40 * SC
    iy = by0 + ((ty - by0) - iso.height) // 2
    im.paste(iso, (ix, iy), iso)

    # divider and notes on the right
    dx = bx0 + 640 * SC
    d.line([(dx, by0), (dx, ty)], fill=HAIR, width=SC)
    rx = dx + 40 * SC
    spaced(d, (rx, by0 + 92 * SC), "SYSTEMS ENGINEER", mono(11 * SC), INK_DIM, 0.1)
    name = archivo(66 * SC, 800, 118)
    spaced(d, (rx - 3 * SC, by0 + 118 * SC), "RICARDO", name, INK, 0.0)
    spaced(d, (rx - 3 * SC, by0 + 178 * SC), "HERRERA", name, INK, 0.0)
    body = mono(13 * SC)
    lines = ["Infrastructure that stays up and", "stays boring. Lately, the harnesses", "AI agents run on."]
    for i, ln in enumerate(lines):
        d.text((rx, by0 + 278 * SC + i * 24 * SC), ln, font=body, fill=INK)

    # redline stamp
    stamp_f = archivo(13 * SC, 700, 90)
    st = Image.new("RGBA", (300 * SC, 40 * SC), (0, 0, 0, 0))
    sd = ImageDraw.Draw(st)
    end = spaced(sd, (12 * SC, 11 * SC), "DRAWING SET · REV B", stamp_f, RED, 0.12)
    sd.rectangle([0, 0, end + 10 * SC, 34 * SC], outline=RED, width=2 * SC)
    st = st.crop((0, 0, int(end + 11 * SC), 35 * SC)).rotate(3, expand=True, resample=Image.BICUBIC)
    im.paste(st, (bx0 + 26 * SC, by0 + 24 * SC), st)

    im = im.resize((W, H), Image.LANCZOS)
    im.save(OUT / "og.png", optimize=True)


PORTRAIT = OUT / "photos" / "portrait.jpg"  # the yellow-wall portrait, also the blog avatar


def favicons():
    """Favicons from the portrait: round for browser tabs, full-bleed squares for Apple and the 512 icon."""
    src = Image.open(PORTRAIT).convert("RGB")

    def square(px):
        return src.resize((px, px), Image.LANCZOS)

    def round_(px):
        big = px * 4  # draw the mask large, then shrink, for a smooth edge
        mask = Image.new("L", (big, big), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, big - 1, big - 1), fill=255)
        im = square(px).convert("RGBA")
        im.putalpha(mask.resize((px, px), Image.LANCZOS))
        return im

    round_(32).save(OUT / "favicon-32.png", optimize=True)
    round_(192).save(OUT / "favicon-192.png", optimize=True)
    square(180).save(OUT / "apple-touch-icon.png", optimize=True)  # iOS rounds the corners itself
    square(512).save(OUT / "icon-512.png", optimize=True)
    (OUT / "favicon.svg").unlink(missing_ok=True)


if __name__ == "__main__":
    og()
    favicons()
    print("ok")
