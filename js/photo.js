const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const photo = photos.find(p => p.id === id);
if (!photo) return;

document.getElementById("photo").src = `images/full/${photo.file}`;  // JPG
document.getElementById("meta").textContent =
  `${photo.location}, ${photo.year}`;
document.getElementById("desc").textContent = photo.description;
