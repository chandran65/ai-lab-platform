/**
 * Hopper's Forest Quest — Main Application
 */
(function () {
  const STORAGE_KEY = "hopper-forest-progress";

  const els = {
    codeEditor: document.getElementById("codeEditor"),
    lineNumbers: document.getElementById("lineNumbers"),
    highlightLayer: document.getElementById("highlightLayer"),
    sageText: document.getElementById("sageText"),
    levelTitle: document.getElementById("levelTitle"),
    levelGoal: document.getElementById("levelGoal"),
    statusBar: document.getElementById("statusBar"),
    carrotCounter: document.getElementById("carrotCounter"),
    canvas: document.getElementById("gameCanvas"),
    celebration: document.getElementById("celebration"),
    celebrationText: document.getElementById("celebrationText"),
    celebrationTitle: document.getElementById("celebrationTitle"),
    lineTutorial: document.getElementById("lineTutorial"),
    lineTutorialText: document.getElementById("lineTutorialText"),
    btnDemo: document.getElementById("btnDemo"),
    btnRun: document.getElementById("btnRun"),
    btnReset: document.getElementById("btnReset"),
    btnNextLevel: document.getElementById("btnNextLevel"),
    btnPrevLevel: document.getElementById("btnPrevLevel"),
    btnPrevLevelNav: document.getElementById("btnPrevLevelNav"),
    btnSoundToggle: document.getElementById("btnSoundToggle"),
    btnTutorialPrev: document.getElementById("btnTutorialPrev"),
    btnTutorialNext: document.getElementById("btnTutorialNext"),
    closeTutorial: document.getElementById("closeTutorial"),
  };

  let currentLevelIndex = 0;
  let engine = null;
  let busy = false;
  let demoWalkthrough = [];
  let demoStepIndex = 0;
  let ghostUpdateTimer = null;
  let tutorialMode = "guidance";
  let canAdvanceFromLevel = false;

  /** Levels 2+ — kid writes all code; editor starts empty */
  function isSelfWriteLevel(level) {
    return level.id > 1;
  }

  function loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const idx = parseInt(saved, 10);
        if (idx >= 0 && idx < LEVELS.length) currentLevelIndex = idx;
      }
    } catch (_) {}
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, String(currentLevelIndex));
    } catch (_) {}
  }

  function getLevel() {
    return LEVELS[currentLevelIndex];
  }

  function setStatus(message, type = "") {
    els.statusBar.textContent = message;
    els.statusBar.className = "status-bar" + (type ? ` ${type}` : "");
  }

  function setSage(html) {
    els.sageText.innerHTML = html;
  }

  function updateLineNumbers() {
    const lines = els.codeEditor.value.split("\n").length;
    els.lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
  }

  function highlightLine(lineNum, isError = false) {
    const lines = els.codeEditor.value.split("\n");
    const html = lines
      .map((line, i) => {
        const cls = i + 1 === lineNum ? (isError ? "hl-error" : "hl-line") : "";
        const escaped = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return cls ? `<span class="${cls}">${escaped || " "}</span>` : escaped;
      })
      .join("\n");
    els.highlightLayer.innerHTML = html;
  }

  function clearHighlight() {
    els.highlightLayer.innerHTML = "";
  }

  function setButtonsDisabled(disabled) {
    els.btnDemo.disabled = disabled;
    els.btnRun.disabled = disabled;
    els.btnReset.disabled = disabled;
    busy = disabled;
  }

  function updateLevelNavButtons() {
    const isFirst = currentLevelIndex === 0;
    const isLast = currentLevelIndex >= LEVELS.length - 1;

    els.btnPrevLevelNav.disabled = isFirst;
    els.btnPrevLevelNav.classList.toggle("hidden", isFirst);

    els.btnPrevLevel.classList.toggle("hidden", isFirst);

    if (isLast) {
      els.btnNextLevel.textContent = "Play from Level 1 🌟";
    } else {
      els.btnNextLevel.textContent = "Next level →";
    }
  }

  function unlockAudio() {
    if (typeof HopperSounds !== "undefined") HopperSounds.unlock();
  }

  function updateGhostTrail() {
    if (!engine || busy) return;
    const { trail, errors } = engine.computeGhostTrail(els.codeEditor.value);
    if (errors.length === 0) {
      engine.setGhostTrail(trail);
    } else {
      engine.setGhostTrail([]);
    }
  }

  function loadLevel(index) {
    currentLevelIndex = index;
    const level = getLevel();
    saveProgress();

    els.levelTitle.textContent = level.title;
    els.levelGoal.textContent = level.goal;
    els.codeEditor.value = isSelfWriteLevel(level) ? "" : (level.starterCode || "");
    els.codeEditor.placeholder = isSelfWriteLevel(level)
      ? "Type your Python here — Sage will guide you!"
      : "";
    els.carrotCounter.textContent = `🥕 0 / 1`;
    els.celebration.classList.add("hidden");
    els.celebrationTitle.textContent = "Level complete!";
    canAdvanceFromLevel = false;
    els.btnNextLevel.classList.add("hidden");

    setSage(level.welcomeSage);
    setStatus(
      isSelfWriteLevel(level)
        ? "Read Sage's tips — they show the exact code to type!"
        : "Sage shows the command above. Edit the code, then click Run my code!"
    );
    updateLineNumbers();
    clearHighlight();

    if (engine) engine.setLevel(level);
    else engine = new HopperEngine(els.canvas, level);

    engine.draw();
    updateGhostTrail();
    updateLevelNavButtons();
  }

  function spawnConfetti() {
    const colors = ["#ff9800", "#4caf50", "#ffd54f", "#e91e63", "#2196f3"];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement("div");
      el.className = "confetti";
      el.style.left = Math.random() * 100 + "vw";
      el.style.top = -10 + "px";
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }
  }

  function showCelebration(usedPreferredMethod = true) {
    const level = getLevel();
    const nudge = !usedPreferredMethod && level.conceptNudge;

    if (nudge) {
      els.celebrationTitle.textContent = nudge.title || "Good job!";
      els.celebrationText.textContent = nudge.celebrationText;
      setSage(nudge.sage);
      setStatus(nudge.status, "info");
    } else {
      els.celebrationTitle.textContent = "Level complete!";
      els.celebrationText.textContent = `Hopper found the carrot! ${level.hint}`;
      setSage("Amazing work! You wrote real Python and Hopper made it home. 🎉");
      setStatus("Level complete! Go to the next level or replay a previous one.", "success");
    }

    els.celebration.classList.remove("hidden");
    els.carrotCounter.textContent = "🥕 1 / 1";
    canAdvanceFromLevel = usedPreferredMethod;
    els.btnNextLevel.classList.toggle("hidden", !usedPreferredMethod);
    els.btnNextLevel.disabled = !usedPreferredMethod;
    if (usedPreferredMethod) updateLevelNavButtons();
    spawnConfetti();
    if (typeof HopperSounds !== "undefined") HopperSounds.win();
    updateLevelNavButtons();
  }

  async function runCode(code, isDemo = false) {
    setButtonsDisabled(true);
    clearHighlight();
    engine.reset();
    engine.draw();

    const { actions, errors } = engine.parseCode(code);

    if (errors.length) {
      const err = errors[0];
      highlightLine(err.line, true);
      if (typeof HopperSounds !== "undefined") HopperSounds.error();
      setSage(`Oops! Line ${err.line}: ${err.message}`);
      setStatus(`Error on line ${err.line}: ${err.message}`, "error");
      setButtonsDisabled(false);
      engine.draw();
      return;
    }

    if (actions.length === 0) {
      const level = getLevel();
      if (typeof HopperSounds !== "undefined") HopperSounds.error();
      setSage(
        isSelfWriteLevel(level)
          ? "The editor is empty — read Sage's tips for the exact code to type!"
          : "Your editor is empty! Type hopper.move(steps=3) to get started."
      );
      setStatus("Add some code before running.", "error");
      setButtonsDisabled(false);
      return;
    }

    setStatus(isDemo ? "Sage is showing you the way..." : "Running your code...", "info");

    const highlightDuringRun = !isDemo;

    const result = await engine.executeActions(actions, (action) => {
      if (highlightDuringRun && action.sourceLine) highlightLine(action.sourceLine);
    });

    if (result.wallLine) {
      highlightLine(result.wallLine, true);
      setSage("Bonk! Hopper hit a wall or the edge. Change your moves and try again!");
      setStatus("Hopper hit a wall! Check your path.", "error");
    } else if (result.success) {
      const level = getLevel();
      const usedConcept =
        isDemo ||
        !level.teachesConcept ||
        usesTeachesConcept(els.codeEditor.value, level.teachesConcept);
      showCelebration(usedConcept);
    } else {
      setSage("Hopper didn't reach the carrot yet. Count the squares and adjust your code!");
      setStatus("Not quite — Hopper needs to land on the carrot.", "error");
    }

    setButtonsDisabled(false);
    updateGhostTrail();
  }

  function showTutorialStep(index) {
    if (!demoWalkthrough.length) return;

    demoStepIndex = Math.max(0, Math.min(index, demoWalkthrough.length - 1));
    const step = demoWalkthrough[demoStepIndex];

    if (tutorialMode === "guidance" && step.title) {
      clearHighlight();
    } else if (step.lineNum) {
      highlightLine(step.lineNum);
    } else {
      clearHighlight();
    }

    const label =
      tutorialMode === "guidance" && step.title
        ? `<strong>${step.title}</strong><br><br>${step.explanation}`
        : step.explanation;

    els.lineTutorialText.innerHTML = label;
    els.lineTutorial.classList.remove("hidden");

    const sageMsg =
      tutorialMode === "guidance" && step.title
        ? `${step.title}: ${step.explanation.replace(/<[^>]+>/g, "")}`
        : `Line ${step.lineNum}: ${step.explanation.replace(/<[^>]+>/g, "")}`;
    setSage(sageMsg);

    els.btnTutorialPrev.disabled = demoStepIndex === 0;
    els.btnTutorialNext.textContent =
      demoStepIndex === demoWalkthrough.length - 1 ? "Watch Hopper go! ▶" : "Next →";
  }

  async function startDemo() {
    const level = getLevel();

    if (level.guidanceSteps && level.guidanceSteps.length) {
      tutorialMode = "guidance";
      demoWalkthrough = level.guidanceSteps.map((step) => ({
        title: step.title,
        explanation: step.sage,
        lineNum: null,
      }));
      setSage(
        isSelfWriteLevel(level)
          ? "Let's learn the exact code to type! Click Next for each tip."
          : "Let's walk through the commands! Click Next — then try Run my code."
      );
      showTutorialStep(0);
      return;
    }

    tutorialMode = "code";
    demoWalkthrough = getDemoWalkthrough(level.demoCode);

    if (demoWalkthrough.length === 0) {
      await runCode(level.demoCode, true);
      return;
    }

    setSage("Let's walk through each line together. Click Next to learn what each one does!");
    showTutorialStep(0);
  }

  async function finishDemoTutorial() {
    els.lineTutorial.classList.add("hidden");
    clearHighlight();
    const level = getLevel();

    if (isSelfWriteLevel(level)) {
      setSage(
        "That's how it works! Now type the code yourself — Sage showed you every command to use."
      );
    } else {
      setSage(
        "Watch Hopper go! Then click <strong>Run my code</strong> with your own numbers — try changing the 3!"
      );
    }

    await runCode(level.demoCode, true);
  }

  function resetHopper() {
    if (busy) return;
    engine.reset();
    engine.draw();
    updateGhostTrail();
    clearHighlight();
    els.celebration.classList.add("hidden");
    els.carrotCounter.textContent = "🥕 0 / 1";
    canAdvanceFromLevel = false;
    els.btnNextLevel.classList.add("hidden");
    setStatus("Hopper is back at the start. Edit your code and try again!");
    const level = getLevel();
    setSage(level.welcomeSage);
  }

  function nextLevel() {
    if (!canAdvanceFromLevel) return;
    unlockAudio();
    if (typeof HopperSounds !== "undefined") HopperSounds.click();
    if (currentLevelIndex < LEVELS.length - 1) {
      if (typeof HopperSounds !== "undefined") HopperSounds.levelUp();
      loadLevel(currentLevelIndex + 1);
    } else {
      els.celebration.classList.add("hidden");
      loadLevel(0);
      setSage("Starting over from Level 1 — practice makes perfect! 🐰");
      setStatus("Replay from the beginning!", "success");
    }
  }

  function prevLevel() {
    if (currentLevelIndex <= 0) return;
    unlockAudio();
    if (typeof HopperSounds !== "undefined") HopperSounds.click();
    loadLevel(currentLevelIndex - 1);
    setSage("Welcome back! Try this level again with what you've learned.");
    setStatus("Replay mode — give this level another go!", "info");
  }

  // Event listeners
  els.codeEditor.addEventListener("input", () => {
    updateLineNumbers();
    clearTimeout(ghostUpdateTimer);
    ghostUpdateTimer = setTimeout(updateGhostTrail, 300);
  });

  els.codeEditor.addEventListener("scroll", () => {
    els.highlightLayer.scrollTop = els.codeEditor.scrollTop;
    els.lineNumbers.scrollTop = els.codeEditor.scrollTop;
  });

  els.codeEditor.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = els.codeEditor.selectionStart;
      const end = els.codeEditor.selectionEnd;
      els.codeEditor.value =
        els.codeEditor.value.substring(0, start) + "    " + els.codeEditor.value.substring(end);
      els.codeEditor.selectionStart = els.codeEditor.selectionEnd = start + 4;
      updateLineNumbers();
      updateGhostTrail();
    }
  });

  els.btnRun.addEventListener("click", () => {
    unlockAudio();
    if (typeof HopperSounds !== "undefined") HopperSounds.click();
    runCode(els.codeEditor.value);
  });
  els.btnDemo.addEventListener("click", () => {
    unlockAudio();
    if (typeof HopperSounds !== "undefined") HopperSounds.click();
    startDemo();
  });
  els.btnReset.addEventListener("click", () => {
    unlockAudio();
    if (typeof HopperSounds !== "undefined") HopperSounds.click();
    resetHopper();
  });
  els.btnNextLevel.addEventListener("click", nextLevel);
  els.btnPrevLevel.addEventListener("click", prevLevel);
  els.btnPrevLevelNav.addEventListener("click", prevLevel);

  els.btnSoundToggle.addEventListener("click", () => {
    unlockAudio();
    const isOn = els.btnSoundToggle.getAttribute("aria-pressed") === "true";
    const willBeOn = !isOn;
    if (typeof HopperSounds !== "undefined") HopperSounds.setMuted(!willBeOn);
    els.btnSoundToggle.setAttribute("aria-pressed", String(willBeOn));
    els.btnSoundToggle.textContent = willBeOn ? "🔊 Sound on" : "🔇 Sound off";
    if (willBeOn && typeof HopperSounds !== "undefined") HopperSounds.click();
  });

  els.btnTutorialNext.addEventListener("click", () => {
    if (demoStepIndex >= demoWalkthrough.length - 1) {
      finishDemoTutorial();
    } else {
      showTutorialStep(demoStepIndex + 1);
    }
  });

  els.btnTutorialPrev.addEventListener("click", () => {
    if (demoStepIndex > 0) showTutorialStep(demoStepIndex - 1);
  });

  els.closeTutorial.addEventListener("click", () => {
    els.lineTutorial.classList.add("hidden");
    clearHighlight();
  });

  // Boot
  loadProgress();
  loadLevel(currentLevelIndex);
})();
