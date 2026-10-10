/* =========================================================
   STUDENT ACADEMIC PORTFOLIO — SCRIPT
   ---------------------------------------------------------
   1. Student details (EDIT THESE)
   2. Small helpers
   3. Loader, theme, navigation, back-to-top, scroll reveal
   4. COA expand / collapse
   5. Number system converter
   6. Assignment storage service (swap for a backend later)
   7. Assignment UI
   8. Start everything
   ========================================================= */

/* ---------- 1. STUDENT DETAILS ----------
   Change these values once and they appear everywhere on the
   page (navbar, hero card, footer) via data-student="..." tags. */
const STUDENT = {
  name: "Sachin Kumar",
  uid: "25BAI10040",
  semester: "3rd Semester",
  course: "B.E. Computer Science & Engineering(AI)",
};

/* ---------- 2. SMALL HELPERS ---------- */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/** Shows a short message at the bottom of the screen. */
let toastTimer;
function showToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

/** Writes a message into an element and colours it as error or success. */
function setMessage(el, text, type = "error") {
  el.textContent = text;
  el.classList.toggle("is-error", type === "error" && text !== "");
  el.classList.toggle("is-success", type === "success");
}

/** Reads/writes JSON in localStorage without crashing on bad data. */
const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

/** Formats a file size in bytes as KB / MB. */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ---------- 3. PAGE-WIDE FEATURES ---------- */

/** Fills every [data-student] element with the values from STUDENT. */
function fillStudentDetails() {
  const initials = STUDENT.name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const values = { ...STUDENT, initials };
  $$("[data-student]").forEach((el) => {
    const key = el.dataset.student;
    if (values[key]) el.textContent = values[key];
  });
  document.title = `${STUDENT.name} | Academic Portfolio`;
}

/** Hides the loading screen once the page has loaded. */
function initLoader() {
  const loader = $("#loader");
  const hide = () => setTimeout(() => loader.classList.add("is-hidden"), 350);
  if (document.readyState === "complete") hide();
  else window.addEventListener("load", hide);
}

/** Dark / light mode toggle — the choice is remembered in localStorage. */
function initTheme() {
  const root = document.documentElement;
  const button = $("#themeToggle");

  const updateLabel = () => {
    const isDark = root.dataset.theme === "dark";
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  };

  button.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("portfolio-theme", root.dataset.theme);
    updateLabel();
  });
  updateLabel();
}

/** Mobile hamburger menu + sticky header shadow + active link highlighting. */
function initNavigation() {
  const header = $("#header");
  const menu = $("#navMenu");
  const hamburger = $("#hamburger");
  const links = $$(".nav__link");

  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("no-scroll", open);
  };

  hamburger.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  links.forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false);
      hamburger.focus();
    }
  });
  // Close the mobile menu if the window is resized to desktop width
  window.matchMedia("(min-width: 901px)").addEventListener("change", (e) => e.matches && setMenu(false));

  // Header shadow + back-to-top visibility depend on scroll position
  const backToTop = $("#backToTop");
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
    backToTop.classList.toggle("is-visible", window.scrollY > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Highlight the nav link of the section currently in view
  const sections = links.map((link) => $(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", isActive);
          if (isActive) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => observer.observe(section));
}

/** Fades elements with the .reveal class in as they scroll into view. */
function initScrollReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => observer.observe(el));
}

/* ---------- 4. COA EXPAND / COLLAPSE ---------- */
function initCoa() {
  const items = $$(".coa-item");
  $("#expandAll").addEventListener("click", () => items.forEach((d) => (d.open = true)));
  $("#collapseAll").addEventListener("click", () => items.forEach((d) => (d.open = false)));
}

/* ---------- 5. NUMBER SYSTEM CONVERTER ---------- */

/* Information about each number system. "digits" is the set of
   characters allowed, used both for validation and for hints. */
const NUMBER_SYSTEMS = {
  2:  { name: "Binary",      short: "BIN", digits: "01",               prefix: "0b", example: "1011",  hint: "Binary: only the digits 0 and 1." },
  8:  { name: "Octal",       short: "OCT", digits: "01234567",         prefix: "0o", example: "755",   hint: "Octal: only the digits 0–7." },
  10: { name: "Decimal",     short: "DEC", digits: "0123456789",       prefix: "",   example: "255",   hint: "Decimal: digits 0–9 (a decimal point is allowed)." },
  16: { name: "Hexadecimal", short: "HEX", digits: "0123456789ABCDEF", prefix: "0x", example: "FF",    hint: "Hexadecimal: digits 0–9 and letters A–F." },
};

const MAX_FRACTION_DIGITS = 12; // how many digits to show after the point
const HISTORY_KEY = "portfolio-conversion-history";
const HISTORY_LIMIT = 8;

/**
 * Checks that `raw` is a valid number in the given base.
 * Returns { ok: true, sign, intDigits, fracDigits } or { ok: false, error }.
 * Spaces/underscores are ignored, an optional "-" sign and an optional
 * prefix (0b / 0o / 0x) are allowed, plus one "." for fractions.
 */
function validateNumber(raw, base) {
  const system = NUMBER_SYSTEMS[base];
  let value = raw.replace(/[\s_]/g, "").toUpperCase();

  if (value === "") return { ok: false, error: `Please enter a ${system.name.toLowerCase()} number.` };

  let sign = "";
  if (value.startsWith("-")) {
    sign = "-";
    value = value.slice(1);
  } else if (value.startsWith("+")) {
    value = value.slice(1);
  }

  if (system.prefix && value.startsWith(system.prefix.toUpperCase())) {
    value = value.slice(system.prefix.length);
  }

  const parts = value.split(".");
  if (parts.length > 2) return { ok: false, error: "A number can contain only one decimal point." };

  const [intDigits, fracDigits = ""] = parts;
  if (intDigits === "" && fracDigits === "") {
    return { ok: false, error: `Please enter at least one ${system.name.toLowerCase()} digit.` };
  }

  // Find the first character that is not allowed in this base
  const invalid = [...intDigits + fracDigits].find((ch) => !system.digits.includes(ch));
  if (invalid) {
    return {
      ok: false,
      error: `"${invalid}" is not a valid ${system.name} digit. ${system.hint}`,
    };
  }

  return { ok: true, sign, intDigits: intDigits || "0", fracDigits };
}

/**
 * Converts a validated number from one base to another.
 * The whole-number part uses BigInt so very large numbers stay exact.
 * The fractional part is converted by repeated multiplication.
 */
function convertNumber({ sign, intDigits, fracDigits }, fromBase, toBase) {
  // Whole part: build the value digit by digit (works for any base)
  let whole = 0n;
  const bigFrom = BigInt(fromBase);
  for (const ch of intDigits) whole = whole * bigFrom + BigInt(parseInt(ch, fromBase));
  let result = whole.toString(toBase).toUpperCase();

  // Fractional part: 0.d1d2d3... = d1/base + d2/base² + ...
  if (fracDigits) {
    let fraction = 0;
    [...fracDigits].forEach((ch, i) => {
      fraction += parseInt(ch, fromBase) / fromBase ** (i + 1);
    });

    let fracOut = "";
    for (let i = 0; i < MAX_FRACTION_DIGITS && fraction > 0; i++) {
      fraction *= toBase;
      const digit = Math.floor(fraction);
      fracOut += digit.toString(toBase).toUpperCase();
      fraction -= digit;
    }
    fracOut = fracOut.replace(/0+$/, "");
    if (fracOut) result += `.${fracOut}`;
  }

  const isZero = /^[0.]+$/.test(result);
  return (sign && !isZero ? "-" : "") + result;
}

function initConverter() {
  const form = $("#converterForm");
  const input = $("#inputNumber");
  const output = $("#outputNumber");
  const inputSystem = $("#inputSystem");
  const outputSystem = $("#outputSystem");
  const errorBox = $("#converterError");
  const historyList = $("#historyList");
  const historyEmpty = $("#historyEmpty");

  let history = storage.get(HISTORY_KEY, []);

  /** Updates badges, placeholder and hint text for the selected systems. */
  function updateLabels() {
    const from = NUMBER_SYSTEMS[inputSystem.value];
    const to = NUMBER_SYSTEMS[outputSystem.value];
    $("#inputBadge").textContent = from.short;
    $("#outputBadge").textContent = to.short;
    $("#inputHint").textContent = from.hint;
    $("#outputHint").textContent = `Result shown in ${to.name} (base ${outputSystem.value}).`;
    input.placeholder = `Enter a ${from.name.toLowerCase()} number, e.g. ${from.example}`;
  }

  /** Shows or clears the validation error for the input box. */
  function showError(text) {
    setMessage(errorBox, text);
    input.classList.toggle("is-invalid", Boolean(text));
    input.setAttribute("aria-invalid", String(Boolean(text)));
  }

  /** Validates the input and writes the converted result. Returns true on success. */
  function runConversion({ saveToHistory = true } = {}) {
    const fromBase = Number(inputSystem.value);
    const toBase = Number(outputSystem.value);
    const check = validateNumber(input.value, fromBase);

    if (!check.ok) {
      output.value = "";
      showError(check.error);
      return false;
    }

    showError("");
    output.value = convertNumber(check, fromBase, toBase);
    if (saveToHistory) addToHistory(input.value.trim(), fromBase, output.value, toBase);
    return true;
  }

  /** Adds a conversion to the history list (skips exact duplicates in a row). */
  function addToHistory(value, fromBase, result, toBase) {
    const last = history[0];
    if (last && last.value === value && last.from === fromBase && last.to === toBase) return;
    history.unshift({ value, from: fromBase, result, to: toBase });
    history = history.slice(0, HISTORY_LIMIT);
    storage.set(HISTORY_KEY, history);
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = "";
    history.forEach((item) => {
      const li = document.createElement("li");
      li.className = "history__item";
      const label = document.createElement("small");
      label.textContent = `${NUMBER_SYSTEMS[item.from].name} → ${NUMBER_SYSTEMS[item.to].name}`;
      const from = document.createElement("span");
      from.textContent = item.value;
      const arrow = document.createElement("span");
      arrow.className = "arrow";
      arrow.textContent = "=";
      const out = document.createElement("span");
      out.className = "out";
      out.textContent = item.result;
      li.append(label, from, arrow, out);
      historyList.append(li);
    });
    historyEmpty.hidden = history.length > 0;
  }

  // Convert button (form submit also fires on Enter key)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    runConversion();
  });

  // Live validation while typing — the result clears so it never looks stale
  input.addEventListener("input", () => {
    output.value = "";
    if (input.value.trim() === "") return showError("");
    const check = validateNumber(input.value, Number(inputSystem.value));
    showError(check.ok ? "" : check.error);
  });

  // Changing the input system re-checks the number against the new rules
  inputSystem.addEventListener("change", () => {
    updateLabels();
    output.value = "";
    if (input.value.trim()) {
      const check = validateNumber(input.value, Number(inputSystem.value));
      showError(check.ok ? "" : check.error);
    }
    input.focus();
  });

  // Changing the output system converts straight away
  outputSystem.addEventListener("change", () => {
    updateLabels();
    if (input.value.trim()) runConversion();
  });

  // Swap the two systems; the current result becomes the new input
  $("#swapBtn").addEventListener("click", () => {
    const previousResult = output.value;
    [inputSystem.value, outputSystem.value] = [outputSystem.value, inputSystem.value];
    if (previousResult) input.value = previousResult;
    updateLabels();
    if (input.value.trim()) runConversion({ saveToHistory: false });
  });

  $("#clearBtn").addEventListener("click", () => {
    input.value = "";
    output.value = "";
    showError("");
    input.focus();
  });

  $("#copyBtn").addEventListener("click", async () => {
    if (!output.value) {
      showToast("Nothing to copy yet — convert a number first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(output.value);
    } catch {
      // Fallback for older browsers / non-HTTPS pages
      output.select();
      document.execCommand("copy");
      window.getSelection().removeAllRanges();
    }
    showToast(`Copied ${output.value}`);
  });

  $("#clearHistoryBtn").addEventListener("click", () => {
    if (!history.length) return showToast("History is already empty.");
    history = [];
    storage.set(HISTORY_KEY, history);
    renderHistory();
    showToast("Conversion history cleared.");
  });

  updateLabels();
  renderHistory();
}

/* ---------- 6. ASSIGNMENT STORAGE SERVICE ----------
   All saving / loading of assignments goes through this one object.
   Right now it stores:
     • metadata (name, subject, file name, date) in localStorage
     • the file itself in the browser's IndexedDB
   Nothing leaves this browser.

   TO CONNECT A REAL BACKEND LATER, rewrite only these four functions
   using fetch(), e.g.:
     list()        → GET    /api/assignments
     add()         → POST   /api/assignments   (FormData with the file)
     remove(id)    → DELETE /api/assignments/:id
     getFileUrl()  → return the file's download URL from the server
   The UI code in section 7 does not need to change. */

const ASSIGNMENTS_KEY = "portfolio-assignments";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/** Tiny IndexedDB wrapper for storing file contents (Blobs). */
const fileStore = {
  dbPromise: null,

  open() {
    if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB not supported"));
    this.dbPromise ??= new Promise((resolve, reject) => {
      const request = indexedDB.open("portfolio-files", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("files");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return this.dbPromise;
  },

  /** Runs one request inside a transaction and resolves with its result. */
  async run(mode, action) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", mode);
      const request = action(tx.objectStore("files"));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
    });
  },

  put: (id, blob) => fileStore.run("readwrite", (store) => store.put(blob, id)),
  get: (id) => fileStore.run("readonly", (store) => store.get(id)),
  delete: (id) => fileStore.run("readwrite", (store) => store.delete(id)),
};

const AssignmentService = {
  /** Returns all assignments, newest first. */
  async list() {
    return storage.get(ASSIGNMENTS_KEY, []);
  },

  /** Saves a new assignment and its file. Returns the saved record. */
  async add({ name, subject, file }) {
    const record = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name,
      subject,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
    };
    await fileStore.put(record.id, file);
    const all = await this.list();
    storage.set(ASSIGNMENTS_KEY, [record, ...all]);
    return record;
  },

  /** Deletes an assignment and its stored file. */
  async remove(id) {
    const all = await this.list();
    storage.set(ASSIGNMENTS_KEY, all.filter((a) => a.id !== id));
    await fileStore.delete(id).catch(() => {});
  },

  /** Returns a temporary URL the browser can download the file from. */
  async getFileUrl(id) {
    const blob = await fileStore.get(id);
    return blob ? URL.createObjectURL(blob) : null;
  },
};

/* ---------- 7. ASSIGNMENT UI ---------- */
function initAssignments() {
  const form = $("#assignmentForm");
  const nameInput = $("#assignName");
  const subjectInput = $("#assignSubject");
  const fileInput = $("#assignFile");
  const dropzone = $("#dropzone");
  const fileLabel = $("#fileLabel");
  const message = $("#assignMessage");
  const list = $("#assignmentList");
  const uploadBtn = $("#uploadBtn");

  const icons = {
    file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>',
    date: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>',
  };

  /** Shows the selected file's name inside the drop zone. */
  function updateFileLabel() {
    const file = fileInput.files[0];
    fileLabel.textContent = file ? `${file.name} (${formatSize(file.size)})` : "Choose a file or drag it here";
    dropzone.classList.toggle("has-file", Boolean(file));
  }

  /** Builds one assignment card. textContent is used so user text can't inject HTML. */
  function createCard(item) {
    const li = document.createElement("li");
    li.className = "card assign-card";

    const date = new Date(item.uploadedAt).toLocaleDateString(undefined, {
      day: "numeric", month: "short", year: "numeric",
    });

    li.innerHTML = `
      <span class="assign-card__subject"></span>
      <h4></h4>
      <div class="assign-card__meta">
        <span class="meta-file">${icons.file}<span></span></span>
        <span>${icons.date}<time datetime="${item.uploadedAt}">${date}</time></span>
      </div>
      <div class="assign-card__actions">
        <button type="button" class="btn btn--outline btn--sm" data-action="download">Download</button>
        <button type="button" class="btn btn--danger btn--sm" data-action="delete">Delete</button>
      </div>`;

    $(".assign-card__subject", li).textContent = item.subject;
    $("h4", li).textContent = item.name;
    $(".meta-file > span", li).textContent = `${item.fileName} · ${formatSize(item.fileSize)}`;
    $$("button", li).forEach((btn) => {
      btn.dataset.id = item.id;
      btn.setAttribute("aria-label", `${btn.textContent} ${item.name}`);
    });
    return li;
  }

  async function render() {
    const items = await AssignmentService.list();
    list.replaceChildren(...items.map(createCard));
    $("#assignCount").textContent = items.length;
    $("#assignEmpty").hidden = items.length > 0;
  }

  /** Returns { field, error } for the first problem, or { error: "" } if the form is valid. */
  function validateForm() {
    const file = fileInput.files[0];
    if (!nameInput.value.trim()) return { field: nameInput, error: "Please enter the assignment name." };
    if (!subjectInput.value.trim()) return { field: subjectInput, error: "Please enter the subject." };
    if (!file) return { field: fileInput, error: "Please choose a file to upload." };
    if (file.size > MAX_FILE_SIZE) return { field: fileInput, error: `File is too large (${formatSize(file.size)}). Maximum is 10 MB.` };
    return { error: "" };
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    [nameInput, subjectInput].forEach((el) => el.classList.remove("is-invalid"));

    const { field, error } = validateForm();
    if (error) {
      setMessage(message, error);
      field.classList.add("is-invalid");
      field.focus();
      return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = "Saving…";
    try {
      await AssignmentService.add({
        name: nameInput.value.trim(),
        subject: subjectInput.value.trim(),
        file: fileInput.files[0],
      });
      form.reset();
      updateFileLabel();
      setMessage(message, "Assignment saved in this browser.", "success");
      await render();
    } catch (err) {
      console.error(err);
      setMessage(message, "Could not save the file. Your browser storage may be full or disabled.");
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = "Upload";
    }
  });

  // Download / Delete buttons (one listener for all cards)
  list.addEventListener("click", async (e) => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;
    const items = await AssignmentService.list();
    const item = items.find((a) => a.id === button.dataset.id);
    if (!item) return;

    if (button.dataset.action === "download") {
      const url = await AssignmentService.getFileUrl(item.id).catch(() => null);
      if (!url) return showToast("File not found in this browser's storage.");
      const link = document.createElement("a");
      link.href = url;
      link.download = item.fileName;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    if (button.dataset.action === "delete") {
      if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
      await AssignmentService.remove(item.id);
      await render();
      showToast("Assignment deleted.");
    }
  });

  // File picker + drag & drop
  fileInput.addEventListener("change", () => {
    updateFileLabel();
    setMessage(message, "");
  });
  ["dragenter", "dragover"].forEach((type) =>
    dropzone.addEventListener(type, (e) => {
      e.preventDefault();
      dropzone.classList.add("is-dragover");
    })
  );
  ["dragleave", "drop"].forEach((type) =>
    dropzone.addEventListener(type, () => dropzone.classList.remove("is-dragover"))
  );
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      updateFileLabel();
    }
  });

  render();
}

/* ---------- 8. START EVERYTHING ---------- */
document.addEventListener("DOMContentLoaded", () => {
  fillStudentDetails();
  initLoader();
  initTheme();
  initNavigation();
  initScrollReveal();
  initCoa();
  initConverter();
  initAssignments();
});
