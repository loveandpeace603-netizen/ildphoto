const gallery = document.getElementById("gallery");

// UI elements
const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");
const panel = document.getElementById("panel");
const overlay = document.getElementById("overlay");
const resetBtn = document.getElementById("resetBtn");

const STORAGE_KEY = "ild_view";
const MOBILE_QUERY = window.matchMedia("(max-width: 768px)");

// 원래 입력 순서(photos.js에서 위에 있을수록 최신) 기억
const originalIndex = new Map(photos.map((p, i) => [p.id, i]));

// filter state
const state = {
  year: "all",     // "2020s" | "2010s" | "2000s" | "1990s" | "gifted" | "all"
  place: "all",    // "Asia" | ... | "all"
  sort: "latest"   // "latest" | "oldest"
};

// ---------- helpers ----------
function isMobile() {
  return MOBILE_QUERY.matches;
}

function lockBodyScroll() {
  document.body.style.overflow = "hidden";
}

function unlockBodyScroll() {
  document.body.style.overflow = "";
}

function decadeFromYear(year) {
  if (year >= 2020) return "2020s";
  if (year >= 2010) return "2010s";
  if (year >= 2000) return "2000s";
  if (year >= 1990) return "1990s";
  return "older";
}

function openPanel() {
  if (!panel) return;

  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");

  if (overlay) overlay.hidden = false;
  if (isMobile()) lockBodyScroll();
}

function closePanel() {
  if (!panel) return;

  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");

  if (overlay) overlay.hidden = true;
  unlockBodyScroll();
}

function saveView(items) {
  const payload = {
    state: { ...state },
    ids: items.map((p) => p.id),
    scrollY: window.scrollY
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadView() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setActiveChip(attr, value) {
  document
    .querySelectorAll(`.chip[${attr}]`)
    .forEach((b) => b.classList.remove("active"));

  const safe =
    window.CSS && CSS.escape
      ? CSS.escape(value)
      : value.replace(/"/g, '\\"');

  const btn = document.querySelector(`.chip[${attr}="${safe}"]`);
  if (btn) btn.classList.add("active");
}

// ---------- core ----------
function getFilteredItems() {
  let items = [...photos];

  // YEAR: gifted / decade
  if (state.year === "gifted") {
    items = items.filter(
      (p) => p.gifted === true || p.year === null || p.year === undefined
    );
  } else if (state.year !== "all") {
    items = items.filter(
      (p) =>
        p.year !== null &&
        p.year !== undefined &&
        decadeFromYear(p.year) === state.year
    );
  }

  // PLACE: continent (string or array)
  if (state.place !== "all") {
    items = items.filter((p) =>
      Array.isArray(p.continent)
        ? p.continent.includes(state.place)
        : p.continent === state.place
    );
  }

  // SORT: unknown year는 항상 뒤로, year 같으면 입력 순서로 안정 정렬
  items.sort((a, b) => {
    const ay = a.year;
    const by = b.year;

    const aUnknown = ay === null || ay === undefined;
    const bUnknown = by === null || by === undefined;

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

    // 둘 다 unknown이면 입력 순서
    return (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0);
  });

  return items;
}

function render(items) {
  if (!gallery) return;

  gallery.innerHTML = "";

  items.forEach((photo) => {
    const link = document.createElement("a");
    link.href = `./photo.html?id=${photo.id}`;
    link.className = "thumb";

    // 디테일에서 "현재 목록 기준 prev/next + back 복귀"를 위해 저장
    link.addEventListener("click", () => {
      saveView(items);
    });

    const img = document.createElement("img");
    img.src = `./images/thumbs/${photo.file}`;
    img.alt = `${photo.location}${photo.year ? `, ${photo.year}` : ""}`;
    img.loading = "lazy";
    img.decoding = "async";

    link.appendChild(img);
    gallery.appendChild(link);
  });
}

function applyAndRender({ restoreScroll = false } = {}) {
  const items = getFilteredItems();
  render(items);

  if (restoreScroll) {
    const view = loadView();
    if (view && typeof view.scrollY === "number") {
      window.scrollTo(0, view.scrollY);
    }
  }
}

// ---------- events ----------
menuBtn?.addEventListener("click", openPanel);
closeBtn?.addEventListener("click", closePanel);
overlay?.addEventListener("click", closePanel);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePanel();
});

document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    const y = btn.getAttribute("data-year");
    const p = btn.getAttribute("data-place");
    const s = btn.getAttribute("data-sort");

    if (y) state.year = y;
    if (p) state.place = p;
    if (s) state.sort = s;

    // active UI
    if (y) setActiveChip("data-year", y);
    if (p) setActiveChip("data-place", p);
    if (s) setActiveChip("data-sort", s);

    applyAndRender();

    // 모바일에서는 선택 후 패널 자동 닫기
    if (isMobile()) closePanel();
  });
});

resetBtn?.addEventListener("click", () => {
  state.year = "all";
  state.place = "all";
  state.sort = "latest";

  document.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
  setActiveChip("data-sort", "latest");

  applyAndRender();

  if (isMobile()) closePanel();
});

// 스크롤 이동시 현재 위치 계속 저장(뒤로 갔을 때 정확히 복귀)
let scrollSaveTicking = false;

window.addEventListener(
  "scroll",
  () => {
    const view = loadView();
    if (!view) return;

    if (scrollSaveTicking) return;

    scrollSaveTicking = true;
    window.requestAnimationFrame(() => {
      view.scrollY = window.scrollY;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(view));
      scrollSaveTicking = false;
    });
  },
  { passive: true }
);

// ---------- init ----------
(function init() {
  const view = loadView();

  if (view?.state) {
    state.year = view.state.year ?? "all";
    state.place = view.state.place ?? "all";
    state.sort = view.state.sort ?? "latest";
  }

  // active UI 복구
  setActiveChip("data-sort", state.sort);
  if (state.year !== "all") setActiveChip("data-year", state.year);
  if (state.place !== "all") setActiveChip("data-place", state.place);

  applyAndRender({ restoreScroll: true });
})();

/* =========================
   MOBILE SWIPE FOR DETAIL PAGE
   ========================= */
(function () {
  const detailArea =
    document.querySelector(".detail-scroll") ||
    document.querySelector(".detail-center") ||
    document.querySelector(".detail-page");

  const prevBtn = document.querySelector(".nav-prev");
  const nextBtn = document.querySelector(".nav-next");

  if (!detailArea || (!prevBtn && !nextBtn)) return;

  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let deltaY = 0;
  let isTouching = false;

  const SWIPE_THRESHOLD = 56;
  const VERTICAL_LIMIT = 44;

  function isInteractiveTarget(target) {
    return !!target.closest("a, button, input, textarea, select");
  }

  detailArea.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      if (isInteractiveTarget(e.target)) return;

      isTouching = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      deltaX = 0;
      deltaY = 0;
    },
    { passive: true }
  );

  detailArea.addEventListener(
    "touchmove",
    (e) => {
      if (!isTouching || !e.touches || e.touches.length !== 1) return;

      deltaX = e.touches[0].clientX - startX;
      deltaY = e.touches[0].clientY - startY;
    },
    { passive: true }
  );

  detailArea.addEventListener(
    "touchend",
    () => {
      if (!isTouching) return;
      isTouching = false;

      // 세로 스크롤이면 무시
      if (Math.abs(deltaY) > VERTICAL_LIMIT) return;

      // 좌우 스와이프가 충분히 명확할 때만 작동
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;

      // 오른쪽으로 밀기 = 이전
      if (deltaX > 0 && prevBtn) {
        prevBtn.click();
        return;
      }

      // 왼쪽으로 밀기 = 다음
      if (deltaX < 0 && nextBtn) {
        nextBtn.click();
      }
    },
    { passive: true }
  );
})();
