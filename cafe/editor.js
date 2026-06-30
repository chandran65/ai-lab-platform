/* ============================================
   PET CAFÉ BUILDER — EDITOR MODULE
   Handles rendering the recipe card (def/body/return)
   and the drag-and-drop ingredient blocks.
   ============================================ */

const Editor = (() => {
  let currentLevel = null;
  let placedBlocks = []; // array of block ids, in order, currently in the recipe body
  let draggedBlockId = null;
  let draggedFromTray = true; // true = dragging from tray, false = reordering within body

  const codeBody = document.getElementById("codeBody");
  const defLine = document.getElementById("defLine");
  const returnLine = document.getElementById("returnLine");
  const trayBlocks = document.getElementById("trayBlocks");
  const recipeTitle = document.getElementById("recipeTitle");
  const recipeSubtitle = document.getElementById("recipeSubtitle");
  const hintBox = document.getElementById("hintBox");
  const hintText = document.getElementById("hintText");

  function findBlockDef(id) {
    return currentLevel.blocks.find(b => b.id === id);
  }

  function loadLevel(level) {
    currentLevel = level;
    placedBlocks = level.prefilled ? [...level.prefilled] : [];
    hintBox.hidden = true;

    recipeTitle.textContent = `${level.functionName}()`;
    recipeSubtitle.textContent = level.concept === "debugging"
      ? "This recipe has a bug — rearrange the lines to fix it!"
      : "Build the function to fill the order";

    // def line
    const paramStr = level.params.join(", ");
    defLine.innerHTML = `def <span style="color:var(--espresso)">${level.functionName}</span>(<span style="color:var(--honey)">${paramStr}</span>):`;

    // return line
    returnLine.innerHTML = level.requiresReturn
      ? `&nbsp;&nbsp;&nbsp;&nbsp;return <span style="color:var(--terracotta-dark)">cup</span>`
      : "";

    renderTray();
    renderBody();
  }

  function renderTray() {
    trayBlocks.innerHTML = "";
    // Show all blocks not currently placed, shuffled a bit for variety
    const available = currentLevel.blocks.filter(b => !placedBlocks.includes(b.id));
    available.forEach(block => {
      trayBlocks.appendChild(makeStripElement(block, true));
    });
  }

  function renderBody() {
    codeBody.innerHTML = "";
    if (placedBlocks.length === 0) {
      const ph = document.createElement("div");
      ph.className = "drop-placeholder";
      ph.textContent = "Drop ingredient lines here, in order ↓";
      codeBody.appendChild(ph);
      return;
    }
    placedBlocks.forEach(id => {
      const block = findBlockDef(id);
      if (block) codeBody.appendChild(makeStripElement(block, false));
    });
  }

  function makeStripElement(block, inTray) {
    const el = document.createElement("div");
    el.className = "ingredient-strip";
    el.draggable = true;
    el.dataset.blockId = block.id;
    el.tabIndex = 0;

    el.innerHTML = `
      <span class="strip-icon">${block.icon}</span>
      <span class="strip-text">${block.label}</span>
      ${!inTray ? '<button class="strip-remove" aria-label="Remove line">✕</button>' : ""}
      <span class="strip-tooltip">${block.tooltip}</span>
    `;

    el.addEventListener("dragstart", (e) => {
      draggedBlockId = block.id;
      draggedFromTray = inTray;
      e.dataTransfer.effectAllowed = "move";
    });

    if (!inTray) {
      el.querySelector(".strip-remove").addEventListener("click", () => {
        placedBlocks = placedBlocks.filter(id => id !== block.id);
        renderTray();
        renderBody();
      });

      // tap-to-hear-tooltip support for touch devices (mobile a11y)
      el.addEventListener("click", (e) => {
        if (e.target.classList.contains("strip-remove")) return;
        highlightKitchenAction(block);
      });
    } else {
      // clicking a tray block adds it to the end of the recipe (mobile-friendly alt to drag)
      el.addEventListener("click", () => {
        placedBlocks.push(block.id);
        renderTray();
        renderBody();
      });
    }

    return el;
  }

  // Drag/drop handlers on the code body container (for reordering + dropping from tray)
  codeBody.addEventListener("dragover", (e) => {
    e.preventDefault();
    codeBody.classList.add("drag-over");
  });
  codeBody.addEventListener("dragleave", () => {
    codeBody.classList.remove("drag-over");
  });
  codeBody.addEventListener("drop", (e) => {
    e.preventDefault();
    codeBody.classList.remove("drag-over");
    if (!draggedBlockId) return;

    if (draggedFromTray) {
      if (!placedBlocks.includes(draggedBlockId)) {
        placedBlocks.push(draggedBlockId);
      }
    }
    // if reordering from within body, simplest approach: leave as-is (click remove + re-add covers most kid use cases)
    draggedBlockId = null;
    renderTray();
    renderBody();
  });

  function highlightKitchenAction(block) {
    // Tapping/hovering a line shows what it does in the kitchen (per spec)
    window.dispatchEvent(new CustomEvent("recipe:lineHighlight", { detail: block }));
  }

  function getPlacedBlocks() {
    return [...placedBlocks];
  }

  function showHint(text) {
    hintText.textContent = text;
    hintBox.hidden = false;
  }

  function hideHint() {
    hintBox.hidden = true;
  }

  function reset() {
    loadLevel(currentLevel);
  }

  function flashResult(isCorrectList) {
    // isCorrectList: array of booleans matching placedBlocks order
    const strips = codeBody.querySelectorAll(".ingredient-strip");
    strips.forEach((strip, i) => {
      strip.classList.add(isCorrectList[i] ? "correct-flash" : "wrong-flash");
    });
  }

  return {
    loadLevel,
    getPlacedBlocks,
    showHint,
    hideHint,
    reset,
    flashResult,
  };
})();
