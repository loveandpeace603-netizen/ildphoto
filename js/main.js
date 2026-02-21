const gallery = document.getElementById("gallery");

// UI elements
const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");
const panel = document.getElementById("panel");
const overlay = document.getElementById("overlay");
const resetBtn = document.getElementById("resetBtn");

// 원래 입력 순서(photos.js에서 위에 있을수록 최신) 기억
const originalIndex = new Map(photos.map((p, i) => [p.id, i]));

const state = {
  year: "all",     // "2020s" | "2010s" | "2000s" | "1990s" | "gifted" | "all"
  place: "all",    // "Asia" | ... | "all"
  sort: "latest"   // "latest" | "oldest"
};

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

function render(items) {
  gallery.innerHTML = "";

  items.forEach((photo) => {
    const link = document.createElement("a");
    link.href = `./photo.html?id=${photo.id}`;
    link.className = "thumb";

    const img = document.createElement("img");
    img.src = `./images/thumbs/${photo.file}`;
    img.alt = `${photo.location}, ${photo.year ?? ""}`;
    img.loading = "lazy";

    link.appendChild(img);
    gallery.appendChild(link);
  });
}

function applyFilters() {
  let items = [...photos];

  // YEAR: gifted / decade
  if (state.year === "gifted") {
    items = items.filter(p => p.gifted === true || p.year === null || p.year === undefined);
  } else if (state.year !== "all") {
    items = items.filter(p => p.year !== null && p.year !== undefined && decadeFromYear(p.year) === state.year);
  }

  // PLACE: continent (string or array)
  if (state.place !== "all") {
    items = items.filter(p =>
      Array.isArray(p.continent) ? p.continent.includes(state.place) : p.continent === state.place
    );
  }

  // SORT: unknown year는 항상 뒤로, year 같으면 입력 순서로 안정 정렬
  items.sort((a, b) => {
    const ay = a.year;
    const by = b.year;

    const aUnknown = (ay === null || ay === undefined);
    const bUnknown = (by === null || by === undefined);

    if (aUnknown && !bUnknown) return 1;
    if (!aUnknown && bUnknown) return -1;

    if (!aUnknown && !bUnknown) {
      if (state.sort === "latest") {
        if (by !== ay) return by - ay;
        return (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0);
      } else {
        if (ay !== by) return ay - by;
        return (originalIndex.get(b.id) ?? 0) - (originalIndex.get(a.id) ?? 0);
      }
    }

    // 둘 다 unknown이면 입력 순서로만
    return (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0);
  });

  render(items);
}

menuBtn?.addEventListener("click", openPanel);
closeBtn?.addEventListener("click", closePanel);
overlay?.addEventListener("click", closePanel);

document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    const y = btn.getAttribute("data-year");
    const p = btn.getAttribute("data-place");
    const s = btn.getAttribute("data-sort");

    if (y) state.year = y;
    if (p) state.place = p;
    if (s) state.sort = s;

    // active 표시 업데이트
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

resetBtn?.addEventListener("click", () => {
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
