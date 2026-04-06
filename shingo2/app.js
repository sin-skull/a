/* 
  れんの腹筋筋トレメニュー
  - HTML/CSS/JS 分離版
  - 6ヶ月保存（localStorage）
  - デイリー: 腹筋+腹斜筋=100（筋肉痛で減算）
  - 追加部位: 1部位必須（難易度20/35/50 + random）
  - 達成度: 120回=100%（固定）で超過も表示
  - カレンダー: 一般的な月カレンダー + 日付詳細
  - グラフ: 1日/1週/全体 を棒グラフ + 体重推移
*/

const BASELINE_100 = 120;

// ============ Utilities ============
const $ = (id) => document.getElementById(id);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const pad2 = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function nowTs() { return Date.now(); }

// ★ 安全にイベントを貼る（ボタンを消しても白画面にならない）
function on(id, ev, fn, opt) {
  const el = $(id);
  if (!el) return;
  el.addEventListener(ev, fn, opt);
}
function onAll(sel, ev, fn, opt) {
  document.querySelectorAll(sel).forEach(el => el.addEventListener(ev, fn, opt));
}

// Disable iOS gesture zoom
['gesturestart', 'gesturechange', 'gestureend'].forEach(evt => {
  document.addEventListener(evt, (e) => e.preventDefault(), { passive: false });
});

// ============ Data Model ============
const STORAGE_KEY = 'ren_abs_app_v3';

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { days: {} };
    const obj = JSON.parse(raw);
    if (!obj.days) obj.days = {};
    return obj;
  } catch {
    return { days: {} };
  }
}

function saveDB() {
  pruneDB();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.db));
}

function pruneDB() {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);
  const cut = ymd(cutoff);
  for (const k of Object.keys(state.db.days)) {
    if (k < cut) delete state.db.days[k];
  }
}

// ============ App State ============
const PARTS = [
  { key: 'random', name: 'ランダム' },
  { key: 'thigh', name: 'もも' },
  { key: 'calf', name: 'ふくらはぎ' },
  { key: 'waist', name: '腰' },
  { key: 'grip', name: '握力' },
  { key: 'arm', name: '腕' },
  { key: 'shoulder', name: '肩' },
  { key: 'back', name: '背筋' },
  { key: 'lat', name: '広背筋' },
  { key: 'neck', name: '首' },
];

const DIFFS = [
  { key: 'easy', label: 'easy', base: 20, rmin: 1, rmax: 20 },
  { key: 'normal', label: 'normal', base: 35, rmin: 21, rmax: 35 },
  { key: 'hard', label: 'hard', base: 50, rmin: 36, rmax: 50 },
];

// soreness: core 100から減算（random）
const SORENESS = {
  none:   { label: 'なし',   min: 0,  max: 0 },
  sweet:  { label: '甘め',   min: 0,  max: 8 },
  normal: { label: '普通',   min: 9,  max: 20 },
  hard:   { label: '難しい', min: 21, max: 40 },
};

const state = {
  db: loadDB(),

  // settings
  settings: {
    extraPartKey: null,
    diffKey: 'easy',
    random: false,
    sorenessMode: 'none',
    sorenessSubtract: 0,
  },

  // session runtime
  session: null,

  // UI
  pickIndex: 0, // default: ランダム
  diffIndex: 0,
  graphScope: 'day', // 'day' | 'week' | 'all'
  calCursor: new Date(),
  calSelected: ymd(new Date()),
};

// ============ Screen Router ============
const screens = [
  'home','core','pick','diff','extra','total','sore','option','calendar','graph','weight'
];

function showScreen(name) {
  for (const s of screens) {
    const el = $(`screen-${s}`);
    if (!el) continue;
    el.classList.toggle('is-active', s === name);
  }

  if (name === 'option') renderOption();
  if (name === 'calendar') renderCalendar();
  if (name === 'graph') renderGraph();
  if (name === 'weight') {
    ensureWeightScreen();
    hydrateWeightScreen();
  }
}

// ============ Weight Screen (ページ切替) ============
function ensureWeightScreen() {
  if (document.getElementById('screen-weight')) return;

  const app = document.getElementById('app') || document.body;
  const sec = document.createElement('section');
  sec.id = 'screen-weight';
  sec.className = 'screen';

  // CSSは触らない前提。クラスは「存在してるなら」効く、無ければ最小表示。
  sec.innerHTML = `
    <div class="topbar">
      <button id="btn-weight-back" class="topbar__btn">←</button>
      <div class="topbar__title">体重計</div>
      <div class="topbar__spacer"></div>
    </div>

    <div class="panel">
      <div class="panel__title">今日の体重（kg）</div>
      <input id="weight-input" class="input" inputmode="decimal" placeholder="例: 77.0" />
      <div id="weight-note" class="muted" style="margin-top:8px;"></div>
    </div>

    <div class="bottombar">
      <button id="btn-weight-save" class="bottombar__btn is-primary">保存</button>
      <button id="btn-weight-delete" class="bottombar__btn">削除</button>
    </div>
  `;

  app.appendChild(sec);
}

function hydrateWeightScreen() {
  const key = ymd(new Date());
  const day = ensureDay(key);
  const input = $('weight-input');
  const note = $('weight-note');
  if (input) input.value = (day.weightKg == null) ? '' : String(day.weightKg);
  if (note) note.textContent = '';
}

function openWeightScreen() {
  ensureWeightScreen();
  hydrateWeightScreen();
  showScreen('weight');
}

// ============ Day helpers ============
function ensureDay(key) {
  if (!state.db.days[key]) {
    state.db.days[key] = {
      sessions: [],
      totals: { doneTotal: 0, plannedTotal: 0 },
      bestDoneTotal: 0,
      weightKg: null,
      weightAt: null,
    };
  } else {
    // 互換
    if (!state.db.days[key].sessions) state.db.days[key].sessions = [];
    if (!state.db.days[key].totals) state.db.days[key].totals = { doneTotal: 0, plannedTotal: 0 };
    if (state.db.days[key].bestDoneTotal == null) state.db.days[key].bestDoneTotal = 0;
    if (!('weightKg' in state.db.days[key])) state.db.days[key].weightKg = null;
    if (!('weightAt' in state.db.days[key])) state.db.days[key].weightAt = null;
  }
  return state.db.days[key];
}

function setTodayWeightFromInput(raw) {
  const key = ymd(new Date());
  const day = ensureDay(key);
  const note = $('weight-note');

  const t = String(raw ?? '').trim();
  if (!t) {
    day.weightKg = null;
    day.weightAt = null;
    if (note) note.textContent = '削除しました。';
    saveDB();
    renderCalendar();
    renderGraph();
    return;
  }

  const v = Number(t);
  if (!Number.isFinite(v) || v <= 0 || v >= 500) {
    if (note) note.textContent = '数値が不正です（例: 77.0）';
    return;
  }

  day.weightKg = Math.round(v * 10) / 10;
  day.weightAt = nowTs();
  if (note) note.textContent = '保存しました。';
  saveDB();
  renderCalendar();
  renderGraph();
}

// ============ Session Logic ============
function computeCoreTarget() {
  const subtract = state.settings.sorenessSubtract || 0;
  return Math.max(0, 100 - subtract);
}

function computeExtraTarget() {
  const diff = DIFFS.find(d => d.key === state.settings.diffKey) || DIFFS[0];
  if (!state.settings.random) return diff.base;
  return randInt(diff.rmin, diff.rmax);
}

function currentExtraPlannedSum(s) {
  const segs = s?.extraSegments || [];
  return segs.reduce((a, seg) => a + (seg.planned || 0), 0);
}

function currentExtraDoneSum(s) {
  const segs = s?.extraSegments || [];
  return segs.reduce((a, seg) => a + (seg.done || 0), 0);
}

function syncSessionTotalsFromSegments() {
  const s = state.session;
  if (!s) return;
  s.plannedTotal = s.planned.coreTotal + currentExtraPlannedSum(s);
}

function resolvePartName(partKey) {
  if (partKey === 'random') {
    const pool = PARTS.filter(p => p.key !== 'random');
    return pool[randInt(0, pool.length - 1)].name;
  }
  return (PARTS.find(p => p.key === partKey)?.name) || '腕';
}

function startSession() {
  if (!state.settings.extraPartKey) {
    alert('追加部位は必須です。OPTION → 追加部位を選択してください。');
    return;
  }

  const coreTotal = computeCoreTarget();
  const coreN = Math.ceil(coreTotal * 0.5);
  const coreO = Math.floor(coreTotal * 0.5);
  const extraTarget = computeExtraTarget();

  const plannedTotal = coreTotal + extraTarget;
  const extraPartName = resolvePartName(state.settings.extraPartKey);

  state.session = {
    at: nowTs(),
    pickReturn: 'core',
    addingExtra: false,
    pendingPart: null,
    pendingPickRandom: false,
    extraSegments: [],
    currentExtraIdx: 0,

    planned: { coreTotal, coreN, coreO, extra: extraTarget },
    done: { coreN: 0, coreO: 0, extra: 0 },

    activeCore: 'coreN',
    firstTapDone: false,

    extraPart: extraPartName,
    diff: state.settings.diffKey,
    random: state.settings.random,
    soreness: { mode: state.settings.sorenessMode, subtract: state.settings.sorenessSubtract },
    plannedTotal,
  };

  // init first extra segment
  state.session.extraSegments.push({
    part: state.session.extraPart,
    diff: state.session.diff,
    randomCount: state.session.random,
    pickRandom: false,
    planned: state.session.planned.extra,
    done: 0,
  });
  syncSessionTotalsFromSegments();

  // init UI
  const inst = $('core-instruction');
  if (inst) inst.style.display = 'block';
  const sl = $('shade-left');
  const sr = $('shade-right');
  if (sl) sl.style.opacity = '0';
  if (sr) sr.style.opacity = '0';
  updateCoreUI();
  showScreen('core');
}

function finishCoreToNext() {
  if (state.session) {
    state.session.pickReturn = 'core';
    state.session.addingExtra = false;
  }
  // ここを有効にすると「開いた瞬間ランダムに合わせる」
  // state.pickIndex = 0;
  syncPickFromSettings();
  showScreen('pick');
}

function ensureExtraAddButton() {
  const footer = document.querySelector('#screen-extra .bottombar');
  if (!footer) return;
  if ($('btn-extra-add')) return;

  footer.style.position = 'relative';

  const btn = document.createElement('button');
  btn.className = 'bottombar__btn';
  btn.id = 'btn-extra-add';
  btn.textContent = '＋';
  btn.style.display = 'none';

  // ★ Finishを潰さない
  btn.style.position = 'absolute';
  btn.style.right = '12px';
  btn.style.bottom = '10px';

  footer.appendChild(btn);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    startAddExtraLoop();
  });
}

function updateExtraFooterButtons() {
  const s = state.session;
  const btnAdd = $('btn-extra-add');
  const btnFinish = $('btn-extra-finish');
  if (!s) return;

  const remaining = s.planned.extra - s.done.extra;
  const show = (remaining <= 0);

  if (btnFinish) btnFinish.style.display = show ? 'inline-flex' : 'none';
  if (btnAdd) btnAdd.style.display = show ? 'inline-flex' : 'none';

  // ★ Finish と + を分ける（両方出る時だけ Finish を少し細くする）
  if (btnFinish) {
    if (show) {
      btnFinish.style.width = 'calc(100% - 72px)';
      btnFinish.style.marginRight = '72px';
    } else {
      btnFinish.style.width = '';
      btnFinish.style.marginRight = '';
    }
  }
}

function startAddExtraLoop() {
  const s = state.session;
  if (!s) return;
  s.pickReturn = 'extra';
  s.addingExtra = true;

  // ★ ループ時は必ずランダムに合わせる
  state.pickIndex = 0;
  renderPick();
  showScreen('pick');
}

function applyPickedPartToSession(partKey) {
  const s = state.session;
  if (!s) return;

  const partName = resolvePartName(partKey);
  s.pendingPart = partName;
  s.pendingPickRandom = (partKey === 'random');
}

function commitPendingPartAsNewSegment() {
  const s = state.session;
  if (!s) return;

  if (s.addingExtra) {
    s.extraSegments.push({
      part: s.pendingPart || resolvePartName(state.settings.extraPartKey),
      diff: s.diff,
      randomCount: s.random,
      pickRandom: !!s.pendingPickRandom,
      planned: computeExtraTarget(),
      done: 0,
    });

    s.currentExtraIdx = s.extraSegments.length - 1;
    const cur = s.extraSegments[s.currentExtraIdx];
    s.extraPart = cur.part;
    s.planned.extra = cur.planned;
    s.done.extra = cur.done;
    syncSessionTotalsFromSegments();
  } else {
    s.extraPart = s.pendingPart || s.extraPart;
    s.extraSegments[0].part = s.extraPart;
    s.extraSegments[0].pickRandom = !!s.pendingPickRandom;
  }

  s.pendingPart = null;
  s.pendingPickRandom = false;
}

function finishExtraToTotal() {
  saveSession();
  renderTotal();
  showScreen('total');
}

function saveSession() {
  if (!state.session) return;
  const key = ymd(new Date());
  const day = ensureDay(key);
  const s = state.session;

  if (s.extraSegments && s.extraSegments.length) {
    const cur = s.extraSegments[s.currentExtraIdx];
    if (cur) cur.done = s.done.extra;
  }

  day.sessions.push({
    at: s.at,
    plannedTotal: s.plannedTotal,
    planned: { core: s.planned.coreTotal, extra: currentExtraPlannedSum(s) },
    done: { coreN: s.done.coreN, coreO: s.done.coreO, extra: currentExtraDoneSum(s) },
    soreness: s.soreness,
    extraPart: s.extraPart,
    diff: s.diff,
    random: s.random,
    extras: (s.extraSegments && s.extraSegments.length) ? s.extraSegments.map(seg => ({
      part: seg.part, diff: seg.diff, randomCount: seg.randomCount, pickRandom: !!seg.pickRandom,
      planned: seg.planned, done: seg.done
    })) : undefined,
  });

  // recompute day totals
  let dayDone = 0;
  let dayPlanned = 0;
  for (const sess of day.sessions) {
    dayDone += (sess.done.coreN + sess.done.coreO + sess.done.extra);
    dayPlanned += sess.plannedTotal;
  }
  day.totals.doneTotal = dayDone;
  day.totals.plannedTotal = dayPlanned;
  day.bestDoneTotal = Math.max(day.bestDoneTotal || 0, dayDone);

  saveDB();
}

// ============ Core UI ============
function updateCoreUI() {
  const s = state.session;
  if (!s) return;

  const done = s.done.coreN + s.done.coreO;
  const remaining = s.planned.coreTotal - done;

  const remainEl = $('core-remaining');
  if (remainEl) remainEl.textContent = String(remaining);

  const finishBtn = $('btn-core-finish');
  if (finishBtn) finishBtn.style.display = (remaining <= 0) ? 'block' : 'none';
}

function coreTap(side) {
  const s = state.session;
  if (!s) return;

  if (!s.firstTapDone) {
    s.firstTapDone = true;
    const inst = $('core-instruction');
    if (inst) inst.style.display = 'none';
  }

  if (side === 'left') {
    s.activeCore = 'coreN';
    s.done.coreN += 1;
    darken('left');
  } else {
    s.activeCore = 'coreO';
    s.done.coreO += 1;
    darken('right');
  }
  updateCoreUI();
}

function darken(side) {
  const step = 0.02;
  const max = 0.55;
  const el = side === 'left' ? $('shade-left') : $('shade-right');
  if (!el) return;
  const current = parseFloat(el.style.opacity || '0');
  el.style.opacity = String(clamp(current + step, 0, max));
}

function toggleCoreSide() {
  const s = state.session;
  if (!s) return;
  s.activeCore = (s.activeCore === 'coreN') ? 'coreO' : 'coreN';
  updateCoreUI();
}

// ============ Pick UI (extra part) ============
function syncPickFromSettings() {
  const idx = PARTS.findIndex(p => p.key === state.settings.extraPartKey);
  state.pickIndex = idx >= 0 ? idx : 0;
  renderPick();
}

function renderPick() {
  const value = PARTS[state.pickIndex]?.name || 'ランダム';
  const v = $('pick-value');
  if (v) v.textContent = value;

  const dots = $('pick-dots');
  if (!dots) return;
  dots.innerHTML = '';
  for (let i = 0; i < PARTS.length; i++) {
    const d = document.createElement('div');
    d.className = 'dot';
    if (i === state.pickIndex) d.classList.add('is-active', 'is-red');
    dots.appendChild(d);
  }
}

function movePick(delta) {
  state.pickIndex = (state.pickIndex + delta + PARTS.length) % PARTS.length;
  renderPick();
}

function decidePick() {
  const part = PARTS[state.pickIndex];
  state.settings.extraPartKey = part.key;

  if (state.session) {
    applyPickedPartToSession(part.key);
    commitPendingPartAsNewSegment();
    renderOption();
    syncDiffFromSettings();

    if (state.session.pickReturn === 'extra') {
      startExtra();
      return;
    }
  }

  renderOption();
  syncDiffFromSettings();
  showScreen('diff');
}

// ============ Difficulty UI ============
function syncDiffFromSettings() {
  const idx = DIFFS.findIndex(d => d.key === state.settings.diffKey);
  state.diffIndex = idx >= 0 ? idx : 0;
  renderDiff();
}

function renderDiff() {
  const diff = DIFFS[state.diffIndex];
  const dv = $('diff-value');
  const dbg = $('diff-bg');
  const dr = $('diff-random');
  if (dv) dv.textContent = diff.label;
  if (dbg) dbg.textContent = diff.label;
  if (dr) dr.textContent = state.settings.random ? 'on' : 'off';

  $('num-easy')?.classList.toggle('is-active', diff.key === 'easy');
  $('num-normal')?.classList.toggle('is-active', diff.key === 'normal');
  $('num-hard')?.classList.toggle('is-active', diff.key === 'hard');

  const dots = $('diff-dots');
  if (!dots) return;
  dots.innerHTML = '';
  for (let i = 0; i < DIFFS.length; i++) {
    const d = document.createElement('div');
    d.className = 'dot';
    if (i === state.diffIndex) d.classList.add('is-active', 'is-red');
    dots.appendChild(d);
  }
}

function moveDiff(delta) {
  state.diffIndex = (state.diffIndex + delta + DIFFS.length) % DIFFS.length;
  renderDiff();
}

function toggleRandom() {
  state.settings.random = !state.settings.random;
  renderDiff();
  renderOption();
}

function decideDiff() {
  const diff = DIFFS[state.diffIndex];
  state.settings.diffKey = diff.key;
  renderOption();

  if (state.session) {
    state.session.diff = diff.key;
    state.session.random = state.settings.random;

    const extraT = computeExtraTarget();
    state.session.planned.extra = extraT;
    const cur = state.session.extraSegments?.[state.session.currentExtraIdx];
    if (cur) {
      cur.diff = diff.key;
      cur.randomCount = state.settings.random;
      cur.planned = extraT;
    }
    syncSessionTotalsFromSegments();
  }
  startExtra();
}

// ============ Extra workout ============
function startExtra() {
  if (!state.session) return;
  const s = state.session;

  const p = $('extra-part');
  const bg = $('extra-bg');
  const r = $('extra-remaining');

  if (p) p.textContent = s.extraPart;
  if (bg) bg.textContent = s.diff;
  if (r) r.textContent = String(s.planned.extra - s.done.extra);

  ensureExtraAddButton();

  // ★ 初期表示は必ず隠す
  const btnFinish = $('btn-extra-finish');
  const btnAdd = $('btn-extra-add');
  if (btnFinish) btnFinish.style.display = 'none';
  if (btnAdd) btnAdd.style.display = 'none';

  showScreen('extra');
  updateExtraFooterButtons();
}

function extraTap(delta) {
  const s = state.session;
  if (!s) return;

  s.done.extra = Math.max(0, s.done.extra + delta);

  const cur = s.extraSegments?.[s.currentExtraIdx];
  if (cur) cur.done = s.done.extra;

  const r = $('extra-remaining');
  if (r) r.textContent = String(s.planned.extra - s.done.extra);

  updateExtraFooterButtons();
}

// ============ Total UI ============
function renderTotal() {
  const key = ymd(new Date());
  const day = state.db.days[key];
  const s = state.session;
  if (!day || !day.sessions.length || !s) return;

  $('total-core-normal') && ($('total-core-normal').textContent = String(s.done.coreN));
  $('total-core-oblique') && ($('total-core-oblique').textContent = String(s.done.coreO));

  const extraDone = currentExtraDoneSum(s);
  const extraName = (s.extraSegments && s.extraSegments.length > 1)
    ? `追加部位（${s.extraSegments.length}部位）`
    : `追加部位[${s.extraPart}]`;

  $('total-extra-name') && ($('total-extra-name').textContent = extraName);
  $('total-extra') && ($('total-extra').textContent = String(extraDone));

  const sum = s.done.coreN + s.done.coreO + extraDone;
  $('total-sum') && ($('total-sum').textContent = String(sum));

  // ★ %は120固定
  const pct = Math.round((sum / BASELINE_100) * 100);
  $('total-percent') && ($('total-percent').textContent = `${pct}%`);

  const isNew = sum >= (day.bestDoneTotal || 0);
  const tn = $('total-new');
  if (tn) tn.style.display = isNew ? 'inline-block' : 'none';
}

function totalTapToHome(e) {
  const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
  if (tag === 'button') return;
  state.session = null;
  showScreen('home');
}

// ============ Soreness ============
function setSoreness(mode) {
  state.settings.sorenessMode = mode;
  const conf = SORENESS[mode] || SORENESS.none;
  const subtract = (mode === 'none') ? 0 : randInt(conf.min, conf.max);
  state.settings.sorenessSubtract = subtract;

  document.querySelectorAll('.sore__btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.sore === mode);
  });

  const note = $('sore-note');
  if (note) {
    note.textContent = (mode === 'none')
      ? '減算なし（100回）'
      : `${conf.label}：100回から ${subtract} 回減らす（random）`;
  }
  renderOption();
}

// ============ OPTION UI ============
function renderOption() {
  const part = PARTS.find(p => p.key === state.settings.extraPartKey);
  const op = $('opt-part');
  const od = $('opt-diff');
  const or = $('opt-random');
  const os = $('opt-sore');

  if (op) op.textContent = part ? part.name : '未選択（必須）';
  if (od) od.textContent = state.settings.diffKey;
  if (or) or.textContent = state.settings.random ? 'on' : 'off';
  if (os) os.textContent = `${SORENESS[state.settings.sorenessMode]?.label || 'なし'}（-${state.settings.sorenessSubtract}）`;
}

// ============ Calendar ============
function renderCalendar() {
  const cursor = new Date(state.calCursor.getFullYear(), state.calCursor.getMonth(), 1);
  const title = `${cursor.getFullYear()}-${pad2(cursor.getMonth()+1)}`;
  const ct = $('cal-title');
  if (ct) ct.textContent = title;

  const grid = $('cal-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const start = new Date(cursor);
  start.setDate(1);
  const dow = start.getDay(); // 0=Sun
  start.setDate(start.getDate() - dow);

  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const k = ymd(d);
    const inMonth = d.getMonth() === cursor.getMonth();

    const cell = document.createElement('button');
    cell.className = 'cal-cell' + (inMonth ? '' : ' is-muted');
    if (k === state.calSelected) cell.classList.add('is-selected');

    const hasData = !!state.db.days[k];
    if (hasData) cell.classList.add('has-data');

    const done = state.db.days[k]?.totals?.doneTotal ?? 0;
    const pct = Math.round((done / BASELINE_100) * 100);

    cell.innerHTML = `
      <div class="cal-cell__d">${d.getDate()}</div>
      <div class="cal-cell__dot"></div>
      <div class="cal-cell__p">${hasData ? pct+'%' : ''}</div>
    `;
    cell.addEventListener('click', () => {
      state.calSelected = k;
      renderCalendar();
      renderCalendarDetail();
    });
    grid.appendChild(cell);
  }
  renderCalendarDetail();
}

function renderCalendarDetail() {
  const key = state.calSelected;
  const day = state.db.days[key];

  const title = $('cal-detail-title');
  const body = $('cal-detail-body');
  if (title) title.textContent = `${key} の記録`;
  if (!body) return;

  if (!day) {
    body.innerHTML = '<div class="muted">記録なし</div>';
    return;
  }

  const lines = [];
  if (day.weightKg != null) {
    lines.push(`<div class="cal-line"><strong>体重</strong> ${day.weightKg} kg</div>`);
  }

  const done = day.totals?.doneTotal ?? 0;
  const pct = Math.round((done / BASELINE_100) * 100);
  lines.push(`<div class="cal-line"><strong>合計</strong> ${done}回（${pct}%）</div>`);

  const sessions = day.sessions || [];
  sessions.slice().reverse().forEach(sess => {
    const dt = new Date(sess.at);
    const t = `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
    const sum = (sess.done.coreN + sess.done.coreO + sess.done.extra);
    const p = Math.round((sum / BASELINE_100) * 100);

    const extras = sess.extras || null;
    let extraHtml = '';
    if (Array.isArray(extras) && extras.length) {
      extraHtml = extras.map(ex =>
        `<div>追加部位[${ex.part}] ${ex.done}/${ex.planned}（${ex.diff}${ex.randomCount ? ' random' : ''}）</div>`
      ).join('');
    } else {
      extraHtml = `<div>追加部位[${sess.extraPart}] ${sess.done.extra}/${sess.planned.extra}（${sess.diff}${sess.random ? ' random' : ''}）</div>`;
    }

    lines.push(`
      <div class="cal-line">
        <div><strong>${t}</strong> <span class="badge">${p}%</span></div>
        <div>腹筋 ${sess.done.coreN + sess.done.coreO}/${sess.planned.core}</div>
        ${extraHtml}
        <div><strong>合計</strong> ${sum}</div>
      </div>
    `);
  });

  body.innerHTML = lines.join('');
}

// ============ Graph ============
function ensureWeightGraphCard() {
  const cards = document.querySelector('#screen-graph .graph-cards');
  if (!cards) return;
  if ($('cv-weight')) return;

  const card = document.createElement('div');
  card.className = 'graph-card';
  card.innerHTML = `
    <div class="graph-card__title">体重推移（kg）</div>
    <canvas id="cv-weight" width="900" height="260"></canvas>
  `;
  cards.appendChild(card);
}

function lastNDaysKeys(n) {
  const keys = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    keys.push(ymd(x));
  }
  return keys;
}

function getWeekKeys(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? 6 : day - 1); // 月曜始まり
  d.setDate(d.getDate() - diff);
  const keys = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    keys.push(ymd(x));
  }
  return keys;
}

function drawBars(canvas, labels, values, opt) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0,0,w,h);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0,0,w,h);

  const padX = 34;
  const padY = 26;
  const innerW = w - padX*2;
  const innerH = h - padY*2;
  const n = Math.max(1, values.length);
  const maxV = Math.max(1, ...values);
  const scaleMax = opt.minMax ? Math.max(100, maxV) : maxV;
  const step = innerW / n;
  const barW = step * 0.62;

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padX, padY + innerH);
  ctx.lineTo(padX + innerW, padY + innerH);
  ctx.stroke();

  for (let i = 0; i < n; i++) {
    const v = values[i] ?? 0;
    const barH = (v / scaleMax) * innerH;
    const x = padX + i*step + (step - barW)/2;
    const y = padY + innerH - barH;
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, barW, barH);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px system-ui';
    const txt = `${v}${opt.suffix}`;
    ctx.fillText(txt, x, Math.max(18, y - 6));

    ctx.font = 'bold 12px system-ui';
    const lab = labels[i] ?? '';
    ctx.fillText(lab, x, padY + innerH + 18);
  }
}

function drawLine(canvas, labels, values, opt) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0,0,w,h);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0,0,w,h);

  const padX = 34;
  const padY = 26;
  const innerW = w - padX*2;
  const innerH = h - padY*2;
  const n = Math.max(1, values.length);

  const nums = values.filter(v => typeof v === 'number');
  const minV = nums.length ? Math.min(...nums) : 0;
  const maxV = nums.length ? Math.max(...nums) : 1;
  const span = Math.max(0.1, maxV - minV);

  const step = innerW / Math.max(1, n - 1);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padX, padY + innerH);
  ctx.lineTo(padX + innerW, padY + innerH);
  ctx.stroke();

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();

  let started = false;
  for (let i = 0; i < n; i++) {
    const v = values[i];
    if (typeof v !== 'number') { started = false; continue; }
    const x = padX + i * step;
    const y = padY + innerH - ((v - minV) / span) * innerH;
    if (!started) { ctx.moveTo(x, y); started = true; }
    else { ctx.lineTo(x, y); }
  }
  ctx.stroke();

  ctx.fillStyle = '#000000';
  for (let i = 0; i < n; i++) {
    const v = values[i];
    const x = padX + i * step;

    if (typeof v === 'number') {
      const y = padY + innerH - ((v - minV) / span) * innerH;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 16px system-ui';
      ctx.fillText(`${v}${opt.suffix}`, x + 6, Math.max(18, y - 8));
    }

    ctx.font = 'bold 12px system-ui';
    ctx.fillText(labels[i] ?? '', x, padY + innerH + 18);
  }
}

function renderGraph() {
  ensureWeightGraphCard();

  const today = ymd(new Date());
  const dayDone = state.db.days[today]?.totals?.doneTotal ?? 0;

  let labels = [];
  let doneVals = [];
  let pctVals = [];
  let weightVals = [];

  if (state.graphScope === 'day') {
    labels = ['今日'];
    doneVals = [dayDone];
    pctVals = [Math.round((dayDone / BASELINE_100) * 100)];
    const w = state.db.days[today]?.weightKg;
    weightVals = [typeof w === 'number' ? w : null];

  } else if (state.graphScope === 'week') {
    const weekKeys = getWeekKeys(new Date());
    labels = weekKeys.map(k => {
      const d = new Date(k);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    doneVals = weekKeys.map(k => state.db.days[k]?.totals?.doneTotal ?? 0);
    pctVals = weekKeys.map(k => {
      const done = state.db.days[k]?.totals?.doneTotal ?? 0;
      return Math.round((done / BASELINE_100) * 100);
    });
    weightVals = weekKeys.map(k => {
      const w = state.db.days[k]?.weightKg;
      return typeof w === 'number' ? w : null;
    });

  } else { // 'all'
    const keys = lastNDaysKeys(30);
    labels = keys.map(k => {
      const d = new Date(k);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    doneVals = keys.map(k => state.db.days[k]?.totals?.doneTotal ?? 0);
    pctVals = keys.map(k => {
      const done = state.db.days[k]?.totals?.doneTotal ?? 0;
      return Math.round((done / BASELINE_100) * 100);
    });
    weightVals = keys.map(k => {
      const w = state.db.days[k]?.weightKg;
      return typeof w === 'number' ? w : null;
    });
  }

  const ach = $('cv-ach');
  const tot = $('cv-total');
  const wcv = $('cv-weight');
  if (ach) drawBars(ach, labels, pctVals, { suffix: '%', minMax: true });
  if (tot) drawBars(tot, labels, doneVals, { suffix: '', minMax: false });
  if (wcv) drawLine(wcv, labels, weightVals, { suffix: 'kg' });

  // ===== 下の合計表示（HTMLに存在するIDへ） =====
  const elDay = $('sum-day');
  const elWeek = $('sum-week');
  const elAll = $('sum-all');

  if (elDay) elDay.textContent = String(dayDone);

  const weekKeys2 = getWeekKeys(new Date());
  const weekSum = weekKeys2.reduce((acc, k) => acc + (state.db.days[k]?.totals?.doneTotal ?? 0), 0);
  if (elWeek) elWeek.textContent = String(weekSum);

  const allSum = Object.values(state.db.days).reduce((acc, day) => acc + (day?.totals?.doneTotal ?? 0), 0);
  if (elAll) elAll.textContent = String(allSum);
}
// ============ Event Wiring ============
function init() {
  // HOME
  on('btn-home-start', 'click', (e) => { e.stopPropagation(); startSession(); });
  on('btn-home-soreness', 'click', (e) => { e.stopPropagation(); showScreen('sore'); });
  on('btn-home-graph', 'click', (e) => { e.stopPropagation(); showScreen('graph'); });
  on('btn-home-calendar', 'click', (e) => { e.stopPropagation(); showScreen('calendar'); });
  on('btn-home-option', 'click', (e) => { e.stopPropagation(); showScreen('option'); });

  // 体重計：ページ切替
  on('btn-home-weight', 'click', (e) => { e.stopPropagation(); openWeightScreen(); });

  // Weight page buttons（ensureWeightScreen後に生成されるのでデリゲーション）
  document.addEventListener('click', (e) => {
    const id = e.target?.id;
    if (id === 'btn-weight-back') { e.stopPropagation(); showScreen('home'); }
    if (id === 'btn-weight-save') {
      e.stopPropagation();
      const v = $('weight-input')?.value ?? '';
      setTodayWeightFromInput(v);
    }
    if (id === 'btn-weight-delete') {
      e.stopPropagation();
      setTodayWeightFromInput('');
      const input = $('weight-input');
      if (input) input.value = '';
    }
  }, true);

  // CORE
  on('btn-core-back', 'click', (e) => { e.stopPropagation(); showScreen('home'); });
  on('btn-core-finish', 'click', (e) => { e.stopPropagation(); finishCoreToNext(); });
  on('btn-core-toggle', 'click', (e) => { e.stopPropagation(); toggleCoreSide(); });

  on('tap-left', 'click', (e) => { e.stopPropagation(); coreTap('left'); });
  on('tap-right', 'click', (e) => { e.stopPropagation(); coreTap('right'); });

  // PICK
  on('btn-pick-back', 'click', (e) => {
    e.stopPropagation();
    const ret = state.session?.pickReturn || 'core';
    showScreen(ret);
  });
  on('pick-prev', 'click', (e) => { e.stopPropagation(); movePick(-1); });
  on('pick-next', 'click', (e) => { e.stopPropagation(); movePick(+1); });
  on('pick-decide', 'click', (e) => { e.stopPropagation(); decidePick(); });

  // DIFF
  on('btn-diff-back', 'click', (e) => { e.stopPropagation(); showScreen('pick'); });
  on('diff-prev', 'click', (e) => { e.stopPropagation(); moveDiff(-1); });
  on('diff-next', 'click', (e) => { e.stopPropagation(); moveDiff(+1); });
  on('diff-decide', 'click', (e) => { e.stopPropagation(); decideDiff(); });

  on('num-easy', 'click', (e) => { e.stopPropagation(); state.diffIndex = 0; renderDiff(); });
  on('num-normal', 'click', (e) => { e.stopPropagation(); state.diffIndex = 1; renderDiff(); });
  on('num-hard', 'click', (e) => { e.stopPropagation(); state.diffIndex = 2; renderDiff(); });

  on('diff-random-toggle', 'click', (e) => { e.stopPropagation(); toggleRandom(); });

  // EXTRA
  const extraScreen = $('screen-extra');
  if (extraScreen) {
    extraScreen.addEventListener('click', (e) => {
      if (e.target.closest && e.target.closest('button')) return;
      extraTap(+1);
    });
  }
  on('btn-extra-back', 'click', (e) => { e.stopPropagation(); showScreen('diff'); });
  on('btn-extra-finish', 'click', (e) => { e.stopPropagation(); finishExtraToTotal(); });

  // TOTAL
  on('btn-total-back', 'click', (e) => { e.stopPropagation(); showScreen('home'); });
  const totalScreen = $('screen-total');
  if (totalScreen) totalScreen.addEventListener('click', totalTapToHome);

  // SORENESS
  onAll('.sore__btn', 'click', (e) => { e.stopPropagation(); setSoreness(e.currentTarget.dataset.sore); });
  on('sore-decide', 'click', (e) => { e.stopPropagation(); showScreen('home'); });
  on('btn-sore-back', 'click', (e) => { e.stopPropagation(); showScreen('home'); });

  // OPTION
  on('btn-option-back', 'click', (e) => { e.stopPropagation(); showScreen('home'); });
  on('opt-part-btn', 'click', (e) => { e.stopPropagation(); state.pickIndex = 0; renderPick(); showScreen('pick'); });
  on('opt-diff-btn', 'click', (e) => { e.stopPropagation(); syncDiffFromSettings(); showScreen('diff'); });
  on('opt-random-btn', 'click', (e) => { e.stopPropagation(); toggleRandom(); });
  on('opt-sore-btn', 'click', (e) => { e.stopPropagation(); showScreen('sore'); });

  // CALENDAR
  on('btn-cal-back', 'click', (e) => { e.stopPropagation(); showScreen('home'); });
  on('cal-prev', 'click', (e) => { e.stopPropagation(); state.calCursor.setMonth(state.calCursor.getMonth() - 1); renderCalendar(); });
  on('cal-next', 'click', (e) => { e.stopPropagation(); state.calCursor.setMonth(state.calCursor.getMonth() + 1); renderCalendar(); });

  // GRAPH（タブが後から生成/内側クリックでも確実に拾う）
  on('btn-graph-back', 'click', (e) => { e.stopPropagation(); showScreen('home'); });
  const graphScreen = $('screen-graph');
  if (graphScreen) {
    graphScreen.addEventListener('click', (e) => {
      const tab = e.target.closest?.('.graph-tab');
      if (!tab) return;

      const scope = tab.getAttribute('data-scope'); // 'day' | 'week' | 'all'
      if (!scope) return;

      state.graphScope = scope;

      graphScreen.querySelectorAll('.graph-tab').forEach(x => {
        x.classList.toggle('is-active', x.getAttribute('data-scope') === state.graphScope);
      });

      renderGraph();
    });
  }

  // init defaults
  if (!state.settings.extraPartKey) state.settings.extraPartKey = 'arm';
  syncPickFromSettings();
  syncDiffFromSettings();
  setSoreness(state.settings.sorenessMode);
  renderOption();
  renderCalendar();
  renderGraph();
}

init();