let allTracks = [];
const DB_NAME = "ScamifyOfflineDB";
const STORE_NAME = "downloads";
let db = null;

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            updateDownloadCount();
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };
    });
}

// Switch UI Tabs
function switchTab(tabName) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));

    if (tabName === 'discover') {
        document.querySelector('button[onclick="switchTab(\'discover\')"]').classList.add('active');
        document.getElementById('discover-page').classList.add('active');
        loadDiscoverTracks();
    } else if (tabName === 'downloads') {
        document.querySelector('button[onclick="switchTab(\'downloads\')"]').classList.add('active');
        document.getElementById('downloads-page').classList.add('active');
        loadDownloadedTracks();
    }
}

// Fetch tracks.json and render random selection
async function loadDiscoverTracks() {
    const container = document.getElementById('discover-container');
    container.innerHTML = '<p class="loading">Loading tracks...</p>';

    try {
        const response = await fetch('data/tracks.json');
        if (!response.ok) throw new Error("Failed to load tracks");
        allTracks = await response.json();

        // Pick random tracks (or all if less than 6)
        const shuffled = [...allTracks].sort(() => 0.5 - Math.random());
        renderTracks(shuffled, container, false);
    } catch (error) {
        container.innerHTML = `<p class="empty">Could not load tracks. Make sure data/tracks.json exists!</p>`;
        console.error(error);
    }
}

// Render tracks into a given container
function renderTracks(tracks, container, isOfflineView = false) {
    if (tracks.length === 0) {
        container.innerHTML = `<p class="empty">No songs found here.</p>`;
        return;
    }

    container.innerHTML = '';
    tracks.forEach(track => {
        const card = document.createElement('div');
        card.className = 'track-card';
        card.innerHTML = `
            <div class="track-info">
                <h3>${escapeHtml(track.title)}</h3>
                <p>${escapeHtml(track.artist)} • ${escapeHtml(track.duration)}</p>
            </div>
            <div class="track-actions">
                <button class="btn" onclick="playTrack('${track.id}', ${isOfflineView})">Play</button>
                ${!isOfflineView ? `<button class="btn btn-secondary" onclick="downloadTrack('${track.id}')">Download</button>` : `<button class="btn btn-secondary" onclick="deleteDownload('${track.id}')">Remove</button>`}
            </div>
        `;
        container.appendChild(card);
    });
}

// Play track (either from network or IndexedDB blob)
async function playTrack(id, isOffline = false) {
    let track;
    let audioSrc;

    if (isOffline) {
        track = await getTrackFromDB(id);
        if (track && track.blob) {
            audioSrc = URL.createObjectURL(track.blob);
        }
    } else {
        track = allTracks.find(t => t.id === id);
        if (track) {
            audioSrc = track.fileUrl;
        }
    }

    if (track && audioSrc) {
        const audioPlayer = document.getElementById('audio-player');
        audioPlayer.style.display = 'block';
        audioPlayer.src = audioSrc;
        audioPlayer.play();
        document.getElementById('now-playing').innerText = `Now Playing: ${track.title} - ${track.artist}`;
    }
}

// Download MP3 and metadata into IndexedDB
async function downloadTrack(id) {
    const track = allTracks.find(t => t.id === id);
    if (!track) return;

    try {
        const response = await fetch(track.fileUrl);
        const blob = await response.blob();

        const trackData = {
            id: track.id,
            title: track.title,
            artist: track.artist,
            duration: track.duration,
            blob: blob
        };

        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(trackData);

        tx.oncomplete = () => {
            alert(`Successfully downloaded "${track.title}" for offline use!`);
            updateDownloadCount();
        };
        tx.onerror = () => {
            alert("Error saving track locally.");
        };
    } catch (e) {
        console.error(e);
        alert("Failed to download audio file.");
    }
}

// Load and render downloaded tracks from IndexedDB
async function loadDownloadedTracks() {
    const container = document.getElementById('downloads-container');
    const tracks = await getAllTracksFromDB();
    renderTracks(tracks, container, true);
}

// IndexedDB Helper Functions
function getTrackFromDB(id) {
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
}

function getAllTracksFromDB() {
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve([]);
    });
}

function deleteDownload(id) {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => {
        loadDownloadedTracks();
        updateDownloadCount();
    };
}

async function updateDownloadCount() {
    if (!db) return;
    const tracks = await getAllTracksFromDB();
    document.getElementById('download-count').innerText = tracks.length;
}

// Security utility
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// App Startup
window.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        loadDiscoverTracks();
    } catch (e) {
        console.error("Initialization error:", e);
    }
});
