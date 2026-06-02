# colour_magic.py
"""Colour Magic Machine  –  Mindora activity (age 3-7).

The child sees a TARGET colour and must pick the two palette colours
that mix to make it.  A reference chart is always visible at the bottom.
"""

import tkinter as tk
from shared import play_sound, flash_red

# ---------------------------------------------------------------------------
BG_COLOR  = "#FFF6E8"
PAL_BG    = "#EEF6FF"
CHART_BG  = "#E4F0FF"
HOME_BG   = "#FFD166"

# ── Palette: only PRIMARY + base mixing colours ───────────────────────────────
# Children mix these to discover result colours.
# Orange, Green, Purple etc. are RESULTS — not in the palette.
PALETTE = [
    ("#FF2020", "Red"),
    ("#1A6EFF", "Blue"),
    ("#FFE000", "Yellow"),
    ("#FF0090", "Pink"),
    ("#FFFFFF", "White"),
    ("#000000", "Black"),
    ("#FF6600", "Orange"),
    ("#00BB44", "Green"),
]

# ── Mix map: 2-colour mixes ───────────────────────────────────────────────────
MIX_MAP_2 = {
    frozenset(["#FF2020", "#FFE000"]): ("#FF7700", "Orange"),
    frozenset(["#FF2020", "#1A6EFF"]): ("#8833BB", "Purple"),
    frozenset(["#1A6EFF", "#FFE000"]): ("#33AA44", "Green"),
}

# ── Mix map: 3-colour mixes ───────────────────────────────────────────────────
MIX_MAP_3 = {
    frozenset(["#FF2020", "#FFE000", "#FFFFFF"]): ("#FFCC88", "Peach"),
    frozenset(["#FF2020", "#1A6EFF", "#FFFFFF"]): ("#CC99EE", "Lavender"),
    frozenset(["#1A6EFF", "#FFE000", "#000000"]): ("#336600", "Dark Green"),
    frozenset(["#FF2020", "#FFE000", "#000000"]): ("#994400", "Dark Orange"),
}

# ── Mix map: 4-colour mixes ───────────────────────────────────────────────────
MIX_MAP_4 = {
    frozenset(["#FF2020", "#1A6EFF", "#FFE000", "#FFFFFF"]): ("#BBDDCC", "Sage"),
    frozenset(["#FF2020", "#1A6EFF", "#FFE000", "#000000"]): ("#334422", "Forest"),
    frozenset(["#FF2020", "#FF0090", "#1A6EFF", "#FFFFFF"]): ("#EE88CC", "Rose"),
}

# Combined for guide display
MIX_MAP = {}
MIX_MAP.update(MIX_MAP_2)
MIX_MAP.update(MIX_MAP_3)
MIX_MAP.update(MIX_MAP_4)

# ── Levels ────────────────────────────────────────────────────────────────────
# Level 1-3: mix 2 colours
# Level 4-7: mix 3 colours
# Level 8-10: mix 4 colours
LEVELS = [
    {"target_hex": "#FF7700", "target_name": "Orange",      "num_slots": 2},
    {"target_hex": "#8833BB", "target_name": "Purple",      "num_slots": 2},
    {"target_hex": "#33AA44", "target_name": "Green",       "num_slots": 2},
    {"target_hex": "#FFCC88", "target_name": "Peach",       "num_slots": 3},
    {"target_hex": "#CC99EE", "target_name": "Lavender",    "num_slots": 3},
    {"target_hex": "#336600", "target_name": "Dark Green",  "num_slots": 3},
    {"target_hex": "#994400", "target_name": "Dark Orange", "num_slots": 3},
    {"target_hex": "#BBDDCC", "target_name": "Sage",        "num_slots": 4},
    {"target_hex": "#334422", "target_name": "Forest",      "num_slots": 4},
    {"target_hex": "#EE88CC", "target_name": "Rose",        "num_slots": 4},
]


# ---------------------------------------------------------------------------
def _hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def _fg(hex_color):
    r, g, b = _hex_to_rgb(hex_color)
    return "#111111" if (0.299*r + 0.587*g + 0.114*b) > 155 else "#FFFFFF"

def _name_of(hex_color):
    for h, n in PALETTE:
        if h == hex_color:
            return n
    # also check mix results
    for pair, (rh, rn) in MIX_MAP.items():
        if rh == hex_color:
            return rn
    return ""

def _oval(canvas, cx, cy, r, **kw):
    canvas.create_oval(cx-r, cy-r, cx+r, cy+r, **kw)


# ---------------------------------------------------------------------------
def launch(root):
    import math
    root.withdraw()
    win = tk.Toplevel(root)
    win.title("Colour Magic")
    win.configure(bg=BG_COLOR)

    # Maximise
    try:
        win.state("zoomed")
    except Exception:
        try:
            win.attributes("-zoomed", True)
        except Exception:
            pass

    win.bind("<F11>",    lambda e: win.attributes(
                         "-fullscreen", not win.attributes("-fullscreen")))
    win.bind("<Escape>", lambda e: win.attributes("-fullscreen", False))
    win.resizable(True, True)

    # ── go_home ─────────────────────────────────────────────────────────────
    def go_home():
        try:
            win.destroy()
        except Exception:
            pass
        try:
            root.deiconify()
        except Exception:
            pass

    win.protocol("WM_DELETE_WINDOW", go_home)

    # ── State ────────────────────────────────────────────────────────────────
    slots       = [None, None, None, None]
    active_slot = tk.IntVar(value=0)
    cur_level   = tk.IntVar(value=0)
    attempts    = tk.IntVar(value=0)

    CHART_BG2 = "#EAF4FF"

    # ========================================================================
    #  ROOT GRID: row 0 = top controls (fixed), row 1 = guide (expands)
    # ========================================================================
    win.rowconfigure(0, weight=0)   # top controls — does NOT grow
    win.rowconfigure(1, weight=1)   # guide — takes all remaining space
    win.columnconfigure(0, weight=1)

    top_pane = tk.Frame(win, bg=BG_COLOR)
    top_pane.grid(row=0, column=0, sticky="ew")

    bottom_pane = tk.Frame(win, bg=CHART_BG2, bd=2, relief="ridge")
    bottom_pane.grid(row=1, column=0, sticky="nsew", padx=18, pady=(0, 10))

    # ========================================================================
    #  TOP BAR  (home + title)
    # ========================================================================
    top_bar = tk.Frame(top_pane, bg=BG_COLOR)
    top_bar.pack(side=tk.TOP, fill=tk.X, padx=20, pady=(8, 0))

    tk.Button(
        top_bar, text="🏠  Home",
        font=("Arial", 13, "bold"),
        bg=HOME_BG, fg="#333333",
        activebackground="#F0BB40",
        relief="raised", bd=3,
        padx=10, pady=4,
        cursor="hand2",
        command=go_home,
    ).pack(side=tk.LEFT)

    tk.Label(top_bar, text="🎨  Colour Magic!",
             font=("Arial", 24, "bold"),
             bg=BG_COLOR, fg="#222222").pack(side=tk.LEFT, expand=True)

    # ========================================================================
    #  LEVEL + INSTRUCTION
    # ========================================================================
    level_lbl = tk.Label(top_pane, text="",
                         font=("Arial", 12, "bold"),
                         bg=BG_COLOR, fg="#888888")
    level_lbl.pack(side=tk.TOP, pady=(4, 0))

    instr_lbl = tk.Label(top_pane,
             text="Pick 2 colours that mix to make the TARGET colour!",
             font=("Arial", 14, "bold"),
             bg=BG_COLOR, fg="#333333")
    instr_lbl.pack(side=tk.TOP, pady=(1, 2))

    # ========================================================================
    #  GAME CANVAS   slot1 + slot2 = [Mixer] → TARGET
    # ========================================================================
    game_canvas = tk.Canvas(top_pane, bg=BG_COLOR, highlightthickness=0, height=160)
    game_canvas.pack(side=tk.TOP, fill=tk.X, padx=30, pady=(0, 2))

    def redraw_game(event=None):
        game_canvas.delete("all")
        W = game_canvas.winfo_width()
        if W < 10:
            return
        CY = 80
        R  = 52

        xs = [int(W * f) for f in (0.10, 0.26, 0.42, 0.595, 0.74, 0.90)]
        X1, XP, X2, XEQ, XM, XT = xs

        def draw_slot(x, idx):
            col  = slots[idx]
            fill = col if col else "#EBEBEB"
            ol   = "#FFD700" if active_slot.get() == idx else "#CCCCCC"
            lw   = 6         if active_slot.get() == idx else 3
            _oval(game_canvas, x, CY, R, fill=fill, outline=ol, width=lw)
            if col:
                game_canvas.create_text(x, CY, text=_name_of(col),
                                        font=("Arial", 13, "bold"),
                                        fill=_fg(col))
            else:
                game_canvas.create_text(x, CY - 10,
                                        text=str(idx + 1),
                                        font=("Arial", 20, "bold"),
                                        fill="#BBBBBB")
                game_canvas.create_text(x, CY + 14,
                                        text="tap to choose",
                                        font=("Arial", 9), fill="#CCCCCC")
            # gold dashed ring when active
            if active_slot.get() == idx:
                game_canvas.create_oval(x-R-8, CY-R-8, x+R+8, CY+R+8,
                                        outline="#FFD700", width=3,
                                        dash=(8, 5))
            # click zone
            tag = f"zone{idx}"
            game_canvas.create_rectangle(x-R-14, 0, x+R+14, 160,
                                         fill="", outline="", tags=tag)
            game_canvas.tag_bind(tag, "<Button-1>",
                                 lambda e, i=idx: _select_slot(i))

        n = LEVELS[cur_level.get()]["num_slots"]
        # compute x positions dynamically based on n slots
        # layout: S1 + S2 [+ S3 [+ S4]] = MIXER → TARGET
        # fractions for 2,3,4 slots
        if n == 2:
            slot_xs   = [int(W*0.10), int(W*0.28)]
            op_xs     = [int(W*0.19)]
            eq_x      = int(W*0.42)
            mixer_x   = int(W*0.57)
            target_x  = int(W*0.80)
        elif n == 3:
            slot_xs   = [int(W*0.07), int(W*0.21), int(W*0.35)]
            op_xs     = [int(W*0.14), int(W*0.28)]
            eq_x      = int(W*0.46)
            mixer_x   = int(W*0.59)
            target_x  = int(W*0.80)
        else:  # 4
            slot_xs   = [int(W*0.05), int(W*0.16), int(W*0.27), int(W*0.38)]
            op_xs     = [int(W*0.105),int(W*0.215),int(W*0.325)]
            eq_x      = int(W*0.47)
            mixer_x   = int(W*0.60)
            target_x  = int(W*0.80)

        for i, sx in enumerate(slot_xs):
            draw_slot(sx, i)
        for xop in op_xs:
            game_canvas.create_text(xop, CY, text="+",
                                    font=("Arial", 22, "bold"), fill="#555555")
        game_canvas.create_text(eq_x, CY, text="=",
                                font=("Arial", 28, "bold"), fill="#555555")

        # re-bind mixer/target/arrow using new positions
        XM, XT = mixer_x, target_x

        # mixer — idle paint palette circle
        bx, PR = XM, 38
        game_canvas.create_oval(bx-PR, CY-PR, bx+PR, CY+PR,
                                fill="#F5F0E8", outline="#BBAA88", width=2)
        for blob_c, ba in [("#FF6644", 0.4), ("#4499FF", 1.5),
                            ("#FFDD22", 2.6), ("#88CC44", 3.8)]:
            blobx = bx + math.cos(ba) * PR * 0.52
            bloby = CY + math.sin(ba) * PR * 0.52
            game_canvas.create_oval(blobx-7, bloby-7, blobx+7, bloby+7,
                                    fill=blob_c, outline="")
        game_canvas.create_text(bx, CY + PR + 13, text="Colour Mixer",
                                font=("Arial", 8, "bold"), fill="#AA8833")

        # arrow
        ax0 = XM + PR + 2
        ax1 = XT - R - 8
        if ax1 > ax0:
            game_canvas.create_line(ax0, CY, ax1, CY,
                                    fill="#4A90D9", width=4,
                                    arrow=tk.LAST, arrowshape=(14, 18, 6))

        # target circle
        lvl = LEVELS[cur_level.get()]
        _oval(game_canvas, XT, CY, R,
              fill=lvl["target_hex"], outline="#333333", width=3)
        game_canvas.create_text(XT, CY, text="?",
                                font=("Arial", 24, "bold"),
                                fill=_fg(lvl["target_hex"]))
        game_canvas.create_text(XT, CY - R - 14,
                                text="Make this!",
                                font=("Arial", 11, "bold"), fill="#CC3300")
        game_canvas.create_text(XT, CY + R + 14,
                                text=lvl["target_name"],
                                font=("Arial", 13, "bold"), fill="#222222")

    def _select_slot(idx):
        active_slot.set(idx)
        redraw_game()

    game_canvas.bind("<Configure>", redraw_game)

    # ========================================================================
    #  PALETTE SECTION  –  large round circles in a light blue panel
    # ========================================================================
    pal_section = tk.Frame(top_pane, bg=PAL_BG, bd=2, relief="groove")
    pal_section.pack(side=tk.TOP, fill=tk.X, padx=18, pady=(0, 4))

    tk.Label(pal_section,
             text="🎨  Choose a colour:",
             font=("Arial", 12, "bold"),
             bg=PAL_BG, fg="#1A3366").pack(pady=(4, 2))

    pal_row = tk.Frame(pal_section, bg=PAL_BG)
    pal_row.pack(anchor="center", pady=(0, 2))

    PAL_R   = 28    # compact radius
    PAL_SZ  = PAL_R * 2 + 8

    def assign_colour(col_hex):
        idx = active_slot.get()
        n   = LEVELS[cur_level.get()]["num_slots"]
        slots[idx] = col_hex
        # auto-advance to next empty slot
        for nxt in range(n):
            if slots[nxt] is None:
                active_slot.set(nxt)
                break
        play_sound(700, 80)
        feedback_lbl.config(text="")
        redraw_game()

    def clear_slots():
        for i in range(4): slots[i] = None
        active_slot.set(0)
        feedback_lbl.config(text="")
        attempts.set(0)
        redraw_game()

    for hex_col, col_name in PALETTE:
        cell = tk.Frame(pal_row, bg=PAL_BG)
        cell.pack(side=tk.LEFT, padx=6, pady=1)

        cv = tk.Canvas(cell, width=PAL_SZ, height=PAL_SZ,
                       bg=PAL_BG, highlightthickness=0, cursor="hand2")
        cv.pack()

        M = 3
        # drop shadow
        cv.create_oval(M+3, M+3, PAL_SZ-M+3, PAL_SZ-M+3,
                       fill="#AAAAAA", outline="")
        # perfect solid circle — no white overlay
        cv.create_oval(M, M, PAL_SZ-M, PAL_SZ-M,
                       fill=hex_col, outline="#222222", width=3, tags="circ")
        # colour name only
        cv.create_text(PAL_SZ//2, PAL_SZ//2,
                       text=col_name,
                       font=("Arial", 9, "bold"),
                       fill=_fg(hex_col), tags="lbl")

        def _on_enter(e, c=cv):
            c.delete("hover")
            c.create_oval(1, 1, PAL_SZ-1, PAL_SZ-1,
                          outline="#FFD700", width=4, tags="hover")

        def _on_leave(e, c=cv):
            c.delete("hover")

        cv.bind("<Enter>",    _on_enter)
        cv.bind("<Leave>",    _on_leave)
        cv.bind("<Button-1>", lambda e, h=hex_col: assign_colour(h))

        tk.Label(cell, text=col_name,
                 font=("Arial", 10, "bold"),
                 bg=PAL_BG, fg="#333333").pack(pady=(1, 0))

    tk.Button(pal_section, text="🗑  Clear",
              font=("Arial", 11, "bold"),
              bg="#FFDDDD", fg="#AA0000",
              activebackground="#FFBBBB",
              relief="flat", padx=12, pady=3,
              cursor="hand2",
              command=clear_slots).pack(pady=(2, 4))

    # slot hint + feedback (dynamic — updated by display_level)
    hint_lbl = tk.Label(top_pane,
             text="👆  Tap circle 1 or 2 to select it, then tap a colour",
             font=("Arial", 10), bg=BG_COLOR, fg="#AAAAAA")
    hint_lbl.pack(side=tk.TOP, pady=(1,0))

    feedback_lbl = tk.Label(top_pane, text="",
                             font=("Arial", 13, "bold"),
                             bg=BG_COLOR, fg="#CC0000",
                             wraplength=1000)
    feedback_lbl.pack(side=tk.TOP, pady=(1, 2))

    # ── Mixing animation helpers ──────────────────────────────────────────────
    _anim_job = [None]
    _mixing   = [False]   # True while animation is running (blocks Mix button)

    def _lerp_color(c1, c2, t):
        """Linearly interpolate between two hex colours; t in [0,1]."""
        r1, g1, b1 = _hex_to_rgb(c1)
        r2, g2, b2 = _hex_to_rgb(c2)
        r = int(r1 + (r2 - r1) * t)
        g = int(g1 + (g2 - g1) * t)
        b = int(b1 + (b2 - b1) * t)
        return f"#{r:02X}{g:02X}{b:02X}"

    # Sound: rising bubbling tones during swirl, played periodically
    _SWIRL_FREQS = [350, 400, 450, 380, 420, 470, 360, 410]

    def _play_swirl_sound(tick):
        """Play a soft bubbling/swirling tone every ~300 ms during animation."""
        if tick % 6 == 0:   # every 6 ticks × 50 ms = 300 ms
            freq = _SWIRL_FREQS[(tick // 6) % len(_SWIRL_FREQS)]
            play_sound(freq, 120)

    def _draw_paint_swirl(cx, cy, R, input_colours, result_hex, phase, mix_t):
        c1 = input_colours[0]
        c2 = input_colours[1] if len(input_colours)>1 else input_colours[0]
        """Draw the paint-swirl palette animation on game_canvas at (cx,cy).

        phase   – float 0..N, drives rotation angle
        mix_t   – float 0..1, blend progress (1 = fully resolved to result)
        """
        TAG = "mixer_anim"
        game_canvas.delete(TAG)

        # ── palette base circle ───────────────────────────────────────────────
        game_canvas.create_oval(
            cx - R, cy - R, cx + R, cy + R,
            fill="#F5F0E8", outline="#BBAA88", width=2, tags=TAG)

        settle = 0.78   # mix_t at which result starts blooming

        if mix_t < settle:
            # ── swirling colour arms ──────────────────────────────────────────
            # Two interleaved arms, each drawn as small overlapping ovals
            # rotating inward from the rim.  Arm 0 = c1, arm 1 = c2.
            n_arms  = 3
            dot_r   = 5
            arm_angle = phase * 2.2   # radians; drives rotation speed

            for arm in range(n_arms):
                col  = input_colours[arm % len(input_colours)]
                aoff = (arm / n_arms) * math.pi * 2
                # draw dots along a radial spiral for this arm
                for step in range(9):
                    frac   = step / 8           # 0 (rim) → 1 (centre)
                    r_dot  = R * 0.85 * (1 - frac * 0.55)
                    angle  = arm_angle + aoff + frac * math.pi * 1.6
                    dx = cx + math.cos(angle) * r_dot
                    dy = cy + math.sin(angle) * r_dot * 0.55  # slight y squash → oval feel
                    alpha_fade = int(210 * (1 - frac * 0.5))
                    # tkinter can't do per-item alpha, so just draw the dot
                    game_canvas.create_oval(
                        dx - dot_r, dy - dot_r,
                        dx + dot_r, dy + dot_r,
                        fill=col, outline="", tags=TAG)

            # ── palette knife ─────────────────────────────────────────────────
            knife_angle = -phase * 1.4 - math.pi / 5
            k_inner = R * 0.25
            k_outer = R * 0.88
            kx0 = cx + math.cos(knife_angle) * k_inner
            ky0 = cy + math.sin(knife_angle) * k_inner * 0.55
            kx1 = cx + math.cos(knife_angle) * k_outer
            ky1 = cy + math.sin(knife_angle) * k_outer * 0.55
            # blade
            game_canvas.create_line(
                kx0, ky0, kx1, ky1,
                fill="#DDDDCC", width=5, capstyle=tk.ROUND, tags=TAG)
            game_canvas.create_line(
                kx0, ky0, kx1, ky1,
                fill="#AAAAAA", width=2, capstyle=tk.ROUND, tags=TAG)
            # wooden handle stub beyond k_outer
            hx0 = cx + math.cos(knife_angle) * k_outer
            hy0 = cy + math.sin(knife_angle) * k_outer * 0.55
            hx1 = cx + math.cos(knife_angle) * (k_outer + 14)
            hy1 = cy + math.sin(knife_angle) * (k_outer + 14) * 0.55
            game_canvas.create_line(
                hx0, hy0, hx1, hy1,
                fill="#C8A06A", width=6, capstyle=tk.ROUND, tags=TAG)

        else:
            # ── result bloom: swirl fades, result colour expands from centre ──
            bloom_t = (mix_t - settle) / (1 - settle)   # 0→1

            # still show faint swirl arms under the bloom
            arm_angle = phase * 2.2
            for arm in range(3):
                col  = _lerp_color(input_colours[arm % len(input_colours)], result_hex, bloom_t)
                aoff = (arm / 3) * math.pi * 2
                for step in range(9):
                    frac  = step / 8
                    r_dot = R * 0.85 * (1 - frac * 0.55)
                    angle = arm_angle + aoff + frac * math.pi * 1.6
                    dx = cx + math.cos(angle) * r_dot
                    dy = cy + math.sin(angle) * r_dot * 0.55
                    game_canvas.create_oval(
                        dx - 5, dy - 5, dx + 5, dy + 5,
                        fill=col, outline="", tags=TAG)

            # expanding result circle
            bloom_r = int(R * 0.1 + R * 0.82 * bloom_t)
            game_canvas.create_oval(
                cx - bloom_r, cy - bloom_r,
                cx + bloom_r, cy + bloom_r,
                fill=result_hex, outline="", tags=TAG)

        # ── rim outline on top of everything ─────────────────────────────────
        game_canvas.create_oval(
            cx - R, cy - R, cx + R, cy + R,
            fill="", outline="#BBAA88", width=2, tags=TAG)

        # ── "mixing…" label below the palette ─────────────────────────────────
        if mix_t < 0.95:
            game_canvas.create_text(
                cx, cy + R + 13, text="mixing…",
                font=("Arial", 8, "bold"), fill="#AA8833", tags=TAG)

    ANIM_DURATION_MS = 2800
    ANIM_TICK_MS     = 50

    def _run_mix_animation(input_colours, result_hex, on_done):
        """Paint-swirl animation for ~2.8 s, then resolves to result_hex."""
        total_ticks = ANIM_DURATION_MS // ANIM_TICK_MS
        state = {"tick": 0, "phase": 0.0}

        # Retrieve mixer centre from current canvas width
        W  = game_canvas.winfo_width()
        CY = 80
        n_s = LEVELS[cur_level.get()]["num_slots"]
        XM = int(W * (0.57 if n_s==2 else 0.59 if n_s==3 else 0.60))
        R  = 38   # palette radius — fits inside the 80px mixer slot

        def _tick():
            t     = state["tick"]
            phase = state["phase"]
            mix_t = min(t / total_ticks, 1.0)

            if t >= total_ticks:
                # final frame: solid result, no swirl
                game_canvas.delete("mixer_anim")
                game_canvas.create_oval(
                    XM - R, CY - R, XM + R, CY + R,
                    fill=result_hex, outline="#BBAA88", width=2,
                    tags="mixer_anim")
                on_done()
                return

            _draw_paint_swirl(XM, CY, R, input_colours, result_hex, phase, mix_t)
            _play_swirl_sound(t)

            state["tick"]  += 1
            # phase speeds up slightly as mix_t rises — feels more excited
            state["phase"] += 0.18 + mix_t * 0.12
            _anim_job[0] = win.after(ANIM_TICK_MS, _tick)

        _tick()

    def mix_action():
        if _mixing[0]:
            return

        lvl    = LEVELS[cur_level.get()]
        n      = lvl["num_slots"]
        target = lvl["target_hex"]

        # Check all required slots are filled
        active_slots = slots[:n]
        if any(s is None for s in active_slots):
            feedback_lbl.config(text=f"⚠  Pick {n} colours first!", fg="#CC6600")
            play_sound(300, 200)
            return

        # Build frozenset from exactly the active slots
        pair   = frozenset(active_slots)
        result = MIX_MAP.get(pair)
        anim_result = result[0] if result else "#7A5C3A"

        _mixing[0] = True
        mix_btn.config(state=tk.DISABLED, text="mixing…")
        feedback_lbl.config(text="")

        def _on_anim_done():
            _mixing[0] = False
            mix_btn.config(state=tk.NORMAL, text="✨  Mix!")
            if result and result[0] == target:
                names = "  +  ".join(_name_of(s) for s in active_slots)
                feedback_lbl.config(
                    text=f"🎉  Amazing!  {names}  =  {lvl['target_name']}! 🎉",
                    fg="#007700")
                for i, freq in enumerate([880, 1047, 1319, 1568]):
                    win.after(i * 130, lambda f=freq: play_sound(f, 120))
                win.after(1700, next_level)
            else:
                attempts.set(attempts.get() + 1)
                hint = ("  Hint: look at the chart below!" if attempts.get() >= 2 else "")
                feedback_lbl.config(
                    text=f"😬  That didn't make {lvl['target_name']}!  Try again!{hint}",
                    fg="#CC0000")
                flash_red(None, 0, 0, None)
                win.after(80, redraw_game)

        _run_mix_animation(active_slots, anim_result, _on_anim_done)

    mix_btn = tk.Button(top_pane, text="✨  Mix!",
                        font=("Arial", 16, "bold"),
                        bg="#FF9F43", fg="white",
                        activebackground="#E07820",
                        relief="raised", bd=3,
                        padx=20, pady=5,
                        cursor="hand2",
                        command=mix_action)
    mix_btn.pack(side=tk.TOP, pady=(2, 4))

    # ── Prev / Next level navigation ──────────────────────────────────────────
    nav_frame = tk.Frame(top_pane, bg=BG_COLOR)
    nav_frame.pack(side=tk.TOP, pady=(0, 4))

    def _nav_level(direction):
        if _mixing[0]:
            return
        new = cur_level.get() + direction
        if 0 <= new < len(LEVELS):
            cur_level.set(new)
            display_level()

    def _update_nav_buttons():
        lv = cur_level.get()
        prev_btn.config(state=tk.NORMAL if lv > 0               else tk.DISABLED)
        next_btn.config(state=tk.NORMAL if lv < len(LEVELS) - 1 else tk.DISABLED)

    prev_btn = tk.Button(nav_frame, text="◀  Prev Level",
                         font=("Arial", 12, "bold"),
                         bg="#D0E8FF", fg="#1A3366",
                         activebackground="#A8CCF0",
                         relief="raised", bd=2,
                         padx=12, pady=3,
                         cursor="hand2",
                         command=lambda: _nav_level(-1))
    prev_btn.pack(side=tk.LEFT, padx=(0, 16))

    next_btn = tk.Button(nav_frame, text="Next Level  ▶",
                         font=("Arial", 12, "bold"),
                         bg="#D0E8FF", fg="#1A3366",
                         activebackground="#A8CCF0",
                         relief="raised", bd=2,
                         padx=12, pady=3,
                         cursor="hand2",
                         command=lambda: _nav_level(+1))
    next_btn.pack(side=tk.LEFT)

    # ========================================================================
    #  COLOUR MIX REFERENCE GUIDE  –  lives in bottom_pane, always visible
    # ========================================================================
    tk.Label(bottom_pane,
             text="📖  Colour Mix Guide  —  what do two colours make?",
             font=("Arial", 14, "bold"),
             bg=CHART_BG2, fg="#1A3366").pack(side=tk.TOP, pady=(8, 4))

    # Scrollable inner area
    guide_frame = tk.Frame(bottom_pane, bg=CHART_BG2)
    guide_frame.pack(fill=tk.BOTH, expand=True, padx=6, pady=(0, 8))

    guide_canvas = tk.Canvas(guide_frame, bg=CHART_BG2,
                             highlightthickness=0)
    scrollbar = tk.Scrollbar(guide_frame, orient=tk.VERTICAL,
                             command=guide_canvas.yview)
    guide_canvas.configure(yscrollcommand=scrollbar.set)

    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    guide_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    inner = tk.Frame(guide_canvas, bg=CHART_BG2)
    inner_id = guide_canvas.create_window((0, 0), window=inner, anchor="nw")

    def _on_inner_configure(e):
        guide_canvas.configure(scrollregion=guide_canvas.bbox("all"))
    inner.bind("<Configure>", _on_inner_configure)

    def _on_canvas_resize(e):
        guide_canvas.itemconfig(inner_id, width=e.width)
    guide_canvas.bind("<Configure>", _on_canvas_resize)

    # Mouse-wheel scrolling
    def _on_wheel(e):
        guide_canvas.yview_scroll(int(-1 * (e.delta / 120)), "units")
    guide_canvas.bind("<MouseWheel>", _on_wheel)
    inner.bind("<MouseWheel>", _on_wheel)

    # ── Build one card per mix entry ──────────────────────────────────────────
    # Group into rows of 5 cards each
    COLS       = 5
    CR         = 26     # circle radius in each card
    CARD_BG    = "#FFFFFF"
    CARD_HI    = "#FFF7CC"   # highlight for level-relevant mixes (set per level)

    items = list(MIX_MAP.items())

    def build_guide_cards(highlight_result=None):
        """Rebuild guide cards grouped by mix type (2/3/4 colours)."""
        for widget in inner.winfo_children():
            widget.destroy()

        sections = [
            ("🎨  Mix 2 Colours  (Levels 1–3)",  list(MIX_MAP_2.items())),
            ("🎨  Mix 3 Colours  (Levels 4–7)",  list(MIX_MAP_3.items())),
            ("🎨  Mix 4 Colours  (Levels 8–10)", list(MIX_MAP_4.items())),
        ]

        current_row = 0
        for sec_title, sec_items in sections:
            # Section header
            tk.Label(inner, text=sec_title,
                     font=("Arial", 12, "bold"),
                     bg=CHART_BG2, fg="#1A3366",
                     anchor="w").grid(row=current_row, column=0,
                                      columnspan=COLS, sticky="ew",
                                      padx=6, pady=(8,2))
            current_row += 1

            for idx, (pair, (res_hex, res_name)) in enumerate(sec_items):
                col_num = idx % COLS
                row_num = current_row + idx // COLS

                pair_list = sorted(pair)
                colours   = [pair_list[i] for i in range(len(pair_list))]
                names     = [_name_of(c) for c in colours]
                c1 = colours[0]
                c2 = colours[1] if len(colours)>1 else colours[0]
                n1 = names[0]; n2 = names[1] if len(names)>1 else names[0]

                is_highlight = (res_hex == highlight_result)
                bg = CARD_HI if is_highlight else CARD_BG
                bd_col = "#FFB300" if is_highlight else "#C5DCEF"
                bd_w   = 3        if is_highlight else 1

                card = tk.Frame(inner, bg=bg,
                                bd=bd_w, relief="solid",
                                highlightbackground=bd_col,
                                highlightthickness=bd_w)
                card.grid(row=row_num, column=col_num,
                          padx=6, pady=5, sticky="nsew")
                inner.grid_columnconfigure(col_num, weight=1)

                # Canvas — lay out all input colours + operators + result
                # Layout per element: CIRCLE(CR*2) + GAP + OP(OP_W) + GAP
                # Last input: CIRCLE + GAP + EQ(OP_W) + GAP + CIRCLE + margin
                OP_W  = 20
                GAP   = 6
                num_c = len(colours)
                # x positions for input circles
                xs_c = []
                x = CR + 6
                for ci in range(num_c):
                    xs_c.append(x)
                    if ci < num_c - 1:
                        x += CR + GAP + OP_W + GAP + CR  # circle + gap + + + gap + next circle
                # = sign and result
                xeq  = x + CR + GAP + OP_W // 2
                xres = xeq + OP_W // 2 + GAP + CR
                # total canvas width = xres + CR + margin
                cw = int(xres + CR + 10)
                ch = CR * 2 + 44
                cv = tk.Canvas(card, bg=bg, highlightthickness=0,
                               width=cw, height=ch)
                cv.pack(pady=(8, 2))
                CY_c = CR + 8

                for ci, (xc, col_h, col_n) in enumerate(zip(xs_c, colours, names)):
                    cv.create_oval(xc-CR, CY_c-CR, xc+CR, CY_c+CR,
                                   fill=col_h, outline="#555555", width=2)
                    cv.create_text(xc, CY_c+CR+5, text=col_n,
                                   font=("Arial", 8, "bold"), fill="#333", anchor="n")
                    if ci < num_c - 1:
                        xplus = xc + CR + GAP + OP_W // 2
                        cv.create_text(xplus, CY_c, text="+",
                                       font=("Arial", 14, "bold"), fill="#333333")
                cv.create_text(xeq, CY_c, text="=",
                               font=("Arial", 14, "bold"), fill="#333333")
                cv.create_oval(xres-CR, CY_c-CR, xres+CR, CY_c+CR,
                               fill=res_hex, outline="#333333", width=2)
                cv.create_text(xres, CY_c+CR+5, text=res_name,
                               font=("Arial", 8, "bold"), fill="#333", anchor="n")

                # result name as readable label under the card canvas
                tk.Label(card, text=f"→  {res_name}",
                     font=("Arial", 11, "bold"),
                     bg=bg, fg="#1A5EA8").pack(pady=(0, 6))

            # advance current_row after each row of cards in section
            rows_in_sec = (len(sec_items) + COLS - 1) // COLS
            current_row += rows_in_sec

    build_guide_cards()

    # ========================================================================
    #  LEVEL LOGIC
    # ========================================================================
    def display_level():
        lv  = LEVELS[cur_level.get()]
        n   = lv["num_slots"]
        level_lbl.config(text=f"Level  {cur_level.get()+1}  of  {len(LEVELS)}")
        word = {2:"2", 3:"3", 4:"4"}[n]
        slot_word = {2:"1 or 2", 3:"1, 2 or 3", 4:"1, 2, 3 or 4"}[n]
        instr_lbl.config(text=f"Pick {word} colours that mix to make the TARGET colour!")
        hint_lbl.config(text=f"👆  Tap circle {slot_word} to select it, then tap a colour")
        for i in range(4): slots[i] = None
        active_slot.set(0)
        attempts.set(0)
        feedback_lbl.config(text="")
        target_hex = lv["target_hex"]
        build_guide_cards(highlight_result=target_hex)
        _update_nav_buttons()
        win.after(80, redraw_game)

    def next_level():
        if cur_level.get() < len(LEVELS) - 1:
            cur_level.set(cur_level.get() + 1)
            display_level()
        else:
            # All 10 levels done — show big celebration, do NOT restart
            feedback_lbl.config(
                text="🎉  HURRAY!  You finished ALL 10 levels!  You are a Colour Genius! 🎉",
                fg="#007700")
            for i, f in enumerate([523, 659, 784, 880, 1047, 1319, 1568]):
                win.after(i * 130, lambda fr=f: play_sound(fr, 160))
            # show a popup celebration window
            def _show_hurray():
                popup = tk.Toplevel(win)
                popup.overrideredirect(True)
                popup.attributes("-topmost", True)
                popup.configure(bg="#FFF9C4")
                pw, ph = 540, 200
                px = win.winfo_rootx() + (win.winfo_width()  - pw) // 2
                py = win.winfo_rooty() + (win.winfo_height() - ph) // 2
                popup.geometry(f"{pw}x{ph}+{px}+{py}")
                tk.Label(popup,
                         text="🏆  HURRAY!  🏆",
                         font=("Arial", 32, "bold"),
                         bg="#FFF9C4", fg="#E65100").pack(pady=(20,4))
                tk.Label(popup,
                         text="You completed ALL 10 levels!\nYou are a true Colour Genius! 🌈",
                         font=("Arial", 16, "bold"),
                         bg="#FFF9C4", fg="#2E7D32").pack()
                tk.Button(popup, text="Close",
                          font=("Arial", 13, "bold"),
                          bg="#FFD166", fg="#333",
                          relief="flat", padx=20, pady=6,
                          command=popup.destroy).pack(pady=(12,0))
            win.after(900, _show_hurray)

    display_level()

    win.attributes("-topmost", True)
    win.after_idle(win.attributes, "-topmost", False)


if __name__ == "__main__":
    root = tk.Tk()
    root.withdraw()
    launch(root)
    root.mainloop()
