const gallery = document.getElementById("gallery");

// UI elements
const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");
const panel = document.getElementById("panel");
const overlay = document.getElementById("overlay");
const resetBtn = document.getElementById("resetBtn");

// ✅ 원래 입력 순서(photos.js에서 위에 있을수록 최신)를 기억하는 맵
const originalIndex = new Map(photos.map((p, i) => [p.id, i]));

// filter state
const state = {
  year: "all",   // "2020s" | "2010s" | "2000s" | "1990s" | "gifted" | "all"
  place: "all",  // "Asia" | ... | "all"
  sort: "latest" // "latest" | "oldest"
};

// ---------- helpers ----------
function decadeFromYear(year) {
  if (year >= 2020) return "2020s";
  if (year >= 2010) return "2010s";
  if (year >= 2000) return "2000s";
  if (year >= 1990) return "1990s";
  return "older";
}

function openPanel() {
  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
}

function closePanel() {
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
}

// ---------- render ----------
function render(items) {
  gallery.innerHTML = "";

  items.forEach((photo) => {
    const link = document.createElement("a");
    link.href = `./photo.html?id=${photo.id}`;
    link.className = "thumb";

    const img = document.createElement("img");
    img.src = `./images/thumbs/${photo.file}`;
    img.alt = `${photo.location}, ${photo.year ?? "Unknown"}`;
    img.loading = "lazy";

    link.appendChild(img);
    gallery.appendChild(link);
  });
}

// ---------- filter + sort ----------
function applyFilters() {
  let items = [...photos];

  // YEAR filter (decade + gifted)
  if (state.year === "gifted") {
    items = items.filter(p => p.gifted === true || p.year === null);
  } else if (state.year !== "all") {
    items = items.filter(p => p.year !== null && decadeFromYear(p.year) === state.year);
  }

  // PLACE filter
  if (state.place !== "all") {
    items = items.filter(p => p.continent === state.place);
  }

  // SORT (year null은 항상 맨 뒤 + 같은 year면 입력순서 유지)
  items.sort((a, b) => {
    const ay = a.year;
    const by = b.year;

    const aUnknown = (ay === null || ay === undefined);
    const bUnknown = (by === null || by === undefined);

    // unknown year → 항상 뒤
    if (aUnknown && !bUnknown) return 1;
    if (!aUnknown && bUnknown) return -1;

    const ia = originalIndex.get(a.id) ?? 0;
    const ib = originalIndex.get(b.id) ?? 0;

    // 둘 다 year 있음
    if (!aUnknown && !bUnknown) {
      if (state.sort === "latest") {
        if (by !== ay) return by - ay;
        return ia - ib;
      } else {
        if (ay !== by) return ay - by;
        return ib - ia;
      }
    }

    // 둘 다 unknown → 입력순 유지
    return ia - ib;
  });

  render(items);
}

// ---------- event wiring ----------
menuBtn.addEventListener("click", openPanel);
closeBtn.addEventListener("click", closePanel);
overlay.addEventListener("click", closePanel);

// chips
document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    const y = btn.getAttribute("data-year");
    const p = btn.getAttribute("data-place");
    const s = btn.getAttribute("data-sort");

    if (y) state.year = y;
    if (p) state.place = p;
    if (s) state.sort = s;

    if (y) {
      document.querySelectorAll(".chip[data-year]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }
    if (p) {
      document.querySelectorAll(".chip[data-place]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }
    if (s) {
      document.querySelectorAll(".chip[data-sort]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }

    applyFilters();
  });
});

resetBtn.addEventListener("click", () => {
  state.year = "all";
  state.place = "all";
  state.sort = "latest";

  document.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));

  const latestBtn = document.querySelector('.chip[data-sort="latest"]');
  if (latestBtn) latestBtn.classList.add("active");

  applyFilters();
});

// init
const latestBtn = document.querySelector('.chip[data-sort="latest"]');
if (latestBtn) latestBtn.classList.add("active");

applyFilters();
