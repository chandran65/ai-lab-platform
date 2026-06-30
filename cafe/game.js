/* ============================================
   PET CAFÉ BUILDER — GAME MODULE
   Orchestrates levels, scoring, customer reactions,
   and the café-growth meta progression.
   ============================================ */

const Game = (() => {
  let coins = 0;
  let currentLevelIndex = 0;
  let nextMilestoneIndex = 0;

  // DOM refs
  const coinCount = document.getElementById("coinCount");
  const levelCount = document.getElementById("levelCount");
  const orderItem = document.getElementById("orderItem");
  const customerSprite = document.getElementById("customerSprite");
  const speechBubble = document.getElementById("speechBubble");
  const cupSprite = document.getElementById("cupSprite");
  const cookBtn = document.getElementById("cookBtn");
  const resetBtn = document.getElementById("resetBtn");

  const toast = document.getElementById("toast");
  const toastEmoji = document.getElementById("toastEmoji");
  const toastTitle = document.getElementById("toastTitle");
  const toastMessage = document.getElementById("toastMessage");
  const toastNext = document.getElementById("toastNext");

  const shopModal = document.getElementById("shopModal");
  const shopMessage = document.getElementById("shopMessage");
  const shopItems = document.getElementById("shopItems");
  const shopClose = document.getElementById("shopClose");

  const cafeProgressFill = document.getElementById("cafeProgressFill");
  const cafeProgressText = document.getElementById("cafeProgressText");

  function init() {
    cookBtn.addEventListener("click", onCook);
    resetBtn.addEventListener("click", () => Editor.reset());
    toastNext.addEventListener("click", onNextOrder);
    shopClose.addEventListener("click", () => { shopModal.hidden = true; });

    window.addEventListener("recipe:lineHighlight", (e) => onLineHighlight(e.detail));

    loadLevel(currentLevelIndex);
    updateCoinUI();
    updateCafeProgress();
  }

  function loadLevel(index) {
    const level = LEVELS[index % LEVELS.length];
    currentLevelIndex = index;
    levelCount.textContent = level.id;

    orderItem.textContent = level.order;
    customerSprite.textContent = level.customer.emoji;
    speechBubble.textContent = level.customer.line;
    cupSprite.textContent = "🥤";
    cupSprite.className = "cup";

    Editor.loadLevel(level);
  }

  function onLineHighlight(block) {
    // Visual nudge: bounce the cup / customer slightly to show "this line does something in the kitchen"
    cupSprite.style.transform = "scale(1.15)";
    speechBubble.textContent = block.tooltip;
    setTimeout(() => {
      cupSprite.style.transform = "scale(1)";
    }, 200);
  }

  function onCook() {
    const level = LEVELS[currentLevelIndex % LEVELS.length];
    const placed = Editor.getPlacedBlocks();
    const correct = level.correctOrder;

    // Build a per-line correctness array for visual flashing
    const correctness = placed.map((id, i) => id === correct[i]);
    const isExactMatch =
      placed.length === correct.length && correctness.every(Boolean);

    Editor.flashResult(correctness);

    if (isExactMatch) {
      handleSuccess(level);
    } else {
      handleFailure(level, placed, correct);
    }
  }

  function handleSuccess(level) {
    cupSprite.classList.add("success-pop");
    speechBubble.textContent = `Yay! Thank you! 🎉`;
    addCoins(level.coinsOnSuccess);

    setTimeout(() => {
      showToast({
        emoji: "🎉",
        title: "Order Perfect!",
        message: `${level.customer.name} loved the ${level.order.split(" (")[0]}! You earned ${level.coinsOnSuccess} coins.`,
      });
    }, 500);
  }

  function handleFailure(level, placed, correct) {
    cupSprite.classList.add("fail-shake");
    cupSprite.textContent = "💥";
    speechBubble.textContent = "Uh oh... that's not quite right! 😟";

    setTimeout(() => {
      cupSprite.textContent = "🥤";
      cupSprite.classList.remove("fail-shake");
    }, 650);

    // Friendly debugging hint based on what went wrong
    let hint;
    if (placed.length === 0) {
      hint = "You haven't added any lines yet! Click or drag ingredients into the recipe.";
    } else if (placed.length < correct.length) {
      hint = `You're missing a step! A ${level.functionName}() recipe needs ${correct.length} lines.`;
    } else if (placed.length > correct.length) {
      hint = "There's an extra line that doesn't belong in this recipe — check the tray for decoys!";
    } else {
      const firstWrongIdx = placed.findIndex((id, i) => id !== correct[i]);
      const wrongBlock = level.blocks.find(b => b.id === placed[firstWrongIdx]);
      hint = `Line ${firstWrongIdx + 1} (${wrongBlock ? wrongBlock.label : "?"}) is out of order. Think about what needs to happen first!`;
    }

    Editor.showHint(level.hint + " " + hint);
  }

  function onNextOrder() {
    toast.hidden = true;
    const nextIndex = currentLevelIndex + 1;
    if (nextIndex >= LEVELS.length) {
      showFinalCelebration();
    } else {
      loadLevel(nextIndex);
    }
  }

  function showToast({ emoji, title, message }) {
    toastEmoji.textContent = emoji;
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.hidden = false;
  }

  function showFinalCelebration() {
    showToast({
      emoji: "👑",
      title: "Café Master!",
      message: "You've completed every recipe! Your café is the talk of the town.",
    });
    toastNext.textContent = "Play Again";
    toastNext.removeEventListener("click", onNextOrder);
    toastNext.addEventListener("click", () => {
      toast.hidden = true;
      loadLevel(0);
    }, { once: true });
  }

  function addCoins(amount) {
    coins += amount;
    updateCoinUI();
    checkMilestones();
    updateCafeProgress();
  }

  function updateCoinUI() {
    coinCount.textContent = coins;
  }

  function checkMilestones() {
    if (nextMilestoneIndex >= SHOP_MILESTONES.length) return;
    const milestone = SHOP_MILESTONES[nextMilestoneIndex];
    if (coins >= milestone.coins) {
      openShop(milestone);
      nextMilestoneIndex++;
    }
  }

  function openShop(milestone) {
    shopMessage.textContent = `You've earned ${milestone.coins} coins! Time to decorate the café.`;
    shopItems.innerHTML = "";
    milestone.items.forEach(item => {
      const div = document.createElement("div");
      div.className = "shop-item";
      div.innerHTML = `<div class="item-emoji">${item.emoji}</div><div class="item-name">${item.name}</div>`;
      shopItems.appendChild(div);
    });
    shopModal.hidden = false;
  }

  function updateCafeProgress() {
    const nextMilestone = SHOP_MILESTONES[nextMilestoneIndex];
    if (!nextMilestone) {
      cafeProgressFill.style.width = "100%";
      cafeProgressText.textContent = "Café fully decorated! 🎉";
      return;
    }
    const prevTarget = nextMilestoneIndex > 0 ? SHOP_MILESTONES[nextMilestoneIndex - 1].coins : 0;
    const span = nextMilestone.coins - prevTarget;
    const progress = Math.min(1, (coins - prevTarget) / span);
    cafeProgressFill.style.width = `${progress * 100}%`;
    cafeProgressText.textContent = `${coins} / ${nextMilestone.coins} coins to next upgrade`;
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", Game.init);
