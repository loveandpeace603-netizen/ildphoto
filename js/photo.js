const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const index = photos.findIndex(p => p.id === id);
const photo = index >= 0 ? photos[index] : null;

const imgEl = document.getElementById("photo");
const locEl = document.getElementById("location");
const yearEl = document.getElementById("year");

if (!photo) {
  console.error("Photo not found:", id);
} else {
  imgEl.src = `./images/full/${photo.file}`;
  imgEl.alt = `${photo.location}${photo.year ? `, ${photo.year}` : ""}`;

  locEl.textContent = photo.location;
  yearEl.textContent = (photo.year !== null && photo.year !== undefined) ? String(photo.year) : "";
}

// 이전 / 다음 버튼
const prevBtn = document.querySelector(".nav-prev");
const nextBtn = document.querySelector(".nav-next");

// photo를 못 찾았으면 버튼 둘 다 숨김
if (!photo || index < 0) {
  if (prevBtn) prevBtn.style.display = "none";
  if (nextBtn) nextBtn.style.display = "none";
} else {
  if (prevBtn) {
    if (index <= 0) prevBtn.style.display = "none";
    else prevBtn.onclick = () => (window.location.href = `photo.html?id=${photos[index - 1].id}`);
  }

  if (nextBtn) {
    if (index >= photos.length - 1) nextBtn.style.display = "none";
    else nextBtn.onclick = () => (window.location.href = `photo.html?id=${photos[index + 1].id}`);
  }
}

// 키보드 네비게이션
document.addEventListener("keydown", (e) => {
  if (!photo || index < 0) return;

  if (e.key === "ArrowLeft" && index > 0) {
    window.location.href = `photo.html?id=${photos[index - 1].id}`;
  }
  if (e.key === "ArrowRight" && index < photos.length - 1) {
    window.location.href = `photo.html?id=${photos[index + 1].id}`;
  }
  if (e.key === "Escape") {
    window.location.href = "index.html";
  }
});
