/* =========================================================
   BLOOM
   A gentle daily planner. Everything you type is saved only
   in this browser, on this device (localStorage).

   PART 1  Settings you can tweak
   PART 2  Starting template (generic, safe to be public)
   PART 3  Saving and loading
   PART 4  Small helpers
   PART 5  Drawing each page
   PART 6  Actions (what happens when you tap things)
   PART 7  Start the app
   ========================================================= */


/* =========================================================
   PART 1: SETTINGS YOU CAN TWEAK
   ========================================================= */

/* Healthy Mind Platter: one task per slice, per energy level */
const PLATTER = [
  { id: "sleep",    name: "Sleep time",      color: "#7C8CD9", 20: "Wake and lights out on time", 50: "Wake and lights out on time", 100: "Wake and lights out on time" },
  { id: "physical", name: "Physical time",   color: "#F2A65A", 20: "5-min stretch",               50: "10-min walk",                 100: "Home workout and a walk" },
  { id: "focus",    name: "Focus time",      color: "#4E9AD6", 20: "One tiny focus task",         50: "One or two focus blocks",     100: "The full plan" },
  { id: "timein",   name: "Time in",         color: "#B38BD9", 20: "Notice how I feel for 1 minute", 50: "Write my one line",       100: "Write my one line, slowly" },
  { id: "down",     name: "Down time",       color: "#6CC4A1", 20: "Rest without the phone",      50: "Rest without the phone",      100: "Rest without the phone" },
  { id: "play",     name: "Play time",       color: "#F27BA5", 20: "Something small and fun",     50: "30 min of a hobby",           100: "A 1–2 hour hobby block" },
  { id: "connect",  name: "Connecting time", color: "#F2C443", 20: "Send one message",            50: "A short call",                100: "A call or going out" }
];

const LEVELS = [
  { value: 20,  label: "🌱 Low",  note: "Only what's shown. Doing this is the whole day." },
  { value: 50,  label: "🌿 Okay", note: "The main things, at a gentle pace." },
  { value: 100, label: "🌸 Good", note: "The full plan. Enjoy the good energy." }
];

/* Suggested number of tasks per energy level (the percentage rule) */
const TASK_CAP = { 20: 1, 50: 2, 100: 3 };

/* What the flower says as it fills up */
function bloomMessage(count) {
  if (count === 0) return "Your flower is waiting. Pick any petal.";
  if (count <= 3)  return `Blooming: ${count} of 7 petals.`;
  if (count <= 6)  return `Nearly in full bloom: ${count} of 7.`;
  return "Full bloom! Every slice got some care today. 🌸";
}

const HOBBY_OPTIONS = ["Writing", "Singing", "Painting"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


/* =========================================================
   PART 2: STARTING TEMPLATE
   Generic on purpose: this file is public. Make it yours
   inside the app (Plan → Edit), not here.
   min = lowest energy level that shows the item (20, 50, 100)
   ========================================================= */

function template() {
  const morning = [
    { t: "7:00", w: "Wake up", n: "Water, open the curtains, some daylight", min: 20 },
    { t: "7:10", w: "Stretch", n: "5–10 gentle minutes", min: 20 },
    { t: "7:30", w: "Get ready", n: "Shower, skincare, breakfast with protein", min: 20 }
  ];
  const night = [
    { t: "9:30", w: "Phone off", n: "Skincare, get comfy", min: 20 },
    { t: "", w: "Time in", n: "Your one line for today", min: 20 },
    { t: "10:30", w: "Lights out", n: "", min: 20 }
  ];
  const weekday = [
    { t: "8:00", w: "Phone allowed", n: "", min: 20 },
    { t: "9:00", w: "Focus block", n: "Classes or study", min: 20 },
    { t: "12:30", w: "Lunch", n: "", min: 20 },
    { t: "1:30", w: "Focus block", n: "Study or job tasks", min: 50 },
    { t: "4:00", w: "Snack", n: "", min: 20 },
    { t: "5:30", w: "Home movement", n: "20–30 min", min: 100 },
    { t: "7:00", w: "Dinner", n: "", min: 20 },
    { t: "7:30", w: "10-min walk", n: "", min: 50 },
    { t: "8:00", w: "Free time", n: "", min: 20 }
  ];
  const saturday = [
    { t: "8:00", w: "Phone allowed", n: "", min: 20 },
    { t: "9:00", w: "Chores and laundry", n: "", min: 50 },
    { t: "11:00", w: "Focus block", n: "", min: 100 },
    { t: "12:30", w: "Lunch", n: "", min: 20 },
    { t: "1:30", w: "Hobby block option", n: "1–2 hours", min: 100, hobby: true },
    { t: "7:00", w: "Dinner", n: "", min: 20 },
    { t: "8:00", w: "Friends or rest", n: "", min: 20 }
  ];
  const sunday = [
    { t: "8:00", w: "Phone allowed", n: "", min: 20 },
    { t: "9:00", w: "Groceries", n: "", min: 50 },
    { t: "11:00", w: "Simple prep", n: "Cook something big, chop some veg", min: 50 },
    { t: "12:30", w: "Lunch", n: "", min: 20 },
    { t: "2:00", w: "Plan the week", n: "Tasks, hobby blocks, a quick look at the basket", min: 20 },
    { t: "", w: "Rest", n: "Nothing else today", min: 20 },
    { t: "7:00", w: "Dinner", n: "", min: 20 }
  ];

  const withIds = list => list.map(item => ({ id: uid(), hobby: false, ...item }));
  return {
    morning: withIds(morning),
    night: withIds(night),
    schedule: [weekday, weekday, weekday, weekday, weekday, saturday, sunday].map(withIds)
  };
}

function freshData() {
  return {
    version: 1,
    ...template(),
    energy: {},        // { "2026-09-28": 50 }
    platter: {},       // { "2026-09-28": { sleep: true, ... } }
    tasks: [],         // { id, text, date, slice, done, letGo, created }
    wins: [],          // { id, text, date, taskId? }
    timein: {},        // { "2026-09-28": "one line" }
    kit: [],           // { id, text }
    counsel: [],       // { id, text, date }
    hobbies: {},       // { "2026-09-28" (a Monday): ["Painting", "", ""] }
    rules: [
      "Phone-free first and last hour.",
      "App timers on.",
      "Never miss twice.",
      "A 20% day done at 20% is a complete day.",
      "Missed days are blank, never red."
    ].map(text => ({ id: uid(), text })),
    settings: { chime: true, name: "" }
  };
}


/* =========================================================
   PART 3: SAVING AND LOADING
   ========================================================= */

const STORAGE_KEY = "bloom-data-v1";
let data = load();

function load() {
  const fresh = freshData();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return fresh;
    return { ...fresh, ...saved, settings: { ...fresh.settings, ...(saved.settings || {}) } };
  } catch (e) {
    return fresh;
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    toast("Couldn't save on this device. Try downloading a backup.");
  }
}


/* =========================================================
   PART 4: SMALL HELPERS
   ========================================================= */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Make any typed text safe to put inside HTML
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Local date as "2026-09-28" (resets at your midnight)
function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function today() { return ymd(new Date()); }
function dayIndex(d = new Date()) { return (d.getDay() + 6) % 7; }  // Monday = 0
function mondayOf(d = new Date()) {
  const m = new Date(d); m.setDate(d.getDate() - dayIndex(d)); return m;
}
function dateOfWeekday(i) {
  const m = mondayOf(); m.setDate(m.getDate() + i); return ymd(m);
}
function daysBetween(a, b) {
  return Math.round((new Date(b + "T12:00") - new Date(a + "T12:00")) / 86400000);
}
function prettyDate(s) {
  return new Date(s + "T12:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function $(id) { return document.getElementById(id); }
function energyToday() { return data.energy[today()] ?? null; }
function level() { return energyToday() ?? 50; }   // 50% until you pick
function platterFor(date) { return data.platter[date] || (data.platter[date] = {}); }
function sliceById(id) { return PLATTER.find(s => s.id === id); }

// Little message at the bottom of the screen
let toastTimer;
function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}

// Soft chime made with the Web Audio API (no sound files needed)
let audio;
function chime(kind = "soft") {
  if (!data.settings.chime) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    const notes = kind === "bloom" ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 987.77];
    notes.forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      const start = audio.currentTime + i * 0.12;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
      osc.connect(gain).connect(audio.destination);
      osc.start(start);
      osc.stop(start + 1);
    });
  } catch (e) { /* no sound, no problem */ }
}

// Fill every "which slice?" dropdown
function fillSliceSelects() {
  document.querySelectorAll('select[name="slice"]').forEach(sel => {
    sel.innerHTML = PLATTER.map(s =>
      `<option value="${s.id}" ${s.id === "focus" ? "selected" : ""}>${s.name.replace(" time", "")}</option>`).join("");
  });
}


/* =========================================================
   PART 5: DRAWING EACH PAGE
   ========================================================= */

let currentView = "home";
let planDay = dayIndex();
let editing = false;
let justToggled = null;
let lastSeenWins = null;
let nextStepFor = null;    // { big, slice, taskId } after finishing a first step   // for the jar drop animation

function render() {
  document.querySelectorAll(".view").forEach(v => { v.hidden = v.dataset.view !== currentView; });
  document.querySelectorAll(".menu button").forEach(b => {
    if (b.dataset.go === currentView) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  ({ home: renderHome, today: renderToday, plan: renderPlan, jars: renderJars, kit: renderKit, notes: renderNotes })[currentView]();
}

/* ---------- shared pieces ---------- */

function itemHTML(item) {
  return `<li class="item${item.hobby ? " hobby" : ""}">
    <span class="t">${esc(item.t)}</span>
    <span><span class="what">${esc(item.w)}</span>${item.n ? `<br><span class="note">${esc(item.n)}</span>` : ""}</span>
  </li>`;
}

function timelineHTML(dayI, energy) {
  const fits = item => energy >= (item.min || 20);
  return `
    <div class="band dawn"><div class="band-label">Phone-free hour</div>
      <ul class="timeline">${data.morning.filter(fits).map(itemHTML).join("")}</ul></div>
    <div class="plain"><ul class="timeline">${data.schedule[dayI].filter(fits).map(itemHTML).join("")}</ul></div>
    <div class="band dusk"><div class="band-label">Phone-free hour</div>
      <ul class="timeline">${data.night.filter(fits).map(itemHTML).join("")}</ul></div>`;
}

function taskHTML(task, mode = "normal") {
  const slice = sliceById(task.slice);
  const dot = slice ? `<span class="dot" style="background:${slice.color}"></span>` : "";
  if (mode === "basket") {
    const age = daysBetween(task.date, today());
    return `<li class="task">
      <span style="flex:1">${dot}<span class="text">${esc(task.text)}</span>
        <span class="meta">${age >= 7 ? "Still want this?" : `From ${prettyDate(task.date)}`}</span></span>
      <span class="task-actions">
        <button class="small-btn" data-action="move-today" data-id="${task.id}">Move to today</button>
        <button class="small-btn ghost" data-action="let-go" data-id="${task.id}">Let go</button>
      </span></li>`;
  }
  return `<li class="task${task.done ? " done" : ""}">
    <label><input type="checkbox" data-task="${task.id}" ${task.done ? "checked" : ""}>
      <span>${dot}<span class="text">${esc(task.text)}</span>
        ${task.big ? `<span class="meta">Step towards: ${esc(task.big)}</span>` : ""}</span></label>
    <button class="icon-btn" data-action="del-task" data-id="${task.id}" aria-label="Delete task">×</button>
  </li>`;
}

function tasksOn(date) {
  return data.tasks.filter(t => t.date === date && !t.letGo);
}

/* Draws a flower. Each petal is one platter slice. */
function flowerSVG(doneMap, big) {
  const petals = PLATTER.map((slice, i) => {
    const on = !!doneMap[slice.id];
    const pop = big && slice.id === justToggled ? " pop" : "";
    return `<g transform="rotate(${i * 360 / PLATTER.length} 100 100)">
      <ellipse class="petal${pop}" ${big ? `data-slice="${slice.id}"` : ""} cx="100" cy="52" rx="22" ry="40"
        ${on ? `style="fill:${slice.color}"` : ""}/></g>`;
  }).join("");
  const count = PLATTER.filter(s => doneMap[s.id]).length;
  return `<svg viewBox="0 0 200 200" aria-hidden="true">${petals}
    <circle class="centre" cx="100" cy="100" r="${big ? 28 : 24}"/>
    ${big ? `<text class="centre-text" x="100" y="108" text-anchor="middle">${count}/7</text>` : ""}</svg>`;
}

/* ---------- HOME ---------- */

function renderHome() {
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  $("homeTitle").textContent = data.settings.name ? `${hello}, ${data.settings.name}` : hello;
  $("homeDate").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  // energy
  const e = energyToday();
  $("levels").innerHTML = LEVELS.map(l => {
    const [emoji, word] = l.label.split(" ");
    return `<button data-action="level" data-level="${l.value}" aria-pressed="${e === l.value}">
      ${emoji} ${l.value}%<small>${word}</small></button>`;
  }).join("");
  $("levelNote").textContent = e ? LEVELS.find(l => l.value === e).note : "Pick one. You can change it later.";

  // low-day note (same note all day, picked by the date)
  const low = $("lowday");
  low.hidden = e !== 20;
  if (e === 20) {
    if (data.kit.length) {
      const n = [...today()].reduce((a, c) => a + c.charCodeAt(0), 0) % data.kit.length;
      low.innerHTML = `<h2>A note from a better day</h2><p>${esc(data.kit[n].text)}</p>`;
    } else {
      low.innerHTML = `<h2>Go gently today</h2><p>On a good day, write notes to yourself in Kit. They'll show up here.</p>`;
    }
  }

  // shortcut to the Today page
  const list = tasksOn(today());
  const doneCount = list.filter(t => t.done).length;
  $("todaySummary").textContent = list.length
    ? `Today's tasks: ${doneCount} of ${list.length} done`
    : "Today's tasks: add your first one";

  // platter + flower
  const done = platterFor(today());
  $("platter").innerHTML = PLATTER.map(s => `
    <label class="check">
      <input type="checkbox" data-slice="${s.id}" ${done[s.id] ? "checked" : ""}>
      <span><strong><span class="dot" style="background:${s.color}"></span>${s.name}</strong>
      <span class="note" style="display:block">${esc(s[level()])}</span></span>
    </label>`).join("");
  const count = PLATTER.filter(s => done[s.id]).length;
  $("bloom").innerHTML = flowerSVG(done, true);
  $("bloom").classList.toggle("full", count === PLATTER.length && justToggled !== null);
  $("bloomStatus").textContent = bloomMessage(count);
  justToggled = null;

  // time in (don't overwrite while typing)
  if (document.activeElement !== $("timeinInput")) $("timeinInput").value = data.timein[today()] || "";

}

/* ---------- TODAY ---------- */

function renderToday() {
  $("todayDate").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const e = energyToday();
  $("energyChip").innerHTML = e
    ? `Showing your ${e}% day <button data-go="home">Change</button>`
    : `Pick your energy on Home <button data-go="home">Go</button>`;

  // "next tiny step?" card
  const next = $("nextStep");
  next.hidden = !nextStepFor;
  if (nextStepFor) {
    next.innerHTML = `
      <h2>Nice, you started 🌱</h2>
      <p class="muted">Want to add the next tiny step for “${esc(nextStepFor.big)}”? Totally optional.</p>
      <form class="add-row" id="nextStepForm">
        <input name="text" placeholder="The next tiny step" maxlength="120" aria-label="Next tiny step">
        <button type="submit">Add</button>
      </form>
      <button class="ghost small-btn" data-action="skip-next">Not now</button>`;
  }

  const list = tasksOn(today());
  const cap = TASK_CAP[level()];
  $("todayTasks").innerHTML = list.length
    ? list.map(t => taskHTML(t)).join("")
    : `<li class="empty">Nothing yet. What's one thing for today?</li>`;
  $("taskHint").textContent = list.length > cap
    ? `That's more than a ${level()}% day needs. Maybe move one to another day in Plan?`
    : `Up to ${cap} ${cap === 1 ? "task" : "tasks"} today. Anything you finish is a win.`;

  $("homeTimeline").innerHTML = timelineHTML(dayIndex(), level());
}

/* ---------- PLAN ---------- */

function renderPlan() {
  $("planDays").innerHTML = DAYS.map((d, i) =>
    `<button role="tab" data-action="plan-day" data-day="${i}" aria-selected="${i === planDay}"
      class="${i === dayIndex() ? "today" : ""}">${d}</button>`).join("");
  $("planDayTitle").textContent = FULL_DAYS[planDay];
  $("editToggle").textContent = editing ? "Done" : "Edit";

  $("planTimeline").innerHTML = editing ? editorHTML() : timelineHTML(planDay, 100);

  const date = dateOfWeekday(planDay);
  const list = tasksOn(date);
  $("planTasks").innerHTML = list.length
    ? list.map(t => taskHTML(t)).join("")
    : `<li class="empty">No tasks planned for ${FULL_DAYS[planDay]}.</li>`;

  // hobby blocks for this week
  const week = ymd(mondayOf());
  const picks = data.hobbies[week] || ["", "", ""];
  $("hobbies").innerHTML = picks.map((v, i) => `
    <div class="hb"><div class="n">${v ? "✓" : i + 1}</div>
      <select data-hobby="${i}" aria-label="Hobby block ${i + 1}">
        ${["", ...HOBBY_OPTIONS].map(o => `<option value="${o}" ${o === v ? "selected" : ""}>${o || "Not yet"}</option>`).join("")}
      </select></div>`).join("");
}

function editorHTML() {
  const section = (title, listName, list) => `
    <div class="edit-section"><h3>${title}</h3>
      ${list.map((item, i) => `
        <div class="edit-item">
          <div class="edit-top">
            <input data-list="${listName}" data-id="${item.id}" data-field="t" value="${esc(item.t)}" placeholder="Time" aria-label="Time">
            <input data-list="${listName}" data-id="${item.id}" data-field="w" value="${esc(item.w)}" placeholder="What" aria-label="What">
          </div>
          <input data-list="${listName}" data-id="${item.id}" data-field="n" value="${esc(item.n)}" placeholder="Note (optional)" aria-label="Note">
          <div class="edit-bottom">
            <select data-list="${listName}" data-id="${item.id}" data-field="min" aria-label="Show on">
              <option value="20" ${item.min == 20 ? "selected" : ""}>Every day</option>
              <option value="50" ${item.min == 50 ? "selected" : ""}>50% and up</option>
              <option value="100" ${item.min == 100 ? "selected" : ""}>100% only</option>
            </select>
            <label><input type="checkbox" data-list="${listName}" data-id="${item.id}" data-field="hobby" ${item.hobby ? "checked" : ""}> Hobby</label>
            <button class="icon-btn" data-action="item-up" data-list="${listName}" data-id="${item.id}" aria-label="Move up" ${i === 0 ? "disabled" : ""}>↑</button>
            <button class="icon-btn" data-action="item-down" data-list="${listName}" data-id="${item.id}" aria-label="Move down" ${i === list.length - 1 ? "disabled" : ""}>↓</button>
            <button class="icon-btn" data-action="item-del" data-list="${listName}" data-id="${item.id}" aria-label="Delete">×</button>
          </div>
        </div>`).join("")}
      <button class="ghost small-btn" data-action="item-add" data-list="${listName}">Add item</button>
    </div>`;
  return section("Morning (every day)", "morning", data.morning)
       + section(FULL_DAYS[planDay], "day", data.schedule[planDay])
       + section("Night (every day)", "night", data.night);
}

function listByName(name) {
  return name === "day" ? data.schedule[planDay] : data[name];
}

/* ---------- JARS ---------- */

function renderJars() {
  const month = today().slice(0, 7);
  const thisMonth = data.wins.filter(w => w.date.startsWith(month));
  $("winsCount").textContent = thisMonth.length
    ? `${thisMonth.length} ${thisMonth.length === 1 ? "win" : "wins"} this month.`
    : "Your jar is ready. Tiny wins count.";
  // the newest dot drops in when the jar has grown since you last looked
  const grew = lastSeenWins === null || thisMonth.length > lastSeenWins;
  $("jar").innerHTML = jarSVG(thisMonth.length, grew);
  lastSeenWins = thisMonth.length;
  $("winsList").innerHTML = data.wins.slice().reverse().slice(0, 20).map(w => `
    <li><span>${esc(w.text)}<span class="date">${prettyDate(w.date)}</span></span>
      <button class="icon-btn" data-action="del-win" data-id="${w.id}" aria-label="Delete win">×</button></li>`).join("");

  // carry-over basket: past days, not done, not let go
  const basket = data.tasks.filter(t => t.date < today() && !t.done && !t.letGo);
  $("basket").innerHTML = basket.length
    ? basket.map(t => taskHTML(t, "basket")).join("")
    : `<li class="empty">Empty basket. Nothing waiting on you.</li>`;

  // garden
  let bloomed = 0;
  $("garden").innerHTML = DAYS.map((d, i) => {
    const date = dateOfWeekday(i);
    const map = data.platter[date] || {};
    if (Object.values(map).some(Boolean)) bloomed++;
    const cls = i === dayIndex() ? " today" : date > today() ? " future" : "";
    return `<div class="plot${cls}">${flowerSVG(map, false)}<span>${d}</span></div>`;
  }).join("");
  $("gardenNote").textContent = bloomed
    ? `${bloomed} ${bloomed === 1 ? "flower has" : "flowers have"} started blooming this week.`
    : "Your first flower grows when you care for any slice.";
}

function jarSVG(count, animateNewest) {
  const shown = Math.min(count, 80);
  let dots = "";
  for (let i = 0; i < shown; i++) {
    const col = i % 8, row = Math.floor(i / 8);
    const x = 55 + col * 13 + (row % 2 ? 4 : 0);
    const y = 186 - row * 12;
    const drop = animateNewest && i === shown - 1 ? ` class="drop"` : "";
    dots += `<circle${drop} cx="${x}" cy="${y}" r="5.5" fill="${PLATTER[i % PLATTER.length].color}"/>`;
  }
  return `<svg viewBox="0 0 200 210" aria-hidden="true">
    ${dots}
    <path class="jar-glass" d="M62 44 H138 V56 Q158 64 158 88 V188 Q158 200 146 200 H54 Q42 200 42 188 V88 Q42 64 62 56 Z"/>
    <rect class="jar-lid" x="56" y="26" width="88" height="18" rx="6"/></svg>`;
}

/* ---------- KIT ---------- */

function renderKit() {
  $("kitList").innerHTML = data.kit.length
    ? data.kit.map(k => `<li><span>${esc(k.text)}</span>
        <button class="icon-btn" data-action="del-kit" data-id="${k.id}" aria-label="Delete note">×</button></li>`).join("")
    : `<li class="empty">No notes yet. Write one on a good day.</li>`;
}

/* ---------- NOTES ---------- */

function renderNotes() {
  const lines = Object.entries(data.timein).filter(([, v]) => v).sort((a, b) => b[0].localeCompare(a[0]));
  $("timeinList").innerHTML = lines.length
    ? lines.slice(0, 60).map(([d, v]) => `<li><span>${esc(v)}<span class="date">${prettyDate(d)}</span></span></li>`).join("")
    : `<li class="empty">Your one-line notes from Home will collect here.</li>`;

  $("counselList").innerHTML = data.counsel.slice().reverse().map(c => `
    <li><span>${esc(c.text)}<span class="date">${prettyDate(c.date)}</span></span>
      <button class="icon-btn" data-action="del-counsel" data-id="${c.id}" aria-label="Delete">×</button></li>`).join("");

  $("rulesList").innerHTML = data.rules.map(r => `
    <li><span>${esc(r.text)}</span>
      <button class="icon-btn" data-action="del-rule" data-id="${r.id}" aria-label="Delete rule">×</button></li>`).join("");

  if (document.activeElement !== $("nameInput")) $("nameInput").value = data.settings.name;
  $("chimeToggle").checked = data.settings.chime;
}


/* =========================================================
   PART 6: ACTIONS
   ========================================================= */

function go(view) {
  currentView = view;
  editing = false;
  if (location.hash !== "#" + view) history.replaceState(null, "", "#" + view);
  window.scrollTo(0, 0);
  render();
}

function addTask(text, date, slice, big = "") {
  data.tasks.push({ id: uid(), text, date, slice, big, done: false, letGo: false, created: today() });
  save();
}

function toggleTask(id, done) {
  const task = data.tasks.find(t => t.id === id);
  if (!task) return;
  task.done = done;
  if (done) {
    const winText = task.big ? `${task.text} (towards: ${task.big})` : task.text;
    data.wins.push({ id: uid(), text: winText, date: today(), taskId: task.id });
    // finished a first step? offer the next tiny one
    if (task.big) nextStepFor = { big: task.big, slice: task.slice, taskId: task.id };
    if (task.slice && task.date === today()) {
      platterFor(today())[task.slice] = true;
      justToggled = task.slice;
    }
    chime();
    toast("Added to your wins jar 🫙");
  } else {
    data.wins = data.wins.filter(w => w.taskId !== task.id);
    if (nextStepFor && nextStepFor.taskId === task.id) nextStepFor = null;
  }
  save();
  render();
}

function setSlice(id, value) {
  const map = platterFor(today());
  map[id] = value;
  justToggled = id;
  save();
  const full = PLATTER.every(s => map[s.id]);
  if (value) chime(full ? "bloom" : "soft");
  render();
}

function removeById(listName, id) {
  data[listName] = data[listName].filter(x => x.id !== id);
  save();
  render();
}

/* The menu */
function setMenu(open) {
  $("menu").hidden = !open;
  $("menuBtn").setAttribute("aria-expanded", String(open));
}
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$("menu").hidden) { setMenu(false); $("menuBtn").focus(); }
});

/* Taps on buttons */
document.addEventListener("click", e => {
  // open or close the menu
  if (e.target.closest("#menuBtn")) return setMenu($("menu").hidden);

  const nav = e.target.closest("[data-go]");
  if (nav) { setMenu(false); return go(nav.dataset.go); }

  // tapping anywhere else closes the menu
  if (!$("menu").hidden && !e.target.closest("#menu")) setMenu(false);

  // tapping a petal on the big flower
  const petal = e.target.closest(".bloom [data-slice]");
  if (petal) return setSlice(petal.dataset.slice, !platterFor(today())[petal.dataset.slice]);

  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;

  switch (btn.dataset.action) {
    case "level":
      data.energy[today()] = Number(btn.dataset.level);
      save(); render();
      break;
    case "del-task":
      data.tasks = data.tasks.filter(t => t.id !== id);
      data.wins = data.wins.filter(w => w.taskId !== id);
      save(); render();
      break;
    case "move-today": {
      const t = data.tasks.find(t => t.id === id);
      if (t) { t.date = today(); save(); render(); toast("Moved to today"); }
      break;
    }
    case "let-go": {
      const t = data.tasks.find(t => t.id === id);
      if (t) { t.letGo = true; save(); render(); toast("Let go. That's a decision, not a failure."); }
      break;
    }
    case "plan-day":
      planDay = Number(btn.dataset.day);
      render();
      break;
    case "edit-toggle":
      editing = !editing;
      render();
      break;
    case "item-add":
      listByName(btn.dataset.list).push({ id: uid(), t: "", w: "New item", n: "", min: 20, hobby: false });
      save(); render();
      break;
    case "item-del": {
      const list = listByName(btn.dataset.list);
      list.splice(list.findIndex(x => x.id === id), 1);
      save(); render();
      break;
    }
    case "item-up":
    case "item-down": {
      const list = listByName(btn.dataset.list);
      const i = list.findIndex(x => x.id === id);
      const j = btn.dataset.action === "item-up" ? i - 1 : i + 1;
      if (j >= 0 && j < list.length) { [list[i], list[j]] = [list[j], list[i]]; save(); render(); }
      break;
    }
    case "random-win":
      if (!data.wins.length) { $("randomWin").textContent = "No wins yet. Your first one is coming."; break; }
      {
        const w = data.wins[Math.floor(Math.random() * data.wins.length)];
        $("randomWin").textContent = `“${w.text}” (${prettyDate(w.date)})`;
      }
      break;
    case "skip-next":
      nextStepFor = null;
      render();
      break;
    case "del-win":     removeById("wins", id); break;
    case "del-kit":     removeById("kit", id); break;
    case "del-counsel": removeById("counsel", id); break;
    case "del-rule":    removeById("rules", id); break;
    case "export":      exportBackup(); break;
    case "reset":
      if (confirm("Erase everything on this device? Download a backup first if you want to keep it.")) {
        data = freshData(); save(); render(); toast("Fresh start.");
      }
      break;
  }
});

/* Checkboxes and dropdowns */
document.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.task)  return toggleTask(el.dataset.task, el.checked);
  if (el.dataset.slice) return setSlice(el.dataset.slice, el.checked);
  if (el.dataset.hobby !== undefined) {
    const week = ymd(mondayOf());
    const picks = data.hobbies[week] || ["", "", ""];
    picks[Number(el.dataset.hobby)] = el.value;
    data.hobbies[week] = picks;
    if (el.value) chime();
    save(); render();
    return;
  }
  if (el.dataset.field === "min" || el.dataset.field === "hobby") {
    const item = listByName(el.dataset.list).find(x => x.id === el.dataset.id);
    item[el.dataset.field] = el.dataset.field === "min" ? Number(el.value) : el.checked;
    save();
    return;
  }
  if (el.id === "chimeToggle") { data.settings.chime = el.checked; save(); if (el.checked) chime(); return; }
  if (el.id === "importFile" && el.files[0]) importBackup(el.files[0]);
});

/* Typing (saved as you go, without redrawing) */
document.addEventListener("input", e => {
  const el = e.target;
  if (el.id === "timeinInput") {
    data.timein[today()] = el.value;
    save();
    $("timeinSaved").textContent = el.value ? "Saved" : "";
    return;
  }
  if (el.id === "nameInput") { data.settings.name = el.value.trim(); save(); return; }
  if (["t", "w", "n"].includes(el.dataset.field)) {
    const item = listByName(el.dataset.list).find(x => x.id === el.dataset.id);
    item[el.dataset.field] = el.value;
    save();
  }
});

/* Forms (the Add buttons) */
document.addEventListener("submit", e => {
  e.preventDefault();
  const form = e.target;
  const text = (form.elements.text?.value || "").trim();

  switch (form.id) {
    case "todayTaskForm":
      if (!text) return;
      addTask(text, today(), form.elements.slice.value);
      break;
    case "planTaskForm":
      if (!text) return;
      addTask(text, dateOfWeekday(planDay), form.elements.slice.value);
      toast(`Planned for ${FULL_DAYS[planDay]}`);
      break;
    case "winForm":
      if (!text) return;
      data.wins.push({ id: uid(), text, date: today() });
      save(); chime(); toast("Into the jar 🫙");
      break;
    case "kitForm":
      if (!text) return;
      data.kit.push({ id: uid(), text });
      save(); toast("Saved for a low day 💌");
      break;
    case "counselForm":
      if (!text) return;
      data.counsel.push({ id: uid(), text, date: today() });
      save();
      break;
    case "ruleForm":
      if (!text) return;
      data.rules.push({ id: uid(), text });
      save();
      break;
    case "nextStepForm":
      if (!text || !nextStepFor) return;
      addTask(text, today(), nextStepFor.slice, nextStepFor.big);
      nextStepFor = null;
      chime();
      toast("Next tiny step added");
      break;
    case "firstStepForm": {
      const step = form.elements.step.value.trim();
      const big = form.elements.big.value.trim();
      if (!step) return toast("Write just the first tiny step");
      addTask(step, today(), form.elements.slice.value, big);
      chime();
      toast("Added to today. Just that one step.");
      break;
    }
  }
  form.reset();
  fillSliceSelects();
  render();
});

/* Backup: download everything as a file */
function exportBackup() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `bloom-backup-${today()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast("Backup downloaded");
}

/* Restore: load a backup file */
function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.tasks)) throw new Error("bad file");
      if (!confirm("Replace what's on this device with this backup?")) return;
      const fresh = freshData();
      data = { ...fresh, ...parsed, settings: { ...fresh.settings, ...(parsed.settings || {}) } };
      save(); render(); toast("Backup restored");
    } catch (err) {
      toast("That file isn't a Bloom backup");
    }
    $("importFile").value = "";
  };
  reader.readAsText(file);
}


/* The sky: which mood for which hour (24-hour clock) */
function skyFor(hour) {
  if (hour >= 5 && hour < 7)   return "dawn";     // soft dawn
  if (hour >= 7 && hour < 17)  return "day";      // golden hour
  if (hour >= 17 && hour < 19) return "sunset";   // sunset
  return "night";                                 // night
}

function updateSky() {
  const mood = skyFor(new Date().getHours());
  if (document.body.dataset.sky === mood) return;
  document.body.dataset.sky = mood;
  // tint the phone's browser bar to match the top of the sky
  const top = getComputedStyle(document.body).getPropertyValue("--sky-1").trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && top) meta.content = top;
}


/* =========================================================
   PART 7: START THE APP
   ========================================================= */

updateSky();
setInterval(updateSky, 60 * 1000);   // check the time every minute

window.addEventListener("hashchange", () => {
  const view = location.hash.slice(1);
  if (view && view !== currentView && document.querySelector(`[data-view="${view}"]`)) go(view);
});

fillSliceSelects();
const startView = location.hash.slice(1);
go(document.querySelector(`[data-view="${startView}"]`) ? startView : "home");