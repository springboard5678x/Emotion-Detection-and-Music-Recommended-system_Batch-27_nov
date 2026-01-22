// HERO SLIDER
const slides = document.querySelectorAll(".hero-slide");
let index = 0;

function showSlide(i) {
  slides.forEach(slide => {
    slide.classList.remove("active");
    // Reset animations
    slide.querySelectorAll(".fade-up").forEach(el => {
      el.style.animation = "none";
      el.offsetHeight; // trigger reflow
      el.style.animation = "";
    });
  });
  slides[i].classList.add("active");
}

setInterval(() => {
  index = (index + 1) % slides.length;
  showSlide(index);
}, 5000);

// HOME QUOTE FADE-UP ON SCROLL
const homeQuote = document.querySelector(".home-quote");
window.addEventListener("scroll", () => {
  const pos = homeQuote.getBoundingClientRect().top;
  if (pos < window.innerHeight - 150) {
    homeQuote.classList.add("show");
  }
});

// ==================== DETECT MY MOOD ====================
const API_URL = "http://localhost:7860/predict_emotion";

const video = document.getElementById("webcam");
const canvas = document.getElementById("webcamCanvas");
const startCamBtn = document.getElementById("startCamBtn");
const imageInput = document.getElementById("imageInput");
const emotionText = document.getElementById("emotionText");
const songsList = document.getElementById("songsList");

let detecting = false;
let intervalId = null;

// Start webcam on button click
startCamBtn.addEventListener("click", () => {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.hidden = false;
      startCamBtn.style.display = "none";

      video.onloadedmetadata = () => {
        // auto detect every 5 sec
        intervalId = setInterval(() => {
          if (!detecting) captureFromWebcam();
        }, 5000);
      };
    })
    .catch(err => {
      console.error("Camera error:", err);
      alert("Camera permission denied");
    });
});

// Capture frame from webcam
function captureFromWebcam() {
  detecting = true;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const imageBase64 = canvas.toDataURL("image/jpeg");
  sendImage(imageBase64);
}

// Upload image
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => sendImage(reader.result);
  reader.readAsDataURL(file);
});

// Send image to backend
function sendImage(imageBase64) {
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageBase64 })
  })
  .then(res => res.json())
  .then(data => {
    detecting = false;
    showResult(data);
  })
  .catch(err => {
    console.error(err);
    detecting = false;
  });
}

// Show result + songs
function showResult(data) {
  emotionText.innerText = `Mood detected: ${data.emotion || "Unknown"}`;
  songsList.innerHTML = "";

  if (data.songs && data.songs.length) {
    data.songs.forEach(song => {
      const div = document.createElement("div");
      div.className = "song-row";
      div.innerHTML = `
        <div class="song-left">
          <img src="https://placehold.co/50x50" />
          <div class="song-info">
            <h5>${song.title}</h5>
            <p>${song.artist}</p>
          </div>
        </div>
        <a href="${song.spotify_url}" target="_blank" class="play-btn">
          <i class="fa-brands fa-spotify"></i>
        </a>
      `;
      songsList.appendChild(div);
    });
  }
}


// ------------------ TEXT TO EMOTION ------------------
const textMoodInput = document.getElementById("textMoodInput");
const textMoodBtn = document.getElementById("textMoodBtn");
const textEmotionText = document.getElementById("textEmotionText");
const textSongsList = document.getElementById("textSongsList");

const TEXT_API_URL = "http://localhost:7860/text_mood";

textMoodBtn.addEventListener("click", () => {
  const text = textMoodInput.value.trim();
  if (!text) return alert("Please type how you feel");

  fetch(TEXT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text })
  })
    .then(res => res.json())
    .then(data => {
      textEmotionText.innerText = `Detected Mood: ${text}`;
      renderTextSongs(data.songs);
    })
    .catch(err => console.error(err));
});

function renderTextSongs(songs) {
  textSongsList.innerHTML = "";
  if (!songs || songs.length === 0) return;

  songs.forEach(song => {
    const div = document.createElement("div");
    div.className = "song-row";

    div.innerHTML = `
      <div class="song-left">
        <img src="https://placehold.co/50x50" alt="album cover" />
        <div class="song-info">
          <h5>${song.title}</h5>
          <p>${song.artist}</p>
        </div>
      </div>
      <a href="${song.spotify_url}" target="_blank" class="play-btn">
        <i class="fa-brands fa-spotify"></i>
      </a>
    `;
    textSongsList.appendChild(div);
  });
}
