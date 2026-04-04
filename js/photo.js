const STORAGE_KEY = "ild_view";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

function loadView() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const photo = photos.find((p) => p.id === id);

const imgEl = document.getElementById("photo");
const locEl = document.getElementById("location");
const yearEl = document.getElementById("year");

if (!photo) {
  console.error("Photo not found:", id);
} else {
  imgEl.src = `./images/full/${photo.file}`;
  imgEl.alt = `${photo.location}${photo.year ? `, ${photo.year}` : ""}`;
  locEl.textContent = photo.location;
  yearEl.textContent =
    photo.year !== null && photo.year !== undefined ? String(photo.year) : "";
}

/* extras (city photos) + scroll hint */
const extrasWrap = document.getElementById("extras");
const extrasGrid = document.getElementById("extrasGrid");
const detailHint = document.getElementById("detailHint");

if (photo?.extras && Array.isArray(photo.extras) && photo.extras.length > 0) {
  if (extrasWrap) extrasWrap.hidden = false;
  if (detailHint) detailHint.hidden = false;

  photo.extras.forEach((fname) => {
    const img = document.createElement("img");
    img.src = `./images/extras/${fname}`;
    img.alt = `${photo.location} extra photo`;
    img.loading = "lazy";
    img.decoding = "async";
    extrasGrid?.appendChild(img);
  });
} else {
  if (extrasWrap) extrasWrap.hidden = true;
  if (detailHint) detailHint.hidden = true;
}

/* 현재 필터된 목록 ids 가져오기 */
const view = loadView();
const ids =
  Array.isArray(view?.ids) && view.ids.length
    ? view.ids
    : photos.map((p) => p.id);

const currentIndex = ids.indexOf(id);

const prevBtn = document.querySelector(".nav-prev");
const nextBtn = document.querySelector(".nav-next");
const backLink = document.querySelector(".nav-back");

function goTo(idx) {
  if (idx < 0 || idx >= ids.length) return;
  window.location.href = `photo.html?id=${ids[idx]}`;
}

function goPrev() {
  if (currentIndex > 0) goTo(currentIndex - 1);
}

function goNext() {
  if (currentIndex !== -1 && currentIndex < ids.length - 1) goTo(currentIndex + 1);
}

function goBack() {
  window.location.href = "index.html";
}

/* nav button setup */
if (!prevBtn || !nextBtn || currentIndex === -1) {
  if (prevBtn) prevBtn.style.display = "none";
  if (nextBtn) nextBtn.style.display = "none";
} else {
  if (currentIndex <= 0) {
    prevBtn.style.display = "none";
  } else {
    prevBtn.addEventListener("click", goPrev);
  }

  if (currentIndex >= ids.length - 1) {
    nextBtn.style.display = "none";
  } else {
    nextBtn.addEventListener("click", goNext);
  }
}

/* keyboard navigation */
document.addEventListener("keydown", (e) => {
  if (currentIndex === -1) return;

  if (e.key === "ArrowLeft" && currentIndex > 0) goPrev();
  if (e.key === "ArrowRight" && currentIndex < ids.length - 1) goNext();
  if (e.key === "Escape") goBack();
});

/* back link */
if (backLink) {
  backLink.addEventListener("click", (e) => {
    e.preventDefault();
    goBack();
  });
}

/* =========================
   MOBILE SWIPE FOR DETAIL PAGE
   ========================= */
(function () {
  const detailArea =
    document.querySelector(".detail-scroll") ||
    document.querySelector(".detail-center") ||
    document.querySelector(".detail-page");

  if (!detailArea || currentIndex === -1) return;

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

      if (Math.abs(deltaY) > VERTICAL_LIMIT) return;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;

      if (deltaX > 0 && currentIndex > 0) {
        goPrev();
        return;
      }

      if (deltaX < 0 && currentIndex < ids.length - 1) {
        goNext();
      }
    },
    { passive: true }
  );
})();
