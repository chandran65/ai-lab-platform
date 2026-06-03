"""feed_puppy.py – Feed the Puppy activity for Mindora.

Concept : IF correct item → happy reaction, ELSE → sad reaction.
Features: fullscreen, animated food sliding to puppy, emotional puppy
          drawn with canvas shapes, thought bubble, speech bubble,
          pyttsx3 voice, all 10 levels.

Run standalone : python feed_puppy.py
Launch from app: from feed_puppy import launch_activity; launch_activity(root)
"""

import tkinter as tk
import math
import random
import threading

# ── PIL color-emoji rendering ─────────────────────────────────────────────────
try:
    from PIL import Image, ImageDraw, ImageFont, ImageTk
    import os as _os
    _EMOJI_FONT_PATHS = [
        '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf',
        '/usr/share/fonts/noto/NotoColorEmoji.ttf',
        'C:/Windows/Fonts/seguiemj.ttf',
        '/System/Library/Fonts/Apple Color Emoji.ttc',
    ]
    _EMOJI_FONT_PATH = next((p for p in _EMOJI_FONT_PATHS if _os.path.exists(p)), None)
    PIL_OK = _EMOJI_FONT_PATH is not None
except ImportError:
    PIL_OK = False

_emoji_cache: dict = {}   # (emoji, size_px) → ImageTk.PhotoImage

def _emoji_image(emoji: str, size_px: int) -> "ImageTk.PhotoImage | None":
    """Return a cached color PhotoImage for the given emoji at size_px."""
    if not PIL_OK:
        return None
    key = (emoji, size_px)
    if key in _emoji_cache:
        return _emoji_cache[key]
    try:
        # NotoColorEmoji is fixed at 109 px internally; request 109 always
        font = ImageFont.truetype(_EMOJI_FONT_PATH, 109)
        # Large canvas with generous offset so nothing gets clipped at edges
        canvas_size = 400
        offset = 100
        tmp = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        ImageDraw.Draw(tmp).text((offset, offset), emoji, font=font, embedded_color=True)
        bbox = tmp.getbbox()
        if not bbox:
            return None
        # Add padding around tight bbox so anti-aliased edges aren't clipped
        pad = 6
        l = max(0, bbox[0] - pad)
        t = max(0, bbox[1] - pad)
        r = min(canvas_size, bbox[2] + pad)
        b = min(canvas_size, bbox[3] + pad)
        cropped = tmp.crop((l, t, r, b))
        # Scale to requested size, keeping aspect ratio
        w, h = cropped.size
        scale = size_px / max(w, h)
        new_w = max(1, int(w * scale))
        new_h = max(1, int(h * scale))
        resized = cropped.resize((new_w, new_h), Image.LANCZOS)
        # Center onto transparent square canvas
        sq = Image.new("RGBA", (size_px, size_px), (0, 0, 0, 0))
        ox = (size_px - new_w) // 2
        oy = (size_px - new_h) // 2
        sq.paste(resized, (ox, oy), resized)
        photo = ImageTk.PhotoImage(sq)
        _emoji_cache[key] = photo
        return photo
    except Exception:
        return None

# ── pyttsx3 – optional, silent fallback ──────────────────────────────────────
try:
    import pyttsx3
    _tts = pyttsx3.init()
    _tts.setProperty("rate", 150)
    _tts.setProperty("volume", 1.0)
    TTS_OK = True
except Exception:
    TTS_OK = False

def _speak(text):
    if not TTS_OK:
        return
    def _run():
        try:
            _tts.say(text)
            _tts.runAndWait()
        except Exception:
            pass
    threading.Thread(target=_run, daemon=True).start()

def _beep(freq=800, dur=200):
    try:
        import winsound
        winsound.Beep(int(freq), int(dur))
    except Exception:
        pass

# ── Colours ───────────────────────────────────────────────────────────────────
BG          = "#FFF9F0"
HOME_BG     = "#FFD166"
PUPPY_BG    = "#FFF3E0"
THOUGHT_COL = "#E8F8F5"
BUBBLE_COL  = "#FDFEFE"

# ── Food pools ────────────────────────────────────────────────────────────────
# Items the puppy loves (safe and yummy!)
DOG_FOODS = ["🍖", "🦴", "🍗", "🥕", "🍎", "🥚", "🧀", "🍓", "🫐", "🐟", "🍠", "🥦"]

# Items that are bad for dogs (harmful / wrong choices)
BAD_FOODS  = ["🍫", "🍇", "🧅", "🥑", "🧃", "🍬", "☕", "🌰", "🍋", "🍷", "🧄", "🌿"]

def _make_level(desired, n_good_extras, n_bad):
    """
    Build a single level dict.
    desired      – the emoji the puppy wants (must be in DOG_FOODS)
    n_good_extras – how many extra dog-safe foods to add as distractors
    n_bad        – how many bad/harmful foods to add
    """
    pool_good = [f for f in DOG_FOODS if f != desired]
    pool_bad  = BAD_FOODS[:]
    import random as _r
    extras = _r.sample(pool_good, min(n_good_extras, len(pool_good)))
    bads   = _r.sample(pool_bad,  min(n_bad,         len(pool_bad)))
    choices = [desired] + extras + bads
    return {"desired": desired, "choices": choices, "multi": False}

# Fixed level definitions so every run is consistent
# (desired, extra_good, extra_bad)  → total pile = 1 + extra_good + extra_bad
_LEVEL_SPECS = [
    # Lvl 1 – only 3 items: the right one + 1 good + 1 bad
    ("🦴",  1, 1),   # 3 items
    # Lvl 2 – 4 items
    ("🍎",  1, 2),   # 4 items
    # Lvl 3 – 5 items
    ("🥕",  2, 2),   # 5 items
    # Lvl 4 – 6 items
    ("🍗",  2, 3),   # 6 items
    # Lvl 5 – 7 items
    ("🥚",  3, 3),   # 7 items
    # Lvl 6 – 8 items
    ("🧀",  3, 4),   # 8 items
    # Lvl 7 – 9 items
    ("🍖",  4, 4),   # 9 items
    # Lvl 8 – 10 items
    ("🐟",  4, 5),   # 10 items
    # Lvl 9 – 11 items
    ("🍓",  5, 5),   # 11 items
    # Lvl 10 – 12 items (the full challenge!)
    ("🫐",  5, 6),   # 12 items
]

import random as _rng
_rng.seed(42)          # fixed seed → same pile each run (reproducible for kids)
LEVELS = [_make_level(d, g, b) for d, g, b in _LEVEL_SPECS]

# ── Guide messages ────────────────────────────────────────────────────────────
HAPPY_MSGS = [
    "Yummy! That's exactly what I wanted! Thank you!",
    "Woof woof! You're the best friend ever!",
    "Mmm delicious! I feel so happy now!",
    "That's my favourite! You're so smart!",
    "Great choice! That food is good for me!",
    "Tail is wagging! You picked the right one!",
]
SAD_MSGS = [
    "Oh no! That food is bad for dogs! Look at my thought bubble!",
    "Woof… dogs can't eat that! Try again!",
    "Hmm… that's not safe for me. Can you find the right food?",
    "Oops! That hurts my tummy. Look at what I'm thinking of!",
    "That's not for dogs! Look at my thought bubble and try again!",
]
WRONG_FOOD_MSGS = [
    "I like that too, but right now I want something else!",
    "That's yummy, but look at my thought bubble — that's what I want!",
    "Good food! But not what I'm dreaming of today. Try again!",
    "I don't want that right now — look at what I'm thinking of!",
]
MULTI_HINTS = [
    "I need a little more! Can you find the other one?",
    "Almost there! Keep going!",
    "Good one! Now find the rest!",
]
LEVEL_START_MSGS = [
    "I'm so hungry! Can you see what I'm thinking of?",
    "Look at my thought bubble! That's what I want!",
    "Woof! Feed me the right food — not all food is safe for dogs!",
    "My tummy is rumbling! Find the food I'm dreaming of!",
    "Some foods hurt dogs! Feed me what I'm thinking of!",
]
COMPLETE_MSG = "We finished every level together! You're my best friend! 🐶❤️"


# ══════════════════════════════════════════════════════════════════════════════
#  Canvas-drawn puppy with emotions
# ══════════════════════════════════════════════════════════════════════════════
class PuppyCharacter:
    """Draws an expressive puppy using canvas shapes."""

    def __init__(self, canvas, cx, cy, size=130):
        self.canvas  = canvas
        self.cx      = cx
        self.cy      = cy
        self.size    = size
        self.emotion = "idle"
        self._ids    = []
        self._bounce_job  = None
        self._thought_label = None
        self.draw()

    def draw(self, dy=0):
        for tag in self._ids:
            self.canvas.delete(tag)
        self._ids = []
        s  = self.size
        cx = self.cx
        cy = self.cy + dy

        def oval(x1,y1,x2,y2,**kw):
            t = f"pup_{len(self._ids)}"
            self.canvas.create_oval(x1,y1,x2,y2,tags=t,**kw)
            self._ids.append(t)

        def poly(*pts,**kw):
            t = f"pup_{len(self._ids)}"
            self.canvas.create_polygon(*pts,tags=t,**kw)
            self._ids.append(t)

        def arc(x1,y1,x2,y2,**kw):
            t = f"pup_{len(self._ids)}"
            self.canvas.create_arc(x1,y1,x2,y2,tags=t,**kw)
            self._ids.append(t)

        def line(*pts,**kw):
            t = f"pup_{len(self._ids)}"
            self.canvas.create_line(*pts,tags=t,**kw)
            self._ids.append(t)

        # ── Body ──────────────────────────────────────────────────────────
        br = s * 0.42
        oval(cx-br, cy-br*0.7, cx+br, cy+br*0.9,
             fill="#C8A882", outline="#9E7B56", width=2)

        # ── Head ──────────────────────────────────────────────────────────
        hr = s * 0.35
        hcy = cy - br * 0.6
        oval(cx-hr, hcy-hr, cx+hr, hcy+hr,
             fill="#D4B896", outline="#9E7B56", width=2)

        # ── Floppy ears ───────────────────────────────────────────────────
        ex = hr * 0.75
        ew, eh = hr * 0.45, hr * 0.7
        for sign in (-1, 1):
            poly(cx+sign*ex,        hcy - hr*0.5,
                 cx+sign*(ex+ew),   hcy - hr*0.15,
                 cx+sign*(ex+ew*0.8), hcy + eh,
                 cx+sign*(ex-ew*0.1), hcy + eh*0.85,
                 fill="#A0785A", outline="#7A5840", width=1, smooth=True)

        # ── Snout ─────────────────────────────────────────────────────────
        sw = hr * 0.55
        sh = hr * 0.35
        scy = hcy + hr * 0.35
        oval(cx-sw, scy-sh, cx+sw, scy+sh,
             fill="#E8C9A0", outline="#9E7B56", width=1)

        # Nose
        nw = sw * 0.35
        nh = sh * 0.45
        oval(cx-nw, scy-sh*0.6-nh, cx+nw, scy-sh*0.6+nh,
             fill="#4A2C2A", outline="")

        # ── Mouth ─────────────────────────────────────────────────────────
        if self.emotion in ("happy", "excited"):
            arc(cx-sw*0.55, scy-sh*0.1, cx+sw*0.55, scy+sh*1.1,
                start=200, extent=140, style="arc",
                outline="#4A2C2A", width=3)
            # Tongue
            oval(cx-sw*0.2, scy+sh*0.35, cx+sw*0.2, scy+sh*0.95,
                 fill="#FF8B94", outline="#E05C6C", width=1)
        elif self.emotion == "sad":
            arc(cx-sw*0.5, scy+sh*0.3, cx+sw*0.5, scy+sh*1.2,
                start=30, extent=120, style="arc",
                outline="#4A2C2A", width=3)
        elif self.emotion == "crying":
            arc(cx-sw*0.5, scy+sh*0.3, cx+sw*0.5, scy+sh*1.2,
                start=30, extent=120, style="arc",
                outline="#4A2C2A", width=3)
            # Tear drops
            for sign in (-1, 1):
                tx = cx + sign * hr * 0.55
                oval(tx-5, hcy+hr*0.25, tx+5, hcy+hr*0.55,
                     fill="#74B9FF", outline="")
        else:  # idle / neutral
            arc(cx-sw*0.4, scy, cx+sw*0.4, scy+sh*0.8,
                start=220, extent=100, style="arc",
                outline="#4A2C2A", width=2)

        # ── Eyes ──────────────────────────────────────────────────────────
        ey  = hcy - hr * 0.15
        ex2 = hr * 0.4
        er  = s * 0.065

        for sign in (-1, 1):
            # White
            oval(cx+sign*ex2-er*1.2, ey-er,
                 cx+sign*ex2+er*1.2, ey+er,
                 fill="white", outline="#4A2C2A", width=1)
            # Pupil
            pr = er * 0.6
            pdx = 0
            if self.emotion in ("happy", "excited"):
                # Happy squint — draw curved line instead of circle
                arc(cx+sign*ex2-er, ey-er*0.5,
                    cx+sign*ex2+er, ey+er*0.5,
                    start=30, extent=120, style="arc",
                    outline="#4A2C2A", width=3)
            else:
                oval(cx+sign*ex2-pr+pdx, ey-pr,
                     cx+sign*ex2+pr+pdx, ey+pr,
                     fill="#2C1A0E", outline="")
                # Shine
                sd = pr*0.3
                oval(cx+sign*ex2+pr*0.3-sd, ey-pr*0.4-sd,
                     cx+sign*ex2+pr*0.3+sd, ey-pr*0.4+sd,
                     fill="white", outline="")

        # ── Eyebrows ──────────────────────────────────────────────────────
        bly = ey - er * 1.8
        bw  = ex2 * 0.9
        if self.emotion in ("happy", "excited"):
            for sign in (-1, 1):
                arc(cx+sign*ex2-bw, bly-s*0.06,
                    cx+sign*ex2+bw, bly+s*0.02,
                    start=0, extent=180,
                    style="arc", outline="#4A2C2A", width=2)
        elif self.emotion in ("sad", "crying"):
            for sign in (-1, 1):
                arc(cx+sign*ex2-bw, bly-s*0.02,
                    cx+sign*ex2+bw, bly+s*0.06,
                    start=0, extent=180,
                    style="arc", outline="#4A2C2A", width=2)

        # ── Tail ──────────────────────────────────────────────────────────
        tx = cx + br * 0.85
        ty = cy - br * 0.1
        if self.emotion in ("happy", "excited"):
            poly(tx,      ty,
                 tx+s*0.12, ty-s*0.2,
                 tx+s*0.22, ty-s*0.1,
                 tx+s*0.12, ty+s*0.08,
                 fill="#A0785A", outline="#7A5840", width=1, smooth=True)
        else:
            oval(tx, ty-s*0.05, tx+s*0.1, ty+s*0.05,
                 fill="#A0785A", outline="#7A5840", width=1)

        # ── Paws ──────────────────────────────────────────────────────────
        pw = br * 0.38
        for sign in (-1, 1):
            oval(cx+sign*br*0.55-pw, cy+br*0.6,
                 cx+sign*br*0.55+pw, cy+br*0.9,
                 fill="#D4B896", outline="#9E7B56", width=1)

        # Always keep thought bubble on top of the puppy body
        self.canvas.tag_raise("thought_group")

    # ── Thought bubble ────────────────────────────────────────────────────────
    def show_thought(self, emoji):
        """Draw a clean round bubble with just the food emoji centered inside."""
        self.canvas.delete("thought_group")
        # Destroy any previous emoji label window
        if hasattr(self, '_thought_label') and self._thought_label:
            try: self._thought_label.destroy()
            except Exception: pass
            self._thought_label = None
        self._last_thought_emoji = emoji

        s   = self.size
        cx  = self.cx
        cy  = self.cy
        br  = s * 0.42
        hr  = s * 0.35
        hcy = cy - br * 0.6          # head centre y

        # Bubble centre — above and to the right of the puppy's head
        bcx = cx + s * 0.90
        bcy = hcy - s * 1.15
        r   = s * 0.54               # bubble radius (perfect circle)

        # ── Trail dots leading from head up to bubble ─────────────────────
        for (tx, ty, tr) in [
            (cx + s*0.22, hcy - hr*0.75,  5),
            (cx + s*0.44, hcy - s*0.60,   9),
            (cx + s*0.66, hcy - s*0.86,  13),
        ]:
            self.canvas.create_oval(
                tx-tr, ty-tr, tx+tr, ty+tr,
                fill="white", outline="#5DADE2", width=2,
                tags="thought_group"
            )

        # ── Drop shadow ───────────────────────────────────────────────────
        self.canvas.create_oval(
            bcx - r + 7, bcy - r + 7,
            bcx + r + 7, bcy + r + 7,
            fill="#C8D6E0", outline="", tags="thought_group"
        )

        # ── Main circle bubble ────────────────────────────────────────────
        self.canvas.create_oval(
            bcx - r, bcy - r,
            bcx + r, bcy + r,
            fill="white", outline="#5DADE2", width=4,
            tags="thought_group"
        )

        # ── Gold glow ring ────────────────────────────────────────────────
        gr = r + 9
        self.canvas.create_oval(
            bcx - gr, bcy - gr,
            bcx + gr, bcy + gr,
            outline="#F7DC6F", width=4, fill="",
            tags="thought_group"
        )

        # ── Emoji — color image centered in bubble ────────────────────────
        emoji_px = max(52, int(r * 1.1))
        img = _emoji_image(emoji, emoji_px)
        if img:
            # Store ref on canvas object to prevent GC
            if not hasattr(self.canvas, '_thought_img_refs'):
                self.canvas._thought_img_refs = []
            self.canvas._thought_img_refs = [img]   # replace each time
            lbl = tk.Label(self.canvas, image=img,
                           bg="white", borderwidth=0)
        else:
            emoji_fs = max(26, int(s * 0.40))
            lbl = tk.Label(self.canvas, text=emoji,
                           font=("Segoe UI Emoji", emoji_fs),
                           bg="white", borderwidth=0)
        self._thought_label = lbl
        self.canvas.create_window(bcx, bcy, window=lbl,
                                  anchor="center", tags="thought_group")

        self.canvas.tag_raise("thought_group")

    def _pop_thought(self, *args, **kwargs):
        """No-op: animation removed; bubble draws at full size instantly."""
        pass

    # ── Speech bubble ─────────────────────────────────────────────────────────
    def say(self, text, emotion="idle"):
        self.emotion = emotion
        self.draw()

        # Clear old speech bubble
        for tag in list(self._ids):
            if tag.startswith("speech"):
                self.canvas.delete(tag)
                self._ids.remove(tag)

        fs   = max(11, self.size // 9)
        cw   = min(max(180, len(text)*fs//2), 360)
        ch   = 60
        bx   = self.cx - self.size*0.6 - cw - 10
        by   = self.cy - self.size*0.5

        # Rounded rect
        r = 12
        pts = [bx+r,by, bx+cw-r,by, bx+cw,by, bx+cw,by+r,
               bx+cw,by+ch-r, bx+cw,by+ch, bx+cw-r,by+ch,
               bx+r,by+ch, bx,by+ch, bx,by+ch-r, bx,by+r, bx,by]
        t = "speech_bg"
        self.canvas.create_polygon(pts, smooth=True,
                                   fill=BUBBLE_COL, outline="#2C3E50",
                                   width=2, tags=t)
        self._ids.append(t)

        # Tail
        tip_x = bx + cw + 12
        tip_y = by + ch//2
        t2 = "speech_tail"
        self.canvas.create_polygon(
            bx+cw-2, tip_y-8,
            bx+cw-2, tip_y+8,
            tip_x,   tip_y,
            fill=BUBBLE_COL, outline="#2C3E50", width=1, tags=t2
        )
        self._ids.append(t2)

        t3 = "speech_text"
        self.canvas.create_text(
            bx+cw//2, by+ch//2,
            text=text, font=("Arial", fs, "bold"),
            fill="#2C3E50", width=cw-16, tags=t3
        )
        self._ids.append(t3)

    # ── Animations ────────────────────────────────────────────────────────────
    def bounce(self, cycles=4):
        offsets = [0,-12,0,-8,0,-4,0,-2,0]
        self._anim(offsets, 0, cycles)

    def shake(self, cycles=3):
        offsets = [0,-7,7,-5,5,-3,3,0]
        self._shake(offsets, 0, cycles)

    def _anim(self, offsets, idx, cycles):
        self.draw(dy=offsets[idx % len(offsets)])
        idx += 1
        if idx < len(offsets)*cycles:
            self._bounce_job = self.canvas.after(
                60, lambda: self._anim(offsets, idx, cycles))
        else:
            self._bounce_job = None
            self.draw()

    def _shake(self, offsets, idx, cycles):
        orig = self.cx
        self.cx += offsets[idx % len(offsets)]
        self.draw()
        self.cx = orig
        idx += 1
        if idx < len(offsets)*cycles:
            self.canvas.after(55, lambda: self._shake(offsets, idx, cycles))
        else:
            self.draw()


# ══════════════════════════════════════════════════════════════════════════════
#  Main game class
# ══════════════════════════════════════════════════════════════════════════════
class FeedPuppyGame:
    def __init__(self, win, root):
        self.win          = win
        self.root         = root
        self.level_index  = 0
        self.selected     = []      # for AND-logic levels
        self.animating    = False
        self.active_popup = None
        self.food_labels  = []

        win.update_idletasks()
        self.W = win.winfo_width()
        self.H = win.winfo_height()
        if self.W < 100: self.W = win.winfo_screenwidth()
        if self.H < 100: self.H = win.winfo_screenheight()

        self._build_ui()
        self._load_level()

    # ── UI ────────────────────────────────────────────────────────────────────
    def _build_ui(self):
        W, H = self.W, self.H
        self.win.configure(bg=BG)

        # Background canvas (full screen)
        self.canvas = tk.Canvas(self.win, width=W, height=H,
                                bg=BG, highlightthickness=0)
        self.canvas.place(x=0, y=0)

        # Draw static background
        self._draw_bg()

        # Home button
        tk.Button(
            self.win, text="🏠", font=("Arial", 20, "bold"),
            bg=HOME_BG, relief="flat", command=self._go_home
        ).place(x=10, y=10, width=44, height=44)

        # Level label
        self.level_lbl = tk.Label(
            self.win, text="Level 1",
            font=("Arial", 18, "bold"),
            fg="#2C3E50", bg=BG
        )
        self.level_lbl.place(x=W//2, y=20, anchor="center")

        # Subtitle: pile size hint
        self.pile_lbl = tk.Label(
            self.win, text="",
            font=("Arial", 12),
            fg="#7F8C8D", bg=BG
        )
        self.pile_lbl.place(x=W//2, y=46, anchor="center")

        # Hint banner at top-right
        tk.Label(
            self.win,
            text="🟢 Dog food = GOOD  ❌ Other items = BAD",
            font=("Arial", 11, "bold"),
            fg="#117A65", bg="#D5F5E3",
            relief="flat", padx=8, pady=4
        ).place(x=W - 10, y=10, anchor="ne")

        # Prev / Next buttons
        tk.Button(
            self.win, text="◀ Prev", font=("Arial", 13, "bold"),
            bg="#FD79A8", fg="white", relief="flat",
            command=self._prev_level
        ).place(x=W//2 - 140, y=H-52, width=110, height=38)

        tk.Button(
            self.win, text="Next ➜", font=("Arial", 13, "bold"),
            bg="#A29BFE", fg="white", relief="flat",
            command=self._next_level
        ).place(x=W//2 + 30, y=H-52, width=110, height=38)

        # Puppy character (left-centre)
        puppy_cx = int(W * 0.32)
        puppy_cy = int(H * 0.52)
        puppy_sz = max(100, min(W, H) // 6)
        self.puppy = PuppyCharacter(self.canvas, puppy_cx, puppy_cy,
                                    size=puppy_sz)

    def _draw_bg(self):
        W, H = self.W, self.H
        # Sky
        self.canvas.create_rectangle(0, 0, W, H*0.55,
                                     fill="#D6EAF8", outline="")
        # Grass
        self.canvas.create_rectangle(0, H*0.55, W, H,
                                     fill="#A9DFBF", outline="")
        # Sun
        self.canvas.create_oval(W*0.82, 20, W*0.82+70, 90,
                                fill="#FFD700", outline="#F1C40F", width=2)
        # Clouds
        for cx, cy in [(W*0.15, 60), (W*0.5, 40), (W*0.7, 80)]:
            for dx, dy, r in [(-22,0,22),(0,-10,26),(22,0,22),(0,10,20)]:
                self.canvas.create_oval(cx+dx-r, cy+dy-r,
                                        cx+dx+r, cy+dy+r,
                                        fill="white", outline="")
        # Flowers on grass
        random.seed(7)
        for _ in range(18):
            fx = random.randint(20, W-20)
            fy = random.randint(int(H*0.57), int(H*0.85))
            fc = random.choice(["#FF6B6B","#FFD166","#A29BFE","#FF9FF3"])
            self.canvas.create_oval(fx-5, fy-5, fx+5, fy+5,
                                    fill=fc, outline="")
            self.canvas.create_line(fx, fy+5, fx, fy+16,
                                    fill="#27AE60", width=2)

    # ── Level loading ─────────────────────────────────────────────────────────
    def _load_level(self):
        self._dismiss_popup()
        self.selected  = []
        self.animating = False
        self._clear_food()

        lvl = LEVELS[self.level_index]
        self.desired = lvl["desired"]
        self.multi   = lvl["multi"]
        n_items = len(lvl["choices"])
        self.level_lbl.config(text=f"Level {self.level_index + 1}")
        self.pile_lbl.config(text=f"{n_items} food items in the pile — find the right one! 🐾")

        # Show first desired item in thought bubble
        first = self.desired[0] if self.multi else self.desired
        self.puppy.show_thought(first)

        # Guide speech
        msg = random.choice(LEVEL_START_MSGS)
        self.puppy.say(msg, "idle")
        _speak(msg)

        # Place food items on right side in a grid-ish layout
        self._place_food(lvl["choices"])

    def _place_food(self, choices):
        W, H = self.W, self.H
        items = choices[:]
        random.shuffle(items)

        n      = len(items)
        cols   = min(n, 4)
        rows   = math.ceil(n / cols)
        fs     = max(28, min(W, H) // 14)
        cell_w = max(90, int(W * 0.52) // cols)
        cell_h = max(90, int(H * 0.55) // rows)
        # Icon fills ~80% of cell, so it never overflows into neighbours
        icon_px = int(min(cell_w, cell_h) * 0.80)
        start_x = int(W * 0.48)
        start_y = int(H * 0.22)

        for i, emoji in enumerate(items):
            col = i % cols
            row = i // cols
            x   = start_x + col * cell_w + cell_w // 2
            y   = start_y + row * cell_h + cell_h // 2

            img = _emoji_image(emoji, icon_px)
            if img:
                tag = f"food_{i}"
                cid = self.canvas.create_image(x, y, image=img,
                                               anchor="center", tags=tag)
                # Store image ref to prevent GC
                if not hasattr(self, '_food_img_refs'):
                    self._food_img_refs = []
                self._food_img_refs.append(img)
                # Bind click on the canvas item
                self.canvas.tag_bind(tag, "<Button-1>",
                                     lambda e, em=emoji, t=tag: self._on_canvas_food(em, t))
                # Hover highlight: slight scale-up effect via tag
                self.canvas.tag_bind(tag, "<Enter>",
                                     lambda e, t=tag: self.canvas.itemconfig(t))
                self.food_labels.append(("canvas", tag, cid))
            else:
                btn = tk.Button(
                    self.win, text=emoji,
                    font=("Segoe UI Emoji", fs),
                    bg=BG, relief="flat",
                    borderwidth=0, cursor="hand2",
                    activebackground=BG, highlightthickness=0,
                )
                btn_size = icon_px + 8
                btn.place(x=x - btn_size // 2, y=y - btn_size // 2,
                          width=btn_size, height=btn_size)
                btn.config(command=lambda e=emoji, b=btn: self._on_click(e, b))
                self.food_labels.append(("widget", btn, None))

    def _on_canvas_food(self, emoji, tag):
        """Click handler for canvas-image food items."""
        if self.animating:
            return
        self.animating = True
        # Find canvas item position for animation start
        cid_list = self.canvas.find_withtag(tag)
        if cid_list:
            bx, by = self.canvas.coords(cid_list[0])
            bx, by = int(bx), int(by)
        else:
            bx, by = self.W // 2, self.H // 2

        # Disable all food items during animation
        for item in self.food_labels:
            if item[0] == "canvas":
                self.canvas.tag_unbind(item[1], "<Button-1>")

        tx = int(self.W * 0.32)
        ty = int(self.H * 0.52)
        steps = 18
        xs = [int(bx + (tx - bx) * i / steps) for i in range(steps + 1)]
        ys = [int(by + (ty - by) * i / steps) for i in range(steps + 1)]

        fly_px = max(56, min(self.W, self.H) // 7)
        fly_img = _emoji_image(emoji, fly_px)
        if fly_img:
            fly_id = self.canvas.create_image(bx, by, image=fly_img,
                                              anchor="center", tags="fly_item")
            self.canvas._fly_img_ref = fly_img
        else:
            fly_id = None

        def _step(i):
            if i > steps:
                if fly_id:
                    self.canvas.delete("fly_item")
                self._evaluate(emoji)
                return
            if fly_id:
                self.canvas.coords(fly_id, xs[i], ys[i])
            self.win.after(25, lambda: _step(i + 1))

        _step(0)

    def _clear_food(self):
        for item in self.food_labels:
            try:
                if item[0] == "canvas":
                    self.canvas.delete(item[1])   # delete by tag
                else:
                    item[1].destroy()             # destroy widget
            except Exception:
                pass
        self.food_labels = []
        self._food_img_refs = []   # release image refs

    # ── Click handler ─────────────────────────────────────────────────────────
    def _on_click(self, emoji, btn):
        if self.animating:
            return
        self.animating = True

        # Animate food sliding toward puppy
        bx = btn.winfo_x() + btn.winfo_width()  // 2
        by = btn.winfo_y() + btn.winfo_height() // 2
        tx = int(self.W * 0.32)
        ty = int(self.H * 0.52)

        steps = 18
        xs = [int(bx + (tx - bx) * i / steps) for i in range(steps+1)]
        ys = [int(by + (ty - by) * i / steps) for i in range(steps+1)]

        # Create a floating label for the animation
        fly_px = max(56, min(self.W, self.H) // 7)
        fly_img = _emoji_image(emoji, fly_px)
        if fly_img:
            fl = tk.Label(self.win, image=fly_img, bg=BG, borderwidth=0)
            fl._img_ref = fly_img
        else:
            fl = tk.Label(self.win, text=emoji,
                          font=("Segoe UI Emoji", max(28, min(self.W,self.H)//14)),
                          bg=BG)
        fl.place(x=bx, y=by)

        def _step(i):
            if i > steps:
                fl.destroy()
                self._evaluate(emoji)
                return
            fl.place(x=xs[i] - fl.winfo_width()//2,
                     y=ys[i] - fl.winfo_height()//2)
            self.win.after(25, lambda: _step(i+1))

        btn.config(state="disabled")
        _step(0)

    # ── Evaluation ────────────────────────────────────────────────────────────
    def _evaluate(self, emoji):
        if self.multi:
            self._eval_multi(emoji)
        else:
            self._eval_single(emoji)

    def _eval_single(self, emoji):
        if emoji == self.desired:
            self._happy()
        elif emoji in DOG_FOODS:
            self._wrong_food()   # safe food, just not what puppy wants right now
        else:
            self._sad()          # harmful / bad food for dogs

    def _eval_multi(self, emoji):
        needed = self.desired if isinstance(self.desired, list) else [self.desired]
        if emoji in needed and emoji not in self.selected:
            self.selected.append(emoji)
            remaining = [x for x in needed if x not in self.selected]
            if remaining:
                # More items needed
                self.puppy.show_thought(remaining[0])
                msg = random.choice(MULTI_HINTS)
                self.puppy.say(msg, "idle")
                _speak(msg)
                self.animating = False
                # Re-enable food items
                for item in self.food_labels:
                    if item[0] == "canvas":
                        self.canvas.tag_bind(item[1], "<Button-1>",
                            lambda e, em=item[1]: self._on_canvas_food(em, item[1]))
                    else:
                        item[1].config(state="normal")
            else:
                self._happy()
        else:
            self._sad()

    def _happy(self):
        msg = random.choice(HAPPY_MSGS)
        self.puppy.say(msg, "happy")
        self.puppy.bounce(cycles=4)
        _speak(msg)
        for freq in [523, 659, 784, 1047]:
            _beep(freq, 140)
        self._show_popup("🎉 " + msg, "#06D6A0", "#EAFAF1",
                         on_close=self._advance)

    def _sad(self):
        msg = random.choice(SAD_MSGS)
        self.puppy.say(msg, "crying")
        self.puppy.shake(cycles=3)
        _speak(msg)
        _beep(200, 350)
        self._show_popup("😢 " + msg, "#FF6B6B", "#FEF0EF",
                         on_close=self._reset_level)

    def _wrong_food(self):
        msg = random.choice(WRONG_FOOD_MSGS)
        self.puppy.say(msg, "sad")
        self.puppy.shake(cycles=2)
        _speak(msg)
        _beep(400, 250)
        self._show_popup("🤔 " + msg, "#FDCB6E", "#FFFBF0",
                         on_close=self._reset_level)

    def _reset_level(self):
        self.animating = False
        self._load_level()

    def _advance(self):
        self.animating = False
        if self.level_index < len(LEVELS) - 1:
            self.level_index += 1
            self._load_level()
        else:
            msg = COMPLETE_MSG
            self.puppy.say(msg, "excited")
            self.puppy.bounce(cycles=6)
            _speak(msg)
            self._show_popup("🏆 " + msg, "#A29BFE", "#F5F0FF")

    # ── Popup ─────────────────────────────────────────────────────────────────
    def _show_popup(self, message, fg, bg,
                    duration_ms=4000, on_close=None):
        self._dismiss_popup()
        popup = tk.Toplevel(self.win)
        popup.overrideredirect(True)
        popup.attributes("-topmost", True)
        self.active_popup = popup

        pw, ph = 520, 150
        wx = self.win.winfo_rootx()
        wy = self.win.winfo_rooty()
        ww = self.win.winfo_width()
        wh = self.win.winfo_height()
        popup.geometry(f"{pw}x{ph}+{wx+(ww-pw)//2}+{wy+(wh-ph)//2}")
        popup.configure(bg=bg)

        tk.Frame(popup, bg=bg,
                 highlightbackground=fg,
                 highlightthickness=3).place(x=0,y=0,width=pw,height=ph)

        tk.Label(popup, text=message,
                 font=("Arial", 16, "bold"),
                 fg=fg, bg=bg, wraplength=pw-30).place(
                     relx=0.5, rely=0.5, anchor="center")

        def _close():
            if self.active_popup is popup:
                self.active_popup = None
            try: popup.destroy()
            except Exception: pass
            if on_close: on_close()

        popup.after(duration_ms, _close)
        popup.bind("<Button-1>", lambda e: _close())

    def _dismiss_popup(self):
        if self.active_popup:
            try: self.active_popup.destroy()
            except Exception: pass
            self.active_popup = None

    # ── Navigation ────────────────────────────────────────────────────────────
    def _prev_level(self):
        if self.animating: return
        if self.level_index > 0:
            self.level_index -= 1
            self._load_level()

    def _next_level(self):
        if self.animating: return
        if self.level_index < len(LEVELS)-1:
            self.level_index += 1
            self._load_level()

    def _go_home(self):
        self._dismiss_popup()
        self._clear_food()
        self.win.destroy()
        if self.root:
            self.root.deiconify()


# ── Public launch function ────────────────────────────────────────────────────
def launch_activity(root=None):
    standalone = root is None
    if standalone:
        root = tk.Tk()
        root.withdraw()
    else:
        root.withdraw()

    win = tk.Toplevel(root)
    win.title("🐶 Feed the Puppy")
    win.configure(bg=BG)

    try: win.state("zoomed")
    except Exception: pass
    try: win.attributes("-zoomed", True)
    except Exception: pass

    win.update_idletasks()
    if win.winfo_width() < 200:
        sw = win.winfo_screenwidth()
        sh = win.winfo_screenheight()
        win.geometry(f"{sw}x{sh}+0+0")
        win.update_idletasks()

    FeedPuppyGame(win, root)

    if standalone:
        win.protocol("WM_DELETE_WINDOW",
                     lambda: (win.destroy(), root.destroy()))
        root.mainloop()


if __name__ == "__main__":
    launch_activity()
