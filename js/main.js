const gallery = document.getElementById("gallery");

// UI elements
const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");
const panel = document.getElementById("panel");
const overlay = document.getElementById("overlay");
const resetBtn = document.getElementById("resetBtn");

// ✅ 원래 입력 순서(photos.js에서 위에 있을수록 최신)를 기억하는 맵
const originalIndex = new Map(photos.map((p, i) => [p.id, i]));

// filter state (continent는 화면에 표시 안 되고, 여기서만 사용됨)
const state = {
  year: "all",   // "2020s" | "2010s" | "2000s" | "1990s" | "all"
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
    img.alt = `${photo.location}, ${photo.year}`;
    img.loading = "lazy";

    link.appendChild(img);
    gallery.appendChild(link);
  });
}

function applyFilters() {
  let items = [...photos];

  // YEAR filter (decade)
  if (state.year !== "all") {
    items = items.filter(p => decadeFromYear(p.year) === state.year);
  }

  // PLACE filter (continent)
  if (state.place !== "all") {
    items = items.filter(p => p.continent === state.place);
  }

  // ✅ SORT (year 기준 + 같은 year면 "원래 입력 순서"로 안정 정렬)
  items.sort((a, b) => {
    const ia = originalIndex.get(a.id) ?? 0;
    const ib = originalIndex.get(b.id) ?? 0;

    if (state.sort === "latest") {
      // 최신: 연도 큰 게 먼저
      if (b.year !== a.year) return b.year - a.year;
      // 같은 연도면: photos.js에서 위(더 최신으로 둔 것) 먼저
      return ia - ib;
    } else {
      // 올드: 연도 작은 게 먼저
      if (a.year !== b.year) return a.year - b.year;
      // 같은 연도면: photos.js에서 아래(더 오래된 쪽) 먼저 = 반전
      return ib - ia;
    }
  });

  render(items);
}

// ---------- event wiring ----------
menuBtn.addEventListener("click", openPanel);
closeBtn.addEventListener("click", closePanel);
overlay.addEventListener("click", closePanel);

// chips (YEAR / PLACE / SORT)
document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    const y = btn.getAttribute("data-year");
    const p = btn.getAttribute("data-place");
    const s = btn.getAttribute("data-sort");

    if (y) state.year = y;
    if (p) state.place = p;
    if (s) state.sort = s;

    // 선택된 버튼 스타일 업데이트
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

  // 기본값 버튼 시각적으로 표시
  const latestBtn = document.querySelector('.chip[data-sort="latest"]');
  if (latestBtn) latestBtn.classList.add("active");

  applyFilters();
});

// init
const latestBtn = document.querySelector('.chip[data-sort="latest"]');
if (latestBtn) latestBtn.classList.add("active");

applyFilters();
