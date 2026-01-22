/* 出勤・退勤ログ（LocalStorage）
   追加したい要件：
   - 提出用（見やすい）TSV / Markdown 生成（合計行つき）
   - 検算：時間計算・金額計算がズレてる行を検出
   - CSV取り込み（貼り付け復元）
   - ワンタップ打刻（出勤→退勤）
*/

const LS_KEY = "timeclock_v2";

const $ = (id) => document.getElementById(id);

const els = {
  companyName: $("companyName"),
  companyWage: $("companyWage"),
  addCompanyBtn: $("addCompanyBtn"),
  resetAllBtn: $("resetAllBtn"),
  companySelect: $("companySelect"),
  selectedWagePill: $("selectedWagePill"),

  toggleClockBtn: $("toggleClockBtn"),
  clockStatusPill: $("clockStatusPill"),

  workDate: $("workDate"),
  startTime: $("startTime"),
  endTime: $("endTime"),
  breakMin: $("breakMin"),
  memo: $("memo"),
  addShiftBtn: $("addShiftBtn"),
  setTodayBtn: $("setTodayBtn"),

  todaySummary: $("todaySummary"),
  monthSummary: $("monthSummary"),
  companyMonthSummary: $("companyMonthSummary"),

  listDate: $("listDate"),
  copyDayBtn: $("copyDayBtn"),
  shiftList: $("shiftList"),
  emptyState: $("emptyState"),

  reportMonth: $("reportMonth"),
  reportCompany: $("reportCompany"),
  makeSubmitTsvBtn: $("makeSubmitTsvBtn"),
  makeSubmitMdBtn: $("makeSubmitMdBtn"),
  makeAuditBtn: $("makeAuditBtn"),
  exportCsvBtn: $("exportCsvBtn"),
  exportJsonBtn: $("exportJsonBtn"),
  copyExportBtn: $("copyExportBtn"),
  exportBox: $("exportBox"),

  importBox: $("importBox"),
  importCsvBtn: $("importCsvBtn"),
  dryRunImportBtn: $("dryRunImportBtn"),
  importResult: $("importResult"),
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function pad2(n) { return String(n).padStart(2, "0"); }

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function nowHHMM() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function monthKey(isoDate) { return isoDate.slice(0, 7); }

function yen(n) { return Math.round(n).toLocaleString("ja-JP") + "円"; }

function minutesToHM(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${pad2(m)}`;
}
function minutesToJapaneseHM(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}時間${m}分`;
}

function parseTimeToMinutes(t) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

function calcShiftMinutes(start, end, breakMin) {
  const s = parseTimeToMinutes(start);
  const e = parseTimeToMinutes(end);
  let total = e - s;
  let isOvernight = false;

  if (total < 0) {
    total += 24 * 60;
    isOvernight = true;
  }

  const b = Math.max(0, Number(breakMin || 0));
  const workMin = Math.max(0, total - b);

  return { workMin, isOvernight };
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { companies: [], shifts: [], activeShiftId: null };
    const parsed = JSON.parse(raw);
    return {
      companies: Array.isArray(parsed.companies) ? parsed.companies : [],
      shifts: Array.isArray(parsed.shifts) ? parsed.shifts : [],
      activeShiftId: parsed.activeShiftId || null,
    };
  } catch {
    return { companies: [], shifts: [], activeShiftId: null };
  }
}

function save(db) { localStorage.setItem(LS_KEY, JSON.stringify(db)); }

function ensureDefaultDates() {
  const t = todayISO();
  if (els.workDate && !els.workDate.value) els.workDate.value = t;
  if (els.listDate && !els.listDate.value) els.listDate.value = t;
}

function getSelectedCompanyId() {
  return els.companySelect?.value || "";
}

function findCompany(db, companyId) {
  return db.companies.find((c) => c.id === companyId) || null;
}

function findCompanyByName(db, name) {
  return db.companies.find((c) => c.name === name) || null;
}

function refreshCompanySelect(db) {
  const sel = els.companySelect;
  if (!sel) return;

  const prev = sel.value;
  sel.innerHTML = "";

  if (db.companies.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "会社が未登録です";
    sel.appendChild(opt);
    if (els.selectedWagePill) els.selectedWagePill.textContent = "時給：-";
    return;
  }

  for (const c of db.companies) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    sel.appendChild(opt);
  }

  if (prev && db.companies.some((c) => c.id === prev)) sel.value = prev;
  else sel.value = db.companies[0].id;

  const company = findCompany(db, sel.value);
  if (els.selectedWagePill) els.selectedWagePill.textContent = company ? `時給：${yen(company.hourlyWage)}` : "時給：-";
}

function upsertCompanyByName(db, name, wageYen) {
  const trimmed = (name || "").trim();
  if (!trimmed) throw new Error("会社名が空です");
  const w = Number(wageYen);
  if (!Number.isFinite(w) || w < 0) throw new Error("時給が不正です");

  const existing = findCompanyByName(db, trimmed);
  if (existing) {
    existing.hourlyWage = w;
    return existing.id;
  }
  const id = uid();
  db.companies.push({ id, name: trimmed, hourlyWage: w });
  return id;
}

function addShift(db, shift) { db.shifts.push(shift); }

function deleteShift(db, shiftId) {
  db.shifts = db.shifts.filter((s) => s.id !== shiftId);
  if (db.activeShiftId === shiftId) db.activeShiftId = null;
}

function computeDerived(db) {
  return db.shifts.map((s) => {
    const comp = findCompany(db, s.companyId);
    const wage = comp ? Number(comp.hourlyWage) : Number(s.wageYen || 0) || 0;

    // 打刻中（退勤未設定）は計算しない
    if (!s.end) {
      return { ...s, wage, workMin: 0, payYen: 0, isOvernight: false, isOpen: true };
    }

    const { workMin, isOvernight } = calcShiftMinutes(s.start, s.end, s.breakMin);
    const payYen = (workMin / 60) * wage;

    return { ...s, wage, workMin, payYen, isOvernight, isOpen: false };
  });
}

function sumMinutes(list) { return list.reduce((a, x) => a + (Number(x.workMin) || 0), 0); }
function sumPay(list) { return list.reduce((a, x) => a + (Number(x.payYen) || 0), 0); }

/* ===== ワンタップ打刻 ===== */

function getActiveShift(db) {
  if (!db.activeShiftId) return null;
  return db.shifts.find((s) => s.id === db.activeShiftId) || null;
}

function renderClockButton(db) {
  const active = getActiveShift(db);
  if (active && active.start && !active.end) {
    els.toggleClockBtn.textContent = "退勤";
    els.clockStatusPill.textContent = `出勤中：${active.start}（${active.date}）`;
  } else {
    els.toggleClockBtn.textContent = "出勤";
    els.clockStatusPill.textContent = "未出勤";
    db.activeShiftId = null;
  }
}

function toggleClock(db) {
  const companyId = getSelectedCompanyId();
  if (!companyId) {
    alert("先に会社を選択してください（会社が無ければ登録してください）");
    return;
  }

  const now = nowHHMM();
  const active = getActiveShift(db);

  // 退勤
  if (active && active.start && !active.end) {
    active.end = now;
    // 保存上の参照値も埋める（表示は再計算するが一応入れる）
    const comp = findCompany(db, active.companyId);
    const wage = comp ? Number(comp.hourlyWage) : 0;
    const { workMin, isOvernight } = calcShiftMinutes(active.start, active.end, active.breakMin);
    active.workMin = workMin;
    active.payYen = (workMin / 60) * wage;
    active.isOvernight = isOvernight;

    db.activeShiftId = null;
    save(db);
    els.listDate.value = active.date;
    rerender(db);
    return;
  }

  // 出勤
  const shiftId = uid();
  const date = todayISO();
  addShift(db, {
    id: shiftId,
    companyId,
    date,
    start: now,
    end: "",
    breakMin: 0,
    memo: "",
    // 参照用
    workMin: 0,
    payYen: 0,
    isOvernight: false,
  });

  db.activeShiftId = shiftId;
  save(db);
  els.listDate.value = date;
  rerender(db);
}

/* ===== 表示：日付一覧 & 集計 ===== */

function renderDayList(db) {
  const dateISO = els.listDate.value;
  const derived = computeDerived(db)
    .filter((s) => s.date === dateISO)
    .sort((a, b) => (a.start > b.start ? 1 : -1));

  els.shiftList.innerHTML = "";

  if (derived.length === 0) {
    els.emptyState.style.display = "block";
    return;
  }
  els.emptyState.style.display = "none";

  for (const s of derived) {
    const comp = findCompany(db, s.companyId);
    const title = comp ? comp.name : "（会社不明）";

    const item = document.createElement("div");
    item.className = "item";

    const left = document.createElement("div");
    left.className = "left";

    const line1 = document.createElement("div");
    line1.style.fontWeight = "800";
    line1.textContent = title;

    const badges = document.createElement("div");
    badges.className = "badges";

    const b1 = document.createElement("span");
    b1.className = "badge good";
    b1.textContent = s.end ? `${s.start} → ${s.end}${s.isOvernight ? "（日またぎ）" : ""}` : `${s.start} → （退勤待ち）`;

    const b2 = document.createElement("span");
    b2.className = "badge";
    b2.textContent = `休憩 ${Number(s.breakMin || 0)}分`;

    badges.append(b1, b2);

    if (s.end) {
      const b3 = document.createElement("span");
      b3.className = "badge";
      b3.textContent = `実働 ${minutesToJapaneseHM(s.workMin)}（${s.workMin}分）`;

      const b4 = document.createElement("span");
      b4.className = "badge warn";
      b4.textContent = `見込み ${yen(s.payYen)}`;

      badges.append(b3, b4);
    } else {
      const bOpen = document.createElement("span");
      bOpen.className = "badge warn";
      bOpen.textContent = "打刻中";
      badges.append(bOpen);
    }

    left.append(line1, badges);

    if (s.memo) {
      const memo = document.createElement("div");
      memo.style.color = "var(--muted)";
      memo.style.fontSize = "12px";
      memo.textContent = `メモ：${s.memo}`;
      left.append(memo);
    }

    const actions = document.createElement("div");
    actions.className = "actions";

    const delBtn = document.createElement("button");
    delBtn.className = "btn danger small";
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", () => {
      const ok = confirm("この勤務を削除しますか？");
      if (!ok) return;
      deleteShift(db, s.id);
      save(db);
      rerender(db);
    });

    actions.append(delBtn);
    item.append(left, actions);
    els.shiftList.appendChild(item);
  }
}

function renderSummary(db) {
  const derived = computeDerived(db);
  const t = todayISO();
  const thisMonth = monthKey(t);
  const companyId = getSelectedCompanyId();

  const today = derived.filter((s) => s.date === t && s.end);
  const month = derived.filter((s) => monthKey(s.date) === thisMonth && s.end);
  const companyMonth = month.filter((s) => s.companyId === companyId);

  els.todaySummary.textContent = `${minutesToJapaneseHM(sumMinutes(today))} / ${yen(sumPay(today))}`;
  els.monthSummary.textContent = `${minutesToJapaneseHM(sumMinutes(month))} / ${yen(sumPay(month))}`;
  els.companyMonthSummary.textContent = `${minutesToJapaneseHM(sumMinutes(companyMonth))} / ${yen(sumPay(companyMonth))}`;
}

/* ===== 提出用生成（TSV / Markdown） ===== */

function filterForReport(db) {
  const month = (els.reportMonth.value || "").trim(); // "YYYY-MM"
  const company = (els.reportCompany.value || "").trim();

  let list = computeDerived(db).filter((s) => s.end); // 確定分だけ

  if (month) list = list.filter((s) => monthKey(s.date) === month);
  if (company) {
    list = list.filter((s) => {
      const c = findCompany(db, s.companyId);
      return (c ? c.name : "") === company;
    });
  }

  // ソート：日付→開始
  list.sort((a, b) => (a.date === b.date ? (a.start > b.start ? 1 : -1) : (a.date > b.date ? 1 : -1)));
  return list;
}

function groupByDate(list) {
  const map = new Map();
  for (const s of list) {
    if (!map.has(s.date)) map.set(s.date, []);
    map.get(s.date).push(s);
  }
  return [...map.entries()].sort((a, b) => (a[0] > b[0] ? 1 : -1));
}

function makeSubmitTSV(db) {
  const list = filterForReport(db);
  const byDate = groupByDate(list);

  const header = ["日付","会社","時給(円)","出勤","退勤","休憩(分)","実働(分)","実働(h:mm)","金額(円)","備考"].join("\t");
  const lines = [header];

  let grandMin = 0;
  let grandPay = 0;

  for (const [date, shifts] of byDate) {
    let dayMin = 0;
    let dayPay = 0;

    for (const s of shifts) {
      const c = findCompany(db, s.companyId);
      const company = c ? c.name : "";
      const memo = s.memo || "";

      lines.push([
        date,
        company,
        String(Math.round(s.wage || 0)),
        s.start,
        s.end,
        String(Number(s.breakMin || 0)),
        String(Math.round(s.workMin || 0)),
        minutesToHM(Math.round(s.workMin || 0)),
        String(Math.round(s.payYen || 0)),
        memo
      ].join("\t"));

      dayMin += Math.round(s.workMin || 0);
      dayPay += Math.round(s.payYen || 0);
    }

    // 日別合計行（コピペ提出向け）
    lines.push([
      date,
      "【日別合計】",
      "",
      "",
      "",
      "",
      String(dayMin),
      minutesToHM(dayMin),
      String(dayPay),
      ""
    ].join("\t"));

    lines.push(""); // 空行
    grandMin += dayMin;
    grandPay += dayPay;
  }

  lines.push([
    "【全体合計】",
    "",
    "",
    "",
    "",
    "",
    String(grandMin),
    minutesToHM(grandMin),
    String(grandPay),
    ""
  ].join("\t"));

  lines.push("");
  lines.push(`（参考）全体合計：${minutesToJapaneseHM(grandMin)} / ${yen(grandPay)}`);

  return lines.join("\n");
}

function makeSubmitMarkdown(db) {
  const list = filterForReport(db);
  const byDate = groupByDate(list);

  const lines = [];
  lines.push("| 日付 | 会社 | 出勤 | 退勤 | 休憩(分) | 実働(分) | 実働 | 金額(円) |");
  lines.push("|---|---|---:|---:|---:|---:|---:|---:|");

  let grandMin = 0;
  let grandPay = 0;

  for (const [date, shifts] of byDate) {
    let dayMin = 0;
    let dayPay = 0;

    for (const s of shifts) {
      const c = findCompany(db, s.companyId);
      const company = c ? c.name : "";
      const wm = Math.round(s.workMin || 0);
      const py = Math.round(s.payYen || 0);

      lines.push(`| ${date} | ${company} | ${s.start} | ${s.end} | ${Number(s.breakMin || 0)} | ${wm} | ${minutesToHM(wm)} | ${py.toLocaleString("ja-JP")} |`);
      dayMin += wm;
      dayPay += py;
    }

    lines.push(`| ${date} | **日別合計** |  |  |  | **${dayMin}** | **${minutesToHM(dayMin)}** | **${dayPay.toLocaleString("ja-JP")}** |`);
    grandMin += dayMin;
    grandPay += dayPay;
  }

  lines.push("");
  lines.push(`**全体合計：${minutesToJapaneseHM(grandMin)} / ${yen(grandPay)}**`);
  return lines.join("\n");
}

/* ===== 検算（ズレ検出） ===== */

function makeAuditReport(db) {
  const derived = computeDerived(db).filter((s) => s.end);
  const lines = [];
  lines.push("検算レポート（確定分のみ）");
  lines.push("");

  let mismatchCount = 0;

  for (const s of derived) {
    const comp = findCompany(db, s.companyId);
    const company = comp ? comp.name : "";
    const wage = Math.round(s.wage || 0);

    const expected = calcShiftMinutes(s.start, s.end, s.breakMin);
    const expectedMin = Math.round(expected.workMin);
    const expectedPay = Math.round((expectedMin / 60) * wage);

    // 元データに保存されてる値（あれば）
    const storedMin = Number(s.workMinStored ?? s.workMin ?? 0); // 今はworkMinがderivedなので、DB側はs.workMin ではない
    const storedPay = Number(s.payYenStored ?? s.payYen ?? 0);

    // DB側は shift に workMin/payYen を持ってる場合があるのでそっちも参照したい
    const raw = db.shifts.find(x => x.id === s.id);
    const rawMin = raw ? Number(raw.workMin || 0) : null;
    const rawPay = raw ? Number(raw.payYen || 0) : null;

    const minMismatch = rawMin !== null && rawMin !== 0 ? (Math.round(rawMin) !== expectedMin) : false;
    const payMismatch = rawPay !== null && rawPay !== 0 ? (Math.round(rawPay) !== expectedPay) : false;

    // 「保存値がない/0」なら mismatch扱いしない（古いデータ/取り込み直後など）
    if (minMismatch || payMismatch) {
      mismatchCount++;
      lines.push(`- [ズレ] ${s.date} ${company} ${s.start}-${s.end} 休憩${Number(s.breakMin||0)}分`);
      if (minMismatch) lines.push(`   - 実働：保存=${Math.round(rawMin)}分 / 計算=${expectedMin}分`);
      if (payMismatch) lines.push(`   - 金額：保存=${Math.round(rawPay)}円 / 計算=${expectedPay}円`);
      lines.push("");
    }
  }

  // 合計（計算値）
  const totalMin = sumMinutes(derived);
  const totalPay = sumPay(derived);

  lines.push(`合計（計算値）：${minutesToJapaneseHM(Math.round(totalMin))} / ${yen(Math.round(totalPay))}`);
  lines.push(`ズレ検出：${mismatchCount}件`);
  lines.push("");
  lines.push("※ ズレが出てる場合：CSVに手修正が入った/時給変更の反映ルール/休憩の入力などが原因になりやすい。");

  return lines.join("\n");
}

/* ===== CSV出力（アプリ用） ===== */

function exportCSV(db) {
  const derived = computeDerived(db);
  const rows = [
    ["id","date","company","wage_yen","start","end","break_min","work_min","pay_yen","overnight","memo"].join(",")
  ];

  for (const s of derived) {
    const comp = findCompany(db, s.companyId);
    const company = comp ? comp.name : "";
    const memo = (s.memo || "").replaceAll('"', '""');

    rows.push([
      s.id,
      s.date,
      `"${company.replaceAll('"','""')}"`,
      String(Math.round(s.wage || 0)),
      s.start || "",
      s.end || "",
      String(Number(s.breakMin || 0)),
      String(Math.round(s.workMin || 0)),
      String(Math.round(s.payYen || 0)),
      s.isOvernight ? "1" : "0",
      `"${memo}"`
    ].join(","));
  }
  return rows.join("\n");
}

/* ===== CSV取り込み（貼り付け） ===== */

// 簡易CSV 1行パーサ（ダブルクォート対応）
function parseCSVLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQ) {
      if (ch === '"') {
        // "" -> "
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === ",") {
        out.push(cur);
        cur = "";
      } else if (ch === '"') {
        inQ = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

function parseCSV(text) {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) throw new Error("CSVが空です");

  const header = parseCSVLine(lines[0]).map(s => s.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length === 1 && cols[0] === "") continue;

    const obj = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = (cols[j] ?? "").trim();
    }
    rows.push(obj);
  }

  return { header, rows };
}

function importCsvTextIntoDb(db, csvText, apply) {
  const { header, rows } = parseCSV(csvText);

  const required = ["id","date","company","wage_yen","start","end","break_min","work_min","pay_yen","overnight","memo"];
  const ok = required.every(k => header.includes(k));
  if (!ok) throw new Error("ヘッダーが想定と違います（必要列: " + required.join(",") + "）");

  // 作業用コピー
  const next = apply ? db : JSON.parse(JSON.stringify(db));

  // 取り込み：会社を作る（同名は時給更新）
  for (const r of rows) {
    const company = (r.company || "").replace(/^"|"$/g, "").trim();
    const wage = Number(r.wage_yen || 0);
    if (company) upsertCompanyByName(next, company, wage);
  }

  // 取り込み：勤務を作る（idが同じなら上書き、なければ追加）
  const index = new Map(next.shifts.map(s => [s.id, s]));
  let added = 0;
  let updated = 0;

  for (const r of rows) {
    const id = (r.id || "").trim();
    const date = (r.date || "").trim();
    const companyName = (r.company || "").replace(/^"|"$/g, "").trim();
    const wageYen = Number(r.wage_yen || 0);
    const start = (r.start || "").trim();
    const end = (r.end || "").trim();
    const breakMin = Number(r.break_min || 0);
    const memo = (r.memo || "").replace(/^"|"$/g, "").trim();

    if (!id || !date || !companyName || !start) continue;

    const companyId = upsertCompanyByName(next, companyName, wageYen);

    const base = {
      id,
      companyId,
      date,
      start,
      end, // 空なら打刻中扱い（ただし取り込みで activeShiftId は立てない）
      breakMin: Number.isFinite(breakMin) ? breakMin : 0,
      memo: memo || "",
      // 参考値（取り込み元が持っていても、表示・提出・検算は再計算優先）
      workMin: Number(r.work_min || 0),
      payYen: Number(r.pay_yen || 0),
      isOvernight: String(r.overnight || "0") === "1",
    };

    if (index.has(id)) {
      Object.assign(index.get(id), base);
      updated++;
    } else {
      next.shifts.push(base);
      index.set(id, base);
      added++;
    }
  }

  // activeShiftIdは取り込み時はリセット
  next.activeShiftId = null;

  // 検算（取り込みデータの内部ズレ確認）
  const derived = computeDerived(next).filter(s => s.end);
  let badTime = 0;
  let badPay = 0;

  for (const s of derived) {
    const comp = findCompany(next, s.companyId);
    const wage = comp ? Number(comp.hourlyWage) : 0;
    const { workMin } = calcShiftMinutes(s.start, s.end, s.breakMin);
    const expectedMin = Math.round(workMin);
    const expectedPay = Math.round((expectedMin / 60) * wage);

    // 取り込み元の値（rawにある）
    const raw = next.shifts.find(x => x.id === s.id);
    if (!raw) continue;

    if (raw.workMin && Math.round(Number(raw.workMin)) !== expectedMin) badTime++;
    if (raw.payYen && Math.round(Number(raw.payYen)) !== expectedPay) badPay++;
  }

  return { next, added, updated, badTime, badPay, totalRows: rows.length };
}

/* ===== 手入力追加 ===== */

function validateShiftInput(db) {
  const companyId = getSelectedCompanyId();
  if (!companyId) throw new Error("会社を選択してください");

  const date = els.workDate.value;
  const start = els.startTime.value;
  const end = els.endTime.value;

  if (!date) throw new Error("日付を選択してください");
  if (!start) throw new Error("出勤時刻を入れてください");
  if (!end) throw new Error("退勤時刻を入れてください");

  const breakMin = Number(els.breakMin.value || 0);
  if (!Number.isFinite(breakMin) || breakMin < 0) throw new Error("休憩(分)が不正です");

  const memo = (els.memo.value || "").trim();
  const { workMin } = calcShiftMinutes(start, end, breakMin);
  if (workMin === 0) throw new Error("実働が0分です（時刻 or 休憩を確認）");

  return { companyId, date, start, end, breakMin, memo };
}

/* ===== その他 ===== */

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert("コピーしました。");
  } catch {
    alert("コピーできない環境です。手動で選択してコピーしてください。");
  }
}

function rerender(db) {
  refreshCompanySelect(db);
  renderClockButton(db);
  renderSummary(db);
  renderDayList(db);
}

/* ===== init ===== */

(function init() {
  let db = load();

  ensureDefaultDates();
  refreshCompanySelect(db);

  els.companySelect.addEventListener("change", () => {
    const c = findCompany(db, getSelectedCompanyId());
    els.selectedWagePill.textContent = c ? `時給：${yen(c.hourlyWage)}` : "時給：-";
    save(db);
    rerender(db);
  });

  els.setTodayBtn.addEventListener("click", () => {
    const t = todayISO();
    els.workDate.value = t;
    els.listDate.value = t;
    rerender(db);
  });

  els.listDate.addEventListener("change", () => renderDayList(db));

  els.toggleClockBtn.addEventListener("click", () => toggleClock(db));

  els.addCompanyBtn.addEventListener("click", () => {
    try {
      const id = upsertCompanyByName(db, els.companyName.value, els.companyWage.value);
      save(db);
      refreshCompanySelect(db);
      els.companySelect.value = id;

      const c = findCompany(db, id);
      els.selectedWagePill.textContent = c ? `時給：${yen(c.hourlyWage)}` : "時給：-";

      els.companyName.value = "";
      els.companyWage.value = "";

      rerender(db);
    } catch (e) {
      alert(e.message || String(e));
    }
  });

  els.addShiftBtn.addEventListener("click", () => {
    try {
      const input = validateShiftInput(db);
      const comp = findCompany(db, input.companyId);
      const wage = comp ? Number(comp.hourlyWage) : 0;

      const { workMin, isOvernight } = calcShiftMinutes(input.start, input.end, input.breakMin);
      const payYen = (workMin / 60) * wage;

      addShift(db, {
        id: uid(),
        companyId: input.companyId,
        date: input.date,
        start: input.start,
        end: input.end,
        breakMin: input.breakMin,
        memo: input.memo,
        workMin: Math.round(workMin),
        payYen: Math.round(payYen),
        isOvernight
      });

      save(db);
      els.listDate.value = input.date;
      els.memo.value = "";
      els.breakMin.value = "0";
      rerender(db);
    } catch (e) {
      alert(e.message || String(e));
    }
  });

  els.copyDayBtn.addEventListener("click", async () => {
    const dateISO = els.listDate.value;
    const derived = computeDerived(db).filter((s) => s.date === dateISO && s.end);
    const totalMin = Math.round(sumMinutes(derived));
    const totalPay = Math.round(sumPay(derived));
    const text = `${dateISO} 合計：${minutesToJapaneseHM(totalMin)} / ${yen(totalPay)}`;
    await copyText(text);
  });

  // 提出TSV / MD / 検算
  els.makeSubmitTsvBtn.addEventListener("click", () => {
    els.exportBox.value = makeSubmitTSV(db);
  });
  els.makeSubmitMdBtn.addEventListener("click", () => {
    els.exportBox.value = makeSubmitMarkdown(db);
  });
  els.makeAuditBtn.addEventListener("click", () => {
    els.exportBox.value = makeAuditReport(db);
  });

  // 出力
  els.exportCsvBtn.addEventListener("click", () => {
    els.exportBox.value = exportCSV(db);
  });
  els.exportJsonBtn.addEventListener("click", () => {
    els.exportBox.value = JSON.stringify(db, null, 2);
  });
  els.copyExportBtn.addEventListener("click", async () => {
    const text = els.exportBox.value || "";
    if (!text.trim()) return alert("出力欄が空です。先に生成してください。");
    await copyText(text);
  });

  // CSV取り込み（反映あり/なし）
  els.importCsvBtn.addEventListener("click", () => {
    try {
      const txt = els.importBox.value || "";
      const res = importCsvTextIntoDb(db, txt, true);
      db = res.next;
      save(db);
      rerender(db);
      els.importResult.textContent = `取り込み完了：${res.totalRows}行 / 追加${res.added}件 / 更新${res.updated}件 / （参考）取り込み元のズレ検出：時間${res.badTime}件・金額${res.badPay}件`;
    } catch (e) {
      els.importResult.textContent = "";
      alert(e.message || String(e));
    }
  });

  els.dryRunImportBtn.addEventListener("click", () => {
    try {
      const txt = els.importBox.value || "";
      const res = importCsvTextIntoDb(db, txt, false);
      els.importResult.textContent = `取り込みテストOK：${res.totalRows}行 / 追加${res.added}件 / 更新${res.updated}件 / （参考）取り込み元のズレ検出：時間${res.badTime}件・金額${res.badPay}件（反映はしてません）`;
    } catch (e) {
      els.importResult.textContent = "";
      alert(e.message || String(e));
    }
  });

  els.resetAllBtn.addEventListener("click", () => {
    const ok = confirm("全データを削除します。元に戻せません。");
    if (!ok) return;
    db = { companies: [], shifts: [], activeShiftId: null };
    save(db);
    els.exportBox.value = "";
    els.importBox.value = "";
    els.importResult.textContent = "";
    rerender(db);
  });

  // 初回描画
  rerender(db);
})();
