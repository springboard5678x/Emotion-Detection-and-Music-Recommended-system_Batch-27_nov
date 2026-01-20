// js/app.js

const emotionLabel = document.getElementById('emotion-label');
const botBubble = document.getElementById('bot-bubble');
const botMouth = document.getElementById('bot-mouth');
const songTitle = document.getElementById('song-title');
const songVibe = document.getElementById('song-vibe');
const moodTrend = document.getElementById('mood-trend');
const spotifyContainer = document.getElementById('spotify-player-container');
const npArtwork = document.getElementById('np-artwork');
const TRACKS_KEY = 'moodmate_tracks';
const SESSIONS_KEY = 'moodmate_sessions';


let currentSessionName = localStorage.getItem('current_session_name') || 'Untitled Session';



let currentSpotifyId = "";
let previousEmotion = "";
let currentMode = "match"; // default
let songHistory = [];
let historyIndex = -1;
let sessionHistory = [];
let sessionStartTime = Date.now();
let playlistQueue = JSON.parse(localStorage.getItem('moodmate_queue')) || [];

// Map emotions to colors and bot expressions
const emotionConfig = {
    'Happy': { color: '#A8E6CF', trend: '↑ Positive', mouth: 'M70 130 Q100 170 130 130' },
    'Sad': { color: '#89B4FF', trend: '↓ Low Energy', mouth: 'M70 140 Q100 160 130 140' },
    'Angry': { color: '#FF6B6B', trend: '⚡ High Stress', mouth: 'M70 140 L130 140' },
    'Fear': { color: '#FF9EAA', trend: '😨 Anxious', mouth: 'M70 130 Q100 150 130 130' },
    'Disgust': { color: '#DDA0DD', trend: '😬 Tense', mouth: 'M70 135 L130 135' },
    'Surprise': { color: '#FFB347', trend: '😲 Alert', mouth: 'M80 120 Q100 150 120 120' },
    'Neutral': { color: '#E0E0E0', trend: '→ Steady', mouth: 'M80 130 L120 130' }
};

window.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('moodmate_user_name');
    if (!user) {
        // If not logged in, kick them back to the login page
        window.location.href = "login.html";
    }
});

// Mode Switch Handler
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        console.log("Mode changed to:", currentMode);
        // Force refresh recommendation on mode change
        fetchRecommendation();
    });
});

document.getElementById('current-session-name').textContent = currentSessionName;
// Rename button
document.getElementById('rename-session-btn').addEventListener('click', () => {
    const newName = prompt('Enter a name for this session:', currentSessionName);
    if (newName && newName.trim() !== '') {
        currentSessionName = newName.trim();
        document.getElementById('current-session-name').textContent = currentSessionName;
        localStorage.setItem('current_session_name', currentSessionName);
    }
});

document.getElementById('add-to-playlist-btn').onclick = () => {
    const playlists = JSON.parse(localStorage.getItem('moodmate_playlists')) || [];
    if (playlists.length === 0) {
        alert("Create a playlist in the Library first!");
        return;
    }

    const names = playlists.map(p => p.name).join("\n");
    const choice = prompt(`Add "${songTitle.textContent}" to which playlist?\n\n${names}`);

    if (choice) {
        const pl = playlists.find(p => p.name.toLowerCase() === choice.toLowerCase());
        if (pl) {
            pl.tracks.push({
                title: songTitle.textContent,
                spotify_id: currentSpotifyId,
                mood: emotionLabel.textContent
            });
            localStorage.setItem('moodmate_playlists', JSON.stringify(playlists));
            alert(`Added to ${pl.name}!`);
        }
    }
};


async function updateDashboard() {
    try {
        // 1. Get current emotion
        const emoRes = await fetch('http://127.0.0.1:8000/current_emotion');
        const emoData = await emoRes.json();
        const mood = emoData.emotion || 'Neutral';
        sessionHistory.push({ time: new Date().toLocaleTimeString(), emotion: mood });
        if (sessionHistory.length > 50) sessionHistory.shift(); // Keep last 50 points

        // Update emotion overlay
        emotionLabel.textContent = mood;
        const config = emotionConfig[mood] || emotionConfig['Neutral'];
        emotionLabel.style.borderColor = config.color;
        emotionLabel.style.boxShadow = `0 0 40px ${config.color}40`;

        // Mood trend arrow
        if (previousEmotion && previousEmotion !== mood) {
            moodTrend.textContent = config.trend;
            moodTrend.style.color = config.color;
        }
        previousEmotion = mood;

        // Update bot mouth and bubble
        botMouth.setAttribute('d', config.mouth);

        // 2. Get assistant reply
        const assistantRes = await fetch('http://127.0.0.1:8000/assistant');
        const assistantData = await assistantRes.json();
        botBubble.textContent = assistantData.assistant_reply || "Analyzing your flow...";

        // 3. Get music recommendation with mode
        await fetchRecommendation();

        // Save track button
        document.getElementById('save-track-btn').onclick = () => {
            const tracks = JSON.parse(localStorage.getItem(TRACKS_KEY)) || [];
            const newTrack = {
                title: songTitle.textContent,
                mood: emotionLabel.textContent,
                spotify_id: currentSpotifyId,
                saved_at: new Date().toLocaleString()
            };


            // Avoid duplicates

            if (!tracks.some(t => t.spotify_id === currentSpotifyId)) {
                tracks.push(newTrack);
                localStorage.setItem(TRACKS_KEY, JSON.stringify(tracks));
                alert('Track saved to My Flow Library!');
            } else {
                alert('Track already saved!');
            }

            addToPlaylist(tracks);
        };


    } catch (error) {
        console.error("Dashboard update error:", error);
        emotionLabel.textContent = "Offline";
        botBubble.textContent = "Connection lost. Check backend.";
    }
}

async function fetchRecommendation() {
    try {
            

        // --- NEW PLAYLIST QUEUE LOGIC ---
        if (playlistQueue.length > 0) {
            const nextTrack = playlistQueue.shift(); // Get the first track from the queue
            localStorage.setItem('moodmate_queue', JSON.stringify(playlistQueue)); // Update storage

            // Play the track from your library
            updatePlayerWithSong(nextTrack);
            songVibe.textContent = "Playing from your Library";
            return; // Exit here so we don't call the AI yet
        }



        const recRes = await fetch(`http://127.0.0.1:8000/recommendation?mode=${currentMode}`);
        const recData = await recRes.json();
        const song = recData.song;

        if (!song || !song.spotify_id) {
            songTitle.textContent = "No track found";
            songVibe.textContent = "Adjusting filters...";
            return;
        }

        // Update bottom bar
        songTitle.textContent = song.title || "Unknown Track";
        songVibe.textContent = recData.vibe || "Custom Flow Mix";

        // // Fake artwork (in real app: extract from Spotify metadata or use placeholder)
        // npArtwork.style.backgroundImage =
        //     `url(https://i.scdn.co/image/ab67616d0000b273${song.spotify_id.slice(-22)})`;

        // // Also update the mini-player artwork if it exists
        // const miniArtwork = document.getElementById('inapp-artwork');
        // if (miniArtwork) {
        //     miniArtwork.style.backgroundImage =
        //         `url(https://i.scdn.co/image/ab67616d0000b273${song.spotify_id.slice(-22)})`;
        // }
        try {
            const embed = await fetch(
                `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${song.spotify_id}`
            );
            const embedData = await embed.json();

            const artwork = embedData.thumbnail_url || null;

            if (artwork) {
                npArtwork.style.backgroundImage = `url(${artwork})`;
                const miniArtwork = document.getElementById('inapp-artwork');
                if (miniArtwork) miniArtwork.style.backgroundImage = `url(${artwork})`;
            }
        } catch (err) {
            console.warn("Artwork fetch failed", err);
        }



        // Only update player if song changed
        if (song.spotify_id !== currentSpotifyId) {
            currentSpotifyId = song.spotify_id;

            spotifyContainer.innerHTML = `
                <iframe style="border-radius:12px" 
                        src="https://open.spotify.com/embed/track/${song.spotify_id}?utm_source=moodmate" 
                        width="100%" height="152" 
                        frameBorder="0" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy">
                </iframe>
            `;
            const iframe = spotifyContainer.querySelector('iframe');
            iframe.onload = () => {
                try {
                    const playBtn = iframe.contentDocument.querySelector('[data-testid="play-button"]');
                    if (playBtn) playBtn.click();
                } catch (err) {
                    console.log('Autoplay click failed - browser policy');
                }
            };
        }

    } catch (error) {
        console.error("Recommendation error:", error);
    }
}
// Autoplay hack: Auto-click play button


// Start polling
setInterval(updateDashboard, 1500);
updateDashboard(); // Initial call

let isMinimized = false;

function toggleMinimize() {
    isMinimized = !isMinimized;
    const fullUI = document.querySelector('.main-container'); // your dashboard grid
    const topNav = document.querySelector('.top-nav');
    const mini = document.getElementById('inapp-mini');

    if (isMinimized) {
        fullUI.style.opacity = '0';
        fullUI.style.pointerEvents = 'none';
        topNav.style.opacity = '0';
        mini.classList.remove('inapp-mini-hidden');
    } else {
        fullUI.style.opacity = '1';
        fullUI.style.pointerEvents = 'auto';
        topNav.style.opacity = '1';
        mini.classList.add('inapp-mini-hidden');
    }

    // Sync data to mini-player
    document.getElementById('inapp-title').textContent = document.getElementById('song-title').textContent;
    document.getElementById('inapp-mood-badge').textContent = emotionLabel.textContent;
    document.getElementById('inapp-artwork').style.backgroundImage = npArtwork.style.backgroundImage;
    document.getElementById('inapp-player-container').innerHTML = spotifyContainer.innerHTML;
}
document.getElementById('minimize-btn').addEventListener('click', toggleMinimize);
document.getElementById('inapp-maximize').addEventListener('click', toggleMinimize);
document.getElementById('inapp-close').addEventListener('click', () => window.close());

async function saveCurrentSession() {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY)) || [];
    const user = localStorage.getItem('moodmate_user_name') || 'Guest';

    const durationSec = Math.floor((Date.now() - sessionStartTime) / 1000);
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;

    // Mock real stats (you can enhance with actual duration/start mood later)
    const sessionData = {
        name: currentSessionName,
        start_time: new Date(sessionStartTime).toLocaleString(),
        end_time: new Date().toLocaleString(),
        username: user,
        duration: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
        start_mood: sessionHistory[0]?.emotion || "Neutral",
        end_mood: emotionLabel.textContent,
        improvement: "+65%", // Calculate from scores
        date: new Date().toLocaleDateString(),
        insight: `Great session, ${user}! You stayed focused.`,
        history: sessionHistory, // This is the data for your chart!
        timestamp: Date.now()
    };

    // sessions.unshift(sessionData); // Add to beginning
    // localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    // console.log('Saved session:', sessionData); // Debug
    // localStorage.removeItem('current_session_name');

    // SAVE TO SERVER DATABASE (Crucial!)
    await fetch('http://127.0.0.1:8000/save_session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
    });
    console.log("Session saved to Database!");
}

function showSection(sectionId) {
    // Hide everything
    document.querySelectorAll('.app-section').forEach(s => s.style.display = 'none');

    // Show the one we want
    document.getElementById(sectionId + '-section').style.display = 'block';

    // Because the webcam <img> never leaves the DOM, it stays ON!
    console.log(`Switched to ${sectionId} - Camera preserved.`);
}

// Check for user identity on load
window.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('moodmate_user_name');
    if (!savedName) {
        document.getElementById('identity-overlay').classList.remove('overlay-hidden');
    } else {
        updateWelcomeMessage(savedName);
    }
});

async function saveIdentity() {
    const name = document.getElementById('user-name-input').value.trim();

    if (name) {
        try {
            // 1. Sync with the SQLite Backend
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: name })
            });

            const result = await response.json();

            if (result.status === "success") {
                // 2. Update Dashboard UI & Local Cache
                localStorage.setItem('moodmate_user_name', name);
                document.getElementById('identity-overlay').classList.add('overlay-hidden');
                updateWelcomeMessage(name);

                // 3. Sync with Chrome Extension
                // We use an 'if' check to prevent errors when testing outside the extension
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.set({ moodmate_user_name: name }, () => {
                        console.log("Extension identity synced.");
                    });
                }
            }
        } catch (error) {
            console.error("Login failed. Check if backend is running:", error);
            alert("Could not connect to MoodMate AI server.");
        }
    } else {
        alert("Please enter a name to start your session.");
    }
}

function updateWelcomeMessage(name) {
    const header = document.querySelector('.top-nav .logo');
    header.innerHTML = `MoodMate AI <span style="font-size:0.9rem; font-weight:400; color:var(--text-secondary); margin-left:10px;">| Welcome, ${name}</span>`;
}

async function skipTrack(direction) {
    if (direction === 'prev') {
        if (historyIndex > 0) {
            historyIndex--;
            const prevSong = songHistory[historyIndex];
            updatePlayerWithSong(prevSong);
        } else {
            console.log("No previous songs in history.");
        }
    } else {
        // 'next' direction
        // Call backend with a 'force' flag to bypass the 5-minute cooldown
        const recRes = await fetch(`http://127.0.0.1:8000/recommendation?mode=${currentMode}&force=true`);
        const recData = await recRes.json();

        if (recData.song) {
            // Add to history stack
            songHistory.push(recData.song);
            historyIndex = songHistory.length - 1;
            updatePlayerWithSong(recData.song);
        }
    }
}

function updatePlayerWithSong(song) {
    currentSpotifyId = song.spotify_id;
    songTitle.textContent = song.title;

    // Fix: Using backticks for dynamic URL
    npArtwork.style.backgroundImage = `url("https://i.scdn.co/image/ab67616d0000b273${song.spotify_id.slice(-22)}")`;

    spotifyContainer.innerHTML = `
        <iframe style="border-radius:12px" 
                src="https://open.spotify.com/embed/track/${song.spotify_id}?utm_source=moodmate" 
                width="100%" height="152" 
                frameBorder="0" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy">
        </iframe>`;
}
async function changeTrack(direction) {
    const userName = localStorage.getItem('moodmate_user_name') || 'Guest';
    let url = direction === 'next'
        ? `http://127.0.0.1:8000/recommendation?mode=${currentMode}&username=${userName}&force=true`
        : `http://127.0.0.1:8000/previous_track?username=${userName}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.song) {
            updatePlayerUI(data.song);
        }
    } catch (err) {
        console.error("Skipping failed", err);
    }
}

function updatePlayerUI(song) {
    currentSpotifyId = song.spotify_id;
    songTitle.textContent = song.title;
    spotifyContainer.innerHTML = `
        <iframe style="border-radius:12px" 
                src="https://open.spotify.com/embed/track/${song.spotify_id}?utm_source=moodmate" 
                width="100%" height="152" 
                frameBorder="0" 
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy">
        </iframe>`;
}

// let isMinimized = false;

// function toggleMinimize() {
//     isMinimized = !isMinimized;
//     const mainContainer = document.querySelector('.main-container');
//     const topNav = document.querySelector('.top-nav');
//     const mini = document.getElementById('mini-player');

//     if (isMinimized) {
//         mainContainer.style.display = 'none';
//         topNav.style.display = 'none';
//         mini.classList.remove('mini-hidden');
//         document.body.style.overflow = 'visible';;
//         document.body.classList.add('minimized');
//     } else {
//         maximizeApp();
//         document.body.classList.remove('minimized');
//     }
// }
// window.addEventListener('resize', () => {
//     if (isMinimized) {
//         miniPlayer.style.left = 'auto';
//         miniPlayer.style.top = 'auto';
//         miniPlayer.style.bottom = '20px';
//         miniPlayer.style.right = '20px';
//     }
// });
// function maximizeApp() {
//     isMinimized = false;
//     document.querySelector('.main-container').style.display = 'flex';
//     document.querySelector('.top-nav').style.display = 'flex';
//     document.getElementById('mini-player').classList.add('mini-hidden');
// }

// // Make mini player draggable
// const miniPlayer = document.getElementById('mini-player');
// let isDragging = false;
// let offsetX, offsetY;

// miniPlayer.addEventListener('mousedown', (e) => {
//     if (e.target.tagName === 'BUTTON') return;
//     isDragging = true;
//     offsetX = e.clientX - miniPlayer.getBoundingClientRect().left;
//     offsetY = e.clientY - miniPlayer.getBoundingClientRect().top;
// });

// document.addEventListener('mousemove', (e) => {
//     if (!isDragging) return;
//     miniPlayer.style.left = (e.clientX - offsetX) + 'px';
//     miniPlayer.style.top = (e.clientY - offsetY) + 'px';
//     miniPlayer.style.bottom = 'auto';
//     miniPlayer.style.right = 'auto';
// });

// document.addEventListener('mouseup', () => { isDragging = false; });

// // Update mini player content in your updateDashboard()
// document.getElementById('mini-title').textContent = songTitle.textContent;
// document.getElementById('mini-mood').textContent = mood;
// document.getElementById('mini-artwork').style.backgroundImage = npArtwork.style.backgroundImage;

// Make in-app mini draggable

