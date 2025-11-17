// ===================== 定数 =====================
const STORAGE_KEY = "cheatday_gacha_v3";

const JEWEL_COST_SINGLE = 30;
const JEWEL_COST_TEN = 300;
const DAILY_BONUS_AMOUNT = 100;

// レアリティ確率（カード・キャラ共通ベース）
const BASE_RARITY_RATES = {
  5: 0.02,
  4: 0.08,
  3: 0.30,
  2: 0.30,
  1: 0.30
};

// キャラ★5ピックアップ
const CHAR_PICKUP_IDS = [
  "shokurai_jounokami",
  "honoka_mikoto",
  "uni_mitama",
  "unagawa_tawara",
  "shizukawa_okina",
  "koshihikari_kou"
];

// ===================== 状態 =====================
let state = null;

let cardById = {};
let cardPoolsByRarity = {};

let charById = {};
let charPoolsByRarity = {};
let charPickupByRarity = {};

let lastResults = [];
let lastGachaType = "meal"; // "meal" | "char"
let lastPullCount = 1;

let animationDurationMs = 5000;

// パッシブ合算
let globalBuffs = {
  dpFlat: 0,
  rateUpPercent: 0,
  rankUpPercent: 0,
  discountPercent: 0
};

// めくり演出
let revealQueue = [];
let revealIndex = 0;
let longPressTimer = null;

// BOX表示
let boxMode = "card";

// ===================== 初期化 =====================
window.addEventListener("load", () => {
  buildIndexes();
  initState();
  cleanupExpiredCards();
  recomputeBuffs();
  setupUI();
  updateJewelUI();
  updateTotalDpUI();
  renderBox();
  showMessage("カードガチャとキャラガチャをタブで切り替えられます。");
});

// ===================== カード / キャラ構築 =====================
function buildIndexes() {
  // カード一覧
  cardById = {};
  cardPoolsByRarity = {};
  cards.forEach(c => {
    cardById[c.id] = c;
    if (!cardPoolsByRarity[c.rarity]) cardPoolsByRarity[c.rarity] = [];
    cardPoolsByRarity[c.rarity].push(c);
  });

  // キャラ一覧
  charById = {};
  charPoolsByRarity = {};
  charPickupByRarity = {};

  characters.forEach(ch => {
    charById[ch.id] = ch;
    if (!charPoolsByRarity[ch.rarity]) charPoolsByRarity[ch.rarity] = [];
    charPoolsByRarity[ch.rarity].push(ch);

    if (CHAR_PICKUP_IDS.includes(ch.id)) {
      if (!charPickupByRarity[ch.rarity]) charPickupByRarity[ch.rarity] = [];
      charPickupByRarity[ch.rarity].push(ch);
    }
  });
}

// ===================== state 初期化 =====================
function initState() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {}

  if (raw) {
    try {
      state = JSON.parse(raw);
    } catch (e) {
      state = {};
    }
  } else {
    state = {};
  }

  if (!state || typeof state !== "object") state = {};

  if (state.jewels == null) state.jewels = 300;
  if (!state.cards) state.cards = {};
  if (!state.characters) state.characters = {};
  if (!state.favorites) state.favorites = {};
  if (!state.totalPullsMeal) state.totalPullsMeal = 0;
  if (!state.totalPullsChar) state.totalPullsChar = 0;
  if (!state.totalDP) state.totalDP = 0;
  if (!state.lastDaily) state.lastDaily = null;

  saveState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn(e);
  }
}

// ===================== 日付系 =====================
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ===================== 期限切れカード削除 =====================
function cleanupExpiredCards() {
  const today = todayStr();
  let removed = 0;

  for (const id in state.cards) {
    const info = state.cards[id];
    if (info.expiresAt < today) {
      delete state.cards[id];
      removed++;
    }
  }

  if (removed > 0) {
    saveState();
    showMessage(`期限切れカードを ${removed} 枚削除しました。`);
  }
}

// ===================== パッシブ効果 =====================
function recomputeBuffs() {
  globalBuffs = {
    dpFlat: 0,
    rateUpPercent: 0,
    rankUpPercent: 0,
    discountPercent: 0
  };

  for (const id in state.characters) {
    const count = state.characters[id];
    if (count <= 0) continue;

    const ch = charById[id];
    if (!ch) continue;

    for (let i = 0; i < count; i++) {
      applyEffectStringToBuffs(ch.effect);
    }
  }
}

function applyEffectStringToBuffs(effect) {
  if (!effect) return;
  const parts = effect.split(/[／、]/);

  parts.forEach(raw => {
    const s = raw.trim();
    if (!s) return;

    if (s.includes("DP")) {
      const m = s.match(/DP\+?([0-9]+)/);
      if (m) globalBuffs.dpFlat += parseInt(m[1], 10);
    }

    if (s.includes("排出")) {
      const m = s.match(/([0-9]+(\.[0-9]+)?)%/);
      if (m) globalBuffs.rateUpPercent += parseFloat(m[1]);
    }

    if (s.includes("昇格")) {
      const m = s.match(/([0-9]+(\.[0-9]+)?)%/);
      if (m) globalBuffs.rankUpPercent += parseFloat(m[1]);
    }

    if (s.includes("割引")) {
      const m = s.match(/([0-9]+(\.[0-9]+)?)%/);
      if (m) globalBuffs.discountPercent += parseFloat(m[1]);
    }
  });
}

// ===================== デイリーボーナス =====================
function claimDailyBonus() {
  const today = todayStr();
  if (state.lastDaily === today) {
    showMessage("今日はすでにデイリーボーナスを受け取っています。");
    return;
  }

  state.lastDaily = today;
  state.jewels += DAILY_BONUS_AMOUNT;

  saveState();
  updateJewelUI();

  showMessage(`デイリーボーナス！ジュエルを${DAILY_BONUS_AMOUNT}個獲得しました。`);
}
// ===================== 割引コスト計算 =====================
function calcCost(baseCost) {
  const d = Math.min(globalBuffs.discountPercent, 90);
  const cost = Math.round(baseCost * (1 - d / 100));
  return Math.max(cost, 0);
}

// ===================== レアリティ抽選 =====================
function buildRarityTable() {
  const up = globalBuffs.rateUpPercent;
  const base = { ...BASE_RARITY_RATES };

  if (up > 0) {
    const factor = 1 + up / 100;
    base[5] *= factor;

    let sum = 0;
    for (const r in base) sum += base[r];
    for (const r in base) base[r] = base[r] / sum;
  }
  return base;
}

function rollRarity() {
  const rates = buildRarityTable();
  const r = Math.random();
  let acc = 0;
  let result = 1;

  [1, 2, 3, 4, 5].forEach(rv => {
    acc += rates[rv];
    if (result === 1 && r < acc) result = rv;
  });

  // 昇格
  if (result < 5) {
    const upChance = Math.min(globalBuffs.rankUpPercent / 100, 0.5);
    if (Math.random() < upChance) result++;
  }

  return result;
}

// ===================== ガチャ開始 =====================
function startGacha(type, pullCount) {
  lastGachaType = type;
  lastPullCount = pullCount;

  const baseCost = pullCount === 10 ? JEWEL_COST_TEN : JEWEL_COST_SINGLE;
  const cost = calcCost(baseCost);

  if (state.jewels < cost) {
    showMessage("ジュエルが足りません。");
    return;
  }

  state.jewels -= cost;
  saveState();
  updateJewelUI();

  // 抽選
  lastResults = [];

  if (type === "meal") {
    for (let i = 0; i < pullCount; i++) {
      lastResults.push(drawMealCard());
    }
    state.totalPullsMeal += pullCount;
    applyMealResults(lastResults);
  } else {
    for (let i = 0; i < pullCount; i++) {
      lastResults.push(drawCharacter(i));
    }
    state.totalPullsChar += pullCount;
    applyCharResults(lastResults);
  }

  saveState();
  renderCardBox();
  renderCharBox();
  recomputeBuffs();

  // ★ 演出時間（★5 → 10秒）
  const maxRarity = Math.max(...lastResults.map(r => r.rarity || 1));
  animationDurationMs = (maxRarity >= 5) ? 10000 : 5000;

  prepareAnimation(maxRarity, pullCount, type);

  switchScreen("animation-screen");

  setTimeout(() => {
    showResultScreen();
  }, animationDurationMs);
}

// ===================== 料理ガチャ =====================
function drawMealCard() {
  const rarity = rollRarity();
  const pool = cardPoolsByRarity[rarity] || cards;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

function applyMealResults(results) {
  let addDP = 0;
  const today = todayStr();

  results.forEach(card => {
    addDP += card.dp || 0;

    const info = state.cards[card.id];
    const baseDays = card.expiryDays || 1;

    if (!info) {
      state.cards[card.id] = {
        daysTotal: baseDays,
        expiresAt: addDays(today, baseDays)
      };
    } else {
      const base = info.expiresAt > today ? info.expiresAt : today;
      info.daysTotal += baseDays;
      info.expiresAt = addDays(base, baseDays);
    }
  });

  state.totalDP += addDP + globalBuffs.dpFlat;
}

// ===================== キャラガチャ =====================
function drawCharacter(indexInMulti) {
  const rarity = rollRarity();
  let pool = null;

  if (indexInMulti < 6 && rarity === 5) {
    pool = charPickupByRarity[5] || charPoolsByRarity[5];
  } else {
    pool = charPoolsByRarity[rarity] || characters;
  }

  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

function applyCharResults(results) {
  results.forEach(ch => {
    if (!state.characters[ch.id]) state.characters[ch.id] = 0;
    state.characters[ch.id]++;
  });
}

// ===================== 演出 =====================
function prepareAnimation(maxRarity, pullCount, type) {
  resetAnimation();

  const screen = document.getElementById("animation-screen");
  const hint = document.getElementById("hint-silhouette");
  const text = document.getElementById("animation-text");

  screen.classList.remove("anim-normal", "anim-rare4", "anim-rare5");

  if (maxRarity >= 5) screen.classList.add("anim-rare5");
  else if (maxRarity === 4) screen.classList.add("anim-rare4");
  else screen.classList.add("anim-normal");

  applyBeamColor(maxRarity);

  if (type === "meal") {
    if (maxRarity >= 5) hint.textContent = "食神クラスの一皿が降臨…！";
    else if (maxRarity === 4) hint.textContent = "黄金の旨味が天へ昇る…";
    else hint.textContent = "旨味が満ちていく…";
  } else {
    if (maxRarity >= 5) hint.textContent = "食の守護神たちが目覚める…！";
    else if (maxRarity === 4) hint.textContent = "強き食の力を感じる…";
    else hint.textContent = "キャラたちが集結中…";
  }

  text.textContent = pullCount === 10 ? "10体召喚中…" : "1体召喚中…";
}

function resetAnimation() {
  const beam = document.querySelector(".beam");
  const hint = document.getElementById("hint-silhouette");

  [beam, hint].forEach(el => {
    if (!el) return;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
  });
}

function applyBeamColor(rarity) {
  const beam = document.querySelector(".beam");
  const glow = document.getElementById("beam-glow");
  if (!beam || !glow) return;

  switch (rarity) {
    case 5:
      beam.style.background =
        "linear-gradient(to top, transparent, red, orange, yellow, green, blue, purple, transparent)";
      glow.style.background =
        "radial-gradient(circle, white, #ff4081, #7c4dff, #40c4ff)";
      break;

    case 4:
      beam.style.background =
        "linear-gradient(to top, transparent, #ffeb3b, #ffc107, transparent)";
      glow.style.background = "#ffeb3b";
      break;

    case 3:
      beam.style.background =
        "linear-gradient(to top, transparent, #29b6f6, transparent)";
      glow.style.background = "#29b6f6";
      break;

    case 2:
      beam.style.background =
        "linear-gradient(to top, transparent, #4fc3f7, transparent)";
      glow.style.background = "#4fc3f7";
      break;

    default:
      beam.style.background =
        "linear-gradient(to top, transparent, #cfd8dc, transparent)";
      glow.style.background = "#cfd8dc";
      break;
  }
}
// ===================== UI セットアップ =====================
function setupUI() {
  // ナビゲーション
  const navHome = document.getElementById("nav-home");
  const navBox = document.getElementById("nav-box");

  if (navHome) {
    navHome.addEventListener("click", () => {
      switchScreen("home-screen");
      navHome.classList.add("active");
      navBox && navBox.classList.remove("active");
    });
  }

  if (navBox) {
    navBox.addEventListener("click", () => {
      switchScreen("box-screen");
      navBox.classList.add("active");
      navHome && navHome.classList.remove("active");
      renderBox();
    });
  }

  // ガチャタブ
  document.querySelectorAll(".gacha-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.gtype;
      setGachaTab(type);
    });
  });

  // ガチャボタン
  const btnMealSingle = document.getElementById("btn-meal-single");
  const btnMealTen = document.getElementById("btn-meal-ten");
  const btnCharSingle = document.getElementById("btn-char-single");
  const btnCharTen = document.getElementById("btn-char-ten");

  btnMealSingle && btnMealSingle.addEventListener("click", () => startGacha("meal", 1));
  btnMealTen && btnMealTen.addEventListener("click", () => startGacha("meal", 10));
  btnCharSingle && btnCharSingle.addEventListener("click", () => startGacha("char", 1));
  btnCharTen && btnCharTen.addEventListener("click", () => startGacha("char", 10));

  // デイリーボーナス・デバッグ
  const btnDaily = document.getElementById("btn-daily");
  btnDaily && btnDaily.addEventListener("click", claimDailyBonus);

  const btnAddJewel = document.getElementById("btn-add-jewel");
  btnAddJewel && btnAddJewel.addEventListener("click", () => {
    state.jewels += 300;
    saveState();
    updateJewelUI();
    showMessage("テスト用にジュエルを300個追加しました。");
  });

  // 結果画面ボタン
  const btnAgain = document.getElementById("result-again-same");
  const btnResultHome = document.getElementById("result-to-home");
  const btnResultBox = document.getElementById("result-to-box");

  btnAgain && btnAgain.addEventListener("click", () => {
    startGacha(lastGachaType, lastPullCount);
  });

  btnResultHome && btnResultHome.addEventListener("click", () => {
    switchScreen("home-screen");
    navHome && navHome.classList.add("active");
    navBox && navBox.classList.remove("active");
  });

  btnResultBox && btnResultBox.addEventListener("click", () => {
    switchScreen("box-screen");
    navBox && navBox.classList.add("active");
    navHome && navHome.classList.remove("active");
    renderBox();
  });

  // BOX タブ & ソート・フィルタ
  const boxTabCard = document.getElementById("box-tab-card");
  const boxTabChar = document.getElementById("box-tab-char");

  boxTabCard && boxTabCard.addEventListener("click", () => {
    boxMode = "card";
    boxTabCard.classList.add("active");
    boxTabChar && boxTabChar.classList.remove("active");
    renderBox();
  });

  boxTabChar && boxTabChar.addEventListener("click", () => {
    boxMode = "char";
    boxTabChar.classList.add("active");
    boxTabCard && boxTabCard.classList.remove("active");
    renderBox();
  });

  const boxSort = document.getElementById("box-sort");
  const boxFilter = document.getElementById("box-filter");
  boxSort && boxSort.addEventListener("change", renderBox);
  boxFilter && boxFilter.addEventListener("change", renderBox);

  const boxToHome = document.getElementById("box-to-home");
  boxToHome && boxToHome.addEventListener("click", () => {
    switchScreen("home-screen");
    navHome && navHome.classList.add("active");
    navBox && navBox.classList.remove("active");
  });

  // 詳細→戻る
  const detailToBox = document.getElementById("detail-to-box");
  const detailToHome = document.getElementById("detail-to-home");
  const charDetailToBox = document.getElementById("char-detail-to-box");
  const charDetailToHome = document.getElementById("char-detail-to-home");

  detailToBox && detailToBox.addEventListener("click", () => switchScreen("box-screen"));
  detailToHome && detailToHome.addEventListener("click", () => switchScreen("home-screen"));
  charDetailToBox && charDetailToBox.addEventListener("click", () => switchScreen("box-screen"));
  charDetailToHome && charDetailToHome.addEventListener("click", () => switchScreen("home-screen"));

  // めくりグリッド（タップで1枚ずつ開く）
  const revealGrid = document.getElementById("reveal-grid");
  const overlay = document.getElementById("reveal-overlay");
  const btnSkip = document.getElementById("btn-reveal-skip");

  if (revealGrid) {
    revealGrid.addEventListener("click", () => {
      if (overlay && !overlay.classList.contains("hidden")) return;
      revealNextCard();
    });

    // 長押しで拡大
    revealGrid.addEventListener("pointerdown", e => {
      const cardEl = e.target.closest(".reveal-card");
      if (!cardEl) return;
      if (!cardEl.classList.contains("flipped")) return;

      const idx = parseInt(cardEl.dataset.index, 10);
      if (Number.isNaN(idx)) return;

      longPressTimer = setTimeout(() => {
        showOverlayForResult(revealQueue[idx]);
      }, 600);
    });

    ["pointerup", "pointerleave", "pointercancel"].forEach(ev => {
      revealGrid.addEventListener(ev, () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      });
    });
  }

  // スキップ
  btnSkip && btnSkip.addEventListener("click", skipReveal);

  // オーバーレイをタップで閉じる
  if (overlay) {
    overlay.addEventListener("click", () => {
      hideOverlay();
    });
  }
}

// ===================== タブ & 画面切り替え =====================
function setGachaTab(type) {
  lastGachaType = type;

  document.querySelectorAll(".gacha-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.gtype === type);
  });

  const panelMeal = document.getElementById("gacha-panel-meal");
  const panelChar = document.getElementById("gacha-panel-char");

  panelMeal && panelMeal.classList.toggle("active", type === "meal");
  panelChar && panelChar.classList.toggle("active", type === "char");
}

function switchScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

// ===================== ステータス表示 =====================
function updateJewelUI() {
  const el = document.getElementById("jewel-count");
  if (el) el.textContent = state.jewels;
}

function updateTotalDpUI() {
  const el = document.getElementById("total-dp");
  if (el) el.textContent = state.totalDP;
}

function showMessage(text) {
  const bar = document.getElementById("message-bar");
  if (bar) bar.textContent = text;
}

// ===================== 結果画面（めくり準備） =====================
function showResultScreen() {
  revealQueue = lastResults.slice();
  revealIndex = 0;

  buildRevealGrid();
  switchScreen("result-screen");

  const label = lastGachaType === "meal" ? "カードガチャ" : "キャラガチャ";
  showMessage(`${lastPullCount}回${label}の結果です。タップしてカードをめくってください。`);
}

// 裏カードグリッド構築
function buildRevealGrid() {
  const grid = document.getElementById("reveal-grid");
  if (!grid) return;
  grid.innerHTML = "";

  revealQueue.forEach((item, idx) => {
    const cardEl = document.createElement("div");
    cardEl.className = "reveal-card rarity-" + item.rarity;
    cardEl.dataset.index = idx;

    const inner = document.createElement("div");
    inner.className = "reveal-inner";

    // 裏面（gtyataik.png）
    const front = document.createElement("div");
    front.className = "reveal-front";
    const img = document.createElement("img");
    img.src = "gtyataik.png";
    img.alt = "card back";
    front.appendChild(img);

    // 表面
    const back = document.createElement("div");
    back.className = "reveal-back";

    const stars = document.createElement("div");
    stars.className = "star-line rarity-" + item.rarity;
    stars.textContent = "★".repeat(item.rarity);

    const name = document.createElement("div");
    name.className = "reveal-name";
    name.textContent = item.name;

    const sub = document.createElement("div");
    sub.className = "reveal-sub";
    if (lastGachaType === "meal") {
      sub.textContent = `DP +${item.dp || 0}`;
    } else {
      sub.textContent = item.food || "";
    }

    const text = document.createElement("div");
    text.className = "reveal-text";
    if (lastGachaType === "meal") {
      text.textContent = item.description || "";
    } else {
      text.textContent =
        `${item.effect ? `効果: ${item.effect}\n` : ""}` +
        `${item.personality ? `性格: ${item.personality}\n` : ""}` +
        `${item.description || ""}`;
    }

    back.appendChild(stars);
    back.appendChild(name);
    back.appendChild(sub);
    back.appendChild(text);

    inner.appendChild(front);
    inner.appendChild(back);
    cardEl.appendChild(inner);
    grid.appendChild(cardEl);
  });
}

// 1枚ずつめくる
function revealNextCard() {
  if (!revealQueue || revealQueue.length === 0) return;
  if (revealIndex >= revealQueue.length) return;

  const card = document.querySelector(`.reveal-card[data-index="${revealIndex}"]`);
  if (!card) {
    revealIndex++;
    return;
  }

  card.classList.add("flipped");

  const rarity = revealQueue[revealIndex].rarity;
  if (rarity >= 4) {
    card.classList.add("flipped-special");
    setTimeout(() => {
      card.classList.remove("flipped-special");
    }, 1500);
  }

  revealIndex++;
}

// 全部スキップ
function skipReveal() {
  const cards = document.querySelectorAll("#reveal-grid .reveal-card");
  cards.forEach(c => c.classList.add("flipped"));
  revealIndex = revealQueue.length;
}

// 長押し拡大オーバーレイ
function showOverlayForResult(item) {
  const overlay = document.getElementById("reveal-overlay");
  if (!overlay) return;

  const t = document.getElementById("overlay-title");
  const s = document.getElementById("overlay-sub");
  const tx = document.getElementById("overlay-text");

  const starHTML =
    `<div class="star-line rarity-${item.rarity}" style="font-size:1.2rem;margin-bottom:6px;">` +
    "★".repeat(item.rarity) +
    `</div>`;

  if (t) t.innerHTML = starHTML + item.name;

  if (lastGachaType === "meal") {
    if (s) s.textContent = `DP +${item.dp || 0}`;
    if (tx) tx.textContent = `${item.bonus ? `効果: ${item.bonus}\n` : ""}${item.description || ""}`;
  } else {
    if (s) s.textContent = item.food || "";
    if (tx)
      tx.textContent =
        `${item.effect ? `効果: ${item.effect}\n` : ""}` +
        `${item.personality ? `性格: ${item.personality}\n` : ""}` +
        `${item.description || ""}`;
  }

  overlay.classList.remove("hidden");
}

function hideOverlay() {
  const overlay = document.getElementById("reveal-overlay");
  if (!overlay) return;
  overlay.classList.add("hidden");
}

// ===================== BOX（モンスト風グリッド） =====================
function renderBox() {
  const grid = document.getElementById("box-grid");
  if (!grid) return;
  grid.innerHTML = "";

  let list = [];

  if (boxMode === "card") {
    const today = todayStr();
    for (const id in state.cards) {
      const base = cardById[id];
      const info = state.cards[id];
      if (!base || !info) continue;

      const diff =
        (new Date(info.expiresAt) - new Date(today + "T00:00:00")) /
        (1000 * 60 * 60 * 24);
      const remain = Math.max(Math.ceil(diff), 0);

      list.push({
        id,
        rarity: base.rarity,
        expiry: remain,
        fav: !!state.favorites[id],
        img: base.image || "box.png"
      });
    }
  } else {
    for (const id in state.characters) {
      const base = charById[id];
      const count = state.characters[id];
      if (!base || !count) continue;

      list.push({
        id,
        rarity: base.rarity,
        expiry: null,
        fav: !!state.favorites[id],
        img: base.image || "box.png"
      });
    }
  }

  // フィルター
  const fltEl = document.getElementById("box-filter");
  const flt = fltEl ? fltEl.value : "all";
  if (flt === "5") list = list.filter(i => i.rarity === 5);
  if (flt === "4up") list = list.filter(i => i.rarity >= 4);
  if (flt === "3up") list = list.filter(i => i.rarity >= 3);

  // ソート
  const sortEl = document.getElementById("box-sort");
  const sort = sortEl ? sortEl.value : "rarity";

  if (sort === "rarity") list.sort((a, b) => b.rarity - a.rarity);
  if (sort === "name") list.sort((a, b) => a.id.localeCompare(b.id));
  if (sort === "expiry") list.sort((a, b) => (a.expiry ?? 999) - (b.expiry ?? 999));
  if (sort === "new") list.reverse();

  if (list.length === 0) {
    const p = document.createElement("p");
    p.textContent =
      boxMode === "card"
        ? "カードをまだ所持していません。ガチャで入手しましょう。"
        : "キャラをまだ所持していません。キャラガチャで入手しましょう。";
    p.style.fontSize = "0.9rem";
    p.style.color = "#ccc";
    p.style.margin = "8px";
    grid.appendChild(p);
    return;
  }

  list.forEach(item => {
    const cell = document.createElement("div");
    cell.className = `box-item rarity-${item.rarity}`;
    cell.dataset.id = item.id;

    const img = document.createElement("img");
    img.src = item.img || "box.png";
    cell.appendChild(img);

    const r = document.createElement("div");
    r.className = `box-rarity rarity-${item.rarity}`;
    r.textContent = "★".repeat(item.rarity);
    cell.appendChild(r);

    if (boxMode === "card") {
      const e = document.createElement("div");
      e.className = "box-expiry";
      e.textContent = item.expiry;
      cell.appendChild(e);
    }

    if (state.favorites[item.id]) {
      const l = document.createElement("div");
      l.className = "box-lock";
      l.textContent = "🔒";
      cell.appendChild(l);
    }

    // 長押しで詳細へ
    let pressTimer = null;
    cell.addEventListener("pointerdown", () => {
      pressTimer = setTimeout(() => {
        openDetailFromBox(item.id);
      }, 350);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach(ev => {
      cell.addEventListener(ev, () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      });
    });

    // タップでお気に入り切り替え
    cell.addEventListener("click", () => {
      state.favorites[item.id] = !state.favorites[item.id];
      saveState();
      renderBox();
    });

    grid.appendChild(cell);
  });
}

// 互換用：昔の renderCardBox / renderCharBox を呼んでいても壊れないようにする
function renderCardBox() {
  renderBox();
}
function renderCharBox() {
  renderBox();
}

function openDetailFromBox(id) {
  if (boxMode === "card") {
    openCardDetail(id);
  } else {
    openCharDetail(id);
  }
}

// ===================== 詳細画面 =====================
function openCardDetail(cardId) {
  const card = cardById[cardId];
  if (!card) return;
  const info = state.cards[cardId];
  if (!info) return;

  const wrap = document.querySelector("#detail-screen .detail-card");
  if (!wrap) return;
  wrap.className = "detail-card rarity-" + card.rarity;

  const rarityEl = document.getElementById("detail-rarity");
  const nameEl = document.getElementById("detail-name");
  const line1El = document.getElementById("detail-line1");
  const line2El = document.getElementById("detail-line2");
  const expiryEl = document.getElementById("detail-expiry");
  const descEl = document.getElementById("detail-desc");

  rarityEl.innerHTML =
    `<div class="star-line rarity-${card.rarity}">` +
    "★".repeat(card.rarity) +
    `</div>`;

  nameEl.textContent = card.name;
  line1El.textContent = card.dp ? `DP +${card.dp}` : "";
  line2El.textContent = card.bonus ? `カード効果: ${card.bonus}` : "";
  expiryEl.textContent =
    `総期限: ${info.daysTotal}日 / 所持期限: ${info.expiresAt} まで`;
  descEl.textContent = card.description || "";

  switchScreen("detail-screen");
}

function openCharDetail(charId) {
  const ch = charById[charId];
  if (!ch) return;
  const count = state.characters[charId] || 0;

  const wrap = document.querySelector("#char-detail-screen .detail-card");
  if (!wrap) return;
  wrap.className = "detail-card rarity-" + ch.rarity;

  const rarityEl = document.getElementById("char-detail-rarity");
  const nameEl = document.getElementById("char-detail-name");
  const foodEl = document.getElementById("char-detail-food");
  const effectEl = document.getElementById("char-detail-effect");
  const persEl = document.getElementById("char-detail-personality");
  const descEl = document.getElementById("char-detail-desc");
  const ownedEl = document.getElementById("char-detail-owned");

  rarityEl.innerHTML =
    `<div class="star-line rarity-${ch.rarity}">` +
    "★".repeat(ch.rarity) +
    `</div>`;

  nameEl.textContent = ch.name;
  foodEl.textContent = ch.food ? `得意料理: ${ch.food}` : "";
  effectEl.textContent = ch.effect ? `効果: ${ch.effect}` : "";
  persEl.textContent = ch.personality ? `性格: ${ch.personality}` : "";
  descEl.textContent = ch.description || "";
  ownedEl.textContent = `所持数: ${count}体`;

  switchScreen("char-detail-screen");
}
