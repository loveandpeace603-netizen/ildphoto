const params = new URLSearchParams(window.location.search);
const id = params.get("id"); // id = "p001"

const photo = photos.find(p => p.id === id);

if (photo) {
  document.getElementById("photo").src = `./images/full/${photo.file}`;
  document.getElementById("meta").textContent =
    `${photo.location}, ${photo.year}`;
  document.getElementById("desc").textContent = photo.description;
} else {
  console.error("Photo not found:", id);
  document.getElementById("meta").textContent = "Photo not found";
}
