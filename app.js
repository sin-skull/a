/*
  れんの腹筋筋トレメニュー
  - HTML/CSS/JS 分離版
  - 6ヶ月保存（localStorage）
  - デイリー: 腹筋+腹斜筋=100（筋肉痛で減算）
  - 追加部位: 1部位必須（難易度20/35/50 + random）
  - 達成度: (デイリー+追加部位) を 100% 基準にして超過も表示
  - カレンダー: 一般的な月カレンダー + 日付詳細
  - グラフ: 1日/1週/全体 を「臨機応変」に棒グラフ
*/

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

/**
 * db schema
 * {
 *   days: {
 *     'YYYY-MM-DD': {
 *        sessions:[{ at, plannedTotal, planned:{core,extra}, done:{coreN, coreO, extra}, soreness:{mode,subtract}, extraPart, diff, random }],
 *        totals:{ doneTotal, plannedTotal },
 *        bestDoneTotal:number
 *     }
 *   }
 * }
 */
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
  pickIndex: 4, // default: 腕
  diffIndex: 0,
  graphScope: 'day',
  calCursor: new Date(),
  calSelected: ymd(new Date()),
};

// ============ Screen Router ============
const screens = [
  'home','core','pick','diff','extra','total','sore','option','calendar','graph'
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
  const extraPart = PARTS.find(p => p.key === state.settings.extraPartKey);

  state.session = {
    at: nowTs(),
    planned: { coreTotal, coreN, coreO, extra: extraTarget },
    done: { coreN: 0, coreO: 0, extra: 0 },
    activeCore: 'coreN',
    firstTapDone: false,
    extraPart: extraPart ? extraPart.name : '追加部位',
    diff: state.settings.diffKey,
    random: state.settings.random,
    soreness: { mode: state.settings.sorenessMode, subtract: state.settings.sorenessSubtract },
    plannedTotal,
  };

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
  // Finish押下後 → 追加部位選択へ（要件）
  syncPickFromSettings();
  showScreen('pick');
}

function finishExtraToTotal() {
  saveSession();
  renderTotal();
  showScreen('total');
}

function saveSession() {
  if (!state.session) return;
  const key = ymd(new Date());
  if (!state.db.days[key]) {
    state.db.days[key] = { sessions: [], totals: { doneTotal: 0, plannedTotal: 0 }, bestDoneTotal: 0 };
  }
  const s = state.session;

  state.db.days[key].sessions.push({
    at: s.at,
    plannedTotal: s.plannedTotal,
    planned: { core: s.planned.coreTotal, extra: s.planned.extra },
    done: { coreN: s.done.coreN, coreO: s.done.coreO, extra: s.done.extra },
    soreness: s.soreness,
    extraPart: s.extraPart,
    diff: s.diff,
    random: s.random,
  });

  // recompute day totals
  let dayDone = 0;
  let dayPlanned = 0;
  for (const sess of state.db.days[key].sessions) {
    dayDone += (sess.done.coreN + sess.done.coreO + sess.done.extra);
    dayPlanned += sess.plannedTotal;
  }
  state.db.days[key].totals.doneTotal = dayDone;
  state.db.days[key].totals.plannedTotal = dayPlanned;
  state.db.days[key].bestDoneTotal = Math.max(state.db.days[key].bestDoneTotal || 0, dayDone);

  saveDB();
}

// ============ Core UI ============
function updateCoreUI() {
  const s = state.session;
  if (!s) return;

  // PDF仕様：左右どっちを叩いても「100から減る」総残り
  const done = s.done.coreN + s.done.coreO;

  // 0で止めない（マイナス表示も出す）
  const remaining = s.planned.coreTotal - done;

  const remainEl = $('core-remaining');
  if (remainEl) remainEl.textContent = String(remaining);

  // Finishは残り<=0で表示
  const finishBtn = $('btn-core-finish');
  if (finishBtn) finishBtn.style.display = (remaining <= 0) ? 'block' : 'none';
}

function coreTap(side) {
  const s = state.session;
  if (!s) return;

  // first tap: hide instruction + lines
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
  // 濃さ蓄積（CSSでopacityを殺してない前提）
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
  state.pickIndex = idx >= 0 ? idx : 4;
  renderPick();
}

function renderPick() {
  const value = PARTS[state.pickIndex]?.name || '腕';
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
  if (state.session) state.session.extraPart = part.name;
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
    state.session.plannedTotal = state.session.planned.coreTotal + extraT;
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
  if (r) r.textContent = String(Math.max(0, s.planned.extra - s.done.extra));

  showScreen('extra');
}

function extraTap(delta) {
  const s = state.session;
  if (!s) return;
  s.done.extra = Math.max(0, s.done.extra + delta);
  const r = $('extra-remaining');
  if (r) r.textContent = String(Math.max(0, s.planned.extra - s.done.extra));
}

// ============ Total UI ============
function renderTotal() {
  const key = ymd(new Date());
  const day = state.db.days[key];
  const s = state.session;
  if (!day || !day.sessions.length || !s) return;

  $('total-core-normal') && ($('total-core-normal').textContent = String(s.done.coreN));
  $('total-core-oblique') && ($('total-core-oblique').textContent = String(s.done.coreO));
  $('total-extra-name') && ($('total-extra-name').textContent = `追加部位[${s.extraPart}]`);
  $('total-extra') && ($('total-extra').textContent = String(s.done.extra));

  const sum = s.done.coreN + s.done.coreO + s.done.extra;
  $('total-sum') && ($('total-sum').textContent = String(sum));

  const pct = Math.round((sum / Math.max(1, s.plannedTotal)) * 100);
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
    const planned = state.db.days[k]?.totals?.plannedTotal ?? 0;
    const pct = planned > 0 ? Math.round((done / planned) * 100) : 0;

    cell.innerHTML = `
      <div class="cal-cell__d">${d.getDate()}</div>
      <div class="cal-cell__dot"></div>
      <div class="cal-cell__p">${hasData ? pct+'%' : ''}</div>
    `;
    cell.addEventListener('click', () => {
      state.calSelected = k;
      renderCalendar();
      renderCalendarDetail(k);
    });
    grid.appendChild(cell);
  }

  renderCalendarDetail(state.calSelected);
}

function renderCalendarDetail(k) {
  const d = new Date(k);
  const ttl = $('cal-detail-title');
  if (ttl) ttl.textContent = `${d.getMonth()+1}/${d.getDate()} の記録`;

  const body = $('cal-detail-body');
  if (!body) return;

  const day = state.db.days[k];
  if (!day) {
    body.innerHTML = '記録がありません。';
    return;
  }

  const lines = [];
  const doneTotal = day.totals.doneTotal;
  const plannedTotal = day.totals.plannedTotal;
  const pct = plannedTotal > 0 ? Math.round((doneTotal / plannedTotal) * 100) : 0;
  lines.push(`<div class="cal-line"><strong>達成度</strong> ${pct}%（合計 ${doneTotal}回 / 基準 ${plannedTotal}回）</div>`);

  for (const sess of day.sessions.slice().reverse()) {
    const dt = new Date(sess.at);
    const t = `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
    const sore = sess.soreness?.mode && sess.soreness.mode !== 'none'
      ? `筋肉痛（-${sess.soreness.subtract}）`
      : '筋肉痛（無）';

    const sum = sess.done.coreN + sess.done.coreO + sess.done.extra;
    const p = Math.round((sum / Math.max(1, sess.plannedTotal)) * 100);

    lines.push(`
      <div class="cal-line">
        <div><strong>${t}</strong> <span class="badge">${p}%</span></div>
        <div>デイリー ${sore}：${sess.done.coreN + sess.done.coreO}回（基準 ${sess.planned.core}回）</div>
        <div>追加部位 [${sess.extraPart}]：${sess.done.extra}回（基準 ${sess.planned.extra}回 / ${sess.diff}${sess.random ? ' random' : ''}）</div>
        <div><strong>合計</strong> ${sum}回</div>
      </div>
    `);
  }
  body.innerHTML = lines.join('');
}

// ============ Graph ============
function renderGraph() {
  const allDays = Object.keys(state.db.days).sort();
  let sumAll = 0;
  for (const k of allDays) sumAll += state.db.days[k].totals.doneTotal;

  $('sum-all') && ($('sum-all').textContent = String(sumAll));

  const today = ymd(new Date());
  const dayDone = state.db.days[today]?.totals?.doneTotal ?? 0;
  $('sum-day') && ($('sum-day').textContent = String(dayDone));

  const weekKeys = getWeekKeys(new Date());
  let sumWeek = 0;
  for (const k of weekKeys) sumWeek += state.db.days[k]?.totals?.doneTotal ?? 0;
  $('sum-week') && ($('sum-week').textContent = String(sumWeek));

  let labels = [];
  let doneVals = [];
  let pctVals = [];

  if (state.graphScope === 'day') {
    labels = ['今日'];
    doneVals = [dayDone];
    const planned = state.db.days[today]?.totals?.plannedTotal ?? 120;
    pctVals = [Math.round((dayDone / Math.max(1, planned)) * 100)];
  } else if (state.graphScope === 'week') {
    labels = weekKeys.map(k => {
      const d = new Date(k);
      return `${d.getMonth()+1}/${d.getDate()}`;
    });
    doneVals = weekKeys.map(k => state.db.days[k]?.totals?.doneTotal ?? 0);
    pctVals = weekKeys.map(k => {
      const done = state.db.days[k]?.totals?.doneTotal ?? 0;
      const planned = state.db.days[k]?.totals?.plannedTotal ?? 120;
      return planned > 0 ? Math.round((done / planned) * 100) : 0;
    });
  } else {
    const keys = lastNDaysKeys(30);
    labels = keys.map(k => {
      const d = new Date(k);
      return `${d.getMonth()+1}/${d.getDate()}`;
    });
    doneVals = keys.map(k => state.db.days[k]?.totals?.doneTotal ?? 0);
    pctVals = keys.map(k => {
      const done = state.db.days[k]?.totals?.doneTotal ?? 0;
      const planned = state.db.days[k]?.totals?.plannedTotal ?? 120;
      return planned > 0 ? Math.round((done / planned) * 100) : 0;
    });
  }

  const ach = $('cv-ach');
  const tot = $('cv-total');
  if (ach) drawBars(ach, labels, pctVals, { suffix: '%', minMax: true });
  if (tot) drawBars(tot, labels, doneVals, { suffix: '', minMax: false });
}

function getWeekKeys(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? 6 : day - 1);
  d.setDate(d.getDate() - diff);
  const keys = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    keys.push(ymd(x));
  }
  return keys;
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

// ============ Swipe Helper ============
function bindSwipe(el, onLeft, onRight) {
  if (!el) return;
  let sx = 0, sy = 0, active = false;
  el.addEventListener('pointerdown', (e) => {
    active = true;
    sx = e.clientX;
    sy = e.clientY;
  });
  el.addEventListener('pointerup', (e) => {
    if (!active) return;
    active = false;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) onLeft(); else onRight();
  });
}

// ============ Event Wiring ============
function init() {
  // グラフ画面だけスクロール許可（CSS: .screen--scroll）
  $('screen-graph')?.classList.add('screen--scroll');

  // HOME
  on('btn-home-start', 'click', (e) => { e.stopPropagation(); startSession(); });
  on('btn-home-soreness', 'click', (e) => { e.stopPropagation(); showScreen('sore'); });
  on('btn-home-graph', 'click', (e) => { e.stopPropagation(); showScreen('graph'); });
  on('btn-home-calendar', 'click', (e) => { e.stopPropagation(); showScreen('calendar'); });
  on('btn-home-option', 'click', (e) => { e.stopPropagation(); showScreen('option'); });

  // CORE
  on('btn-core-back', 'click', (e) => { e.stopPropagation(); showScreen('home'); });

  // Finish → 追加部位選択へ
  on('btn-core-finish', 'click', (e) => { e.stopPropagation(); finishCoreToNext(); });

  // もし残ってるなら（消してても落ちない）
  on('btn-core-toggle', 'click', (e) => { e.stopPropagation(); toggleCoreSide(); });
  on('btn-core-add', 'click', (e) => { e.stopPropagation(); finishCoreToNext(); });

  on('tap-left', 'click', (e) => { e.stopPropagation(); coreTap('left'); });
  on('tap-right', 'click', (e) => { e.stopPropagation(); coreTap('right'); });

  // PICK
  on('btn-pick-back', 'click', (e) => { e.stopPropagation(); showScreen('core'); });
  on('pick-prev', 'click', (e) => { e.stopPropagation(); movePick(-1); });
  on('pick-next', 'click', (e) => { e.stopPropagation(); movePick(+1); });
  on('pick-decide', 'click', (e) => { e.stopPropagation(); decidePick(); });
  bindSwipe($('screen-pick'), () => movePick(+1), () => movePick(-1));

  // DIFF
  on('btn-diff-back', 'click', (e) => { e.stopPropagation(); showScreen('pick'); });
  on('diff-prev', 'click', (e) => { e.stopPropagation(); moveDiff(-1); });
  on('diff-next', 'click', (e) => { e.stopPropagation(); moveDiff(+1); });
  on('diff-decide', 'click', (e) => { e.stopPropagation(); decideDiff(); });

  on('num-easy', 'click', (e) => { e.stopPropagation(); state.diffIndex = 0; toggleRandom(); renderDiff(); });
  on('num-normal', 'click', (e) => { e.stopPropagation(); state.diffIndex = 1; toggleRandom(); renderDiff(); });
  on('num-hard', 'click', (e) => { e.stopPropagation(); state.diffIndex = 2; toggleRandom(); renderDiff(); });

  bindSwipe($('diff-swipe'), () => moveDiff(+1), () => moveDiff(-1));

  // EXTRA
  on('btn-extra-back', 'click', (e) => { e.stopPropagation(); showScreen('diff'); });
  on('btn-extra-minus', 'click', (e) => { e.stopPropagation(); extraTap(-1); });
  on('btn-extra-plus', 'click', (e) => { e.stopPropagation(); extraTap(+1); });
  on('btn-extra-finish', 'click', (e) => { e.stopPropagation(); finishExtraToTotal(); });

  const extraScreen = $('screen-extra');
  if (extraScreen) {
    extraScreen.addEventListener('click', (e) => {
      if (e.target.closest && e.target.closest('button')) return;
      extraTap(+1);
    });
  }

  // TOTAL
  on('btn-total-back', 'click', (e) => { e.stopPropagation(); showScreen('home'); });
  const totalScreen = $('screen-total');
  if (totalScreen) totalScreen.addEventListener('click', totalTapToHome);

  // SORENESS
  on('btn-sore-back', 'click', (e) => { e.stopPropagation(); showScreen('home'); });
  on('sore-decide', 'click', (e) => { e.stopPropagation(); showScreen('home'); });
  onAll('.sore__btn', 'click', (e) => {
    e.stopPropagation();
    const mode = e.currentTarget?.dataset?.sore;
    if (mode) setSoreness(mode);
  });

  // OPTION
  on('btn-option-back', 'click', (e) => { e.stopPropagation(); showScreen('home'); });
  on('opt-part-btn', 'click', (e) => { e.stopPropagation(); syncPickFromSettings(); showScreen('pick'); });
  on('opt-diff-btn', 'click', (e) => { e.stopPropagation(); syncDiffFromSettings(); showScreen('diff'); });
  on('opt-random-btn', 'click', (e) => { e.stopPropagation(); toggleRandom(); renderOption(); });
  on('opt-sore-btn', 'click', (e) => { e.stopPropagation(); showScreen('sore'); });

  // CAL
  on('btn-cal-back', 'click', (e) => { e.stopPropagation(); showScreen('home'); });
  on('cal-prev', 'click', (e) => {
    e.stopPropagation();
    state.calCursor = new Date(state.calCursor.getFullYear(), state.calCursor.getMonth()-1, 1);
    renderCalendar();
  });
  on('cal-next', 'click', (e) => {
    e.stopPropagation();
    state.calCursor = new Date(state.calCursor.getFullYear(), state.calCursor.getMonth()+1, 1);
    renderCalendar();
  });

  // GRAPH
  on('btn-graph-back', 'click', (e) => { e.stopPropagation(); showScreen('home'); });
  onAll('.graph-tab', 'click', (e) => {
    e.stopPropagation();
    const scope = e.currentTarget?.dataset?.scope;
    if (!scope) return;
    state.graphScope = scope;
    document.querySelectorAll('.graph-tab').forEach(x => x.classList.toggle('is-active', x.dataset.scope === state.graphScope));
    renderGraph();
  });

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
