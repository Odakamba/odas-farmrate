const multipliers = [
  ["dc", 1e33],
  ["no", 1e30],
  ["oc", 1e27],
  ["sp", 1e24],
  ["sx", 1e21],
  ["qn", 1e18],
  ["qd", 1e15],
  ["qa", 1e15],
  ["t", 1e12],
  ["b", 1e9],
  ["m", 1e6],
  ["k", 1e3],
];

const formatUnits = [
  ["Dc", 1e33],
  ["No", 1e30],
  ["Oc", 1e27],
  ["Sp", 1e24],
  ["Sx", 1e21],
  ["Qn", 1e18],
  ["Qd", 1e15],
  ["T", 1e12],
  ["B", 1e9],
  ["M", 1e6],
  ["k", 1e3],
];

const unitSeconds = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
};

const state = {
  mode: "earn",
};

const $ = (id) => document.getElementById(id);
const modeButtons = document.querySelectorAll(".mode-button");
const modeSections = document.querySelectorAll(".mode-section");
const form = $("farmForm");
const resultLabel = $("resultLabel");
const mainResult = $("mainResult");
const resultNote = $("resultNote");
const breakdown = $("breakdown");
const errorMessage = $("errorMessage");

function parseGameNumber(value) {
  const raw = String(value || "").trim().replace(/,/g, "");
  const match = raw.match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([a-z]*)$/i);

  if (!match) {
    throw new Error(`"${value}" is not a valid number.`);
  }

  const amount = Number(match[1]);
  const suffix = match[2].toLowerCase();
  const found = multipliers.find(([key]) => key === suffix);

  if (!Number.isFinite(amount)) {
    throw new Error(`"${value}" is too large to calculate.`);
  }

  if (suffix && !found) {
    throw new Error(`Unknown suffix "${match[2]}". Try k, M, B, T, Qd, Qn, or 1e21.`);
  }

  return amount * (found ? found[1] : 1);
}

function parsePositive(value, label) {
  const number = parseGameNumber(value);
  if (number <= 0) {
    throw new Error(`${label} must be greater than 0.`);
  }
  return number;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Too large";
  }

  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  if (abs < 1000) {
    return sign + trimNumber(abs, 2);
  }

  const found = formatUnits.find(([, size]) => abs >= size);
  if (!found) {
    return sign + trimNumber(abs, 2);
  }

  return sign + trimNumber(abs / found[1], 2) + found[0];
}

function trimNumber(value, decimals) {
  return Number(value.toFixed(decimals)).toString();
}

function plural(value, unit) {
  return `${trimNumber(value, 2)} ${unit}${value === 1 ? "" : "s"}`;
}

function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) {
    return "Too long";
  }

  if (totalSeconds <= 0) {
    return "0 seconds";
  }

  const rounded = Math.ceil(totalSeconds);
  const days = Math.floor(rounded / 86400);
  const hours = Math.floor((rounded % 86400) / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  const parts = [];

  if (days) parts.push(plural(days, "day"));
  if (hours) parts.push(plural(hours, "hour"));
  if (minutes) parts.push(plural(minutes, "minute"));
  if (seconds || parts.length === 0) parts.push(plural(seconds, "second"));

  return parts.slice(0, 3).join(" ");
}

function secondsFromInterval(amountId, unitId) {
  const amount = parsePositive($(amountId).value, "Interval");
  return amount * unitSeconds[$(unitId).value];
}

function durationSeconds() {
  const days = Number($("durationDays").value || 0);
  const hours = Number($("durationHours").value || 0);
  const minutes = Number($("durationMinutes").value || 0);
  const seconds = Number($("durationSeconds").value || 0);
  const total = days * 86400 + hours * 3600 + minutes * 60 + seconds;

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("Duration must be greater than 0.");
  }

  return total;
}

function setDurationFromPreset(seconds) {
  $("durationDays").value = Math.floor(seconds / 86400);
  $("durationHours").value = Math.floor((seconds % 86400) / 3600);
  $("durationMinutes").value = Math.floor((seconds % 3600) / 60);
  $("durationSeconds").value = seconds % 60;
}

function getRatePerSecond(amountId, intervalAmountId, intervalUnitId) {
  const income = parsePositive($(amountId).value, "Income");
  const interval = secondsFromInterval(intervalAmountId, intervalUnitId);
  return income / interval;
}

function renderBreakdown(rows) {
  breakdown.innerHTML = "";

  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    const labelElement = document.createElement("span");
    const valueElement = document.createElement("strong");

    row.className = "breakdown-row";
    labelElement.textContent = label;
    valueElement.textContent = value;

    row.append(labelElement, valueElement);
    breakdown.append(row);
  });
}

function renderEarn() {
  const currency = $("earnCurrency").value.trim() || "Currency";
  const income = parsePositive($("earnIncome").value, "Income");
  const interval = secondsFromInterval("earnIntervalAmount", "earnIntervalUnit");
  const seconds = durationSeconds();
  const total = (income / interval) * seconds;

  resultLabel.textContent = "Total earned";
  mainResult.textContent = `${formatNumber(total)} ${currency}`;
  resultNote.textContent = `At ${formatNumber(income)} ${currency} every ${plural(parseGameNumber($("earnIntervalAmount").value), $("earnIntervalUnit").value)} for ${formatDuration(seconds)}.`;

  renderBreakdown([
    ["Per second", `${formatNumber((income / interval) * 1)} ${currency}`],
    ["Per minute", `${formatNumber((income / interval) * 60)} ${currency}`],
    ["Per hour", `${formatNumber((income / interval) * 3600)} ${currency}`],
    ["Per day", `${formatNumber((income / interval) * 86400)} ${currency}`],
  ]);
}

function renderTarget() {
  const currency = $("targetCurrency").value.trim() || "Currency";
  const current = parseGameNumber($("currentAmount").value);
  const target = parsePositive($("targetAmount").value, "Target");
  const rate = getRatePerSecond("targetIncome", "targetIntervalAmount", "targetIntervalUnit");
  const remaining = Math.max(target - current, 0);
  const seconds = remaining / rate;

  resultLabel.textContent = remaining <= 0 ? "Target reached" : "Time needed";
  mainResult.textContent = remaining <= 0 ? "Ready now" : formatDuration(seconds);
  resultNote.textContent = remaining <= 0
    ? `You already have enough ${currency}.`
    : `You need ${formatNumber(remaining)} more ${currency} to reach ${formatNumber(target)}.`;

  renderBreakdown([
    ["Remaining", `${formatNumber(remaining)} ${currency}`],
    ["Rate per second", `${formatNumber(rate)} ${currency}`],
    ["Rate per minute", `${formatNumber(rate * 60)} ${currency}`],
    ["Rate per hour", `${formatNumber(rate * 3600)} ${currency}`],
  ]);
}

function renderConvert() {
  const currency = $("convertCurrency").value.trim() || "Currency";
  const rate = getRatePerSecond("convertIncome", "convertIntervalAmount", "convertIntervalUnit");

  resultLabel.textContent = "Converted rate";
  mainResult.textContent = `${formatNumber(rate * 3600)} ${currency}/hour`;
  resultNote.textContent = `Based on ${$("convertIncome").value} ${currency} every ${plural(parseGameNumber($("convertIntervalAmount").value), $("convertIntervalUnit").value)}.`;

  renderBreakdown([
    ["Per second", `${formatNumber(rate)} ${currency}`],
    ["Per minute", `${formatNumber(rate * 60)} ${currency}`],
    ["Per hour", `${formatNumber(rate * 3600)} ${currency}`],
    ["Per day", `${formatNumber(rate * 86400)} ${currency}`],
  ]);
}

function calculate() {
  errorMessage.textContent = "";

  try {
    if (state.mode === "earn") renderEarn();
    if (state.mode === "target") renderTarget();
    if (state.mode === "convert") renderConvert();
  } catch (error) {
    mainResult.textContent = "Check inputs";
    resultNote.textContent = "FarmRate needs clean numbers before it can calculate.";
    breakdown.innerHTML = "";
    errorMessage.textContent = error.message;
  }
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    modeButtons.forEach((item) => item.classList.toggle("active", item === button));
    modeSections.forEach((section) => section.classList.toggle("active", section.dataset.section === state.mode));
    calculate();
  });
});

document.querySelectorAll("#durationPresets button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#durationPresets button").forEach((item) => item.classList.toggle("active", item === button));
    setDurationFromPreset(Number(button.dataset.seconds));
    calculate();
  });
});

document.querySelectorAll("#durationDays, #durationHours, #durationMinutes, #durationSeconds").forEach((input) => {
  input.addEventListener("input", () => {
    document.querySelectorAll("#durationPresets button").forEach((button) => button.classList.remove("active"));
  });
});

form.addEventListener("input", calculate);
form.addEventListener("change", calculate);

calculate();
