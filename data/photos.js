const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id")); // ⭐ 문자열 → 숫자 변환

const photo = photos.find(p => p.id === id);
if (!photo) {
  console.error("Photo not found. id:", id);
  return;
}

document.getElementById("photo").src = `images/full/${photo.file}`;
document.getElementById("meta").textContent =
  `${photo.location}, ${photo.year}`;
document.getElementById("desc").textContent = photo.description;
