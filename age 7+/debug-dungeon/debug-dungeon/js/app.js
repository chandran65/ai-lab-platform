/**
 * Debug Dungeon: The Code Knight — Engine
 *
 * Flow per level:
 *  1. Monster banner + error attack shown
 *  2. Quiz gate: must pick the correct "what does this error mean" answer
 *     (wrong answers show feedback but don't punish — they can retry)
 *  3. Once quiz passed, code becomes clickable; buggy token(s) pulse red
 *  4. Click bug -> confirm popover -> apply fix -> token turns green
 *  5. Explanation box appears + "Strike!" button
 *  6. Victory animation -> next level
 */

const state = {
  levelIndex: 0,
  quizPassed: false,
  bugFixed: false,
  cleared: [],
};

const el = {
  app: document.getElementById("app"),
  progressTrack: document.getElementById("progressTrack"),
};

function init() {
  renderProgressTrack();
  renderTitleScreen();
}

function renderProgressTrack() {
  el.progressTrack.innerHTML = "";
  LEVELS.forEach((lvl, i) => {
    const dot = document.createElement("div");
    dot.className = "progress-dot";
    if (state.cleared.includes(lvl.id)) dot.className += " cleared";
    else if (i === state.levelIndex) dot.className += " current";
    dot.title = lvl.title;
    dot.textContent = state.cleared.includes(lvl.id) ? "✓" : "";
    el.progressTrack.appendChild(dot);
  });
}

function renderTitleScreen() {
  el.app.innerHTML = `
    <div class="screen title-screen">
      <span class="big-emoji">🗡️</span>
      <h2>Debug Dungeon</h2>
      <p>Ten monsters guard the exit, and each one attacks with broken Python code.
      Read the error, understand <em>why</em> it happened, then strike the bug to defeat them.
      No error message? Even worse — the final boss lies with silence.</p>
      <button class="btn btn-gold" id="btnStart">⚔️ Enter the dungeon</button>
    </div>
  `;
  document.getElementById("btnStart").onclick = () => {
    state.levelIndex = 0;
    loadLevel(0);
  };
}

function loadLevel(index) {
  state.levelIndex = index;
  state.quizPassed = false;
  state.bugFixed = false;
  renderProgressTrack();

  const lvl = LEVELS[index];
  if (!lvl) {
    renderVictoryScreen();
    return;
  }

  el.app.innerHTML = `
    <div class="screen">
      <div class="monster-banner">
        <div class="monster-emoji-big">${lvl.monster.emoji}</div>
        <div>
          <h2>${lvl.title}</h2>
          <p>${lvl.intro}</p>
          <div class="hp-bar-wrap">
            <span class="hp-label">HP</span>
            <div class="hp-bar"><div class="hp-bar-fill" id="hpFill"></div></div>
          </div>
        </div>
      </div>

      <div class="battle-grid">
        <div class="panel">
          <div class="panel-title">⚔️ The Attack</div>
          ${
            lvl.errorMessage
              ? `<div class="error-attack">${escapeHtml(lvl.errorMessage)}</div>`
              : `<div class="error-attack logic-attack">No crash. Code ran, but: ${escapeHtml(lvl.runOutput || "")}</div>`
          }

          <div class="quiz-box" id="quizBox">
            <p class="quiz-q">🦉 Sage Knight asks: ${escapeHtml(lvl.quiz.question)}</p>
            <div class="quiz-options" id="quizOptions"></div>
            <p class="quiz-feedback" id="quizFeedback"></p>
          </div>

          <div class="panel-title" style="margin-top:0;">📜 The Broken Spell (click the bug once unlocked)</div>
          <div class="code-panel-inner locked" id="codePanel"></div>

          <div id="explainSlot"></div>

          <div class="action-bar" id="actionBar"></div>
        </div>
      </div>
    </div>
  `;

  renderQuiz(lvl);
  renderCode(lvl);
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

/* ---------------- QUIZ GATE ---------------- */
function renderQuiz(lvl) {
  const wrap = document.getElementById("quizOptions");
  const feedback = document.getElementById("quizFeedback");
  const shuffled = [...lvl.quiz.options];

  shuffled.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = opt.text;
    btn.onclick = () => {
      if (opt.correct) {
        btn.classList.add("correct");
        feedback.textContent = "✅ Exactly right! The code is now unlocked — find the bug.";
        feedback.className = "quiz-feedback ok";
        [...wrap.children].forEach((b) => (b.disabled = true));
        unlockCode();
        if (typeof DungeonSounds !== "undefined") DungeonSounds.correct();
      } else {
        btn.classList.add("incorrect");
        feedback.textContent = "❌ Not quite — read the attack message again carefully.";
        feedback.className = "quiz-feedback bad";
        if (typeof DungeonSounds !== "undefined") DungeonSounds.wrong();
      }
    };
    wrap.appendChild(btn);
  });
}

function unlockCode() {
  state.quizPassed = true;
  document.getElementById("codePanel").classList.remove("locked");
}

/* ---------------- CODE RENDER ---------------- */
function renderCode(lvl) {
  const panel = document.getElementById("codePanel");
  panel.innerHTML = "";

  lvl.code.forEach((line, i) => {
    const lineDiv = document.createElement("div");
    lineDiv.className = "code-line";
    lineDiv.dataset.lineIndex = i;

    const lnNum = document.createElement("span");
    lnNum.className = "ln";
    lnNum.textContent = i + 1;
    lineDiv.appendChild(lnNum);

    if (line.isComment) {
      const span = document.createElement("span");
      span.className = "tok code-comment";
      span.textContent = line.text;
      lineDiv.appendChild(span);
    } else if (line.bug) {
      const span = document.createElement("span");
      span.className = "tok tok-bug";
      span.textContent = line.text;
      span.dataset.fix = line.fix;
      span.onclick = (e) => onBugClick(e, lvl, line, lineDiv, span);
      lineDiv.appendChild(span);
    } else {
      const span = document.createElement("span");
      span.className = "tok tok-plain";
      span.textContent = line.text;
      lineDiv.appendChild(span);
    }

    panel.appendChild(lineDiv);
  });
}

/* ---------------- BUG CLICK -> FIX ---------------- */
function onBugClick(e, lvl, lineData, lineDiv, span) {
  if (!state.quizPassed || state.bugFixed) return;
  removeExistingPopover();

  const popover = document.createElement("div");
  popover.className = "fix-popover";
  popover.innerHTML = `
    <p class="fp-title">🔍 Found it!</p>
    <p style="margin:0;">Strike to fix this to:<br><code>${escapeHtml(lvl.customFix ? "" : lineData.fix)}${lvl.customFix ? fixPreview(lvl) : ""}</code></p>
    <div class="fp-row">
      <button class="btn btn-gold btn-sm" id="confirmFix">⚔️ Strike!</button>
      <button class="btn btn-ghost btn-sm" id="cancelFix">Cancel</button>
    </div>
  `;
  document.body.appendChild(popover);

  const rect = span.getBoundingClientRect();
  popover.style.top = `${window.scrollY + rect.bottom + 8}px`;
  popover.style.left = `${Math.min(window.scrollX + rect.left, window.innerWidth - 280)}px`;

  document.getElementById("confirmFix").onclick = () => {
    applyFix(lvl, lineData, lineDiv, span);
    removeExistingPopover();
  };
  document.getElementById("cancelFix").onclick = removeExistingPopover;
}

function fixPreview(lvl) {
  if (lvl.customFix === "swap") return "mana = 50  (moved above the print line)";
  if (lvl.customFix === "intWrap") return "if int(level) &gt; 3:";
  if (lvl.customFix === "rangeBoss") return "for i in range(6):";
  return "";
}

function removeExistingPopover() {
  document.querySelectorAll(".fix-popover").forEach((p) => p.remove());
}

function applyFix(lvl, lineData, lineDiv, span) {
  state.bugFixed = true;

  if (typeof DungeonSounds !== "undefined") DungeonSounds.hit();

  if (lvl.customFix === "swap") {
    // Special: visually reorder lines 1 (print) and 4 (mana=50)
    const panel = document.getElementById("codePanel");
    const lines = [...panel.children];
    lines[0].classList.add("line-removed");
    lines[3].classList.add("line-new");
    setTimeout(() => {
      panel.innerHTML = "";
      const order = [
        { text: "mana = 50" },
        { text: "print(mana)" },
      ];
      order.forEach((l, i) => {
        const d = document.createElement("div");
        d.className = "code-line line-new";
        d.innerHTML = `<span class="ln">${i + 1}</span><span class="tok tok-fixed">${l.text}</span>`;
        panel.appendChild(d);
      });
      finishLevel(lvl);
    }, 500);
    return;
  }

  if (lvl.customFix === "intWrap") {
    span.textContent = "int(level) > 3";
    span.className = "tok tok-fixed";
    finishLevel(lvl);
    return;
  }

  if (lvl.customFix === "rangeBoss") {
    span.textContent = "range(6)";
    span.className = "tok tok-fixed";
    finishLevel(lvl);
    return;
  }

  // default: simple in-place text fix
  span.textContent = lineData.fix;
  span.className = "tok tok-fixed";
  span.onclick = null;
  finishLevel(lvl);
}

function finishLevel(lvl) {
  if (typeof DungeonSounds !== "undefined") DungeonSounds.defeat();

  const hpFill = document.getElementById("hpFill");
  if (hpFill) hpFill.style.width = "0%";

  const explainSlot = document.getElementById("explainSlot");
  explainSlot.innerHTML = `
    <div class="explain-box">
      <p class="eb-title">📖 ${lvl.monster.name} defeated! Here's the lesson:</p>
      <p>${lvl.explain}</p>
    </div>
  `;

  const actionBar = document.getElementById("actionBar");
  const isLast = state.levelIndex === LEVELS.length - 1;
  actionBar.innerHTML = `
    <button class="btn btn-gold" id="btnNext">${isLast ? "🏆 Claim victory" : "Next monster →"}</button>
  `;
  document.getElementById("btnNext").onclick = () => {
    if (!state.cleared.includes(lvl.id)) state.cleared.push(lvl.id);
    loadLevel(state.levelIndex + 1);
  };
}

/* ---------------- VICTORY ---------------- */
function renderVictoryScreen() {
  renderProgressTrack();
  el.app.innerHTML = `
    <div class="screen victory-screen">
      <span class="big-emoji">🏆</span>
      <h2>The Code Knight triumphs!</h2>
      <p>You debugged your way through ten monsters — NameErrors, TypeErrors, SyntaxErrors,
      IndentationErrors, an IndexError, and a sneaky logic bug with no error message at all.
      That last skill — catching wrong answers when nothing crashes — is the hardest one in real programming.</p>
      <div class="badge-row">
        ${LEVELS.map((l) => `<div class="concept-badge">${l.concept}</div>`).join("")}
      </div>
      <button class="btn btn-gold" id="btnReplay">⚔️ Replay the dungeon</button>
    </div>
  `;
  document.getElementById("btnReplay").onclick = () => {
    state.cleared = [];
    loadLevel(0);
  };
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".fix-popover") && !e.target.closest(".tok-bug")) {
    removeExistingPopover();
  }
});

init();
