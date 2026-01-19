/* 出勤・退勤ログ（LocalStorage）
   - 会社登録：会社名 + 時給
   - 勤務追加：日付 + 出勤 + 退勤 + 休憩(分) + メモ
   - 同日複数OK
   - 日またぎ対応（退勤 < 出勤 → 翌日退勤扱い）
   - 今日/今月/会社別(今月)集計
   - CSV / JSON 出力
*/

const LS_KEY = "timeclock_v1";

const $ = (id) => document.getElementById(id);

const els = {
  companyName: $("companyName"),
  companyWage: $("companyWage"),
  addCompanyBtn: $("addCompanyBtn"),
  resetAllBtn: $("resetAllBtn"),
  companySelect: $("companySelect"),
  selectedWagePill: $("selectedWagePill"),

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

  exportCsvBtn: $("exportCsvBtn"),
  exportJsonBtn: $("exportJsonBtn"),
  exportBox: $("exportBox"),
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { companies: [], shifts: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("bad data");
    return {
      companies: Array.isArray(parsed.companies) ? parsed.companies : [],
      shifts: Array.isArray(parsed.shifts) ? parsed.shifts : [],
    };
  } catch {
    return { companies: [], shifts: [] };
  }
}

function save(db) {
  localStorage.setItem(LS_KEY, JSON.stringify(db));
}

function yen(n) {
  const x = Math.round(n);
  return x.toLocaleString("ja-JP") + "円";
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function minutesToHM(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}時間${m}分`;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function monthKey(isoDate) {
  // "YYYY-MM"
  return isoDate.slice(0, 7);
}

function parseTimeToMinutes(t) {
  // "HH:MM" -> minutes from 0
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

function calcShiftMinutes(dateISO, start, end, breakMin) {
  // returns { workMin, isOvernight }
  const s = parseTimeToMinutes(start);
  const e = parseTimeToMinutes(end);
  let total = e - s;
  let isOvernight = false;

  if (total < 0) {
    // overnight: add 24h
    total += 24 * 60;
    isOvernight = true;
  }

  const b = Math.max(0, Number(breakMin || 0));
  const workMin = Math.max(0, total - b);

  return { workMin, isOvernight };
}

function getSelectedCompanyId() {
  return els.companySelect.value || "";
}

function findCompany(db, companyId) {
  return db.companies.find((c) => c.id === companyId) || null;
}

function ensureDefaultDates() {
  const t = todayISO();
  if (!els.workDate.value) els.workDate.value = t;
  if (!els.listDate.value) els.listDate.value = t;
}

function refreshCompanySelect(db) {
  const sel = els.companySelect;
  const prev = sel.value;

  sel.innerHTML = "";

  if (db.companies.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "会社が未登録です";
    sel.appendChild(opt);
    els.selectedWagePill.textContent = "時給：-";
    return;
  }

  for (const c of db.companies) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.name}`;
    sel.appendChild(opt);
  }

  // restore selection if possible
  if (prev && db.companies.some((c) => c.id === prev)) {
    sel.value = prev;
  } else {
    sel.value = db.companies[0].id;
  }

  const company = findCompany(db, sel.value);
  els.selectedWagePill.textContent = company ? `時給：${yen(company.hourlyWage)}` : "時給：-";
}

function upsertCompany(db, name, wage) {
  const trimmed = (name || "").trim();
  if (!trimmed) throw new Error("会社名が空です");
  const w = Number(wage);
  if (!Number.isFinite(w) || w < 0) throw new Error("時給が不正です");

  // 同名があれば更新、なければ追加（簡易仕様）
  const existing = db.companies.find((c) => c.name === trimmed);
  if (existing) {
    existing.hourlyWage = w;
    return existing.id;
  }

  const id = uid();
  db.companies.push({ id, name: trimmed, hourlyWage: w });
  return id;
}

function addShift(db, shift) {
  db.shifts.push(shift);
}

function deleteShift(db, shiftId) {
  db.shifts = db.shifts.filter((s) => s.id !== shiftId);
}

function shiftsForDate(db, dateISO) {
  return db.shifts
    .filter((s) => s.date === dateISO)
    .sort((a, b) => (a.start > b.start ? 1 : -1));
}

function shiftsForMonth(db, yyyyMm) {
  return db.shifts.filter((s) => monthKey(s.date) === yyyyMm);
}

function sumMinutes(shifts) {
  return shifts.reduce((acc, s) => acc + Number(s.workMin || 0), 0);
}

function sumPay(shifts) {
  return shifts.reduce((acc, s) => acc + Number(s.payYen || 0), 0);
}

function computeDerived(db) {
  // 各shiftに workMin / payYen / overnight を付与（保存はせず、表示用）
  return db.shifts.map((s) => {
    const comp = findCompany(db, s.companyId);
    const wage = comp ? Number(comp.hourlyWage) : 0;
    const { workMin, isOvernight } = calcShiftMinutes(s.date, s.start, s.end, s.breakMin);
    const payYen = (workMin / 60) * wage;
    return { ...s, workMin, payYen, isOvernight, wage };
  });
}

function renderDayList(db) {
  const dateISO = els.listDate.value;
  const derived = computeDerived(db);

  const list = derived
    .filter((s) => s.date === dateISO)
    .sort((a, b) => (a.start > b.start ? 1 : -1));

  els.shiftList.innerHTML = "";

  if (list.length === 0) {
    els.emptyState.style.display = "block";
    return;
  }
  els.emptyState.style.display = "none";

  for (const s of list) {
    const comp = findCompany(db, s.companyId);
    const title = comp ? comp.name : "（会社不明）";

    const item = document.createElement("div");
    item.className = "item";

    const left = document.createElement("div");
    left.className = "left";

    const line1 = document.createElement("div");
    line1.style.fontWeight = "800";
    line1.textContent = `${title}`;

    const badges = document.createElement("div");
    badges.className = "badges";

    const b1 = document.createElement("span");
    b1.className = "badge good";
    b1.textContent = `${s.start} → ${s.end}${s.isOvernight ? "（日またぎ）" : ""}`;

    const b2 = document.createElement("span");
    b2.className = "badge";
    b2.textContent = `休憩 ${Number(s.breakMin || 0)}分`;

    const b3 = document.createElement("span");
    b3.className = "badge";
    b3.textContent = `実働 ${minutesToHM(s.workMin)}`;

    const b4 = document.createElement("span");
    b4.className = "badge warn";
    b4.textContent = `見込み ${yen(s.payYen)}`;

    badges.append(b1, b2, b3, b4);

    const memo = document.createElement("div");
    memo.style.color = "var(--muted)";
    memo.style.fontSize = "12px";
    memo.textContent = s.memo ? `メモ：${s.memo}` : "";

    left.append(line1, badges);
    if (s.memo) left.append(memo);

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
  const selectedCompanyId = getSelectedCompanyId();

  const todayShifts = derived.filter((s) => s.date === t);
  const monthShifts = derived.filter((s) => monthKey(s.date) === thisMonth);
  const companyMonth = monthShifts.filter((s) => s.companyId === selectedCompanyId);

  const todayMin = sumMinutes(todayShifts);
  const todayPay = sumPay(todayShifts);

  const monthMin = sumMinutes(monthShifts);
  const monthPay = sumPay(monthShifts);

  const cMin = sumMinutes(companyMonth);
  const cPay = sumPay(companyMonth);

  els.todaySummary.textContent = `${minutesToHM(todayMin)} / ${yen(todayPay)}`;
  els.monthSummary.textContent = `${minutesToHM(monthMin)} / ${yen(monthPay)}`;
  els.companyMonthSummary.textContent = `${minutesToHM(cMin)} / ${yen(cPay)}`;
}

function exportCSV(db) {
  const derived = computeDerived(db);
  // header
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
      s.start,
      s.end,
      String(Number(s.breakMin || 0)),
      String(Math.round(s.workMin || 0)),
      String(Math.round(s.payYen || 0)),
      s.isOvernight ? "1" : "0",
      `"${memo}"`
    ].join(","));
  }
  return rows.join("\n");
}

function rerender(db) {
  refreshCompanySelect(db);
  renderSummary(db);
  renderDayList(db);
}

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

  // 計算して最低限チェック
  const { workMin } = calcShiftMinutes(date, start, end, breakMin);
  if (workMin === 0) throw new Error("実働が0分です（時刻 or 休憩を確認）");

  return { companyId, date, start, end, breakMin, memo };
}

/* ====== Events ====== */

(function init() {
  let db = load();

  ensureDefaultDates();

  // 初回：会社が無いならサンプルを入れない（ユーザー運用前提）
  refreshCompanySelect(db);

  // company select change
  els.companySelect.addEventListener("change", () => {
    const c = findCompany(db, getSelectedCompanyId());
    els.selectedWagePill.textContent = c ? `時給：${yen(c.hourlyWage)}` : "時給：-";
    rerender(db);
  });

  els.setTodayBtn.addEventListener("click", () => {
    const t = todayISO();
    els.workDate.value = t;
    els.listDate.value = t;
    rerender(db);
  });

  els.listDate.addEventListener("change", () => {
    renderDayList(db);
  });

  els.addCompanyBtn.addEventListener("click", () => {
    try {
      const id = upsertCompany(db, els.companyName.value, els.companyWage.value);
      save(db);

      // select it
      refreshCompanySelect(db);
      els.companySelect.value = id;

      const c = findCompany(db, id);
      els.selectedWagePill.textContent = c ? `時給：${yen(c.hourlyWage)}` : "時給：-";

      // clear inputs
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

      const { workMin, isOvernight } = calcShiftMinutes(input.date, input.start, input.end, input.breakMin);
      const payYen = (workMin / 60) * wage;

      addShift(db, {
        id: uid(),
        companyId: input.companyId,
        date: input.date,
        start: input.start,
        end: input.end,
        breakMin: input.breakMin,
        memo: input.memo,
        // 保存しておく（再計算もするが、表示が速い）
        workMin,
        payYen,
        isOvernight
      });

      save(db);

      // list date to work date
      els.listDate.value = input.date;

      // clear time + memo only
      els.memo.value = "";
      els.breakMin.value = "0";

      rerender(db);
    } catch (e) {
      alert(e.message || String(e));
    }
  });

  els.copyDayBtn.addEventListener("click", async () => {
    const dateISO = els.listDate.value;
    const derived = computeDerived(db).filter((s) => s.date === dateISO);
    const totalMin = sumMinutes(derived);
    const totalPay = sumPay(derived);

    const text = `${dateISO} 合計：${minutesToHM(totalMin)} / ${yen(totalPay)}`;
    try {
      await navigator.clipboard.writeText(text);
      alert("コピーしました:\n" + text);
    } catch {
      // clipboard未対応環境用
      els.exportBox.value = text;
      alert("コピーできない環境でした。下の出力欄に入れました。");
    }
  });

  els.exportCsvBtn.addEventListener("click", () => {
    els.exportBox.value = exportCSV(db);
  });

  els.exportJsonBtn.addEventListener("click", () => {
    els.exportBox.value = JSON.stringify(db, null, 2);
  });

  els.resetAllBtn.addEventListener("click", () => {
    const ok = confirm("全データを削除します。元に戻せません。");
    if (!ok) return;
    db = { companies: [], shifts: [] };
    save(db);
    rerender(db);
    els.exportBox.value = "";
  });

  // initial render
  rerender(db);
})();
