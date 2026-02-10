const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const photo = photos.find(p => p.id === id);

if (photo) {
  document.getElementById("photo").src = `./images/full/${photo.file}`;
  document.getElementById("location").textContent = photo.location;
  document.getElementById("year").textContent = photo.year;
} else {
  console.error("Photo not found:", id);
  document.getElementById("location").textContent = "Photo not found";
  document.getElementById("year").textContent = "";
}
