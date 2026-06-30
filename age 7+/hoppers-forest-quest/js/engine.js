/**
 * Hopper's Forest Quest — Game Engine & Safe Python Parser
 */
const GRID_SIZE = 12;
const CELL_SIZE = 40;

class HopperEngine {
  constructor(canvas, level) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.level = level;
    this.reset();
    this.ghostTrail = [];
    this.animating = false;
  }

  reset() {
    const { start, carrot } = this.level;
    this.hopper = {
      x: start.x,
      y: start.y,
      direction: start.direction,
    };
    this.initial = { ...this.hopper, direction: start.direction };
    this.carrotCollected = false;
    this.ghostTrail = [];
    this.hitWall = false;
  }

  setLevel(level) {
    this.level = level;
    this.reset();
  }

  isWall(x, y) {
    return this.level.walls.some((w) => w.x === x && w.y === y);
  }

  isOutOfBounds(x, y) {
    return x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE;
  }

  directionVector(dir) {
    const d = ((dir % 360) + 360) % 360;
    if (d === 0) return { dx: 1, dy: 0 };
    if (d === 90) return { dx: 0, dy: 1 };
    if (d === 180) return { dx: -1, dy: 0 };
    if (d === 270) return { dx: 0, dy: -1 };
    return { dx: 1, dy: 0 };
  }

  /**
   * Parse kid-friendly Python subset into executable actions
   */
  parseCode(code) {
    const lines = code.split("\n");
    const actions = [];
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const lineNum = i + 1;
      const line = raw.trim();

      if (!line || line.startsWith("#")) continue;

      const forMatch = line.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:/);
      if (forMatch) {
        const count = parseInt(forMatch[2], 10);
        const blockLines = [];
        let j = i + 1;
        while (j < lines.length) {
          if (lines[j].trim() === "") {
            j++;
            continue;
          }
          if (!/^\s{2,}/.test(lines[j])) break;
          blockLines.push(lines[j].trim());
          j++;
        }
        if (blockLines.length === 0) {
          errors.push({ line: lineNum, message: "Loop needs indented code below it (press Tab or add 4 spaces)." });
        } else {
          for (let r = 0; r < count; r++) {
            blockLines.forEach((bl, bi) => {
              const result = this.parseSingleLine(bl, lineNum + bi + 1);
              if (result.error) errors.push(result.error);
              else if (result.action) actions.push({ ...result.action, sourceLine: lineNum });
            });
          }
        }
        i = j - 1;
        continue;
      }

      const result = this.parseSingleLine(line, lineNum);
      if (result.error) errors.push(result.error);
      else if (result.action) actions.push({ ...result.action, sourceLine: lineNum });
      else if (!result.skip) {
        errors.push({
          line: lineNum,
          message: `I don't understand this line yet. Try hopper.move(steps=3) or hopper.turn(90).`,
        });
      }
    }

    return { actions, errors };
  }

  parseSingleLine(line, lineNum) {
    const moveMatch = line.match(/^hopper\.move\s*\(\s*(?:steps\s*=\s*)?(\d+)\s*\)\s*$/);
    if (moveMatch) {
      return { action: { type: "move", steps: parseInt(moveMatch[1], 10) } };
    }

    const turnMatch = line.match(/^hopper\.turn\s*\(\s*(?:degrees\s*=\s*)?(-?\d+)\s*\)\s*$/);
    if (turnMatch) {
      return { action: { type: "turn", degrees: parseInt(turnMatch[1], 10) } };
    }

    if (/^hopper\./.test(line)) {
      return {
        error: { line: lineNum, message: "Use hopper.move(steps=N) or hopper.turn(90)." },
      };
    }

    return { skip: true };
  }

  simulate(actions) {
    const state = {
      x: this.initial.x,
      y: this.initial.y,
      direction: this.initial.direction,
    };
    const trail = [{ x: state.x, y: state.y }];
    let hitWall = false;
    let wallLine = null;
    let completed = false;

    for (const action of actions) {
      if (hitWall) break;

      if (action.type === "turn") {
        state.direction = ((state.direction + action.degrees) % 360 + 360) % 360;
      } else if (action.type === "move") {
        const { dx, dy } = this.directionVector(state.direction);
        for (let s = 0; s < action.steps; s++) {
          const nx = state.x + dx;
          const ny = state.y + dy;
          if (this.isOutOfBounds(nx, ny) || this.isWall(nx, ny)) {
            hitWall = true;
            wallLine = action.sourceLine;
            break;
          }
          state.x = nx;
          state.y = ny;
          trail.push({ x: state.x, y: state.y });
        }
      }
    }

    if (!hitWall && state.x === this.level.carrot.x && state.y === this.level.carrot.y) {
      completed = true;
    }

    return { finalState: state, trail, hitWall, wallLine, completed };
  }

  computeGhostTrail(code) {
    const { actions, errors } = this.parseCode(code);
    if (errors.length) return { trail: [], errors };
    const sim = this.simulate(actions);
    return { trail: sim.trail, errors: [], completed: sim.completed, hitWall: sim.hitWall };
  }

  async executeActions(actions, onStep, speed = 350) {
    this.animating = true;
    this.hitWall = false;

    for (const action of actions) {
      if (this.hitWall) break;

      if (action.type === "turn") {
        if (typeof HopperSounds !== "undefined") HopperSounds.turn();
        await this.animateTurn(action.degrees, speed / 2);
        if (onStep) onStep(action);
      } else if (action.type === "move") {
        const result = await this.animateMove(action.steps, speed, action.sourceLine);
        if (onStep) onStep(action);
        if (result.hitWall) {
          if (typeof HopperSounds !== "undefined") HopperSounds.wall();
          this.hitWall = true;
          return { success: false, wallLine: result.wallLine };
        }
      }
    }

    this.animating = false;
    const won =
      !this.hitWall &&
      this.hopper.x === this.level.carrot.x &&
      this.hopper.y === this.level.carrot.y;

    if (won) this.carrotCollected = true;
    return { success: won, wallLine: null };
  }

  animateTurn(degrees, duration) {
    return new Promise((resolve) => {
      const startDir = this.hopper.direction;
      const endDir = ((startDir + degrees) % 360 + 360) % 360;
      const start = performance.now();

      const frame = (now) => {
        const t = Math.min(1, (now - start) / duration);
        this.hopper.direction = startDir + (endDir - startDir) * this.easeOut(t);
        this.draw();
        if (t < 1) requestAnimationFrame(frame);
        else {
          this.hopper.direction = endDir;
          this.draw();
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }

  animateMove(steps, duration, sourceLine) {
    return new Promise((resolve) => {
      const { dx, dy } = this.directionVector(this.hopper.direction);
      let stepIndex = 0;
      const stepDuration = duration;

      const doStep = () => {
        if (stepIndex >= steps) {
          resolve({ hitWall: false });
          return;
        }

        const nx = this.hopper.x + dx;
        const ny = this.hopper.y + dy;

        if (this.isOutOfBounds(nx, ny) || this.isWall(nx, ny)) {
          this.hitWall = true;
          resolve({ hitWall: true, wallLine: sourceLine });
          return;
        }

        const fromX = this.hopper.x;
        const fromY = this.hopper.y;
        const start = performance.now();

        const frame = (now) => {
          const t = Math.min(1, (now - start) / stepDuration);
          const eased = this.easeOut(t);
          this.hopper.renderX = fromX + (nx - fromX) * eased;
          this.hopper.renderY = fromY + (ny - fromY) * eased;
          this.draw();
          if (t < 1) {
            requestAnimationFrame(frame);
          } else {
            this.hopper.x = nx;
            this.hopper.y = ny;
            delete this.hopper.renderX;
            delete this.hopper.renderY;
            if (typeof HopperSounds !== "undefined") HopperSounds.hop();
            this.draw();
            stepIndex++;
            doStep();
          }
        };
        requestAnimationFrame(frame);
      };

      doStep();
    });
  }

  easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  draw(ghostTrail = null) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.fillStyle = "#faf6eb";
    ctx.fillRect(0, 0, w, h);

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;
        ctx.strokeStyle = "rgba(200, 180, 140, 0.35)";
        ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);

        if ((x + y) % 2 === 0) {
          ctx.fillStyle = "rgba(210, 195, 160, 0.15)";
          ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Walls
    this.level.walls.forEach((wall) => {
      const px = wall.x * CELL_SIZE;
      const py = wall.y * CELL_SIZE;
      ctx.fillStyle = "#5d4037";
      ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      ctx.fillStyle = "#795548";
      ctx.fillRect(px + 4, py + 4, CELL_SIZE - 8, CELL_SIZE - 8);
    });

    // Decorations
    (this.level.decorations || []).forEach((dec) => {
      if (dec.type === "tree") this.drawTree(dec.x, dec.y);
    });

    // Ghost trail
    const trail = ghostTrail || this.ghostTrail;
    if (trail.length > 1) {
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(45, 138, 85, 0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      trail.forEach((pt, i) => {
        const cx = pt.x * CELL_SIZE + CELL_SIZE / 2;
        const cy = pt.y * CELL_SIZE + CELL_SIZE / 2;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      trail.forEach((pt, i) => {
        if (i === 0) return;
        ctx.fillStyle = "rgba(123, 201, 111, 0.4)";
        ctx.beginPath();
        ctx.arc(pt.x * CELL_SIZE + CELL_SIZE / 2, pt.y * CELL_SIZE + CELL_SIZE / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Carrot
    this.drawCarrot(this.level.carrot.x, this.level.carrot.y);

    // Hopper
    const hx = this.hopper.renderX ?? this.hopper.x;
    const hy = this.hopper.renderY ?? this.hopper.y;
    this.drawHopper(hx, hy, this.hopper.direction);
  }

  drawHopper(gx, gy, direction) {
    const ctx = this.ctx;
    const cx = gx * CELL_SIZE + CELL_SIZE / 2;
    const cy = gy * CELL_SIZE + CELL_SIZE / 2;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 14, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = "#a1887f";
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 14, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#bcaaa4";
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 11, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = "#8d6e63";
    ctx.beginPath();
    ctx.ellipse(cx - 8, cy - 18, 4, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 8, cy - 18, 4, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 9, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = "#ffab91";
    ctx.beginPath();
    ctx.arc(cx + 10, cy - 6, 3, 0, Math.PI * 2);
    ctx.fill();

    // Direction arrow
    const rad = (direction * Math.PI) / 180;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rad);
    ctx.fillStyle = "rgba(27, 94, 58, 0.7)";
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(8, -5);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawCarrot(gx, gy) {
    const ctx = this.ctx;
    const cx = gx * CELL_SIZE + CELL_SIZE / 2;
    const cy = gy * CELL_SIZE + CELL_SIZE / 2;

    if (this.carrotCollected) return;

    // Glow
    ctx.fillStyle = "rgba(255, 193, 7, 0.25)";
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();

    // Carrot body
    ctx.fillStyle = "#ff9800";
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 4);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx - 6, cy + 4);
    ctx.closePath();
    ctx.fill();

    // Leaves
    ctx.fillStyle = "#4caf50";
    ctx.beginPath();
    ctx.ellipse(cx - 8, cy - 6, 3, 8, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - 10, cy - 2, 3, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTree(gx, gy) {
    const ctx = this.ctx;
    const cx = gx * CELL_SIZE + CELL_SIZE / 2;
    const cy = gy * CELL_SIZE + CELL_SIZE / 2;

    ctx.fillStyle = "#6d4c41";
    ctx.fillRect(cx - 4, cy, 8, 14);

    ctx.fillStyle = "#388e3c";
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#43a047";
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 8, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 6, cy - 6, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  setGhostTrail(trail) {
    this.ghostTrail = trail;
    this.draw(trail);
  }
}
