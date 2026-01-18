// Standalone JS to mimic App behavior from React version
document.addEventListener('DOMContentLoaded',()=>{
  const fileInput=document.getElementById('fileInput');
  const dropArea=document.getElementById('dropArea');
  const preview=document.getElementById('preview');
  const previewWrap=document.getElementById('previewWrap');
  const resetBtn=document.getElementById('resetBtn');
  const predictionsEl=document.getElementById('predictions');
  const predictedEmotionEl=document.getElementById('predictedEmotion');
  const spotifyEl=document.getElementById('spotify');
  const openCamera=document.getElementById('openCamera');
  const cameraModal=document.getElementById('cameraModal');
  const video=document.getElementById('video');
  const captureBtn=document.getElementById('capture');
  const usePhotoBtn=document.getElementById('usePhoto');
  const closeCamera=document.getElementById('closeCamera');
  const canvas=document.getElementById('captureCanvas');
  const cameraError = document.getElementById('cameraError');
  let currentDataUrl=null;
  let stream=null;

  // Backend endpoint:
  // - If the frontend is served by FastAPI (port 8001), use same-origin.
  // - If the frontend is served separately (e.g. http.server on 8000), use the backend port.
  function getApiUrl(){
    if (location.protocol === 'file:') return 'http://127.0.0.1:8001/predict-and-recommend';
    if (location.port === '8001') return '/predict-and-recommend';
    return 'http://127.0.0.1:8001/predict-and-recommend';
  }
  const API_URL = getApiUrl();
  // defensive: ensure required elements exist
  const required = {fileInput, dropArea, preview, previewWrap, resetBtn, predictionsEl, spotifyEl, openCamera, cameraModal, video, captureBtn, usePhotoBtn, closeCamera, canvas};
  for (const [k,v] of Object.entries(required)){
    if (!v) console.warn('Missing element:', k);
  }

  function showPreview(dataUrl){
    currentDataUrl=dataUrl;
    preview.src=dataUrl;
    previewWrap.classList.remove('hidden');
    dropArea.classList.add('hidden');
  }
  function resetAll(){
    currentDataUrl=null;
    preview.src='';
    previewWrap.classList.add('hidden');
    dropArea.classList.remove('hidden');
    if (predictedEmotionEl) predictedEmotionEl.textContent = 'No detection yet.';
    predictionsEl.innerHTML='Upload an image to detect your mood.';
    predictionsEl.classList.add('empty');
    spotifyEl.innerHTML='No tracks yet.';
    spotifyEl.classList.add('empty');
  }

  function renderMood(emotion){
    const safeEmotion = (emotion ?? '').toString().trim() || 'Unknown';

    if (predictedEmotionEl) {
      predictedEmotionEl.innerHTML = `<span class="mood-label">Detected emotion</span> <span class="mood-chip">${safeEmotion}</span>`;
      predictedEmotionEl.classList.remove('muted');
      predictedEmotionEl.classList.add('mood-line');
    }

    predictionsEl.classList.remove('empty');
    predictionsEl.innerHTML = `
      <div class="mood-result">
        <div class="mood-title">${safeEmotion}</div>
        <div class="mood-meta">Based on the detected facial expression.</div>
      </div>
    `;
  }

  function renderTracks(tracks){
    if (tracks && tracks.length) {
      spotifyEl.innerHTML = '';
      spotifyEl.classList.remove('empty');
      tracks.forEach(t => {
        const a = document.createElement('a');
        a.href = t.spotify_url || t.spotifyUrl || t.spotifyUrl || '#';
        a.target = '_blank'; a.rel = 'noreferrer';
        const img = t.album_image || t.albumImage || '';
        a.innerHTML = `<div style="display:flex;gap:12px;align-items:center"><div style="width:56px;height:56px;border-radius:8px;overflow:hidden;background:rgba(255,132,208,0.06);display:flex;align-items:center;justify-content:center">${img ? `<img src='${img}' alt='album' style='width:100%;height:100%;object-fit:cover;'/>` : '♫'}</div><div style="min-width:0"><div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.track_name || t.label || t.trackName}</div><div style="font-size:12px;color:var(--muted)">Artists: ${t.artists || ''}</div></div></div><div style="opacity:0.6">↗</div>`;
        spotifyEl.appendChild(a);
      });
    } else {
      spotifyEl.innerHTML = 'No tracks yet.';
      spotifyEl.classList.add('empty');
    }
  }

  function mockPredictions(){
    // simulate API delay
    predictionsEl.innerHTML='Analyzing image...';
    predictionsEl.classList.remove('empty');
    setTimeout(()=>{
      const data={
        emotion:'Happy',
        tracks:[
          {track_name:'Sample Track 1',artists:'Artist A',spotify_url:'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp',album_image:null},
          {track_name:'Sample Track 2',artists:'Artist B',spotify_url:'https://open.spotify.com/track/5nVHIV214bnHF3yuvJmVFF',album_image:null},
          {track_name:'Sample Track 3',artists:'Artist C',spotify_url:'https://open.spotify.com/track/2fvCKV8y12d48dMkP0pXiQ',album_image:null}
        ]
      };
      renderMood(data.emotion);
      renderTracks(data.tracks);
    },1400);
  }

  async function sendToBackendFile(file) {
    if (!file) return mockPredictions();
    predictionsEl.innerHTML = 'Analyzing image...';
    predictionsEl.classList.remove('empty');
    spotifyEl.innerHTML = 'Loading tracks...';
    spotifyEl.classList.remove('empty');

    try {
      const form = new FormData();
      form.append('file', file, file.name || 'upload.jpg');

      // Avoid leaving the UI stuck on "Loading tracks..." if the backend is down.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(API_URL, { method: 'POST', body: form, signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        console.warn('Backend returned', res.status);
        return mockPredictions();
      }
      const data = await res.json();

      renderMood(data.emotion);
      renderTracks(data.tracks);

    } catch (err) {
      console.error('sendToBackendFile error', err);
      // fallback to mock if network/backend fails
      mockPredictions();
    }
  }

  // file input handlers
  if (dropArea && fileInput) {
    dropArea.addEventListener('click',()=>fileInput.click());
    fileInput.addEventListener('change',e=>{
      const f=e.target.files[0];
      if(f && f.type.startsWith('image/')){
        const r=new FileReader();
        r.onloadend=()=>{showPreview(r.result)};
        r.readAsDataURL(f);
        // send real file to backend
        sendToBackendFile(f);
      }
    });
  }

  // drag drop
  if (dropArea) {
    dropArea.addEventListener('dragover',e=>{e.preventDefault();dropArea.classList.add('dragging')});
    dropArea.addEventListener('dragleave',e=>{dropArea.classList.remove('dragging')});
    dropArea.addEventListener('drop',e=>{
      e.preventDefault();
      dropArea.classList.remove('dragging');
      const f=e.dataTransfer.files[0];
      if(f && f.type.startsWith('image/')){
        const r=new FileReader();
        r.onloadend=()=>{showPreview(r.result)};
        r.readAsDataURL(f);
        // send real file to backend
        sendToBackendFile(f);
      }
    });
  }

  if (resetBtn) resetBtn.addEventListener('click',resetAll);

  // Camera
  if (openCamera) openCamera.addEventListener('click', async () => {
    if (!cameraModal) return;
    cameraModal.classList.remove('hidden');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (video) {
        try {
          video.srcObject = stream;
          // some browsers require explicit play call
          const p = video.play();
          if (p && p.catch) p.catch(err => console.warn('video.play() failed:', err));
        } catch (err) {
          console.warn('Error attaching stream to video', err);
        }
      }
      if (usePhotoBtn) usePhotoBtn.classList.add('hidden');
      if (cameraError) cameraError.textContent = '';
    } catch (err) {
      console.error('getUserMedia error:', err);
      let msg = 'Unable to access camera. Please check browser permissions.';
      if (location.protocol === 'file:') {
        msg = 'Camera access requires a local server. It does note work when opening files directly. Please run "npx serve" or "python -m http.server" and open localhost.';
      } else if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        msg = 'Camera requires HTTPS or localhost.';
      }
      
      if (cameraError) cameraError.textContent = msg;
      alert(msg);
      if (cameraModal) cameraModal.classList.add('hidden');
    }
  });

  // Close handlers (close button and click outside modal content)
  if (closeCamera) closeCamera.addEventListener('click', () => {
    stopStream();
    if (cameraModal) cameraModal.classList.add('hidden');
  });

  if (cameraModal) {
    cameraModal.addEventListener('click', (ev) => {
      if (ev.target === cameraModal) {
        stopStream();
        cameraModal.classList.add('hidden');
      }
    });
  }

  function stopStream() {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    } catch (e) {
      console.warn('Error stopping stream', e);
    }
    stream = null;
    if (video) video.srcObject = null;
    if (usePhotoBtn) usePhotoBtn.classList.add('hidden');
    if (cameraError) cameraError.textContent = '';
  }

  if (captureBtn) captureBtn.addEventListener('click', () => {
    if (!stream) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    usePhotoBtn.classList.remove('hidden');
  });

  if (usePhotoBtn) usePhotoBtn.addEventListener('click', () => {
    if (!canvas) return;
    canvas.toBlob(b => {
      if (!b) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          showPreview(reader.result);
          // wrap captured blob as File and send to backend
          const file = new File([b], 'capture.jpg', { type: 'image/jpeg' });
          sendToBackendFile(file);
        } finally {
          // ensure modal is hidden and camera stopped even if preview/rendering throws
          cameraModal.classList.add('hidden');
          stopStream();
        }
      };
      reader.readAsDataURL(b);
    }, 'image/jpeg', 0.95);
  });

  // initial state
  resetAll();
  // global keyboard handler to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (cameraModal && !cameraModal.classList.contains('hidden')) {
        stopStream();
        cameraModal.classList.add('hidden');
      }
    }
  });
});
