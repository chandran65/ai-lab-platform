# =========================================================
# MINDORA 3D — Turtle Path Game  v4.0
#
# FIXES & ENHANCEMENTS:
#   - Sound: level-change cancels any playing sounds (no bleed-over)
#   - Rocks: animated 3D boulders with shimmer, crack lightning,
#            floating dust particles, and bounce idle animation
#
# HOW TO PLAY:
#   1. Click arrow buttons (or arrow keys) to queue moves
#   2. Click  ▶ EXECUTE MOVES  to run the queued path
#   3. Hit a wall / rock → path is WRONG → auto-reset
#   4. Reach HOME → celebrate → auto-advance level
#   5. Use ◀ PREV / NEXT ▶ buttons to jump between levels
# =========================================================

import tkinter as tk
from tkinter import Canvas
import random, math, threading, time

try:
    import winsound
    SOUND_AVAILABLE = True
except ImportError:
    SOUND_AVAILABLE = False

# ─────────────────────────────────────────────────────────
# PALETTE
# ─────────────────────────────────────────────────────────
C = {
    "bg0":       "#050d1a",
    "bg1":       "#0a1628",
    "bg2":       "#0f2040",
    "panel":     "#0c1c30",
    "panel_bd":  "#1a3a5c",
    "tile_a":    "#1a6b3c",
    "tile_b":    "#1d7a44",
    "tile_sh":   "#0f4025",
    "tile_hl":   "#3dba6f",
    "goal_yel":  "#ffd700",
    "goal_amb":  "#ff8c00",
    "obs_gray":  "#4a5568",
    "obs_dark":  "#2d3748",
    "obs_lite":  "#718096",
    "white":     "#f0f6ff",
    "lo":        "#6b8caa",
    "gold":      "#ffd700",
    "cyan":      "#00e5ff",
    "green":     "#00e676",
    "red":       "#ff1744",
    "orange":    "#ff9100",
    "purple":    "#d500f9",
    "blue":      "#2979ff",
    "teal":      "#1de9b6",
    "pink":      "#f50057",
    "btn_move":  "#00c853",
    "btn_rst":   "#d50000",
    "btn_snd":   "#0091ea",
    "btn_nav":   "#37474f",
    "queue_bg":  "#071220",
    "queue_bd":  "#1a3a5c",
}

# ─────────────────────────────────────────────────────────
# GRID / LEVEL SETUP
# ─────────────────────────────────────────────────────────
COLS, ROWS, CELL = 8, 6, 88
DEPTH = 11

LEVELS = [
    {
        "name": "Meadow", "emoji": "🌿", "diff": "EASY",
        "start": (0,0), "goal": (7,5),
        "obstacles": [(2,1),(3,2),(4,3)],
        "hint": "A gentle stroll — build your path!",
        "sky": ("#0a2015","#1a4030"),
    },
    {
        "name": "Forest", "emoji": "🌲", "diff": "MEDIUM",
        "start": (0,0), "goal": (7,4),
        "obstacles": [(1,1),(2,1),(3,1),(4,1),(4,2),(4,3),(2,3),(2,4)],
        "hint": "Weave through the trees carefully!",
        "sky": ("#0a1a0a","#153020"),
    },
    {
        "name": "Canyon", "emoji": "🏜️",  "diff": "TRICKY",
        "start": (0,2), "goal": (7,3),
        "obstacles": [(1,0),(1,1),(1,3),(1,4),(1,5),
                      (3,0),(3,1),(3,3),(3,4),
                      (5,1),(5,2),(5,4),(5,5)],
        "hint": "Squeeze through the canyon gaps!",
        "sky": ("#1a1000","#302010"),
    },
    {
        "name": "Volcano", "emoji": "🌋", "diff": "HARD",
        "start": (0,5), "goal": (7,0),
        "obstacles": [(1,3),(1,4),(2,1),(2,2),(3,3),(3,4),
                      (4,1),(4,2),(5,3),(5,4),(6,2),(6,3)],
        "hint": "Climb to safety — one wrong step resets!",
        "sky": ("#1a0505","#300a0a"),
    },
    {
        "name": "Galaxy", "emoji": "🌌", "diff": "EXPERT",
        "start": (0,0), "goal": (7,5),
        "obstacles": [(1,1),(1,2),(2,0),(2,3),(3,1),(3,4),
                      (4,2),(4,5),(5,0),(5,3),(6,1),(6,4),(3,2),(5,4)],
        "hint": "Master the cosmos — plan every move!",
        "sky": ("#050010","#0a0020"),
    },
]

DIRS = {"UP":(0,-1),"DOWN":(0,1),"LEFT":(-1,0),"RIGHT":(1,0)}
DIR_SYMBOLS = {"UP":"↑","DOWN":"↓","LEFT":"←","RIGHT":"→"}

# ─────────────────────────────────────────────────────────
# SOUND  —  with stop-all on level change
# ─────────────────────────────────────────────────────────
sound_on      = True
_sound_lock   = threading.Lock()
_sound_stop   = threading.Event()   # set this to abort any playing thread

def _play(notes):
    if not SOUND_AVAILABLE:
        return
    stop_evt = _sound_stop        # capture reference
    def _r():
        for f, d in notes:
            if stop_evt.is_set():
                return
            try:
                winsound.Beep(max(37, min(32767, f)), max(10, d))
            except Exception:
                pass
    threading.Thread(target=_r, daemon=True).start()

def stop_sounds():
    """Cancel any in-flight sound sequence."""
    _sound_stop.set()
    # small pause, then re-arm for next use
    def _rearm():
        time.sleep(0.05)
        _sound_stop.clear()
    threading.Thread(target=_rearm, daemon=True).start()

SOUNDS = {
    "add":   [(660,60),(880,60)],
    "clear": [(440,70),(330,70)],
    "move":  [(523,55),(659,55)],
    "wall":  [(330,120),(250,150)],
    "rock":  [(370,100),(280,130)],
    "win":   [(523,120),(659,120),(784,130),(1047,260)],
    "level": [(659,100),(784,100),(988,110),(1319,200)],
    "reset": [(550,70),(440,70),(330,80)],
    "sndon": [(880,70),(1047,80)],
    "sndoff":[(440,90)],
}

def play(k):
    if sound_on:
        _play(SOUNDS.get(k, []))

# ─────────────────────────────────────────────────────────
# WINDOW  &  CANVAS
# ─────────────────────────────────────────────────────────
root = tk.Tk()
root.title("MINDORA 3D — Turtle Path Game")
root.configure(bg=C["bg0"])
root.state("zoomed")
root.update_idletasks()

W = root.winfo_screenwidth()
H = root.winfo_screenheight()

canvas = Canvas(root, width=W, height=H, highlightthickness=0, bg=C["bg0"])
canvas.pack(fill="both", expand=True)

# ─────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────
def px(h):
    h = h.lstrip("#")
    return int(h[:2],16), int(h[2:4],16), int(h[4:],16)

def lerpC(a, b, t):
    a, b = px(a), px(b)
    return "#{:02x}{:02x}{:02x}".format(
        int(a[0]+(b[0]-a[0])*t),
        int(a[1]+(b[1]-a[1])*t),
        int(a[2]+(b[2]-a[2])*t))

# ─────────────────────────────────────────────────────────
# LAYOUT CONSTANTS
# ─────────────────────────────────────────────────────────
GRID_W = COLS * CELL
GRID_H = ROWS * CELL

PANEL_W = 260
PANEL_X = 18
PANEL_Y = 20
PANEL_H = H - 40

GRID_X = PANEL_X + PANEL_W + 30
GRID_Y = 140

RINFO_X = GRID_X + GRID_W + 30
RINFO_W = W - RINFO_X - 18

# ─────────────────────────────────────────────────────────
# GRADIENT BACKGROUND
# ─────────────────────────────────────────────────────────
def draw_gradient(top="#050d1a", bot="#0f2040"):
    canvas.delete("bg")
    for i in range(H):
        canvas.create_line(0,i,W,i, fill=lerpC(top,bot,i/H), tags="bg")

draw_gradient()

# ─────────────────────────────────────────────────────────
# STAR FIELD
# ─────────────────────────────────────────────────────────
star_ids = []
def draw_stars(count=200):
    global star_ids
    for s in star_ids:
        canvas.delete(s)
    star_ids.clear()
    for _ in range(count):
        x = random.randint(0, W)
        y = random.randint(0, H)
        r = random.uniform(0.4, 2.2)
        br = random.randint(160, 255)
        col = "#{0:02x}{0:02x}{0:02x}".format(br)
        star_ids.append(canvas.create_oval(x-r,y-r,x+r,y+r, fill=col, outline=""))

draw_stars()

# ─────────────────────────────────────────────────────────
# GAME STATE
# ─────────────────────────────────────────────────────────
current_level = 0
player        = [0, 0]
game_won      = False
steps         = 0
move_queue    = []
executing     = False
float_offset  = 0.0
confetti_ids  = []
pulse_ph      = 0.0
wave          = 0.0

# ── Rock animation state ──────────────────────────────────
rock_phase    = {}   # (c,r) → float phase offset per rock
rock_shimmer  = {}   # (c,r) → shimmer intensity 0..1
rock_crack    = {}   # (c,r) → lightning crack phase
rock_dust     = {}   # (c,r) → list of dust particles {x,y,dx,dy,life,maxlife,r}

def lv():
    return LEVELS[current_level]

# ─────────────────────────────────────────────────────────
# CELL → PIXEL
# ─────────────────────────────────────────────────────────
def cell_px(c, r):
    return GRID_X + c*CELL, GRID_Y + r*CELL

# ─────────────────────────────────────────────────────────
# 3-D TILE DRAW
# ─────────────────────────────────────────────────────────
def draw_3d_tile(c, r, fill, hl, sh, tag="grid"):
    x1, y1 = cell_px(c, r)
    x2, y2 = x1+CELL, y1+CELL
    d = DEPTH
    canvas.create_polygon(x2,y1,x2+d,y1-d,x2+d,y2-d,x2,y2, fill=sh, outline="", tags=tag)
    canvas.create_polygon(x1,y2,x2,y2,x2+d,y2-d,x1+d,y2-d, fill=sh, outline="", tags=tag)
    canvas.create_rectangle(x1,y1,x2,y2, fill=fill, outline=sh, width=1, tags=tag)
    canvas.create_line(x1+2,y1+2,x2-2,y1+2, fill=hl, width=1, tags=tag)
    canvas.create_line(x1+2,y1+2,x1+2,y2-2, fill=hl, width=1, tags=tag)

# ─────────────────────────────────────────────────────────
# DRAW GRID
# ─────────────────────────────────────────────────────────
def draw_grid():
    canvas.delete("grid")
    obs = lv()["obstacles"]
    st  = lv()["start"]
    for r in range(ROWS):
        for c in range(COLS):
            if (c, r) in obs:
                continue
            base = C["tile_a"] if (r+c)%2==0 else C["tile_b"]
            draw_3d_tile(c, r, base, C["tile_hl"], C["tile_sh"])
    sx, sy = cell_px(*st)
    canvas.create_rectangle(sx+5,sy+5,sx+CELL-5,sy+CELL-5,
        fill="#0a2a44", outline=C["cyan"], width=2, tags="grid")
    canvas.create_text(sx+CELL//2, sy+CELL//2, text="START",
        font=("Consolas",8,"bold"), fill=C["cyan"], tags="grid")

# ─────────────────────────────────────────────────────────
# DRAW GOAL
# ─────────────────────────────────────────────────────────
def draw_goal():
    canvas.delete("goal")
    gx, gy = cell_px(*lv()["goal"])
    cx, cy = gx+CELL//2, gy+CELL//2
    for rr in [34, 28, 22]:
        canvas.create_oval(cx-rr,cy-rr,cx+rr,cy+rr,
            outline=C["goal_yel"], width=2, tags="goal")
    canvas.create_rectangle(cx-16,cy-8,cx+16,cy+18,
        fill="#c0871a", outline=C["goal_amb"], width=2, tags="goal")
    canvas.create_rectangle(cx-6,cy+4,cx+6,cy+18,
        fill="#5c3a0a", outline="", tags="goal")
    canvas.create_rectangle(cx-13,cy-4,cx-5,cy+2,
        fill="#87ceeb", outline=C["goal_yel"], width=1, tags="goal")
    canvas.create_rectangle(cx+5,cy-4,cx+13,cy+2,
        fill="#87ceeb", outline=C["goal_yel"], width=1, tags="goal")
    canvas.create_polygon(cx-20,cy-8, cx,cy-28, cx+20,cy-8,
        fill="#b54700", outline=C["goal_amb"], width=2, tags="goal")
    canvas.create_rectangle(cx+8,cy-30,cx+14,cy-16,
        fill="#8b3a00", outline="", tags="goal")
    canvas.create_oval(cx+9,cy-38,cx+15,cy-31, fill="#ccc", outline="", tags="goal")
    canvas.create_oval(cx+7,cy-44,cx+14,cy-37, fill="#ddd", outline="", tags="goal")
    canvas.create_text(cx, cy+30, text="HOME",
        font=("Consolas",9,"bold"), fill=C["gold"], tags="goal")

# ─────────────────────────────────────────────────────────
# INIT ROCK ANIMATION STATE
# ─────────────────────────────────────────────────────────
def init_rock_state():
    global rock_phase, rock_shimmer, rock_crack, rock_dust
    rock_phase   = {}
    rock_shimmer = {}
    rock_crack   = {}
    rock_dust    = {}
    for (ox, oy) in lv()["obstacles"]:
        key = (ox, oy)
        rock_phase[key]   = random.uniform(0, math.pi*2)
        rock_shimmer[key] = 0.0
        rock_crack[key]   = random.uniform(0, math.pi*2)
        rock_dust[key]    = []
        # seed initial dust particles
        x1, y1 = cell_px(ox, oy)
        cx, cy  = x1 + CELL//2, y1 + CELL//2
        for _ in range(6):
            rock_dust[key].append({
                "x": cx + random.randint(-18,18),
                "y": cy + random.randint(-10,10),
                "dx": random.uniform(-0.4, 0.4),
                "dy": random.uniform(-0.8, -0.2),
                "life": random.randint(20, 60),
                "maxlife": 60,
                "r": random.uniform(1.5, 3.5),
            })

# ─────────────────────────────────────────────────────────
# ANIMATED 3-D BOULDER OBSTACLE  (called each frame)
# ─────────────────────────────────────────────────────────
_rock_anim_phase = 0.0   # global tick driven from animate()

def draw_obstacles():
    """Draw all obstacles using current animation state."""
    canvas.delete("obs")
    t = _rock_anim_phase
    for (ox, oy) in lv()["obstacles"]:
        key    = (ox, oy)
        ph     = rock_phase.get(key, 0)
        sh_int = rock_shimmer.get(key, 0)
        cr_ph  = rock_crack.get(key, 0)

        x1, y1 = cell_px(ox, oy)
        # gentle vertical bob
        bob    = math.sin(t * 1.1 + ph) * 3.0
        x1c, y1c = x1, y1 + bob
        x2c, y2c = x1c + CELL, y1c + CELL
        cx     = x1c + CELL//2
        cy     = y1c + CELL//2
        d      = DEPTH

        # ── shadow beneath boulder ──────────────────────
        shadow_r = 28 + math.sin(t*1.1 + ph)*2
        canvas.create_oval(
            cx - shadow_r, y1c + CELL - 6,
            cx + shadow_r, y1c + CELL + 8,
            fill="#000000", outline="", tags="obs")

        # ── 3D right face (dark) ───────────────────────
        canvas.create_polygon(
            x2c-6, y1c+6,   x2c-6+d, y1c+6-d,
            x2c-6+d, y2c-6-d, x2c-6, y2c-6,
            fill="#1a1a2e", outline="", tags="obs")

        # ── 3D top face (slightly lighter) ────────────
        canvas.create_polygon(
            x1c+6, y1c+6,   x2c-6, y1c+6,
            x2c-6+d, y1c+6-d, x1c+6+d, y1c+6-d,
            fill="#2a2a3e", outline="", tags="obs")

        # ── main boulder body (rounded polygon) ────────
        # layered ovals for depth illusion
        layers = [
            (30, "#1c1c2e"),
            (27, "#252540"),
            (24, "#303050"),
            (21, "#3a3a5c"),
            (18, "#464666"),
            (15, "#505070"),
            (11, "#5a5a7a"),
        ]
        for rad, col in layers:
            canvas.create_oval(
                cx-rad, cy-rad+4,
                cx+rad, cy+rad-4,
                fill=col, outline="", tags="obs")

        # ── shimmer highlight layer ─────────────────────
        shimmer_a = (math.sin(t*3.0 + ph*2) + 1) / 2   # 0..1 pulsing
        sh_col = lerpC("#5050a0", "#c0c0ff", shimmer_a * 0.7)
        canvas.create_oval(
            cx-13, cy-14, cx+13, cy-4,
            fill=sh_col, outline="", tags="obs")

        # ── surface crack lines (animated lightning) ───
        crack_anim = math.sin(t*2.5 + cr_ph)
        crack_bright = int(60 + abs(crack_anim) * 120)
        crack_col = "#{0:02x}{0:02x}{1:02x}".format(crack_bright, crack_bright+20)
        # main diagonal crack
        canvas.create_line(
            cx-9, cy-14,  cx-3, cy-4,  cx+5, cy+2,  cx+2, cy+12,
            fill=crack_col, width=2, smooth=True, tags="obs")
        # secondary crack
        canvas.create_line(
            cx-2, cy-8,  cx+7, cy-2,
            fill=crack_col, width=1, smooth=True, tags="obs")
        # lightning flash: random faint branch
        if crack_anim > 0.7:
            canvas.create_line(
                cx-3, cy-4,  cx-10, cy+4,
                fill="#8888ff", width=1, tags="obs")

        # ── specular highlight dot ──────────────────────
        spec_x = cx - 9 + math.sin(t*0.8 + ph)*3
        spec_y = cy - 16 + math.cos(t*0.8 + ph)*2
        spec_r  = 3 + math.sin(t*2 + ph)
        canvas.create_oval(
            spec_x-spec_r, spec_y-spec_r,
            spec_x+spec_r, spec_y+spec_r,
            fill="#e0e0ff", outline="", tags="obs")

        # ── rim outline ────────────────────────────────
        canvas.create_oval(
            cx-30, cy-30+4, cx+30, cy+30-4,
            fill="", outline="#0a0a1a", width=2, tags="obs")

        # ── dust particles ────────────────────────────
        dust = rock_dust.get(key, [])
        alive = []
        for p in dust:
            p["x"]   += p["dx"]
            p["y"]   += p["dy"]
            p["life"] -= 1
            if p["life"] > 0:
                alive.append(p)
                frac = p["life"] / p["maxlife"]
                gray = int(80 + frac * 80)
                col2 = "#{0:02x}{0:02x}{0:02x}".format(gray, gray, gray+20)
                pr = max(0.5, p["r"] * frac)
                canvas.create_oval(
                    p["x"]-pr, p["y"]-pr,
                    p["x"]+pr, p["y"]+pr,
                    fill=col2, outline="", tags="obs")
        # respawn dead particles
        while len(alive) < 5:
            alive.append({
                "x": cx + random.randint(-20, 20),
                "y": cy + random.randint(-8, 12),
                "dx": random.uniform(-0.35, 0.35),
                "dy": random.uniform(-0.7, -0.15),
                "life": random.randint(25, 70),
                "maxlife": 70,
                "r": random.uniform(1.5, 4.0),
            })
        rock_dust[key] = alive

# ─────────────────────────────────────────────────────────
# DRAW TURTLE
# ─────────────────────────────────────────────────────────
def draw_turtle(flash=False):
    canvas.delete("turtle")
    cx = GRID_X + player[0]*CELL + CELL//2
    cy = GRID_Y + player[1]*CELL + CELL//2 + int(float_offset)
    fl = "#ff4444" if flash else None

    canvas.create_oval(cx-30, cy+30, cx+30, cy+44,
        fill="#000", stipple="gray25", outline="", tags="turtle")

    shells = [
        ("#0d4a22",36),("#155e2c",32),("#1a7a3a",28),
        ("#229948",24),("#2bbb5a",20),("#39d46e",16),
    ]
    for col, rad in shells:
        c2 = fl or col
        canvas.create_oval(cx-rad, cy-rad+4, cx+rad, cy+rad-4,
            fill=c2, outline="", tags="turtle")

    canvas.create_oval(cx-36, cy-32, cx+36, cy+28,
        fill="", outline="#0a3018", width=2, tags="turtle")

    for dx, dy in [(0,-16),(-14,-6),(14,-6),(-14,6),(14,6),(0,14)]:
        canvas.create_oval(cx+dx-8, cy+dy-6, cx+dx+8, cy+dy+6,
            fill="#1a7a3a", outline="#0a3018", width=1, tags="turtle")

    canvas.create_rectangle(cx-8, cy-48, cx+8, cy-28,
        fill="#4ab870", outline="#0a3018", width=1, tags="turtle")
    canvas.create_oval(cx-16, cy-70, cx+16, cy-40,
        fill="#56c97a", outline="#0a3018", width=2, tags="turtle")

    for ex in [-7, 7]:
        canvas.create_oval(cx+ex-5, cy-62, cx+ex+5, cy-52,
            fill="white", outline="#0a3018", width=1, tags="turtle")
        canvas.create_oval(cx+ex-3, cy-60, cx+ex+3, cy-54,
            fill="#111", tags="turtle")
        canvas.create_oval(cx+ex, cy-59, cx+ex+2, cy-57,
            fill="white", tags="turtle")

    canvas.create_arc(cx-8, cy-50, cx+8, cy-40,
        start=200, extent=140, style="arc", outline="#0a3018", width=1, tags="turtle")

    for nx2 in [-3, 3]:
        canvas.create_oval(cx+nx2-1, cy-45, cx+nx2+1, cy-43,
            fill="#0a3018", outline="", tags="turtle")

    for lx, ly in [(-38,-16),(38,-16),(-38,10),(38,10)]:
        canvas.create_oval(cx+lx-10, cy+ly-8, cx+lx+10, cy+ly+8,
            fill="#39d46e", outline="#0a3018", width=1, tags="turtle")
        for tx in [-6, 0, 6]:
            canvas.create_oval(cx+lx+tx-3, cy+ly+6, cx+lx+tx+3, cy+ly+12,
                fill="#2bbb5a", outline="", tags="turtle")

    canvas.create_oval(cx-5, cy+28, cx+5, cy+42,
        fill="#39d46e", outline="#0a3018", width=1, tags="turtle")

# ─────────────────────────────────────────────────────────
# FULL REDRAW
# ─────────────────────────────────────────────────────────
def redraw():
    draw_grid()
    draw_goal()
    draw_obstacles()
    draw_turtle()

# ─────────────────────────────────────────────────────────
# HEADER
# ─────────────────────────────────────────────────────────
def draw_header():
    canvas.delete("hdr")
    canvas.create_rectangle(GRID_X-10,10,GRID_X+GRID_W+10,125,
        fill="#05111e", outline=C["panel_bd"], width=2, tags="hdr")
    for i, col in enumerate([C["cyan"], C["teal"], C["blue"]]):
        canvas.create_line(GRID_X+i*6,10,GRID_X+i*6,125, fill=col, width=2, tags="hdr")
        canvas.create_line(GRID_X+GRID_W+10-i*6,10,GRID_X+GRID_W+10-i*6,125, fill=col, width=2, tags="hdr")
    canvas.create_text(GRID_X+GRID_W//2, 58,
        text="MINDORA 3D", font=("Consolas",40,"bold"), fill=C["gold"], tags="hdr")
    canvas.create_text(GRID_X+GRID_W//2, 95,
        text="T U R T L E   P A T H   A D V E N T U R E",
        font=("Consolas",12), fill=C["lo"], tags="hdr")

draw_header()

# ─────────────────────────────────────────────────────────
# LEFT PANEL
# ─────────────────────────────────────────────────────────
pf = tk.Frame(root, bg=C["panel"],
              highlightbackground=C["panel_bd"], highlightthickness=2)
pf.place(x=PANEL_X, y=PANEL_Y, width=PANEL_W, height=PANEL_H)

def lbl(parent, text, font, fg, bg=None, **kw):
    return tk.Label(parent, text=text, font=font,
                    fg=fg, bg=bg or C["panel"], **kw)

lbl(pf, "MINDORA 3D", ("Consolas",20,"bold"), C["gold"]).pack(pady=(18,2))
lbl(pf, "TURTLE PATH GAME", ("Consolas",9), C["lo"]).pack(pady=(0,10))
tk.Frame(pf, bg=C["panel_bd"], height=1).pack(fill="x", padx=12, pady=4)

lbl_level = lbl(pf, "LEVEL 1 · Meadow", ("Consolas",13,"bold"), C["cyan"])
lbl_level.pack(pady=4)
lbl_diff  = lbl(pf, "● EASY", ("Consolas",10), C["green"])
lbl_diff.pack()

dot_row = tk.Frame(pf, bg=C["panel"]); dot_row.pack(pady=8)
dot_lbls = []
for i in range(5):
    d = tk.Label(dot_row, text="◆", font=("Arial",16), bg=C["panel"], fg=C["lo"])
    d.pack(side="left", padx=3)
    dot_lbls.append(d)

tk.Frame(pf, bg=C["panel_bd"], height=1).pack(fill="x", padx=12, pady=4)

mbox = tk.Frame(pf, bg="#071828",
                highlightbackground=C["panel_bd"], highlightthickness=1)
mbox.pack(fill="x", padx=14, pady=8)
lbl_msg = tk.Label(mbox, text="Queue your moves then press MOVE!",
                   font=("Consolas",11,"bold"), bg="#071828",
                   fg=C["white"], wraplength=210, justify="center")
lbl_msg.pack(padx=8, pady=10)

tk.Frame(pf, bg=C["panel_bd"], height=1).pack(fill="x", padx=12, pady=2)

lbl(pf, "MOVE QUEUE", ("Consolas",10), C["lo"]).pack(pady=(8,2))

queue_box = tk.Frame(pf, bg=C["queue_bg"],
                     highlightbackground=C["queue_bd"], highlightthickness=1)
queue_box.pack(fill="x", padx=14, pady=4)

lbl_queue = tk.Label(queue_box, text="[ empty ]",
                     font=("Consolas",12,"bold"),
                     bg=C["queue_bg"], fg=C["cyan"],
                     wraplength=210, justify="center")
lbl_queue.pack(padx=6, pady=8)

def refresh_queue():
    if move_queue:
        lbl_queue.config(text=" → ".join(DIR_SYMBOLS[d] for d in move_queue), fg=C["cyan"])
    else:
        lbl_queue.config(text="[ empty ]", fg=C["lo"])

tk.Frame(pf, bg=C["panel_bd"], height=1).pack(fill="x", padx=12, pady=6)

lbl(pf, "ADD MOVES", ("Consolas",10), C["lo"]).pack(pady=(2,6))

def _arrow_btn(parent, text, color, direction, side=None, fill_=False):
    b = tk.Button(parent, text=text,
                  font=("Consolas",14,"bold"),
                  bg=color, fg=C["white"],
                  activebackground=color, activeforeground=C["white"],
                  relief="flat", bd=0, cursor="hand2",
                  command=lambda: add_move(direction))
    if side:
        b.pack(side=side, ipadx=12, ipady=6, padx=4)
    else:
        kw = dict(fill="x") if fill_ else {}
        b.pack(ipadx=12, ipady=6, pady=3, padx=20, **kw)
    return b

_arrow_btn(pf, "▲  UP",    "#1565c0", "UP",    fill_=True)
lr = tk.Frame(pf, bg=C["panel"]); lr.pack(pady=2)
_arrow_btn(lr, "◀  LEFT",  "#b84000", "LEFT",  side="left")
_arrow_btn(lr, "RIGHT ▶",  "#6a1b9a", "RIGHT", side="left")
_arrow_btn(pf, "▼  DOWN",  "#00695c", "DOWN",  fill_=True)

tk.Frame(pf, bg=C["panel_bd"], height=1).pack(fill="x", padx=12, pady=8)

def _ctrl_btn(parent, text, color, cmd, pady_=4):
    b = tk.Button(parent, text=text,
                  font=("Consolas",13,"bold"),
                  bg=color, fg=C["white"],
                  activebackground=color, activeforeground=C["white"],
                  relief="flat", bd=0, cursor="hand2",
                  command=cmd)
    b.pack(ipadx=14, ipady=7, pady=pady_, padx=16, fill="x")
    return b

btn_move  = _ctrl_btn(pf, "▶  EXECUTE MOVES",  C["btn_move"],  lambda: execute_queue())
btn_clear = _ctrl_btn(pf, "✕  CLEAR QUEUE",     "#455a64",      lambda: clear_queue())
btn_rst   = _ctrl_btn(pf, "↺  RESET LEVEL",     C["btn_rst"],   lambda: do_reset())

tk.Frame(pf, bg=C["panel_bd"], height=1).pack(fill="x", padx=12, pady=6)

nav_row = tk.Frame(pf, bg=C["panel"]); nav_row.pack(fill="x", padx=16, pady=4)
btn_prev_lv = tk.Button(nav_row, text="◀◀ PREV",
    font=("Consolas",11,"bold"), bg=C["btn_nav"], fg=C["white"],
    activebackground=C["btn_nav"], activeforeground=C["white"],
    relief="flat", bd=0, cursor="hand2", command=lambda: do_prev())
btn_prev_lv.pack(side="left", ipadx=6, ipady=6, expand=True, fill="x", padx=(0,4))

btn_next_lv = tk.Button(nav_row, text="NEXT ▶▶",
    font=("Consolas",11,"bold"), bg=C["btn_nav"], fg=C["white"],
    activebackground=C["btn_nav"], activeforeground=C["white"],
    relief="flat", bd=0, cursor="hand2", command=lambda: do_next())
btn_next_lv.pack(side="left", ipadx=6, ipady=6, expand=True, fill="x", padx=(4,0))

btn_snd = _ctrl_btn(pf, "♪  SOUND  ON", C["btn_snd"], lambda: toggle_snd(), pady_=6)

lbl_steps = lbl(pf, "Steps: 0", ("Consolas",11), C["lo"])
lbl_steps.pack(pady=6)
lbl(pf, "Arrow keys also add moves", ("Consolas",8), C["lo"]).pack(side="bottom", pady=10)

# ─────────────────────────────────────────────────────────
# RIGHT INFO PANEL
# ─────────────────────────────────────────────────────────
def draw_right_panel():
    canvas.delete("rpanel")
    rx = RINFO_X
    rw = RINFO_W
    if rw < 10: return
    canvas.create_rectangle(rx,140,rx+rw,H-20,
        fill="#05111e", outline=C["panel_bd"], width=2, tags="rpanel")
    canvas.create_text(rx+rw//2, 165, text="LEVELS",
        font=("Consolas",13,"bold"), fill=C["gold"], tags="rpanel")
    for i, lev in enumerate(LEVELS):
        y = 195 + i*68
        active  = (i == current_level)
        box_col = "#0a2a44" if active else "#071220"
        bd_col  = C["cyan"] if active else C["panel_bd"]
        canvas.create_rectangle(rx+10, y, rx+rw-10, y+56,
            fill=box_col, outline=bd_col, width=2 if active else 1, tags="rpanel")
        canvas.create_text(rx+rw//2, y+14,
            text=f"{lev['emoji']}  {lev['name']}",
            font=("Consolas",11,"bold"),
            fill=C["white"] if active else C["lo"], tags="rpanel")
        diff_col = {
            "EASY":C["green"],"MEDIUM":C["teal"],"TRICKY":C["orange"],
            "HARD":C["red"],"EXPERT":C["purple"]
        }.get(lev["diff"], C["lo"])
        canvas.create_text(rx+rw//2, y+36,
            text=lev["diff"], font=("Consolas",9), fill=diff_col, tags="rpanel")
        if active:
            canvas.create_text(rx+rw//2, y+50, text="▶ PLAYING",
                font=("Consolas",7), fill=C["cyan"], tags="rpanel")

draw_right_panel()

# ─────────────────────────────────────────────────────────
# UI UPDATE HELPERS
# ─────────────────────────────────────────────────────────
DIFF_COLORS = {
    "EASY":C["green"],"MEDIUM":C["teal"],"TRICKY":C["orange"],
    "HARD":C["red"],"EXPERT":C["purple"]
}

def update_ui():
    lv2 = lv()
    lbl_level.config(text=f"LEVEL {current_level+1} · {lv2['name']}")
    lbl_diff .config(text=f"● {lv2['diff']}", fg=DIFF_COLORS.get(lv2["diff"], C["white"]))
    for i, d in enumerate(dot_lbls):
        d.config(fg=C["gold"] if i<=current_level else C["lo"])
    lbl_steps.config(text=f"Steps: {steps}")
    refresh_queue()
    draw_right_panel()

def set_msg(txt, col=None):
    lbl_msg.config(text=txt, fg=col or C["white"])

# ─────────────────────────────────────────────────────────
# MOVE QUEUE LOGIC
# ─────────────────────────────────────────────────────────
def add_move(direction):
    if game_won or executing: return
    if len(move_queue) >= 20:
        set_msg("Queue full! Clear some moves.", C["orange"]); return
    move_queue.append(direction)
    play("add")
    refresh_queue()
    set_msg(f"Added {DIR_SYMBOLS[direction]}  —  queue: {len(move_queue)} move(s)", C["cyan"])

def clear_queue():
    move_queue.clear()
    play("clear")
    refresh_queue()
    set_msg("Queue cleared. Add new moves!", C["lo"])

# ─────────────────────────────────────────────────────────
# EXECUTE QUEUE
# ─────────────────────────────────────────────────────────
def execute_queue():
    global executing
    if game_won or executing: return
    if not move_queue:
        set_msg("Queue is empty! Add moves first.", C["orange"]); return
    executing = True
    btn_move.config(state="disabled")
    _step_index = [0]

    def do_step():
        global game_won, steps, executing
        i = _step_index[0]
        if i >= len(move_queue):
            executing = False
            btn_move.config(state="normal")
            if not game_won:
                set_msg("Wrong path! Resetting…", C["red"])
                play("wall")
                flash_turtle()
                root.after(900, do_reset_silent)
            return

        direction = move_queue[i]
        _step_index[0] += 1

        dx, dy = DIRS[direction]
        nx = player[0]+dx
        ny = player[1]+dy

        if nx<0 or nx>=COLS or ny<0 or ny>=ROWS:
            executing = False
            btn_move.config(state="normal")
            set_msg(f"Hit the boundary going {direction}! Resetting…", C["red"])
            play("wall"); flash_turtle()
            root.after(900, do_reset_silent)
            return

        if (nx, ny) in lv()["obstacles"]:
            executing = False
            btn_move.config(state="normal")
            set_msg(f"Hit a rock going {direction}! Resetting…", C["red"])
            play("rock"); flash_turtle()
            root.after(900, do_reset_silent)
            return

        player[0]=nx; player[1]=ny
        steps+=1
        lbl_steps.config(text=f"Steps: {steps}")
        play("move")
        draw_turtle()

        q_str = " → ".join(
            (f"[{DIR_SYMBOLS[d]}]" if j==i else DIR_SYMBOLS[d])
            for j, d in enumerate(move_queue)
        )
        lbl_queue.config(text=q_str, fg=C["teal"])

        if tuple(player) == lv()["goal"]:
            game_won=True
            executing=False
            btn_move.config(state="normal")
            set_msg(f"🎉 HOME! Level {current_level+1} done in {steps} steps!", C["green"])
            play("win")
            celebrate()
            root.after(2600, auto_next_level)
            return

        root.after(320, do_step)

    do_step()

# ─────────────────────────────────────────────────────────
# FLASH TURTLE
# ─────────────────────────────────────────────────────────
def flash_turtle():
    for t in [0, 120, 240, 360]:
        root.after(t,    lambda: draw_turtle(flash=True))
        root.after(t+60, lambda: draw_turtle(flash=False))

# ─────────────────────────────────────────────────────────
# RESET  —  stops sounds before switching level
# ─────────────────────────────────────────────────────────
def _do_reset_core(new_lv=None):
    global game_won, steps, current_level
    stop_sounds()                          # ← kill any bleeding audio
    if new_lv is not None:
        current_level = new_lv
    lv2 = lv()
    player[0], player[1] = lv2["start"]
    game_won=False; steps=0
    move_queue.clear()
    for cid in confetti_ids:
        canvas.delete(cid)
    confetti_ids.clear()
    init_rock_state()                      # ← fresh rock anim per level
    draw_gradient(*lv2.get("sky", ("#050d1a","#0f2040")))
    draw_stars()
    draw_header()
    update_ui()
    redraw()
    set_msg(lv2["hint"])

def do_reset():
    play("reset"); _do_reset_core()

def do_reset_silent():
    _do_reset_core()

def do_prev():
    if current_level > 0:
        stop_sounds()
        play("reset")
        _do_reset_core(current_level-1)

def do_next():
    if current_level < len(LEVELS)-1:
        stop_sounds()
        play("level")
        _do_reset_core(current_level+1)

def auto_next_level():
    if current_level < len(LEVELS)-1:
        _do_reset_core(current_level+1)
        set_msg(f"Welcome to {lv()['name']}! 🎮", C["cyan"])
    else:
        set_msg("🏆 ALL LEVELS COMPLETE! You're a master!", C["gold"])

def toggle_snd():
    global sound_on
    sound_on = not sound_on
    btn_snd.config(text="♪  SOUND  ON" if sound_on else "✕  SOUND OFF",
                   bg=C["btn_snd"] if sound_on else "#455a64")
    play("sndon")

# ─────────────────────────────────────────────────────────
# KEYBOARD
# ─────────────────────────────────────────────────────────
KM = {"Up":"UP","Down":"DOWN","Left":"LEFT","Right":"RIGHT",
      "Return":"EXEC","space":"EXEC"}

def on_key(event):
    k = KM.get(event.keysym)
    if k=="EXEC":   execute_queue()
    elif k in DIRS: add_move(k)

root.bind("<KeyPress>", on_key)

# ─────────────────────────────────────────────────────────
# CONFETTI
# ─────────────────────────────────────────────────────────
def celebrate():
    for _ in range(180):
        x = random.randint(GRID_X, GRID_X+GRID_W)
        y = random.randint(GRID_Y-40, GRID_Y+GRID_H)
        sz = random.randint(5,14)
        col = random.choice([C["red"],C["orange"],C["gold"],
                             C["green"],C["blue"],C["purple"],C["teal"],C["pink"]])
        fn = canvas.create_oval if random.random()<0.5 else canvas.create_rectangle
        cid = fn(x,y,x+sz,y+sz, fill=col, outline="", tags="confetti")
        confetti_ids.append(cid)

    def fall(n=0):
        if n > 55: return
        for cid in confetti_ids:
            canvas.move(cid, random.randint(-3,3), random.randint(2,6))
        root.after(35, lambda: fall(n+1))
    fall()

# ─────────────────────────────────────────────────────────
# GOAL PULSE
# ─────────────────────────────────────────────────────────
def pulse_goal():
    global pulse_ph
    pulse_ph += 0.10
    canvas.delete("gpulse")
    gx, gy = cell_px(*lv()["goal"])
    cx, cy  = gx+CELL//2, gy+CELL//2
    rr = 26 + math.sin(pulse_ph)*5
    alpha = max(1, int(2+math.sin(pulse_ph)*1.5))
    col = lerpC(C["goal_yel"], C["goal_amb"], (math.sin(pulse_ph)+1)/2)
    canvas.create_oval(cx-rr-2, cy-rr, cx+rr+2, cy+rr,
        outline=col, width=alpha, tags="gpulse")

# ─────────────────────────────────────────────────────────
# ANIMATION LOOP
# ─────────────────────────────────────────────────────────
def animate():
    global wave, float_offset, _rock_anim_phase
    wave += 0.08
    float_offset = math.sin(wave)*4
    _rock_anim_phase += 0.07        # drives all rock animations
    if not executing:
        draw_turtle()
    draw_obstacles()                # rocks update every frame
    pulse_goal()
    root.after(80, animate)

# ─────────────────────────────────────────────────────────
# BOOT
# ─────────────────────────────────────────────────────────
_do_reset_core(0)
animate()
root.mainloop()