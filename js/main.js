const gallery = document.getElementById("gallery");

photos.forEach(photo => {
  const link = document.createElement("a");
  link.href = `photo.html?id=${photo.id}`;

  const img = document.createElement("img");
  img.src = `images/thumbs/${photo.file}`;  // JPG
  img.alt = `${photo.location}, ${photo.year}`;
  img.loading = "lazy";

  link.appendChild(img);
  gallery.appendChild(link);
});
