const imgEl = document.getElementById("photo");
const locationEl = document.getElementById("location");
const yearEl = document.getElementById("year");

const prevBtn = document.querySelector(".nav-prev");
const nextBtn = document.querySelector(".nav-next");
const backBtn = document.getElementById("backBtn");

const params = new URLSearchParams(location.search);
const currentId = params.get("id");
const ctxId = params.get("ctx") || "gallery";

// 1) 현재 사진 찾기
const currentPhoto = photos.find(p => String(p.id) === String(currentId));

if (!currentPhoto) {
  // id가 잘못됐을 때 안전장치
  location.href = "./index.html";
} else {
  imgEl.src = `./images/${currentPhoto.file}`;
  imgEl.alt = `${currentPhoto.location}, ${currentPhoto.year ?? "Unknown"}`;
  locationEl.textContent = currentPhoto.location ?? "";
  yearEl.textContent = currentPhoto.year ?? "";
}

// 2) 컨텍스트(필터 결과 리스트) 기반 prev/next 만들기
let idList = photos.map(p => String(p.id)); // fallback: 전체

const savedCtx = sessionStorage.getItem(`ctx:${ctxId}`);
if (savedCtx) {
  try {
    const parsed = JSON.parse(savedCtx).map(String);
    if (Array.isArray(parsed) && parsed.length) idList = parsed;
  } catch (e) {
    // ignore, fallback 유지
  }
}

const idx = idList.indexOf(String(currentId));
const prevId = idx > 0 ? idList[idx - 1] : null;
const nextId = idx >= 0 && idx < idList.length - 1 ? idList[idx + 1] : null;

function goTo(id) {
  if (!id) return;
  location.href = `./photo.html?id=${encodeURIComponent(id)}&ctx=${encodeURIComponent(ctxId)}`;
}

prevBtn.addEventListener("click", () => goTo(prevId));
nextBtn.addEventListener("click", () => goTo(nextId));

// 끝에서 버튼 동작 막기(원하면 CSS로 disabled 처리 가능)
if (!prevId) prevBtn.style.visibility = "hidden";
if (!nextId) nextBtn.style.visibility = "hidden";

// 3) Back: 가능하면 진짜 뒤로가기(스크롤/상태 그대로 복귀)
backBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // history 길이가 있으면 뒤로(보던 위치/스크롤 복귀가 가장 정확)
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  // fallback
  location.href = "./index.html";
});
