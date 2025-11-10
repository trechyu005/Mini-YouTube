const API_KEY = "AIzaSyApydf3bxLi7nmZJ6T00sZU5xYKHjsW8yo"; // Ganti dengan API key kamu
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const videoContainer = document.getElementById("videoContainer");
const themeToggle = document.getElementById("themeToggle");
const favToggle = document.getElementById("favToggle");
const sectionTitle = document.getElementById("sectionTitle");
const backBtn = document.getElementById("backBtn");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let showingFavorites = false;
let showingChannel = false;

// 🔎 Cari video
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    searchYouTube(query);
    showingFavorites = false;
    showingChannel = false;
    sectionTitle.textContent = "Hasil Pencarian";
    backBtn.style.display = "none";
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// 🌗 Ganti tema
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light") ? "🌞" : "🌙";
});

// ❤️ Toggle favorit
favToggle.addEventListener("click", () => {
  showingFavorites = !showingFavorites;
  showingChannel = false;
  sectionTitle.textContent = showingFavorites ? "❤️ Video Favorit" : "Hasil Pencarian";
  backBtn.style.display = showingFavorites ? "none" : "none";
  if (showingFavorites) displayVideos(favorites, true);
});

// 🔙 Tombol kembali
backBtn.addEventListener("click", () => {
  showingChannel = false;
  backBtn.style.display = "none";
  sectionTitle.textContent = "Hasil Pencarian";
  videoContainer.innerHTML = "";
});

// 🔍 Pencarian video
async function searchYouTube(query) {
  videoContainer.innerHTML = "🔍 Mencari video...";
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(query)}&key=${API_KEY}`
    );
    const data = await res.json();
    if (data.items) displayVideos(data.items, false);
    else videoContainer.innerHTML = "⚠️ Tidak ada video ditemukan.";
  } catch (err) {
    videoContainer.innerHTML = "❌ Gagal memuat video.";
    console.error(err);
  }
}

// 📺 Tampilkan video
function displayVideos(videos, isFavoriteView) {
  videoContainer.innerHTML = "";

  if (videos.length === 0) {
    videoContainer.innerHTML = "😕 Belum ada video favorit.";
    return;
  }

  videos.forEach((item) => {
    const videoId = item.id.videoId || item.videoId;
    const title = item.snippet.title;
    const channelId = item.snippet.channelId;
    const channelTitle = item.snippet.channelTitle;

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.allowFullscreen = true;

    const titleEl = document.createElement("p");
    titleEl.textContent = title;
    titleEl.classList.add("video-title");

    const channelEl = document.createElement("p");
    channelEl.textContent = channelTitle;
    channelEl.classList.add("channel-name");
    channelEl.onclick = () => openChannel(channelId, channelTitle);

    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.textContent = "⛶ Fullscreen";
    fullscreenBtn.classList.add("fullscreen-btn");
    fullscreenBtn.onclick = () => iframe.requestFullscreen();

    const favBtn = document.createElement("button");
    favBtn.textContent = isFavoriteView ? "💔 Hapus" : "❤️ Simpan";
    favBtn.classList.add("favorite-btn");
    favBtn.onclick = () => toggleFavorite(videoId, item, isFavoriteView);

    const actions = document.createElement("div");
    actions.classList.add("video-actions");
    actions.appendChild(fullscreenBtn);
    actions.appendChild(favBtn);

    const div = document.createElement("div");
    div.classList.add("video-box");
    div.appendChild(iframe);
    div.appendChild(titleEl);
    div.appendChild(channelEl);
    div.appendChild(actions);

    videoContainer.appendChild(div);
  });
}

// 💾 Simpan / hapus favorit
function toggleFavorite(videoId, videoData, isFavoriteView) {
  if (isFavoriteView) {
    favorites = favorites.filter((v) => v.videoId !== videoId && v.id.videoId !== videoId);
  } else {
    if (!favorites.some((v) => v.videoId === videoId || v.id.videoId === videoId)) {
      favorites.push(videoData);
    }
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  if (showingFavorites) displayVideos(favorites, true);
}

// 📺 Buka channel
async function openChannel(channelId, channelTitle) {
  showingChannel = true;
  backBtn.style.display = "block";
  sectionTitle.textContent = `📺 ${channelTitle}`;

  videoContainer.innerHTML = "📡 Memuat video channel...";

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=6&type=video&key=${API_KEY}`
    );
    const data = await res.json();
    displayVideos(data.items, false);
  } catch (err) {
    videoContainer.innerHTML = "❌ Gagal memuat video channel.";
    console.error(err);
  }
}