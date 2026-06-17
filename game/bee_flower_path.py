# =========================================================
# MINDORA — Bee Flower Path Game
# Standalone Educational Algorithm & Pathfinding Game
# =========================================================

import tkinter as tk
from tkinter import Canvas
import random
import math
import threading
import time
import json
import os

try:
    import winsound
    SOUND_AVAILABLE = True
except ImportError:
    SOUND_AVAILABLE = False

# ─────────────────────────────────────────────────────────
# PALETTE / COLOR THEMES
# ─────────────────────────────────────────────────────────
C = {
    "day": {
        "bg_top":    "#cbe3db",
        "bg_bot":    "#eef7e8",
        "panel":     "#ffffff",
        "panel_bd":  "#cbd5e1",
        "tile_a":    "#86efac",
        "tile_b":    "#6ee7b7",
        "tile_sh":   "#166534",
        "tile_hl":   "#bbf7d0",
        "text_main": "#1e293b",
        "text_muted":"#64748b",
        "accent":    "#d97706",
        "accent_lite":"#fef3c7"
    },
    "night": {
        "bg_top":    "#0f172a",
        "bg_bot":    "#1e152a",
        "panel":     "#1e293b",
        "panel_bd":  "#334155",
        "tile_a":    "#1e3a8a",
        "tile_b":    "#312e81",
        "tile_sh":   "#0f172a",
        "tile_hl":   "#3b82f6",
        "text_main": "#f8fafc",
        "text_muted":"#94a3b8",
        "accent":    "#fbbf24",
        "accent_lite":"#78350f"
    }
}

# ─────────────────────────────────────────────────────────
# LEVEL DESIGN SPECIFICATIONS
# ─────────────────────────────────────────────────────────
LEVELS = [
  {
    "name": "Gentle Flight", "emoji": "🌸", "diff": "EASY", "gridSize": 5,
    "start": (0, 2), "goals": [(4, 2)],
    "obstacles": [], "key": None, "gate": None, "honey": [], "energy": None, "wind": None, "movingObstacles": None, "rain": False,
    "hint": "Guide the bee directly to the flower. A straight path is all you need!",
    "diffColor": "#15803d"
  },
  {
    "name": "Round the Rock", "emoji": "🪨", "diff": "EASY", "gridSize": 5,
    "start": (0, 2), "goals": [(4, 2)],
    "obstacles": [(2, 2)], "key": None, "gate": None, "honey": [], "energy": None, "wind": None, "movingObstacles": None, "rain": False,
    "hint": "A heavy rock blocks the direct route. Fly above or below it to reach the flower!",
    "diffColor": "#15803d"
  },
  {
    "name": "Garden Obstacles", "emoji": "🌿", "diff": "MEDIUM", "gridSize": 5,
    "start": (0, 0), "goals": [(4, 4)],
    "obstacles": [(1, 1), [2, 2], [3, 3]], "key": None, "gate": None, "honey": [], "energy": None, "wind": None, "movingObstacles": None, "rain": False,
    "hint": "Bushes are blocking the diagonal. Weave through the garden grid to reach the flower!",
    "diffColor": "#0d9488"
  },
  {
    "name": "Bushy Maze", "emoji": "🌳", "diff": "MEDIUM", "gridSize": 8,
    "start": (0, 0), "goals": [(7, 7)],
    "obstacles": [
      (0, 2), (1, 2), (2, 2), (3, 2), (4, 2), (6, 2), (7, 2),
      (1, 4), (3, 4), (4, 4), (5, 4), (6, 4), (7, 4),
      (0, 6), (1, 6), (2, 6), (3, 6), (5, 6), (6, 6)
    ], "key": None, "gate": None, "honey": [], "energy": None, "wind": None, "movingObstacles": None, "rain": False,
    "hint": "Find your way through the openings in the maze of bushes. Plan ahead!",
    "diffColor": "#0d9488"
  },
  {
    "name": "Double Bloom", "emoji": "🌺", "diff": "TRICKY", "gridSize": 8,
    "start": (0, 0), "goals": [(3, 3), (7, 7)],
    "obstacles": [(1, 1), (2, 5), (5, 2), (6, 6)], "key": None, "gate": None, "honey": [], "energy": None, "wind": None, "movingObstacles": None, "rain": False,
    "hint": "There are two flowers! You must collect both of them to win. The order you visit them matters!",
    "diffColor": "#b45309"
  },
  {
    "name": "Windy Meadow", "emoji": "💨", "diff": "TRICKY", "gridSize": 8,
    "start": (0, 7), "goals": [(7, 0)],
    "obstacles": [(1, 4), (2, 1), (4, 5), (5, 2)], "key": None, "gate": None, "honey": [], "energy": 15,
    "wind": {"dir": "E", "interval": 3, "label": "East wind pushes bee EAST (+1 cell) every 3 moves!"},
    "movingObstacles": None, "rain": False,
    "hint": "A strong wind pushes you right every 3 steps! Keep your energy (15 moves max) and the wind push in mind.",
    "diffColor": "#b45309"
  },
  {
    "name": "Honey Harvest", "emoji": "🍯", "diff": "HARD", "gridSize": 8,
    "start": (0, 4), "goals": [(7, 4)],
    "obstacles": [(3, 3), (3, 4), (4, 3), (4, 4)], "key": None, "gate": None,
    "honey": [(3, 1), (4, 6)], "energy": None, "wind": None, "movingObstacles": None, "rain": False,
    "hint": "Collect the sweet honey jars for extra points (+20 score each) before heading to the final flower!",
    "diffColor": "#be123c"
  },
  {
    "name": "Key to the Gate", "emoji": "🔑", "diff": "HARD", "gridSize": 8,
    "start": (0, 7), "goals": [(7, 0)],
    "obstacles": [
      (3, 0), (3, 1), (3, 2), (3, 4), (3, 5), (3, 6), (3, 7)
    ],
    "key": (0, 0), "gate": (3, 3), "honey": [], "energy": None, "wind": None, "movingObstacles": None, "rain": False,
    "hint": "The gate at [3,3] blocks the wall divider! Fly to the key at [0,0] first to unlock the gate, then pass through it.",
    "diffColor": "#be123c"
  },
  {
    "name": "Jumping Frogs", "emoji": "🐸", "diff": "EXPERT", "gridSize": 10,
    "start": (0, 0), "goals": [(9, 9)],
    "obstacles": [(1, 1), (2, 8), (8, 2)], "key": None, "gate": None, "honey": [], "energy": None, "wind": None,
    "movingObstacles": [
      {"start": (3, 2), "path": [(3, 2), (3, 3), (3, 4), (3, 5), (3, 4), (3, 3)], "label": "Frog A bounces vertically"},
      {"start": (6, 7), "path": [(4, 7), (5, 7), (6, 7), (7, 7), (8, 7), (7, 7), (6, 7), (5, 7)], "label": "Frog B bounces horizontally"}
    ], "rain": True,
    "hint": "Watch out for the frogs! They hop when you fly. Also, the rain slows down the bee's flight time.",
    "diffColor": "#6d28d9"
  },
  {
    "name": "Bee Academy Master", "emoji": "🏆", "diff": "EXPERT", "gridSize": 10,
    "start": (0, 0), "goals": [(9, 9)],
    "obstacles": [
      (4, 0), (4, 1), (4, 2), (4, 3), (4, 4), (4, 6), (4, 7), (4, 8), (4, 9),
      (7, 0), (7, 1), (7, 2), (7, 3), (7, 5), (7, 6), (7, 7), (7, 8), (7, 9)
    ],
    "key": (9, 0), "gate": (4, 5), "honey": [(0, 9)], "energy": 30, "wind": None, "movingObstacles": None, "rain": False,
    "hint": "The ultimate maze! Key is in the bottom-right chamber, gate is at the center, honey is in the top-right. Plan your steps carefully!",
    "diffColor": "#6d28d9"
  }
]

DIRS = ["NW", "NE", "E", "SE", "SW", "W"]
DIR_SYMBOLS = {"NW": "↖", "NE": "↗", "E": "➡️", "SE": "↘", "SW": "↙", "W": "⬅"}

# ─────────────────────────────────────────────────────────
# AUDIO CHIMES ENGINE (Standalone winsound)
# ─────────────────────────────────────────────────────────
sound_on = True
_sound_lock = threading.Lock()
_sound_stop = threading.Event()

def _play(notes):
    if not SOUND_AVAILABLE:
        return
    stop_evt = _sound_stop
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
    _sound_stop.set()
    def _rearm():
        time.sleep(0.05)
        _sound_stop.clear()
    threading.Thread(target=_rearm, daemon=True).start()

SOUNDS = {
    "add":     [(600, 60)],
    "clear":   [(350, 70)],
    "buzz":    [(200, 100)],
    "key":     [(988, 120), (1318, 120)],
    "gate":    [(250, 90), (150, 90)],
    "honey":   [(440, 80), (880, 80)],
    "flower":  [(587, 80), (880, 80), (1174, 150)],
    "win":     [(523, 80), (587, 80), (659, 80), (784, 80), (1046, 200)],
    "failure": [(150, 300)],
    "reset":   [(440, 60), (330, 60), (220, 60)]
}

def play(k):
    if sound_on:
        _play(SOUNDS.get(k, []))

# ─────────────────────────────────────────────────────────
# BFS SOLVER
# ─────────────────────────────────────────────────────────
def solve_bfs(level):
    grid_size = level["gridSize"]
    start = level["start"]
    goals = level["goals"]
    obstacles = level["obstacles"]
    key = level.get("key")
    gate = level.get("gate")
    wind = level.get("wind")
    moving_obstacles = level.get("movingObstacles", [])
    
    num_goals = len(goals)
    target_mask = (1 << num_goals) - 1
    
    queue = [(start[0], start[1], 0, False, 0, [start], [])]
    period = 24
    visited = set()
    visited.add((start[0], start[1], 0, False, 0))
    
    dirs = ["NW", "NE", "E", "SE", "SW", "W"]
    
    max_iters = 20000
    iters = 0
    while queue and iters < max_iters:
        iters += 1
        x, y, col_mask, has_k, steps, path, moves = queue.pop(0)
        
        if col_mask == target_mask:
            return path, moves
            
        for dname in dirs:
            nx = x
            ny = y
            if dname == "W":
                nx -= 1
            elif dname == "E":
                nx += 1
            elif dname == "NW":
                if y % 2 == 0: nx -= 1; ny -= 1
                else: ny -= 1
            elif dname == "NE":
                if y % 2 == 0: ny -= 1
                else: nx += 1; ny -= 1
            elif dname == "SW":
                if y % 2 == 0: nx -= 1; ny += 1
                else: ny += 1
            elif dname == "SE":
                if y % 2 == 0: ny += 1
                else: nx += 1; ny += 1
                
            nsteps = steps + 1
            nhas_k = has_k
            ncol_mask = col_mask
            
            if nx < 0 or nx >= grid_size or ny < 0 or ny >= grid_size:
                continue
            if (nx, ny) in obstacles or [nx, ny] in obstacles:
                continue
            if gate and gate[0] == nx and gate[1] == ny and not has_k:
                continue
                
            # Moving obstacle frog check
            frog_collision = False
            if moving_obstacles:
                for frog in moving_obstacles:
                    fpath = frog["path"]
                    fpos = fpath[nsteps % len(fpath)]
                    if fpos[0] == nx and fpos[1] == ny:
                        frog_collision = True
                        break
            if frog_collision:
                continue
                
            # Wind push
            if wind and nsteps % wind["interval"] == 0:
                wind_dir = wind["dir"]
                if wind_dir == "W":
                    nx -= 1
                elif wind_dir == "E":
                    nx += 1
                elif wind_dir == "NW":
                    if ny % 2 == 0: nx -= 1; ny -= 1
                    else: ny -= 1
                elif wind_dir == "NE":
                    if ny % 2 == 0: ny -= 1
                    else: nx += 1; ny -= 1
                elif wind_dir == "SW":
                    if ny % 2 == 0: nx -= 1; ny += 1
                    else: ny += 1
                elif wind_dir == "SE":
                    if ny % 2 == 0: ny += 1
                    else: nx += 1; ny += 1
                
                if nx < 0 or nx >= grid_size or ny < 0 or ny >= grid_size:
                    continue
                if (nx, ny) in obstacles or [nx, ny] in obstacles:
                    continue
                if gate and gate[0] == nx and gate[1] == ny and not has_k:
                    continue
                
                frog_collision_wind = False
                if moving_obstacles:
                    for frog in moving_obstacles:
                        fpath = frog["path"]
                        fpos = fpath[nsteps % len(fpath)]
                        if fpos[0] == nx and fpos[1] == ny:
                            frog_collision_wind = True
                            break
                if frog_collision_wind:
                    continue
            
            # lands safely
            if key and key[0] == nx and key[1] == ny:
                nhas_k = True
                
            for g_idx, g in enumerate(goals):
                if g[0] == nx and g[1] == ny:
                    ncol_mask |= (1 << g_idx)
                    
            vis_key = (nx, ny, ncol_mask, nhas_k, nsteps % period)
            if vis_key not in visited:
                visited.add(vis_key)
                queue.append((nx, ny, ncol_mask, nhas_k, nsteps, path + [(nx, ny)], moves + [dname]))
                
    return None

def is_hex_adjacent(c1, r1, c2, r2):
    dc = c1 - c2
    dr = r1 - r2
    if dr == 0:
        return abs(dc) == 1
    if abs(dr) == 1:
        if r2 % 2 == 0:
            return dc == -1 or dc == 0
        else:
            return dc == 0 or dc == 1
    return False

# ─────────────────────────────────────────────────────────
# GAME APPLICATION
# ─────────────────────────────────────────────────────────
class BeeFlowerPathGame:
    def __init__(self, root_window):
        self.root = root_window
        self.root.title("Mindora - Bee Flower Path Educational Game")
        self.root.configure(bg="#0f172a")
        self.root.state("zoomed")
        
        self.current_level = 0
        self.max_unlocked_level = 0
        self.theme = "day"
        
        # State variables
        self.player_pos = [0, 0]
        self.steps = 0
        self.move_queue = []
        self.executing = False
        self.has_key = False
        self.collected_mask = 0
        self.collected_honey = []
        self.energy = 100
        self.obstacle_states = []
        
        self.hints_used = 0
        self.hint_level = 0
        self.path_trace = []
        self.show_paths_overlay = False
        
        # Load local score/progress data
        self.load_local_progress()
        
        self.W = self.root.winfo_screenwidth()
        self.H = self.root.winfo_screenheight()
        if self.W < 100: self.W = 1280
        if self.H < 100: self.H = 800
        
        self.build_ui()
        self.load_level()
        
        # Keyboard shortcuts
        self.root.bind("<Key-q>", lambda e: self.add_move("NW"))
        self.root.bind("<Key-e>", lambda e: self.add_move("NE"))
        self.root.bind("<Key-d>", lambda e: self.add_move("E"))
        self.root.bind("<Key-x>", lambda e: self.add_move("SE"))
        self.root.bind("<Key-c>", lambda e: self.add_move("SE"))
        self.root.bind("<Key-z>", lambda e: self.add_move("SW"))
        self.root.bind("<Key-a>", lambda e: self.add_move("W"))
        
    def load_local_progress(self):
        self.progress_file = os.path.expanduser("~/.bee_progress.json")
        if os.path.exists(self.progress_file):
            try:
                with open(self.progress_file, "r") as f:
                    data = json.load(f)
                    self.max_unlocked_level = data.get("max_unlocked_level", 0)
                    self.current_level = min(self.max_unlocked_level, len(LEVELS) - 1)
            except Exception:
                pass

    def save_local_progress(self):
        try:
            with open(self.progress_file, "w") as f:
                json.dump({
                    "max_unlocked_level": self.max_unlocked_level
                }, f)
        except Exception:
            pass

    def build_ui(self):
        # Full screen canvas background
        self.canvas = Canvas(self.root, width=self.W, height=self.H, highlightthickness=0, bg="#0f172a")
        self.canvas.pack(fill="both", expand=True)
        
        # Binding clicks on grid cells
        self.canvas.bind("<Button-1>", self.on_canvas_click)
        
        # Left sidebar panel
        self.panel_w = 280
        self.panel_x = 20
        self.panel_y = 20
        self.panel_h = self.H - 80
        
        self.pf = tk.Frame(self.root, bg="#ffffff", highlightbackground="#cbd5e1", highlightthickness=1)
        self.pf.place(x=self.panel_x, y=self.panel_y, width=self.panel_w, height=self.panel_h)
        
        # UI controls inside left panel
        tk.Label(self.pf, text="BEE FLOWER PATH", font=("Consolas", 18, "bold"), bg="#ffffff", fg="#d97706").pack(pady=(18, 2))
        tk.Label(self.pf, text="Algorithm Sequencer", font=("Consolas", 9), bg="#ffffff", fg="#64748b").pack(pady=(0, 10))
        
        tk.Frame(self.pf, bg="#cbd5e1", height=1).pack(fill="x", padx=12, pady=4)
        
        self.lbl_level = tk.Label(self.pf, text="Level 1", font=("Consolas", 12, "bold"), bg="#ffffff", fg="#1e293b")
        self.lbl_level.pack(pady=4)
        self.lbl_diff = tk.Label(self.pf, text="● EASY", font=("Consolas", 9), bg="#ffffff", fg="#15803d")
        self.lbl_diff.pack()
        
        # Message panel
        self.mbox = tk.Frame(self.pf, bg="#f8fafc", highlightbackground="#cbd5e1", highlightthickness=1)
        self.mbox.pack(fill="x", padx=14, pady=8)
        self.lbl_msg = tk.Label(self.mbox, text="Queue your flight moves then press RUN!", font=("Consolas", 10), bg="#f8fafc", fg="#1e293b", wraplength=220, justify="center")
        self.lbl_msg.pack(padx=8, pady=10)
        
        # Queue panel HUD
        tk.Label(self.pf, text="FLIGHT QUEUE", font=("Consolas", 9), bg="#ffffff", fg="#64748b").pack(pady=(4, 2))
        self.queue_box = tk.Frame(self.pf, bg="#f8fafc", highlightbackground="#cbd5e1", highlightthickness=1)
        self.queue_box.pack(fill="x", padx=14, pady=4)
        
        self.lbl_queue = tk.Label(self.queue_box, text="[ empty ]", font=("Consolas", 11, "bold"), bg="#f8fafc", fg="#d97706", wraplength=220, justify="center")
        self.lbl_queue.pack(padx=6, pady=8)
        
        # Hex Queue Controls NW/NE, W/E, SW/SE
        hex_ctrl = tk.Frame(self.pf, bg="#ffffff")
        hex_ctrl.pack(pady=4)
        
        # Row 1: NW, NE
        r1_frame = tk.Frame(hex_ctrl, bg="#ffffff")
        r1_frame.pack(pady=2)
        self.btn_nw = tk.Button(r1_frame, text="↖ NW", font=("Consolas", 10, "bold"), bg="#f59e0b", fg="#000000", relief="flat", bd=0, cursor="hand2", command=lambda: self.add_move("NW"))
        self.btn_nw.pack(side="left", padx=3, ipadx=4)
        self.btn_ne = tk.Button(r1_frame, text="NE ↗", font=("Consolas", 10, "bold"), bg="#f59e0b", fg="#000000", relief="flat", bd=0, cursor="hand2", command=lambda: self.add_move("NE"))
        self.btn_ne.pack(side="left", padx=3, ipadx=4)
        
        # Row 2: W, E
        r2_frame = tk.Frame(hex_ctrl, bg="#ffffff")
        r2_frame.pack(pady=2)
        self.btn_w = tk.Button(r2_frame, text="⬅ W", font=("Consolas", 10, "bold"), bg="#f59e0b", fg="#000000", relief="flat", bd=0, cursor="hand2", command=lambda: self.add_move("W"))
        self.btn_w.pack(side="left", padx=8, ipadx=5)
        self.btn_e = tk.Button(r2_frame, text="E ➡️", font=("Consolas", 10, "bold"), bg="#f59e0b", fg="#000000", relief="flat", bd=0, cursor="hand2", command=lambda: self.add_move("E"))
        self.btn_e.pack(side="left", padx=8, ipadx=5)
        
        # Row 3: SW, SE
        r3_frame = tk.Frame(hex_ctrl, bg="#ffffff")
        r3_frame.pack(pady=2)
        self.btn_sw = tk.Button(r3_frame, text="↙ SW", font=("Consolas", 10, "bold"), bg="#f59e0b", fg="#000000", relief="flat", bd=0, cursor="hand2", command=lambda: self.add_move("SW"))
        self.btn_sw.pack(side="left", padx=3, ipadx=4)
        self.btn_se = tk.Button(r3_frame, text="SE ↘", font=("Consolas", 10, "bold"), bg="#f59e0b", fg="#000000", relief="flat", bd=0, cursor="hand2", command=lambda: self.add_move("SE"))
        self.btn_se.pack(side="left", padx=3, ipadx=4)
        
        # Run buttons
        self.btn_run = tk.Button(self.pf, text="▶ RUN PROGRAM", font=("Consolas", 12, "bold"), bg="#10b981", fg="#ffffff", relief="flat", bd=0, cursor="hand2", command=self.execute_queue)
        self.btn_run.pack(pady=(12, 3), padx=16, fill="x")
        
        self.btn_clear = tk.Button(self.pf, text="✕ CLEAR QUEUE", font=("Consolas", 10, "bold"), bg="#ef4444", fg="#ffffff", relief="flat", bd=0, cursor="hand2", command=self.clear_queue)
        self.btn_clear.pack(pady=2, padx=16, fill="x")
        
        self.btn_rst = tk.Button(self.pf, text="↺ RESET LEVEL", font=("Consolas", 10, "bold"), bg="#64748b", fg="#ffffff", relief="flat", bd=0, cursor="hand2", command=lambda: self.reset_level())
        self.btn_rst.pack(pady=2, padx=16, fill="x")
        
        # Navigation
        nav_frame = tk.Frame(self.pf, bg="#ffffff")
        nav_frame.pack(pady=6, fill="x", padx=16)
        
        self.btn_prev = tk.Button(nav_frame, text="◀ PREV", font=("Consolas", 9, "bold"), bg="#cbd5e1", fg="#1e293b", relief="flat", bd=0, cursor="hand2", command=self.prev_level)
        self.btn_prev.pack(side="left", expand=True, fill="x", padx=(0, 2))
        self.btn_next = tk.Button(nav_frame, text="NEXT ▶", font=("Consolas", 9, "bold"), bg="#cbd5e1", fg="#1e293b", relief="flat", bd=0, cursor="hand2", command=self.next_level)
        self.btn_next.pack(side="left", expand=True, fill="x", padx=(2, 0))
        
        # Toolbar options: Sound, Hint, DayNight
        tools_frame = tk.Frame(self.pf, bg="#ffffff")
        tools_frame.pack(pady=(8, 2), fill="x", padx=16)
        
        self.btn_snd = tk.Button(tools_frame, text="♪ SOUND ON", font=("Consolas", 8, "bold"), bg="#e2e8f0", fg="#1e293b", relief="flat", bd=0, cursor="hand2", command=self.toggle_snd)
        self.btn_snd.pack(side="left", expand=True, fill="x", padx=(0, 2))
        
        self.btn_hint = tk.Button(tools_frame, text="💡 HINT (0)", font=("Consolas", 8, "bold"), bg="#e2e8f0", fg="#1e293b", relief="flat", bd=0, cursor="hand2", command=self.use_hint)
        self.btn_hint.pack(side="left", expand=True, fill="x", padx=(2, 2))
        
        self.btn_theme = tk.Button(tools_frame, text="☼ DAY", font=("Consolas", 8, "bold"), bg="#e2e8f0", fg="#1e293b", relief="flat", bd=0, cursor="hand2", command=self.toggle_theme)
        self.btn_theme.pack(side="left", expand=True, fill="x", padx=(2, 0))
        
        # Energy and wind display
        self.lbl_stats = tk.Label(self.pf, text="Moves: 0", font=("Consolas", 9), bg="#ffffff", fg="#64748b")
        self.lbl_stats.pack(pady=4)

    def draw_bg(self):
        self.canvas.delete("bg")
        colors = C[self.theme]
        
        # Dynamic top to bottom gradient lines
        for i in range(self.H):
            frac = i / self.H
            c = self.lerp_color(colors["bg_top"], colors["bg_bot"], frac)
            self.canvas.create_line(0, i, self.W, i, fill=c, tags="bg")
            
        # Draw sky features depending on theme
        if self.theme == "day":
            # Bright Sun
            self.canvas.create_oval(self.W - 120, 40, self.W - 50, 110, fill="#fbbf24", outline="#f59e0b", width=2, tags="bg")
            # Clouds
            for cx, cy in [(self.W * 0.35, 70), (self.W * 0.72, 90)]:
                for dx, dy, r in [(-25, 0, 20), (0, -12, 25), (25, 0, 20), (0, 10, 18)]:
                    self.canvas.create_oval(cx+dx-r, cy+dy-r, cx+dx+r, cy+dy+r, fill="#ffffff", outline="", tags="bg")
        else:
            # Glowing Moon
            self.canvas.create_oval(self.W - 125, 40, self.W - 55, 110, fill="#e2e8f0", outline="#94a3b8", width=1, tags="bg")
            self.canvas.create_oval(self.W - 140, 30, self.W - 70, 100, fill=colors["bg_top"], outline="", tags="bg")
            # Star dots
            random.seed(42)
            for _ in range(50):
                x = random.randint(300, self.W)
                y = random.randint(20, 250)
                r = random.uniform(0.5, 2.0)
                self.canvas.create_oval(x-r, y-r, x+r, y+r, fill="#ffffff", outline="", tags="bg")

    def lerp_color(self, c1, c2, t):
        c1 = c1.lstrip("#")
        c2 = c2.lstrip("#")
        r1, g1, b1 = int(c1[0:2], 16), int(c1[2:4], 16), int(c1[4:6], 16)
        r2, g2, b2 = int(c2[0:2], 16), int(c2[2:4], 16), int(c2[4:6], 16)
        r = int(r1 + (r2 - r1) * t)
        g = int(g1 + (g2 - g1) * t)
        b = int(b1 + (b2 - b1) * t)
        return "#{:02x}{:02x}{:02x}".format(r, g, b)

    def load_level(self):
        self.executing = False
        self.game_won = False
        self.has_key = False
        self.collected_mask = 0
        self.collected_honey = []
        self.hint_level = 0
        self.show_paths_overlay = False
        
        level = LEVELS[self.current_level]
        self.grid_size = level["gridSize"]
        self.player_pos = list(level["start"])
        self.energy = level["energy"] if level["energy"] is not None else 100
        
        self.path_trace = [tuple(self.player_pos)]
        
        if level["movingObstacles"]:
            self.obstacle_states = [mo["start"] for mo in level["movingObstacles"]]
        else:
            self.obstacle_states = []
            
        # UI Labels
        self.lbl_level.config(text=f"Level {self.current_level + 1}: {level['name']}")
        self.lbl_diff.config(text=f"● {level['diff']}", fg=level["diffColor"])
        self.lbl_msg.config(text=level["hint"], fg="#1e293b" if self.theme=="day" else "#f8fafc")
        self.btn_hint.config(text=f"💡 HINT ({self.hints_used})")
        
        # Enable controls
        self.btn_run.config(state="normal")
        self.btn_clear.config(state="normal")
        
        self.draw_bg()
        self.calculate_layout()
        self.redraw_grid()
        self.update_stats_labels()

    def calculate_layout(self):
        # Dynamically calculate grid tile size based on dimensions
        canvas_h = self.H - 250
        canvas_w = self.W - self.panel_w - 100
        
        # Grid width in hex coordinates: (grid_size + 0.5) * cell_w
        # Grid height in hex coordinates: (0.75 * (grid_size - 1) + 1) * cell_w
        self.cell_w = int(min(canvas_w / (self.grid_size + 0.5), canvas_h / (0.75 * (self.grid_size - 1) + 1)))
        
        self.grid_w = int((self.grid_size + 0.5) * self.cell_w)
        self.grid_h = int((0.75 * (self.grid_size - 1) + 1) * self.cell_w)
        
        # Centering inside right content area
        self.grid_x = self.panel_x + self.panel_w + (self.W - self.panel_x - self.panel_w) // 2 - self.grid_w // 2
        self.grid_y = self.H // 2 - self.grid_h // 2 + 20
        self.depth = 6

    def redraw_grid(self):
        self.canvas.delete("grid")
        self.canvas.delete("overlay")
        
        level = LEVELS[self.current_level]
        colors = C[self.theme]
        
        # 1. Base grid drawing (3D extrusions)
        for r in range(self.grid_size):
            for c in range(self.grid_size):
                is_even = (r + c) % 2 == 0
                
                is_adjacent_safe = False
                if self.hint_level == 1 and not (c, r) in level["obstacles"] and not (level["gate"] and level["gate"][0] == c and level["gate"][1] == r):
                    is_adjacent_safe = is_hex_adjacent(c, r, self.player_pos[0], self.player_pos[1])
                
                # Check for trace path highlight
                if (c, r) in self.path_trace:
                    fill = "#fef08a" if self.theme == "day" else "#854d0e"
                    sh = "#ca8a04" if self.theme == "day" else "#451a03"
                    hl = "#fde047"
                elif self.hint_level == 3 and self.optimal_route_coords and (c, r) in self.optimal_route_coords:
                    # Highlight full optimal BFS path (Green)
                    fill = "#bbf7d0" if self.theme == "day" else "#064e3b"
                    sh = "#16a34a" if self.theme == "day" else "#022c22"
                    hl = "#86efac"
                elif is_adjacent_safe:
                    # Highlight safe adjacent neighbors (Light Green/Cyan)
                    fill = "#ccfbf1" if self.theme == "day" else "#115e59"
                    sh = "#0d9488" if self.theme == "day" else "#134e4a"
                    hl = "#99f6e4"
                else:
                    fill = colors["tile_a"] if is_even else colors["tile_b"]
                    sh = colors["tile_sh"]
                    hl = colors["tile_hl"]
                    
                self.draw_3d_cell(c, r, fill, hl, sh)
                
        # 2. Draw Start Tile tag
        start_cell = level["start"]
        sx, sy = self.cell_to_px(*start_cell)
        self.canvas.create_text(sx + self.cell_w//2, sy + self.cell_w * 0.8, text="START", font=("Consolas", 7, "bold"), fill="#1e293b" if self.theme=="day" else "#f8fafc", tags="grid")
        
        # 3. Draw static obstacles
        for ox, oy in level["obstacles"]:
            ox_px, oy_px = self.cell_to_px(ox, oy)
            cx, cy = ox_px + self.cell_w//2, oy_px + self.cell_w//2
            
            # Simple emoji shapes at hex center
            self.canvas.create_text(cx, cy - 2, text="🪨", font=("Segoe UI Emoji", int(self.cell_w * 0.42)), tags="grid")
            
        # 4. Draw Collectible key
        if level["key"] and not self.has_key:
            kx, ky = level["key"]
            kx_px, ky_px = self.cell_to_px(kx, ky)
            cx, cy = kx_px + self.cell_w//2, ky_px + self.cell_w//2
            self.canvas.create_text(cx, cy, text="🔑", font=("Segoe UI Emoji", int(self.cell_w * 0.45)), tags="grid")
            
        # 5. Draw Gate
        if level["gate"]:
            gx, gy = level["gate"]
            gx_px, gy_px = self.cell_to_px(gx, gy)
            cx, cy = gx_px + self.cell_w//2, gy_px + self.cell_w//2
            gate_col = "#e2e8f0" if self.has_key else "#ef4444"
            self.canvas.create_oval(cx - 16, cy - 16, cx + 16, cy + 16, fill=gate_col, outline="#000000", width=2, tags="grid")
            lock_str = "🔓" if self.has_key else "🔒"
            self.canvas.create_text(cx, cy, text=lock_str, font=("Segoe UI Emoji", int(self.cell_w * 0.38)), tags="grid")
            
        # 6. Draw Honey jars
        for hx, hy in level["honey"]:
            if (hx, hy) not in self.collected_honey:
                hx_px, hy_px = self.cell_to_px(hx, hy)
                cx, cy = hx_px + self.cell_w//2, hy_px + self.cell_w//2
                self.canvas.create_text(cx, cy, text="🍯", font=("Segoe UI Emoji", int(self.cell_w * 0.45)), tags="grid")
                
        # 7. Draw Goals (Flowers)
        for idx, g in enumerate(level["goals"]):
            g_collected = (self.collected_mask & (1 << idx)) != 0
            if not g_collected:
                gx_px, gy_px = self.cell_to_px(g[0], g[1])
                cx, cy = gx_px + self.cell_w//2, gy_px + self.cell_w//2
                self.canvas.create_text(cx, cy, text="🌸" if idx%2==0 else "🌺", font=("Segoe UI Emoji", int(self.cell_w * 0.48)), tags="grid")
                
        # 8. Draw Moving Frogs
        if level["movingObstacles"]:
            for fx, fy in self.obstacle_states:
                fx_px, fy_px = self.cell_to_px(fx, fy)
                cx, cy = fx_px + self.cell_w//2, fy_px + self.cell_w//2
                self.canvas.create_text(cx, cy, text="🐸", font=("Segoe UI Emoji", int(self.cell_w * 0.45)), tags="grid")

        # 9. Draw Path comparisons overlay lines
        if self.show_paths_overlay:
            # User path (Red) vs Optimal path (Green)
            if self.optimal_route_coords:
                for cx, cy in self.optimal_route_coords:
                    x1, y1 = self.cell_to_px(cx, cy)
                    top_coords = [
                        x1 + self.cell_w * 0.5, y1 + 2,
                        x1 + self.cell_w - 2, y1 + self.cell_w * 0.25 + 1,
                        x1 + self.cell_w - 2, y1 + self.cell_w * 0.75 - 1,
                        x1 + self.cell_w * 0.5, y1 + self.cell_w - 2,
                        x1 + 2, y1 + self.cell_w * 0.75 - 1,
                        x1 + 2, y1 + self.cell_w * 0.25 + 1
                    ]
                    self.canvas.create_polygon(top_coords, fill="", outline="#22c55e", width=3, tags="grid")

            for cx, cy in self.path_trace:
                if (cx, cy) != self.path_trace[0] and (cx, cy) != tuple(self.player_pos):
                    px_x, px_y = self.cell_to_px(cx, cy)
                    mx, my = px_x + self.cell_w // 2, px_y + self.cell_w // 2
                    self.canvas.create_oval(mx - 5, my - 5, mx + 5, my + 5, fill="#ef4444", outline="#b91c1c", width=1, tags="grid")

        # 10. Draw Bee Player
        px_val, py_val = self.cell_to_px(self.player_pos[0], self.player_pos[1])
        cx, cy = px_val + self.cell_w//2, py_val + self.cell_w//2
        # Bee representation
        tag_f = "bee_flash" if self.flashing_player else "grid"
        self.canvas.create_oval(cx - 16, cy - 12, cx + 16, cy + 12, fill="#eab308" if not self.flashing_player else "#ef4444", outline="#713f12", width=2, tags=tag_f)
        # wing left
        self.canvas.create_oval(cx - 10, cy - 20, cx - 2, cy - 6, fill="#f1f5f9", outline="#94a3b8", tags=tag_f)
        # wing right
        self.canvas.create_oval(cx + 2, cy - 20, cx + 10, cy - 6, fill="#f1f5f9", outline="#94a3b8", tags=tag_f)
        self.canvas.create_text(cx, cy, text="🐝", font=("Segoe UI Emoji", int(self.cell_w * 0.42)), tags=tag_f)
        
    def draw_3d_cell(self, c, r, fill, hl, sh):
        x1, y1 = self.cell_to_px(c, r)
        d = self.depth
        
        # 1. Shadow polygon depth
        p2 = (x1 + self.cell_w, y1 + self.cell_w * 0.25)
        p3 = (x1 + self.cell_w, y1 + self.cell_w * 0.75)
        p4 = (x1 + self.cell_w * 0.5, y1 + self.cell_w)
        p5 = (x1, y1 + self.cell_w * 0.75)
        
        shadow_coords = [
            p2[0], p2[1],
            p3[0], p3[1],
            p4[0], p4[1],
            p5[0], p5[1],
            p5[0], p5[1] + d,
            p4[0], p4[1] + d,
            p3[0], p3[1] + d,
            p2[0], p2[1] + d
        ]
        self.canvas.create_polygon(shadow_coords, fill=sh, outline="", tags="grid")
        
        # 2. Top surface hexagon
        top_coords = [
            x1 + self.cell_w * 0.5, y1,
            x1 + self.cell_w, y1 + self.cell_w * 0.25,
            x1 + self.cell_w, y1 + self.cell_w * 0.75,
            x1 + self.cell_w * 0.5, y1 + self.cell_w,
            x1, y1 + self.cell_w * 0.75,
            x1, y1 + self.cell_w * 0.25
        ]
        self.canvas.create_polygon(top_coords, fill=fill, outline=sh, width=1, tags="grid")
        
        # 3. Spec highlight line (top/left edges)
        self.canvas.create_line(
            x1 + 2, y1 + self.cell_w * 0.75 - 1,
            x1 + 2, y1 + self.cell_w * 0.25 + 1,
            x1 + self.cell_w * 0.5, y1 + 2,
            x1 + self.cell_w - 2, y1 + self.cell_w * 0.25 + 1,
            fill=hl, width=1, tags="grid"
        )

    def cell_to_px(self, c, r):
        x = self.grid_x + c * self.cell_w + (self.cell_w * 0.5 if r % 2 == 1 else 0)
        y = self.grid_y + r * self.cell_w * 0.75
        return x, y

    def on_canvas_click(self, event):
        if self.executing or self.game_won:
            return
            
        x, y = event.x, event.y
        
        # Hex distance picking
        best_cell = None
        min_dist = float('inf')
        for r in range(self.grid_size):
            for c in range(self.grid_size):
                cx_tl, cy_tl = self.cell_to_px(c, r)
                cx = cx_tl + self.cell_w * 0.5
                cy = cy_tl + self.cell_w * 0.5
                dist = (x - cx) ** 2 + (y - cy) ** 2
                if dist < min_dist:
                    min_dist = dist
                    best_cell = (c, r)
                    
        if best_cell is None or min_dist > (self.cell_w * 0.65) ** 2:
            return
            
        col, row = best_cell
        last_cell = self.path_trace[-1]
        if last_cell[0] == col and last_cell[1] == row:
            return
            
        if is_hex_adjacent(col, row, last_cell[0], last_cell[1]):
            level = LEVELS[self.current_level]
            if (col, row) in level["obstacles"] or [col, row] in level["obstacles"]:
                return
            if level["gate"] and level["gate"][0] == col and level["gate"][1] == row and not self.has_key:
                path_has_key = self.has_key
                if level["key"] and tuple(level["key"]) in self.path_trace:
                    path_has_key = True
                if not path_has_key:
                    return
                    
            self.path_trace.append((col, row))
            
            # Find direction name
            dname = ""
            lx, ly = last_cell
            for d in ["NW", "NE", "E", "SE", "SW", "W"]:
                nx, ny = lx, ly
                if d == "W":
                    nx -= 1
                elif d == "E":
                    nx += 1
                elif d == "NW":
                    if ly % 2 == 0: nx -= 1; ny -= 1
                    else: ny -= 1
                elif d == "NE":
                    if ly % 2 == 0: ny -= 1
                    else: nx += 1; ny -= 1
                elif d == "SW":
                    if ly % 2 == 0: nx -= 1; ny += 1
                    else: ny += 1
                elif d == "SE":
                    if ly % 2 == 0: ny += 1
                    else: nx += 1; ny += 1
                if nx == col and ny == row:
                    dname = d
                    break
                    
            if dname:
                self.move_queue.append(dname)
                play("add")
                self.redraw_grid()
                self.refresh_queue_hud()

    def add_move(self, direction):
        if self.game_won or self.executing: return
        self.move_queue.append(direction)
        play("add")
        self.refresh_queue_hud()

    def clear_queue(self):
        if self.executing or self.game_won: return
        self.move_queue.clear()
        play("clear")
        self.path_trace = [tuple(LEVELS[self.current_level]["start"])]
        self.redraw_grid()
        self.refresh_queue_hud()

    def refresh_queue_hud(self):
        if self.move_queue:
            q_str = " → ".join(DIR_SYMBOLS[d] for d in self.move_queue)
            self.lbl_queue.config(text=q_str, fg="#d97706")
        else:
            self.lbl_queue.config(text="[ empty ]", fg="#64748b")
        self.update_stats_labels()

    def execute_queue(self):
        if self.game_won or self.executing or not self.move_queue:
            return
            
        self.executing = True
        self.btn_run.config(state="disabled")
        self.btn_clear.config(state="disabled")
        
        level = LEVELS[self.current_level]
        step_idx = [0]
        curr_pos = list(level["start"])
        curr_energy = level["energy"] if level["energy"] is not None else 100
        path_walked = [tuple(curr_pos)]
        
        interval = 700 if level["rain"] else 400
        
        def run_step():
            if not self.executing:
                return
                
            idx = step_idx[0]
            if idx >= len(self.move_queue):
                self.executing = False
                self.btn_run.config(state="normal")
                self.btn_clear.config(state="normal")
                
                # Check target completion
                target_mask = (1 << len(level["goals"])) - 1
                if self.collected_mask == target_mask:
                    self.trigger_success()
                else:
                    play("failure")
                    self.lbl_msg.config(text="Stranded! The bee did not reach all flowers. Retry!", fg="#ef4444")
                    self.flash_player()
                    self.root.after(1000, lambda: self.reset_level(True))
                return
                
            move = self.move_queue[idx]
            step_idx[0] += 1
            self.steps = step_idx[0]
            
            nonlocal curr_pos, curr_energy
            curr_energy -= 1
            self.energy = curr_energy
            
            x, y = curr_pos
            nx, ny = x, y
            if move == "W":
                nx -= 1
            elif move == "E":
                nx += 1
            elif move == "NW":
                if y % 2 == 0: nx -= 1; ny -= 1
                else: ny -= 1
            elif move == "NE":
                if y % 2 == 0: ny -= 1
                else: nx += 1; ny -= 1
            elif move == "SW":
                if y % 2 == 0: nx -= 1; ny += 1
                else: ny += 1
            elif move == "SE":
                if y % 2 == 0: ny += 1
                else: nx += 1; ny += 1
            
            # 1. boundary
            if nx < 0 or nx >= self.grid_size or ny < 0 or ny >= self.grid_size:
                self.executing = False
                play("failure")
                self.lbl_msg.config(text=f"Boundary crash going {move}! Resetting...", fg="#ef4444")
                self.flash_player()
                self.root.after(1000, lambda: self.reset_level(True))
                return
                
            # 2. Obstacle
            if (nx, ny) in level["obstacles"] or [nx, ny] in level["obstacles"]:
                self.executing = False
                play("failure")
                self.lbl_msg.config(text="Crashed into a forest obstacle! Resetting...", fg="#ef4444")
                self.flash_player()
                self.root.after(1000, lambda: self.reset_level(True))
                return
                
            # 3. Gate
            if level["gate"] and level["gate"][0] == nx and level["gate"][1] == ny and not self.has_key:
                self.executing = False
                play("failure")
                self.lbl_msg.config(text="Locked Gate! Key is required.", fg="#ef4444")
                self.flash_player()
                self.root.after(1000, lambda: self.reset_level(True))
                return
                
            # 4. Moving Frogs
            if level["movingObstacles"]:
                self.obstacle_states = [get_frog_pos_t(f_idx, step_idx[0]) for f_idx in range(len(level["movingObstacles"]))]
                
                # Check hits
                if (nx, ny) in self.obstacle_states:
                    self.executing = False
                    play("failure")
                    self.lbl_msg.config(text="Oops! Collided with a jumping frog!", fg="#ef4444")
                    self.flash_player()
                    self.root.after(1000, lambda: self.reset_level(True))
                    return
                    
            # 5. Energy drain
            if curr_energy < 0:
                self.executing = False
                play("failure")
                self.lbl_msg.config(text="Out of energy! Route is too long.", fg="#ef4444")
                self.flash_player()
                self.root.after(1000, lambda: self.reset_level(True))
                return
                
            # 6. Wind push
            if level["wind"] and step_idx[0] % level["wind"]["interval"] == 0:
                wind_dir = level["wind"]["dir"]
                if wind_dir == "W":
                    nx -= 1
                elif wind_dir == "E":
                    nx += 1
                elif wind_dir == "NW":
                    if ny % 2 == 0: nx -= 1; ny -= 1
                    else: ny -= 1
                elif wind_dir == "NE":
                    if ny % 2 == 0: ny -= 1
                    else: nx += 1; ny -= 1
                elif wind_dir == "SW":
                    if ny % 2 == 0: nx -= 1; ny += 1
                    else: ny += 1
                elif wind_dir == "SE":
                    if ny % 2 == 0: ny += 1
                    else: nx += 1; ny += 1
                
                self.lbl_msg.config(text="Gust of wind pushes the bee!", fg="#0d9488")
                
                # checks
                if nx < 0 or nx >= self.grid_size or ny < 0 or ny >= self.grid_size:
                    self.executing = False
                    play("failure")
                    self.lbl_msg.config(text="Wind blew the bee out of bounds!", fg="#ef4444")
                    self.flash_player()
                    self.root.after(1000, lambda: self.reset_level(True))
                    return
                if (nx, ny) in level["obstacles"] or [nx, ny] in level["obstacles"]:
                    self.executing = False
                    play("failure")
                    self.lbl_msg.config(text="Wind blew the bee into a bush!", fg="#ef4444")
                    self.flash_player()
                    self.root.after(1000, lambda: self.reset_level(True))
                    return
                if level["gate"] and level["gate"][0] == nx and level["gate"][1] == ny and not self.has_key:
                    self.executing = False
                    play("failure")
                    self.lbl_msg.config(text="Wind blew the bee into the locked gate!", fg="#ef4444")
                    self.flash_player()
                    self.root.after(1000, lambda: self.reset_level(True))
                    return
                if level["movingObstacles"] and (nx, ny) in self.obstacle_states:
                    self.executing = False
                    play("failure")
                    self.lbl_msg.config(text="Wind blew the bee into a jumping frog!", fg="#ef4444")
                    self.flash_player()
                    self.root.after(1000, lambda: self.reset_level(True))
                    return
            
            # Land safely
            curr_pos = [nx, ny]
            self.player_pos = curr_pos
            path_walked.append(tuple(curr_pos))
            self.path_trace = path_walked
            play("buzz")
            
            # Collect key
            if level["key"] and level["key"][0] == nx and level["key"][1] == ny and not self.has_key:
                self.has_key = True
                play("key")
                self.lbl_msg.config(text="Collected key! Gates unlocked.", fg="#d97706")
                
            # Collect honey
            if (nx, ny) in level["honey"] and (nx, ny) not in self.collected_honey:
                self.collected_honey.append((nx, ny))
                play("honey")
                
            # Collect flower
            for g_idx, goal in enumerate(level["goals"]):
                if goal[0] == nx and goal[1] == ny:
                    is_collected = (self.collected_mask & (1 << g_idx)) != 0
                    if not is_collected:
                        self.collected_mask |= (1 << g_idx)
                        play("flower")
                        
            self.redraw_grid()
            self.update_stats_labels()
            
            # schedule next step
            self.root.after(interval, run_step)

        def get_frog_pos_t(f_idx, step):
            fpath = level["movingObstacles"][f_idx]["path"]
            return fpath[step % len(fpath)]

        # launch first step
        run_step()

    def flash_player(self):
        self.flashing_player = True
        self.redraw_grid()
        
    def trigger_success(self):
        self.game_won = True
        play("win")
        
        # Calculate optimal comparison
        level = LEVELS[self.current_level]
        opt = solve_bfs(level)
        opt_len = len(opt[1]) if opt else len(self.move_queue)
        eff = int((opt_len / len(self.move_queue)) * 100)
        
        score = max(10, 100 - (len(self.move_queue) - opt_len) * 5 - self.hints_used * 15 + len(self.collected_honey) * 20)
        
        stars = 1
        if eff >= 90 and self.hints_used == 0: stars = 3
        elif eff >= 65: stars = 2
        
        msg = f"🎉 SUCCESS! You collected all flowers!\nScore: {score} | Efficiency: {eff}% ({stars} ★)"
        self.lbl_msg.config(text=msg, fg="#10b981")
        
        # Save progress
        next_lvl = max(self.max_unlocked_level, self.current_level + 1)
        self.max_unlocked_level = next_lvl
        self.save_local_progress()
        
        # Enable route path overlay comparison
        self.show_paths_overlay = True
        self.optimal_route_coords = opt[0] if opt else None
        self.redraw_grid()

    def reset_level(self, silent=False):
        self.player_pos = list(LEVELS[self.current_level]["start"])
        self.steps = 0
        self.executing = False
        self.game_won = False
        self.has_key = False
        self.collected_mask = 0
        self.collected_honey = []
        self.flashing_player = False
        self.path_trace = [tuple(self.player_pos)]
        self.show_paths_overlay = False
        
        level = LEVELS[self.current_level]
        self.energy = level["energy"] if level["energy"] is not None else 100
        
        if level["movingObstacles"]:
            self.obstacle_states = [mo["start"] for mo in level["movingObstacles"]]
        else:
            self.obstacle_states = []
            
        if not silent:
            play("reset")
            self.lbl_msg.config(text=level["hint"], fg="#1e293b" if self.theme=="day" else "#f8fafc")
            
        self.redraw_grid()
        self.update_stats_labels()

    def use_hint(self):
        if self.game_won or self.executing: return
        self.hints_used += 1
        self.hint_level = min(3, self.hint_level + 1)
        play("key")
        
        level = LEVELS[self.current_level]
        opt = solve_bfs(level)
        self.optimal_route_coords = opt[0] if opt else None
        
        if self.hint_level == 1:
            self.lbl_msg.config(text="Hint 1: Safe grid cells surrounding bee highlighted in grid!", fg="#6d28d9")
        elif self.hint_level == 2:
            if opt and opt[1]:
                self.lbl_msg.config(text=f"Hint 2: Recommended next step is {opt[1][0]}!", fg="#6d28d9")
            else:
                self.lbl_msg.config(text="Hint 2: Reset and clear queue to search path.", fg="#6d28d9")
        else:
            self.lbl_msg.config(text="Hint 3: Full optimal BFS path highlighted in Green!", fg="#6d28d9")
            
        self.btn_hint.config(text=f"💡 HINT ({self.hints_used})")
        self.redraw_grid()

    def toggle_snd(self):
        global sound_on
        sound_on = not sound_on
        self.btn_snd.config(text="♪ SOUND ON" if sound_on else "♪ MUTED")
        play("add")

    def toggle_theme(self):
        self.theme = "night" if self.theme == "day" else "day"
        self.btn_theme.config(text="☽ NIGHT" if self.theme == "night" else "☼ DAY")
        
        # Style panel accordingly
        bg_col = "#1e293b" if self.theme == "night" else "#ffffff"
        text_col = "#f8fafc" if self.theme == "night" else "#1e293b"
        self.pf.config(bg=bg_col)
        self.lbl_level.config(bg=bg_col, fg=text_col)
        self.lbl_diff.config(bg=bg_col)
        self.lbl_stats.config(bg=bg_col, fg=text_col)
        
        self.draw_bg()
        self.redraw_grid()

    def prev_level(self):
        if self.current_level > 0:
            self.current_level -= 1
            self.hints_used = 0
            self.load_level()
            play("clear")

    def next_level(self):
        if self.current_level < len(LEVELS) - 1 and self.current_level < self.max_unlocked_level:
            self.current_level += 1
            self.hints_used = 0
            self.load_level()
            play("clear")

    def update_stats_labels(self):
        level = LEVELS[self.current_level]
        energy_str = f" | Energy: {self.energy}" if level["energy"] is not None else ""
        self.lbl_stats.config(text=f"Queue Count: {len(self.move_queue)} | Steps: {self.steps}{energy_str}")

# ── standalone launch ────────────────────────────────────────────────────────
if __name__ == "__main__":
    win = tk.Tk()
    app = BeeFlowerPathGame(win)
    win.mainloop()
