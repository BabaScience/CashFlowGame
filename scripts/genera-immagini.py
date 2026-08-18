#!/usr/bin/env python3
"""
Genera tutte le immagini del progetto: icone, favicon e il banner che appare
quando si condivide il link.

    python3 scripts/genera-immagini.py

Le immagini finiscono in public/ e vengono versionate: questo script serve a
rigenerarle in modo identico se un domani cambiano colori o scritte.
I caratteri sono gli stessi dell'applicazione (Archivo Black e Barlow, in
licenza SIL Open Font: vedi scripts/font/OFL.txt).

Serve Pillow:  pip install pillow
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
PUBLIC = os.path.join(RADICE, "public")
FONT = os.path.join(QUI, "font")
os.makedirs(PUBLIC, exist_ok=True)

# ── Colori, gli stessi di src/styles/globale.css ──
TAVOLO      = (16, 32, 27)
FELTRO_INT  = (38, 82, 68)
FELTRO_EST  = (18, 39, 31)
CARTA       = (244, 241, 230)
ORO         = (201, 162, 39)
ORO_CHIARO  = (227, 197, 90)
VERDE       = (78, 139, 61)
BLU         = (46, 111, 168)
ROSSO       = (178, 58, 46)
ARANCIO     = (217, 131, 36)
VIOLA       = (123, 79, 168)
ACQUA       = (47, 143, 134)
ROSA        = (194, 85, 122)
TENUE       = (150, 165, 157)

# Sequenza di colori delle 24 caselle della Corsa dei Topi,
# nello stesso ordine di src/game/data/tabellone.js
CORSA_TOPI = [ARANCIO, VERDE, ROSSO, VERDE, VIOLA, VERDE, BLU, VERDE,
              ARANCIO, VERDE, ROSSO, VERDE, ACQUA, VERDE, BLU, VERDE,
              ARANCIO, VERDE, ROSSO, VERDE, (107, 68, 35), VERDE, BLU, VERDE]

# Le 48 della Corsia Veloce: cashflow, affare, sogno, affare, penalità...
CORSIA_VELOCE = []
for i in range(48):
    if i % 12 == 0:      CORSIA_VELOCE.append(ARANCIO)
    elif i % 2 == 1:     CORSIA_VELOCE.append(VERDE)
    elif i % 4 == 2:     CORSIA_VELOCE.append(ROSA)
    elif i % 8 == 4:     CORSIA_VELOCE.append(ROSSO)
    else:                CORSIA_VELOCE.append(VIOLA)

SUPER = 4  # fattore di sovracampionamento: si disegna in grande e si riduce


def font(nome, dim):
    return ImageFont.truetype(os.path.join(FONT, nome), dim)


def sfumatura_radiale(dim, centro, esterno):
    """Feltro del tavolo: più chiaro al centro, più scuro ai bordi."""
    img = Image.new("RGB", (dim, dim), esterno)
    px = img.load()
    r = dim / 2
    for y in range(dim):
        for x in range(dim):
            d = min(1.0, math.hypot(x - r, y - r) / r)
            t = d * d
            px[x, y] = tuple(int(centro[i] + (esterno[i] - centro[i]) * t) for i in range(3))
    return img


def anello(draw, cx, cy, raggio, spessore, colori, vuoto=0.16, alone=None):
    """Disegna un anello di caselle colorate, come sul tabellone."""
    n = len(colori)
    passo = 360 / n
    for i, col in enumerate(colori):
        a0 = i * passo - 90 + passo * vuoto / 2
        a1 = (i + 1) * passo - 90 - passo * vuoto / 2
        cassa = [cx - raggio, cy - raggio, cx + raggio, cy + raggio]
        draw.arc(cassa, a0, a1, fill=col, width=spessore)
    if alone:
        r = raggio + spessore / 2 + alone[1]
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=alone[0], width=alone[2])


def rombo(draw, cx, cy, r, colore):
    draw.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=colore)


def angoli_arrotondati(img, raggio):
    """Ritaglia gli angoli, per le icone quadrate."""
    maschera = Image.new("L", img.size, 0)
    ImageDraw.Draw(maschera).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1],
                                               radius=raggio, fill=255)
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste(img, (0, 0), maschera)
    return out


# ══════════════════════════════════════════════════════════════════
def icona(lato, arrotonda=True, margine=0.0, sfondo_pieno=True):
    """
    Icona quadrata: tavolo verde, i due anelli del tabellone, rombo d'oro
    al centro. `margine` serve alla versione "maskable", che deve reggere
    il ritaglio circolare di Android.
    """
    D = lato * SUPER
    if sfondo_pieno:
        img = sfumatura_radiale(D, FELTRO_INT, FELTRO_EST).convert("RGBA")
    else:
        img = Image.new("RGBA", (D, D), TAVOLO + (255,))
    d = ImageDraw.Draw(img)
    cx = cy = D / 2

    utile = D * (1 - margine * 2)
    r_est = utile * 0.375
    r_int = utile * 0.235
    sp_est = max(SUPER, int(utile * 0.052))
    sp_int = max(SUPER, int(utile * 0.060))

    anello(d, cx, cy, r_est, sp_est, CORSIA_VELOCE, vuoto=0.22)
    anello(d, cx, cy, r_int, sp_int, CORSA_TOPI, vuoto=0.20)

    # bordo dorato esterno
    rb = utile * 0.445
    d.ellipse([cx - rb, cy - rb, cx + rb, cy + rb], outline=ORO + (110,), width=max(1, int(D * 0.006)))

    # centro scuro e rombo d'oro
    rc = utile * 0.165
    d.ellipse([cx - rc, cy - rc, cx + rc, cy + rc], fill=(19, 42, 34, 255))
    rombo(d, cx, cy, utile * 0.088, ORO_CHIARO)

    img = img.resize((lato, lato), Image.LANCZOS)
    if arrotonda:
        img = angoli_arrotondati(img, int(lato * 0.22))
    return img


def favicon(lato):
    """A 16-32 px gli anelli spariscono: meglio un rombo grande e leggibile."""
    D = lato * SUPER
    img = Image.new("RGBA", (D, D), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, D - 1, D - 1], radius=int(D * 0.22), fill=(19, 42, 34, 255))
    cx = cy = D / 2
    d.ellipse([cx - D * 0.38, cy - D * 0.38, cx + D * 0.38, cy + D * 0.38],
              outline=ORO + (255,), width=max(SUPER, int(D * 0.055)))
    rombo(d, cx, cy, D * 0.20, ORO_CHIARO)
    return img.resize((lato, lato), Image.LANCZOS)


def banner():
    """
    Immagine 1200×630 per l'anteprima dei link (WhatsApp, Telegram,
    Facebook, X, Slack, iMessage...).
    """
    L, A = 1200, 630
    D = (L * 2, A * 2)
    img = Image.new("RGB", D, TAVOLO)

    # feltro sfumato
    px = img.load()
    for y in range(D[1]):
        for x in range(0, D[0], 2):
            dx = (x - D[0] * 0.72) / (D[0] * 0.62)
            dy = (y - D[1] * 0.5) / (D[1] * 0.95)
            t = min(1.0, math.hypot(dx, dy))
            t = t * t
            c = tuple(int(FELTRO_INT[i] + (TAVOLO[i] - FELTRO_INT[i]) * t) for i in range(3))
            px[x, y] = c
            if x + 1 < D[0]:
                px[x + 1, y] = c

    d = ImageDraw.Draw(img)

    # tabellone sulla destra
    cx, cy = D[0] * 0.755, D[1] * 0.5
    r_est, r_int = D[1] * 0.355, D[1] * 0.222
    anello(d, cx, cy, r_est, int(D[1] * 0.050), CORSIA_VELOCE, vuoto=0.20)
    anello(d, cx, cy, r_int, int(D[1] * 0.057), CORSA_TOPI, vuoto=0.18)
    rb = D[1] * 0.418
    d.ellipse([cx - rb, cy - rb, cx + rb, cy + rb], outline=ORO, width=3)
    rc = D[1] * 0.155
    d.ellipse([cx - rc, cy - rc, cx + rc, cy + rc], fill=(19, 42, 34))
    rombo(d, cx, cy, D[1] * 0.052, ORO_CHIARO)

    # pedine dei giocatori sull'anello interno
    for i, (idx, col) in enumerate([(2, ROSSO), (9, BLU), (15, VERDE), (20, ARANCIO)]):
        ang = math.radians((idx + 0.5) / 24 * 360 - 90)
        pxp = cx + math.cos(ang) * r_int
        pyp = cy + math.sin(ang) * r_int
        rr = D[1] * 0.019
        d.ellipse([pxp - rr, pyp - rr, pxp + rr, pyp + rr], fill=col, outline=CARTA, width=4)

    # testo a sinistra
    f_tit = font("ArchivoBlack-Regular.ttf", 132)
    f_sot = font("Barlow-SemiBold.ttf", 52)
    f_pic = font("Barlow-Regular.ttf", 40)

    x = int(D[0] * 0.058)
    d.text((x, int(D[1] * 0.255)), "CASHFLOW", font=f_tit, fill=ORO_CHIARO)
    d.text((x, int(D[1] * 0.435)), "Esci dalla Corsa dei Topi.", font=f_sot, fill=CARTA)
    d.text((x, int(D[1] * 0.515)), "Il gioco da tavolo, online.", font=f_sot, fill=CARTA)

    # etichette in basso.
    # L'immagine è in RGB: un riempimento con canale alfa verrebbe ignorato e
    # le etichette uscirebbero bianche piene. Si usa quindi un colore già
    # mescolato col fondo.
    y = int(D[1] * 0.665)
    for testo in ["Da 2 a 6 giocatori", "Regole complete", "Gratis"]:
        cassa = d.textbbox((0, 0), testo, font=f_pic)
        larg = cassa[2] - cassa[0] + 60
        alt = 80
        d.rounded_rectangle([x, y, x + larg, y + alt], radius=40,
                            fill=(30, 62, 51), outline=(82, 116, 100), width=3)
        d.text((x + 30, y + 17), testo, font=f_pic, fill=(196, 214, 204))
        x += larg + 22

    # filo d'oro in alto
    d.rectangle([0, 0, D[0], 8], fill=ORO)
    return img.resize((L, A), Image.LANCZOS)


# ══════════════════════════════════════════════════════════════════
def salva(img, nome, **kw):
    p = os.path.join(PUBLIC, nome)
    img.save(p, **kw)
    print(f"  {nome:28} {img.size[0]}×{img.size[1]}  {os.path.getsize(p) / 1024:6.1f} KB")


if __name__ == "__main__":
    print("\nGenerazione delle immagini in public/\n")

    salva(favicon(32), "favicon-32.png")
    salva(favicon(16), "favicon-16.png")
    favicon(32).save(os.path.join(PUBLIC, "favicon.ico"),
                     sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"  {'favicon.ico':28} multi-dimensione")

    salva(icona(180), "apple-touch-icon.png")
    salva(icona(192), "icona-192.png")
    salva(icona(512), "icona-512.png")
    # maskable: margine ampio, Android ritaglia un cerchio
    salva(icona(512, arrotonda=False, margine=0.14, sfondo_pieno=False), "icona-maskable-512.png")

    salva(banner(), "og-banner.png", optimize=True)

    print("\nFatto.\n")
