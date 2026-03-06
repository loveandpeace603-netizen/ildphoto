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

const photo = photos.find(p => p.id === id);

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
    (photo.year !== null && photo.year !== undefined) ? String(photo.year) : "";
}

// ✅ extras (city photos)
const extrasWrap = document.getElementById("extras");
const extrasGrid = document.getElementById("extrasGrid");

if (photo?.extras && Array.isArray(photo.extras) && photo.extras.length > 0) {
  extrasWrap.hidden = false;

  photo.extras.forEach((fname) => {
    const img = document.createElement("img");
    img.src = `./images/extras/${fname}`;
    img.alt = `${photo.location} extra photo`;
    img.loading = "lazy";
    extrasGrid.appendChild(img);
  });
} else if (extrasWrap) {
  extrasWrap.hidden = true;
}

// ✅ 현재 필터된 목록 ids 가져오기
const view = loadView();
const ids = Array.isArray(view?.ids) && view.ids.length
  ? view.ids
  : photos.map(p => p.id);

const currentIndex = ids.indexOf(id);

const prevBtn = document.querySelector(".nav-prev");
const nextBtn = document.querySelector(".nav-next");

function goTo(idx) {
  window.location.href = `photo.html?id=${ids[idx]}`;
}

if (!prevBtn || !nextBtn || currentIndex === -1) {
  if (prevBtn) prevBtn.style.display = "none";
  if (nextBtn) nextBtn.style.display = "none";
} else {
  if (currentIndex <= 0) prevBtn.style.display = "none";
  else prevBtn.onclick = () => goTo(currentIndex - 1);

  if (currentIndex >= ids.length - 1) nextBtn.style.display = "none";
  else nextBtn.onclick = () => goTo(currentIndex + 1);
}

// 키보드 네비게이션
document.addEventListener("keydown", (e) => {
  if (currentIndex === -1) return;

  if (e.key === "ArrowLeft" && currentIndex > 0) goTo(currentIndex - 1);
  if (e.key === "ArrowRight" && currentIndex < ids.length - 1) goTo(currentIndex + 1);
  if (e.key === "Escape") window.location.href = "index.html";
});

// 뒤로가기(←): index로 이동하면 main.js가 상태/스크롤 복구
const backLink = document.querySelector(".nav-back");
if (backLink) {
  backLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "index.html";
  });
}
