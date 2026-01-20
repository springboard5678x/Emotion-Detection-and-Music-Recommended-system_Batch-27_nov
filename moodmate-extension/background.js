// // background.js

// let currentData = {
//   mood: 'Neutral',
//   title: 'Detecting mood...',
//   spotify_id: null
// };

// async function pollBackend() {
//   try {
//     const [emoRes, recRes] = await Promise.all([
//       fetch('http://127.0.0.1:8000/current_emotion'),
//       fetch('http://127.0.0.1:8000/recommendation?mode=match')
//     ]);

//     if (!emoRes.ok || !recRes.ok) throw new Error('Bad response');

//     const emoData = await emoRes.json();
//     const recData = await recRes.json();

//     const mood = emoData.emotion || 'Neutral';
//     const song = recData.song || {};

//     currentData = {
//       mood,
//       title: song.title || 'No track',
//       spotify_id: song.spotify_id || null
//     };

//   } catch (err) {
//     console.error('Backend poll failed:', err);
//     currentData.title = 'Backend offline';
//     currentData.mood = 'Error';
//   }

//   // Broadcast to ALL tabs
//   chrome.tabs.query({}, (tabs) => {
//     tabs.forEach((tab) => {
//       chrome.tabs.sendMessage(tab.id, { type: 'updateData', data: currentData })
//         .catch(() => {}); // Ignore tabs without listener
//     });
//   });
// }

// // Poll every 3 seconds
// setInterval(pollBackend, 3000);
// pollBackend(); // Immediate start

// background.js
let currentData = { mood: 'Neutral', title: 'Detecting...', spotify_id: null };

// background.js
async function pollBackend() {
  try {
    const storage = await chrome.storage.local.get(['moodmate_user_name']);
    const user = storage.moodmate_user_name || 'Guest';

    const [emoRes, recRes] = await Promise.all([
      fetch('http://127.0.0.1:8000/current_emotion'),
      // Send the username to prevent the 500 error!
      fetch(`http://127.0.0.1:8000/recommendation?mode=match&username=${user}`)
    ]);

    const emoData = await emoRes.json();
    const recData = await recRes.json();

    const currentData = {
      mood: emoData.emotion || 'Neutral',
      title: recData.song?.title || 'No track',
      spotify_id: recData.song?.spotify_id || null
    };

    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { type: 'updateData', data: currentData }).catch(() => {});
      });
    });
  } catch (err) { console.error('Poll failed:', err); }
}

// Add skip listener
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'skip') {
        const user = 'Guest'; // You can fetch from storage here too
        const url = msg.direction === 'next' 
            ? `http://127.0.0.1:8000/recommendation?force=true&username=${user}`
            : `http://127.0.0.1:8000/previous_track?username=${user}`;
        fetch(url);
    }
});

setInterval(pollBackend, 3000);