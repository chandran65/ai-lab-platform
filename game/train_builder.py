import tkinter as tk
import random

class TrainGame:
    def __init__(self, root):
        self.root = root
        self.root.title("🚂 Choo Choo Train Builder!")
        self.root.geometry("1200x800")  # Made wider and taller for perfect spacing
        self.root.configure(bg="#87CEEB") 
        
        self.stars = 0
        self.level = 1
        self.max_level = 1
        self.attempts = 0
        self.selected_item = None
        
        self.levels = {
            1: {"cars": ["engine", "car1", "car2", "car3", "caboose"], "shuffle": False, "hints": True},
            2: {"cars": ["engine", "car1", "car2", "car3", "caboose"], "shuffle": True, "hints": True},
            3: {"cars": ["engine", "car1", "car2", "car3", "caboose"], "shuffle": True, "hints": True},
            4: {"cars": ["engine", "car1", "car2", "car3", "caboose"], "shuffle": True, "hints": True},
            5: {"cars": ["engine", "car1", "car2", "car3", "caboose"], "shuffle": True, "hints": False},
            6: {"cars": ["engine", "car1", "car2", "car3", "car4", "car5", "caboose"], "shuffle": True, "hints": True},
            7: {"cars": ["engine", "car1", "car2", "car3", "car4", "car5", "caboose"], "shuffle": True, "hints": False},
            8: {"cars": ["engine", "car1", "car2", "car3", "car4", "car5", "car6", "car7", "caboose"], "shuffle": True, "hints": False}
        }
        
        self.car_info = {
            "engine": {"emoji": "🚂", "name": "ENGINE", "color": "#FF4500", "order": 0},
            "car1": {"emoji": "🍎", "name": "APPLE", "color": "#FF3366", "order": 1},
            "car2": {"emoji": "☀️", "name": "SUN", "color": "#FFCC00", "order": 2},
            "car3": {"emoji": "🐸", "name": "FROG", "color": "#33CC33", "order": 3},
            "car4": {"emoji": "💧", "name": "WATER", "color": "#3399FF", "order": 4},
            "car5": {"emoji": "🦄", "name": "PONY", "color": "#CC66FF", "order": 5},
            "car6": {"emoji": "🦋", "name": "BUG", "color": "#00CCCC", "order": 6},
            "car7": {"emoji": "🌙", "name": "MOON", "color": "#1abc9c", "order": 7},
            "caboose": {"emoji": "🐶", "name": "PUPPY", "color": "#FF9933", "order": -1}
        }
        
        self.drag_data = {"x": 0, "y": 0}
        self.track_slots = []
        self.station_cars = {}
        self.confetti_particles = []
        
        self.build_menu()
    
    def clear_all(self):
        for widget in self.root.winfo_children():
            widget.destroy()
        self.track_slots = []
        self.station_cars = {}
        self.confetti_particles = []
        self.selected_item = None
        
    def build_menu(self):
        self.clear_all()
        tk.Label(self.root, text="🚂 Magical Train Builder!", font=("Comic Sans MS", 45, "bold"), bg="#87CEEB", fg="#FF4500").pack(pady=30)
        tk.Label(self.root, text="Let's build a colorful train together!", font=("Comic Sans MS", 20), bg="#87CEEB", fg="#333333").pack(pady=10)
        
        btn_frame = tk.Frame(self.root, bg="#87CEEB")
        btn_frame.pack(pady=40)
        
        tk.Button(btn_frame, text="▶️ PLAY TIME!", font=("Comic Sans MS", 24, "bold"), bg="#33CC33", fg="white", width=15, height=2, bd=5, relief="raised", command=self.show_levels).pack(pady=15)
        tk.Button(btn_frame, text="📖 How to Play", font=("Comic Sans MS", 16), bg="#3399FF", fg="white", width=15, height=1, bd=4, command=self.show_help).pack(pady=10)
        
        tk.Label(self.root, text=f"⭐ Your Gold Stars: {self.stars} ⭐", font=("Comic Sans MS", 20, "bold"), bg="#87CEEB", fg="#FFCC00").pack(pady=20)

    def show_levels(self):
        self.clear_all()
        tk.Label(self.root, text="🗺️ Pick a Fun Level!", font=("Comic Sans MS", 36, "bold"), bg="#87CEEB", fg="#FF4500").pack(pady=20)
        
        grid = tk.Frame(self.root, bg="#87CEEB")
        grid.pack(pady=20)
        
        for lvl in range(1, 9):
            unlocked = lvl <= self.max_level
            completed = lvl < self.max_level
            bg_color = "#FFFFFF" if unlocked else "#CCCCCC"
            
            frame = tk.Frame(grid, bg=bg_color, bd=5, relief="ridge", width=220, height=160)
            frame.grid(row=(lvl-1)//4, column=(lvl-1)%4, padx=15, pady=15)
            frame.grid_propagate(False)
            
            if unlocked:
                status = "✅" if completed else "🎯"
                tk.Label(frame, text=f"{status} Level {lvl}", font=("Comic Sans MS", 16, "bold"), bg=bg_color, fg="#33CC33" if completed else "#FF9933").pack(pady=5)
                tk.Label(frame, text=f"{'⭐' * min(lvl, 5)}", font=("Arial", 14), bg=bg_color, fg="#FFCC00").pack()
                
                tk.Button(frame, text="▶️ GO!" if not completed else "🔄 Play Again", font=("Comic Sans MS", 14, "bold"), bg="#33CC33" if not completed else "#3399FF", fg="white", command=lambda l=lvl: self.start_level(l)).pack(pady=15)
            else:
                tk.Label(frame, text="🔒", font=("Arial", 30), bg=bg_color, fg="#777").pack(expand=True)
                tk.Label(frame, text="Locked", font=("Comic Sans MS", 12), bg=bg_color, fg="#777").pack()
                
        tk.Button(self.root, text="⬅️ Back Home", font=("Comic Sans MS", 16, "bold"), bg="#FF3366", fg="white", bd=4, command=self.build_menu).pack(pady=20)

    def show_help(self):
        self.clear_all()
        tk.Label(self.root, text="📖 How to Play", font=("Comic Sans MS", 36, "bold"), bg="#87CEEB", fg="#FF4500").pack(pady=20)
        help_text = "1. Grab a colorful train car from the bottom.\n2. Look at the Guide Box to see the correct order.\n3. Put the ENGINE first, then the colorful cars in order!\n4. Put the CABOOSE at the very end.\n5. Click 'CHOO CHOO!' to see if you win!"
        tk.Label(self.root, text=help_text, font=("Comic Sans MS", 18), justify="left", bg="#FFFFFF", fg="#333", padx=30, pady=20, bd=4, relief="ridge").pack(pady=20)
        tk.Button(self.root, text="🚀 Let's Go!", font=("Comic Sans MS", 20, "bold"), bg="#33CC33", fg="white", bd=5, padx=30, pady=10, command=self.show_levels).pack()

    def start_level(self, lvl):
        self.level = lvl
        self.attempts = 0
        config = self.levels[lvl]
        self.car_info["caboose"]["order"] = len(config["cars"]) - 1
        self.clear_all()
        
        # HUD Panel
        hud = tk.Frame(self.root, bg="#3399FF", height=55)
        hud.pack(fill="x")
        tk.Label(hud, text=f"🎈 Level {self.level}", font=("Comic Sans MS", 18, "bold"), bg="#3399FF", fg="white").pack(side="left", padx=20, pady=10)
        tk.Label(hud, text=f"⭐ {self.stars} Stars", font=("Comic Sans MS", 18, "bold"), bg="#3399FF", fg="#FFCC00").pack(side="right", padx=20, pady=10)
        
        # Canvas Game Area
        self.canvas = tk.Canvas(self.root, bg="#87CEEB", highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)
        
        self.draw_scenery()
        self.draw_guide_box(config)
        self.draw_tracks(config)
        self.spawn_cars(config)
        
        self.canvas.tag_bind("car", "<ButtonPress-1>", self.on_car_press)
        self.canvas.tag_bind("car", "<B1-Motion>", self.on_car_drag)
        self.canvas.tag_bind("car", "<ButtonRelease-1>", self.on_car_release)
        
        # Action Bar Buttons
        ctrls = tk.Frame(self.root, bg="#66CDAA")
        ctrls.pack(side="bottom", fill="x", pady=15)
        
        tk.Button(ctrls, text="🚂 CHOO CHOO! (Check)", font=("Comic Sans MS", 18, "bold"), bg="#FF4500", fg="white", bd=5, padx=25, command=self.check_answer).pack(side="left", padx=25)
        tk.Button(ctrls, text="🔄 Start Over", font=("Comic Sans MS", 14), bg="#FF3366", fg="white", bd=4, padx=15, command=lambda: self.start_level(self.level)).pack(side="left", padx=10)
        
        if config["hints"]:
            tk.Button(ctrls, text="💡 Need Help?", font=("Comic Sans MS", 14), bg="#FFCC00", fg="#333", bd=4, padx=15, command=self.show_hint).pack(side="left", padx=10)
            
        tk.Button(ctrls, text="⬅️ Quit", font=("Comic Sans MS", 14), bg="#777", fg="white", bd=4, padx=15, command=self.show_levels).pack(side="right", padx=25)
        
        self.feedback_label = tk.Label(self.root, text="👆 Drag the cars onto the track!", font=("Comic Sans MS", 16, "bold"), bg="#FFFFFF", fg="#FF4500", pady=10, bd=3, relief="ridge")
        self.feedback_label.pack(side="bottom", fill="x", padx=20)

    def draw_scenery(self):
        self.canvas.create_oval(1050, -20, 1250, 180, fill="#FFD700", outline="#FFA500", width=3)
        self.canvas.create_oval(1070, 0, 1230, 160, fill="#FFFF00", outline="")
        
        clouds = [(450, 40), (850, 50), (930, 70)]
        for cx, cy in clouds:
            self.canvas.create_oval(cx, cy, cx+60, cy+40, fill="white", outline="")
            self.canvas.create_oval(cx+25, cy-20, cx+85, cy+30, fill="white", outline="")
            self.canvas.create_oval(cx+50, cy, cx+110, cy+40, fill="white", outline="")
            
        self.canvas.create_rectangle(0, 420, 1200, 800, fill="#7CFC00", outline="")
        self.canvas.create_rectangle(0, 460, 1200, 800, fill="#32CD32", outline="")
        self.canvas.create_rectangle(0, 530, 1200, 800, fill="#228B22", outline="")
        
        for _ in range(15):
            fx = random.randint(20, 1180)
            fy = random.randint(480, 540)
            color = random.choice(["#FFB6C1", "#FFD700", "#FFFFFF", "#FF69B4"])
            self.canvas.create_oval(fx, fy, fx+10, fy+10, fill=color, outline="white")

    def draw_guide_box(self, config):
        box_x1, box_y1 = 30, 20
        box_width = 380
        box_height = 95
        box_x2, box_y2 = box_x1 + box_width, box_y1 + box_height
        
        self.canvas.create_rectangle(box_x1+4, box_y1+4, box_x2+4, box_y2+4, fill="#444", stipple="gray50", outline="")
        self.canvas.create_rectangle(box_x1, box_y1, box_x2, box_y2, fill="#FFFDEE", outline="#FF8C00", width=4)
        
        self.canvas.create_text(box_x1 + box_width//2, box_y1 + 18, text="🗺️ Train Blueprint Order:", font=("Comic Sans MS", 12, "bold"), fill="#8B4513")
        
        sorted_cars = sorted(config["cars"], key=lambda c: self.car_info[c]["order"])
        start_emoji_x = box_x1 + 30
        spacing = (box_width - 60) / max(1, len(sorted_cars) - 1) if len(sorted_cars) > 1 else 0
        
        for i, car in enumerate(sorted_cars):
            ex = start_emoji_x + (i * spacing) if spacing else box_x1 + box_width//2
            self.canvas.create_text(ex, box_y1 + 55, text=self.car_info[car]["emoji"], font=("Arial", 22))
            
            if i < len(sorted_cars) - 1:
                self.canvas.create_text(ex + (spacing/2), box_y1 + 55, text="➔", font=("Arial", 12, "bold"), fill="#FFA500")

    def draw_tracks(self, config):
        num_slots = len(config["cars"])
        slot_width = 125
        total_slots_width = num_slots * slot_width
        start_x = (1200 - total_slots_width) // 2
        
        self.canvas.create_rectangle(start_x - 30, 280, start_x + total_slots_width + 30, 325, fill="#A9A9A9", outline="", stipple="gray25")
        
        for px in range(start_x - 20, start_x + total_slots_width + 20, 24):
            self.canvas.create_rectangle(px, 285, px+12, 320, fill="#8B5A2B", outline="#5C4033", width=1.5)
            
        self.canvas.create_rectangle(start_x - 30, 292, start_x + total_slots_width + 30, 296, fill="#D3D3D3", outline="#555")
        self.canvas.create_rectangle(start_x - 30, 310, start_x + total_slots_width + 30, 314, fill="#D3D3D3", outline="#555")

        self.track_slots = []
        for i in range(num_slots):
            x1, y1 = start_x + (i * slot_width), 190
            x2, y2 = x1 + 112, 300
            
            slot_id = self.canvas.create_rectangle(x1, y1, x2, y2, fill="", outline="#FFFFFF", width=3, dash=(8,4))
            labels = ["START"] + [str(j) for j in range(2, num_slots)] + ["END"]
            
            self.canvas.create_rectangle(x1+15, y1+20, x2-15, y1+50, fill="#FFFFFF", outline="")
            self.canvas.create_text((x1+x2)//2, y1+35, text=labels[i], font=("Comic Sans MS", 12, "bold"), fill="#333")
            
            self.track_slots.append({"bounds": (x1, y1, x2, y2), "car_tag": None, "id": slot_id})

    def spawn_cars(self, config):
        car_types = config["cars"][:]
        if config["shuffle"]:
            random.shuffle(car_types)
            
        total_cars_width = len(car_types) * 130
        car_start_x = (1200 - total_cars_width) // 2
        
        for idx, car_type in enumerate(car_types):
            info = self.car_info[car_type]
            cx1, cy1 = car_start_x + (idx * 130), 470
            cx2, cy2 = cx1 + 112, 580
            
            tag = f"car_{idx}"
            
            shadow = self.canvas.create_rectangle(cx1+6, cy1+6, cx2+6, cy2+6, fill="#1A4A1A", outline="", tags=(tag, "car"))
            
            w1 = self.canvas.create_oval(cx1+16, cy2-10, cx1+36, cy2+10, fill="#111", tags=(tag, "car"))
            w2 = self.canvas.create_oval(cx2-36, cy2-10, cx2-16, cy2+10, fill="#111", tags=(tag, "car"))
            w1_inner = self.canvas.create_oval(cx1+22, cy2-4, cx1+30, cy2+4, fill="white", tags=(tag, "car"))
            w2_inner = self.canvas.create_oval(cx2-30, cy2-4, cx2-22, cy2+4, fill="white", tags=(tag, "car"))
            
            rect = self.canvas.create_rectangle(cx1, cy1, cx2, cy2, fill=info["color"], outline="#FFF", width=4, tags=(tag, "car"))
            txt_emo = self.canvas.create_text((cx1+cx2)//2, cy1+42, text=info["emoji"], font=("Arial", 38), tags=(tag, "car"))
            txt_lbl = self.canvas.create_text((cx1+cx2)//2, cy1+85, text=info["name"], font=("Comic Sans MS", 14, "bold"), fill="white", tags=(tag, "car"))
            
            self.station_cars[tag] = {
                "type": car_type,
                "order": info["order"],
                "home": (cx1, cy1),
                "current_slot": None,
                "elements": [rect, txt_emo, txt_lbl, w1, w2, w1_inner, w2_inner, shadow]
            }

    def on_car_press(self, event):
        tags = self.canvas.gettags("current")
        car_tag = [t for t in tags if t.startswith("car_")]
        if not car_tag: return
        
        self.selected_item = car_tag[0]
        self.canvas.tag_raise(self.selected_item)
        
        rect_id = self.station_cars[self.selected_item]["elements"][0]
        self.canvas.itemconfig(rect_id, outline="#FFD700", width=6)
        
        self.drag_data["x"] = event.x
        self.drag_data["y"] = event.y
        
        car_data = self.station_cars[self.selected_item]
        if car_data["current_slot"] is not None:
            self.track_slots[car_data["current_slot"]]["car_tag"] = None
            car_data["current_slot"] = None

    def on_car_drag(self, event):
        if not self.selected_item: return
        
        dx = event.x - self.drag_data["x"]
        dy = event.y - self.drag_data["y"]
        self.canvas.move(self.selected_item, dx, dy)
        
        self.drag_data["x"] = event.x
        self.drag_data["y"] = event.y

    def on_car_release(self, event):
        if not self.selected_item: return
        
        car_data = self.station_cars[self.selected_item]
        rect_id = car_data["elements"][0]
        self.canvas.itemconfig(rect_id, outline="#FFF", width=4)
        
        cx1, cy1, cx2, cy2 = self.canvas.coords(rect_id)
        mid_x, mid_y = (cx1 + cx2) / 2, (cy1 + cy2) / 2
        
        placed = False
        for idx, slot in enumerate(self.track_slots):
            sx1, sy1, sx2, sy2 = slot["bounds"]
            if sx1 <= mid_x <= sx2 and sy1 <= mid_y <= sy2:
                if slot["car_tag"] and slot["car_tag"] != self.selected_item:
                    self.snap_to_home(slot["car_tag"])
                    
                offset_x = sx1 - cx1
                offset_y = sy1 - cy1
                self.canvas.move(self.selected_item, offset_x, offset_y)
                
                slot["car_tag"] = self.selected_item
                car_data["current_slot"] = idx
                placed = True
                self.update_feedback("🌟 Great job! Check the Guide Box for the next one!", "#FFFFFF", "#33CC33")
                break
                
        if not placed:
            self.snap_to_home(self.selected_item)
            
        self.selected_item = None

    def snap_to_home(self, tag):
        car_data = self.station_cars[tag]
        hx, hy = car_data["home"]
        cx1, cy1, _, _ = self.canvas.coords(car_data["elements"][0])
        self.canvas.move(tag, hx - cx1, hy - cy1)
        if car_data["current_slot"] is not None:
            self.track_slots[car_data["current_slot"]]["car_tag"] = None
            car_data["current_slot"] = None

    def check_answer(self):
        self.attempts += 1
        filled_slots = [s["car_tag"] for s in self.track_slots if s["car_tag"] is not None]
        
        if not filled_slots:
            self.update_feedback("⚠️ Put some cars on the tracks first, silly!", "#FFFFFF", "#FF3366")
            return
            
        is_correct = True
        err_slot = None
        err_msg = ""
        
        for idx, slot in enumerate(self.track_slots):
            tag = slot["car_tag"]
            if tag:
                order_val = self.station_cars[tag]["order"]
                if order_val != idx:
                    is_correct = False
                    err_slot = idx
                    if idx == 0: err_msg = "❌ The ENGINE always goes FIRST!"
                    elif self.station_cars[tag]["type"] == "caboose": err_msg = "❌ The CABOOSE always goes LAST!"
                    else: err_msg = f"❌ Oops! Look at the Guide Box to see the correct order."
                    break
            else:
                is_correct = False
                err_slot = idx
                err_msg = f"❌ There's an empty space in the middle!"
                break

        if is_correct and len(filled_slots) == len(self.track_slots):
            earned = 3 if self.attempts == 1 else 2
            self.stars += earned
            if self.level >= self.max_level and self.level < 8: self.max_level = self.level + 1
            
            self.update_feedback("🎉 YAY! YOU DID IT! 🎉", "#FFFFFF", "#33CC33")
            self.fire_confetti()
            self.root.after(2000, lambda: self.show_victory(earned))
        else:
            self.update_feedback(err_msg, "#FFFFFF", "#FF3366")
            if err_slot is not None: self.flash_slot_ui(err_slot)

    def flash_slot_ui(self, idx):
        sid = self.track_slots[idx]["id"]
        self.canvas.itemconfig(sid, outline="#FF3366", width=6)
        self.root.after(400, lambda: self.canvas.itemconfig(sid, outline="#FFFFFF", width=3))

    def fire_confetti(self):
        colors = ["#FF4500", "#33CC33", "#3399FF", "#CC66FF", "#FFCC00", "#FF3366"]
        for _ in range(80):
            x = random.randint(0, 1200)
            y = random.randint(-400, 0)
            size = random.randint(8, 20)
            color = random.choice(colors)
            p = self.canvas.create_oval(x, y, x+size, y+size, fill=color, outline="")
            self.confetti_particles.append(p)
        self.animate_confetti()
        
    def animate_confetti(self):
        active = False
        for p in self.confetti_particles:
            if self.canvas.coords(p)[1] < 800:
                self.canvas.move(p, random.choice([-2, 0, 2]), random.randint(5, 15))
                active = True
        
        if active:
            self.root.after(30, self.animate_confetti)

    def show_victory(self, earned):
        popup = tk.Toplevel(self.root)
        popup.title("🎉 WINNER! 🎉")
        popup.geometry("450x350")
        popup.configure(bg="#87CEEB")
        popup.grab_set()
        
        popup.update_idletasks()
        x = (self.root.winfo_width() - popup.winfo_width()) // 2 + self.root.winfo_x()
        y = (self.root.winfo_height() - popup.winfo_height()) // 2 + self.root.winfo_y()
        popup.geometry(f"+{x}+{y}")
        
        tk.Label(popup, text="🚂 CHOO CHOO!", font=("Comic Sans MS", 30, "bold"), bg="#87CEEB", fg="#FF4500").pack(pady=20)
        tk.Label(popup, text="You built the train!", font=("Comic Sans MS", 20), bg="#87CEEB", fg="#333").pack()
        tk.Label(popup, text=f"⭐ You got {earned} Stars! ⭐", font=("Comic Sans MS", 20, "bold"), bg="#87CEEB", fg="#FFCC00").pack(pady=15)
        
        bf = tk.Frame(popup, bg="#87CEEB")
        bf.pack(pady=20)
        if self.level < 8:
            tk.Button(bf, text="Next Level ➡️", font=("Comic Sans MS", 16, "bold"), bg="#33CC33", fg="white", bd=5, command=lambda: [popup.destroy(), self.start_level(self.level+1)]).pack(side="left", padx=10)
        tk.Button(bf, text="Level Map", font=("Comic Sans MS", 16), bg="#3399FF", fg="white", bd=4, command=lambda: [popup.destroy(), self.show_levels()]).pack(side="left", padx=10)

    def show_hint(self):
        self.update_feedback("💡 Hint: Look at the Guide Box in the top left corner to see the right order!", "#FFFFFF", "#FF9933")

    def update_feedback(self, text, bg, fg):
        self.feedback_label.config(text=text, bg=bg, fg=fg)

if __name__ == "__main__":
    root = tk.Tk()
    game = TrainGame(root)
    root.mainloop()