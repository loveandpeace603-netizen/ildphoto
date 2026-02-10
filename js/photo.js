const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const index = photos.findIndex(p => p.id === id);
const photo = photos[index];

if (!photo) {
  console.error("Photo not found:", id);
} else {
  // 이미지 & 메타
  document.getElementById("photo").src = `./images/full/${photo.file}`;
  document.getElementById("location").textContent = photo.location;
  document.getElementById("year").textContent = photo.year;
}

// 이전 / 다음 버튼
const prevBtn = document.querySelector(".nav-prev");
const nextBtn = document.querySelector(".nav-next");

if (index <= 0) {
  prevBtn.style.display = "none";
} else {
  prevBtn.onclick = () => {
    window.location.href = `photo.html?id=${photos[index - 1].id}`;
  };
}

if (index >= photos.length - 1) {
  nextBtn.style.display = "none";
} else {
  nextBtn.onclick = () => {
    window.location.href = `photo.html?id=${photos[index + 1].id}`;
  };
}

// 키보드 네비게이션
document.addEventListener("keydown", (e) => {
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
