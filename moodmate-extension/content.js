// content.js - Global Mini-Player

// Inject mini-player immediately
// const miniHtml = `
//   <div id="moodmate-mini" style="
//     position: fixed; 
//     bottom: 24px; 
//     right: 24px; 
//     width: 400px; 
//     height: 140px; 
//     background: linear-gradient(135deg, rgba(10, 15, 35, 0.95), rgba(20, 25, 50, 0.9)); 
//     backdrop-filter: blur(20px); 
//     border-radius: 24px; 
//     border: 1px solid rgba(0, 255, 255, 0.25); 
//     box-shadow: 0 20px 50px rgba(0, 255, 255, 0.15), 0 0 30px rgba(0, 255, 255, 0.1); 
//     z-index: 999999; 
//     font-family: 'Segoe UI', system-ui, sans-serif; 
//     color: white; 
//     overflow: hidden;
//     transition: all 0.4s ease;
//   ">
//     <!-- Header -->
//     <div style="
//       padding: 12px 20px; 
//       background: rgba(0, 255, 255, 0.08); 
//       display: flex; 
//       justify-content: space-between; 
//       align-items: center; 
//       border-bottom: 1px solid rgba(0, 255, 255, 0.15);
//     ">
//       <div style="font-weight: 700; font-size: 1.1rem; color: #00FFFF; letter-spacing: 0.5px;">
//         MoodMate Flow
//       </div>
//       <div>
//         <button id="mm-maximize" style="
//           background: none; border: none; color: #00FFFF; font-size: 1.1rem; cursor: pointer; margin-right: 16px; font-weight: 600;
//         ">Maximize</button>
//         <button id="mm-close" style="
//           background: none; border: none; color: #FF6B6B; font-size: 1.1rem; cursor: pointer; font-weight: 600;
//         ">Close</button>
//       </div>
//     </div>

//     <!-- Main Content -->
//     <div style="display: flex; padding: 16px 20px; gap: 16px; align-items: center; height: 100%;">
//       <!-- Artwork -->
//       <div id="mm-artwork" style="
//         width: 96px; 
//         height: 96px; 
//         background: #1e1e1e; 
//         border-radius: 16px; 
//         background-size: cover; 
//         background-position: center;
//         box-shadow: 0 8px 24px rgba(0,0,0,0.6);
//         flex-shrink: 0;
//       "></div>

//       <!-- Track Info + Controls -->
//       <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 6px;">
//         <div id="mm-title" style="
//           font-weight: 700; 
//           font-size: 1.15rem; 
//           color: #FFFFFF;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//         ">Detecting mood...</div>
        
//         <div style="display: flex; align-items: center; gap: 8px;">
//           <div id="mm-mood" style="
//             font-size: 0.95rem; 
//             color: #00FFFF; 
//             font-weight: 600;
//             padding: 4px 12px;
//             background: rgba(0, 255, 255, 0.15);
//             border-radius: 20px;
//             border: 1px solid rgba(0, 255, 255, 0.3);
//           ">Neutral</div>
//         </div>

//         <!-- Progress bar (fake for style) -->
//         <div style="margin-top: 8px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
//           <div style="width: 35%; height: 100%; background: #00FFFF; border-radius: 2px;"></div>
//         </div>
//       </div>

//       <!-- Controls -->
//         <div id="mm-controls" style="
//           display: flex;
//           gap: 14px;
//           margin-top: 10px;
//           align-items: center;
//         ">
//           <button id="mm-prev" style="
//             width: 36px; height: 36px;
//             border-radius: 50%;
//             border: none;
//             background: rgba(0,255,255,0.12);
//             color: #00FFFF;
//             font-size: 1.1rem;
//             font-weight: 700;
//             cursor: pointer;
//             transition: 0.25s;
//           ">⏮</button>

//           <button id="mm-play" style="
//             width: 44px; height: 44px;
//             border-radius: 50%;
//             border: none;
//             background: rgba(0,255,255,0.22);
//             color: #00FFFF;
//             font-size: 1.2rem;
//             font-weight: 700;
//             cursor: pointer;
//             transition: 0.25s;
//           ">⏵</button>

//           <button id="mm-next" style="
//             width: 36px; height: 36px;
//             border-radius: 50%;
//             border: none;
//             background: rgba(0,255,255,0.12);
//             color: #00FFFF;
//             font-size: 1.1rem;
//             font-weight: 700;
//             cursor: pointer;
//             transition: 0.25s;
//           ">⏭</button>
//         </div>


//       <!-- Spotify Player -->
//       <div id="mm-player-container" style="width: 160px; height: 90px; overflow: hidden; border-radius: 12px;">
//         <p style="color: #666; font-size: 0.8rem; text-align: center; padding-top: 30px;">Loading...</p>
//       </div>
//     </div>

//     <!-- Floating Bot Message -->
//     <div style="
//       position: absolute; 
//       bottom: -38px; 
//       left: 50%; 
//       transform: translateX(-50%); 
//       background: rgba(0, 255, 255, 0.15); 
//       padding: 8px 20px; 
//       border-radius: 30px; 
//       font-size: 0.85rem; 
//       color: #00FFFF; 
//       border: 1px solid rgba(0, 255, 255, 0.3);
//       white-space: nowrap;
//       backdrop-filter: blur(10px);
//     ">
//       I'm here while you code! 🤖
//     </div>
//   </div>
// `;

// document.body.insertAdjacentHTML('beforeend', miniHtml);

// content.js - Updated to Green Theme


// Elements
// const mini = document.getElementById('moodmate-mini');
// const titleEl = document.getElementById('mm-title');
// const moodEl = document.getElementById('mm-mood');
// const artworkEl = document.getElementById('mm-artwork');
// const playerContainer = document.getElementById('mm-player-container');

// let currentSpotifyId = "";
// // Controls (fake for demo — log actions)
// const playPauseBtn = document.querySelector('#mm-player-container button:nth-child(2)'); // Assume middle is play/pause
// playPauseBtn.addEventListener('click', () => console.log('Play/Pause clicked — integrate SDK for real control'));
// document.querySelector('#mm-player-container button:nth-child(1)').addEventListener('click', () => console.log('Previous track'));
// document.querySelector('#mm-player-container button:nth-child(3)').addEventListener('click', () => console.log('Next track'));

// // Draggable
// let dragging = false;
// let offsetX, offsetY;
// mini.addEventListener('mousedown', (e) => {
//   if (e.target.tagName === 'BUTTON' || e.target.tagName === 'IFRAME') return;
//   dragging = true;
//   offsetX = e.clientX - mini.getBoundingClientRect().left;
//   offsetY = e.clientY - mini.getBoundingClientRect().top;
//   mini.style.transition = 'none';
// });
// document.addEventListener('mousemove', (e) => {
//   if (dragging) {
//     mini.style.left = (e.clientX - offsetX) + 'px';
//     mini.style.top = (e.clientY - offsetY) + 'px';
//     mini.style.right = 'auto';
//     mini.style.bottom = 'auto';
//   }
// });
// document.addEventListener('mouseup', () => {
//   dragging = false;
//   mini.style.transition = 'all 0.4s ease';
// });

// // Buttons
// document.getElementById('mm-maximize').addEventListener('click', () => {
//   window.open('http://127.0.0.1:8000/frontend/app2.html', '_blank');
// });
// document.getElementById('mm-close').addEventListener('click', () => {
//   mini.style.display = 'none';
// });

// // Receive updates from background
// chrome.runtime.onMessage.addListener((message) => {
//   if (message.type === 'updateData') {
//     const { mood, title, spotify_id } = message.data;

//     moodEl.textContent = mood;
//     titleEl.textContent = title || 'No track';

//     if (spotify_id && spotify_id !== currentSpotifyId) {
//       currentSpotifyId = spotify_id;

//       // Artwork
//       artworkEl.style.backgroundImage = `url("https://i.scdn.co/image/ab67616d0000b273${spotify_id.slice(-22)}")`;


//       // Spotify Player
//       playerContainer.innerHTML = `
//         <iframe style="border-radius:12px; width:140px; height:80px;" 
//                 src="https://open.spotify.com/embed/track/${spotify_id}" 
//                 frameBorder="0" 
//                 allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture" 
//                 loading="lazy">
//         </iframe>
//       `;
//     }
//   }
// });
// Fixed Message Listener
// IMPORTANT: Wait for DOM before adding listeners
const injectMiniPlayer = () => {
    const miniHtml = `
      <div id="moodmate-mini" style="all: initial; position: fixed; bottom: 24px; right: 24px; width: 380px; height: 150px; background: #161B22; border: 1px solid #1DB954; border-radius: 20px; z-index: 999999; color: white; display: flex; flex-direction: column; font-family: 'Circular Std', sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.6); overflow: hidden;">
        <div style="padding: 10px 20px; background: rgba(29, 185, 84, 0.1); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363D;">
          <span style="color: #1DB954; font-weight: 700; font-size: 14px;">MoodMate Flow</span>
          <div style="display: flex; gap: 10px;">
            <button id="mm-maximize" style="background:none; border:none; color:#1DB954; cursor:pointer; font-weight:600;">Full</button>
            <button id="mm-close" style="background:none; border:none; color:#FF6B6B; cursor:pointer; font-weight:600;">✕</button>
          </div>
        </div>
        <div style="padding: 15px; display: flex; align-items: center; gap: 15px; flex: 1;">
          <div id="mm-artwork" style="width: 70px; height: 70px; background: #282828; border-radius: 12px; background-size: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></div>
          <div style="flex: 1; min-width: 0;">
            <div id="mm-title" style="font-weight: 700; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Detecting...</div>
            <div id="mm-mood" style="color: #1DB954; font-size: 12px; margin-top: 4px; font-weight: 600;">Neutral</div>
          </div>
          <div style="display: flex; gap: 12px;">
            <button id="ext-prev" style="background:none; border:none; color:#1DB954; font-size:22px; cursor:pointer;">⏮</button>
            <button id="ext-next" style="background:none; border:none; color:#1DB954; font-size:22px; cursor:pointer;">⏭</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', miniHtml);

    // Attach listeners immediately after injection
    document.getElementById('mm-maximize').onclick = () => window.open('http://127.0.0.1:8000/frontend/app2.html');
    document.getElementById('mm-close').onclick = () => document.getElementById('moodmate-mini').remove();
    
    // Use the force=true logic we built for your dashboard skip buttons
    document.getElementById('ext-next').onclick = () => chrome.runtime.sendMessage({type: 'skip', direction: 'next'});
    document.getElementById('ext-prev').onclick = () => chrome.runtime.sendMessage({type: 'skip', direction: 'prev'});
};

if (!document.getElementById('moodmate-mini')) injectMiniPlayer();

chrome.runtime.onMessage.addListener(async(msg) => {
    if (msg.type === 'updateData') {
        const titleEl = document.getElementById('mm-title');
        const moodEl = document.getElementById('mm-mood');
        const artworkEl = document.getElementById('mm-artwork');
        if (titleEl) titleEl.textContent = msg.data.title|| "Unknown Track";
        if (moodEl) moodEl.textContent = msg.data.mood|| "Neutral";

        // --- NEW: Real Spotify artwork using oEmbed ---
        if (artworkEl && msg.data.spotify_id) {
            try {
                const embed = await fetch(
                    `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${msg.data.spotify_id}`
                );
                const embedData = await embed.json();

                const artwork = embedData.thumbnail_url || null;

                if (artwork) {
                    artworkEl.style.backgroundImage = `url(${artwork})`;
                } else {
                    artworkEl.style.backgroundImage = "none";
                }

            } catch (err) {
                console.warn("Extension artwork fetch failed", err);
            }
        }
    }
});