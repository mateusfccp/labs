// --- CONFIGURATION ---
const TILE_SIZE = 64; // Power of two for easy math
const STORAGE_KEY = 'whiteboard_tiles_v1';
const CHUNK_SYNC_INTERVAL = 2000; // ms between sync broadcasts

const GLOBAL_ROOM = 'labs-global-whiteboard-room-v1';

// --- GLOBALS ---
let myPeerId = null;
let myNickname = '';
let peer = null;
let isHost = false;
let connections = {}; // peerId -> DataConnection
let isConnected = true; // allow drawing offline immediately

// Tool state
let currentTool = 'pencil'; // 'pencil' | 'eraser'
let currentColor = '#000000';
let currentThickness = 2;

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let activeStrokeBounds = null; // {minX, minY, maxX, maxY}

// Tile State (The Truth)
// Format: "x,y" -> { ts: <timestamp>, data: <base64 image> }
let tileGrid = {};

// DOM Elements
const uiOverlay = document.getElementById('ui-overlay');
const setupSection = document.getElementById('setup-section');
const connectedSection = document.getElementById('connected-section');
const lblMyId = document.getElementById('lbl-my-id');
const peersList = document.getElementById('peers-list');

const mainCanvas = document.getElementById('main-canvas');
const mainCtx = mainCanvas.getContext('2d', { willReadFrequently: true });
const customCursor = document.getElementById('custom-cursor');

// Offscreen canvas for tile rasterization
const tileCanvas = document.createElement('canvas');
tileCanvas.width = TILE_SIZE;
tileCanvas.height = TILE_SIZE;
const tileCtx = tileCanvas.getContext('2d', { willReadFrequently: true });

// --- INITIALIZATION ---
function init() {
    resizeCanvases();
    window.addEventListener('resize', () => {
        resizeCanvases();
        renderAllTiles(); // Re-render on resize
    });

    loadTilesFromStorage();
    setupUI();
    setupCanvasEvents();

    // Start the sync loop
    setInterval(broadcastTileTimestamps, CHUNK_SYNC_INTERVAL);
}

function resizeCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    mainCanvas.width = w;
    mainCanvas.height = h;
}

// --- UI SETUP ---
function setupUI() {
    myNickname = localStorage.getItem('whiteboard_nickname') || '';
    if (myNickname) {
        document.getElementById('nickname-input').value = myNickname;
        initPeer(myNickname);
    }

    const initBtn = document.getElementById('btn-init-peer');
    const inputField = document.getElementById('nickname-input');

    const handleJoin = () => {
        const input = inputField.value.trim();
        if (input) {
            localStorage.setItem('whiteboard_nickname', input);
            initPeer(input);
        }
    };

    initBtn.addEventListener('click', handleJoin);
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleJoin();
    });

    document.getElementById('btn-change-name').addEventListener('click', () => {
        localStorage.removeItem('whiteboard_nickname');
        location.reload();
    });

    // Tools
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentTool = target.dataset.tool;
        });
    });

    // Thickness
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentThickness = parseInt(target.dataset.size, 10);
        });
    });

    // Colors
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentColor = target.dataset.color;

            // Auto-switch to pencil if picking color
            document.querySelector('.tool-btn[data-tool="pencil"]').click();
        });
    });

    // Clear modal logic
    const clearModal = document.getElementById('clear-modal');
    document.getElementById('btn-clear').addEventListener('click', () => {
        clearModal.classList.remove('hidden');
    });

    document.getElementById('btn-cancel-clear').addEventListener('click', () => {
        clearModal.classList.add('hidden');
    });

    document.getElementById('btn-confirm-clear').addEventListener('click', () => {
        clearModal.classList.add('hidden');
        clearBoard();
    });
}

function updatePeersUI() {
    const peerIds = Object.keys(connections);
    if (peerIds.length === 0) {
        peersList.innerHTML = '<small style="color:var(--text-dim)">No active peers</small>';
        return;
    }

    peersList.innerHTML = '';
    peerIds.forEach(id => {
        const conn = connections[id];
        const name = conn.metadata?.nickname || (id === GLOBAL_ROOM && conn.peer === GLOBAL_ROOM ? 'Room Host' : 'Anonymous');
        const badge = document.createElement('div');
        badge.className = 'peer-badge';
        badge.innerHTML = `<span>${name}</span> <span style="color:#34C759">●</span>`;
        peersList.appendChild(badge);
    });
}

// --- PEERJS LOGIC ---
function initPeer(nickname) {
    myNickname = nickname;
    setupSection.classList.add('hidden');
    connectedSection.classList.remove('hidden');

    // Reposition panel to top left now that we are logged in
    const panelContainer = document.getElementById('connection-panel-container');
    panelContainer.style.position = 'relative';
    panelContainer.style.top = '0';
    panelContainer.style.left = '0';
    panelContainer.style.transform = 'none';

    document.getElementById('toolbar').classList.remove('hidden');
    lblMyId.innerText = nickname + " (Connecting...)";

    peer = new Peer({ debug: 2 });

    peer.on('open', (id) => {
        myPeerId = id;
        lblMyId.innerText = nickname;

        // Try to connect to global room immediately
        connectToPeer(GLOBAL_ROOM, false);
    });

    peer.on('connection', (conn) => {
        // If we are host, others connect to us
        setupConnectionEvents(conn);
    });

    peer.on('error', (err) => {
        console.warn('Peer Error:', err.type);
        if (err.type === 'peer-unavailable') {
            // Global room host doesn't exist. We become the host.
            peer.destroy();
            peer = new Peer(GLOBAL_ROOM, { debug: 2 });
            peer.on('open', () => {
                isHost = true;
                myPeerId = GLOBAL_ROOM;
                lblMyId.innerText = nickname;
            });
            peer.on('connection', (conn) => {
                setupConnectionEvents(conn);
            });
            peer.on('error', (e) => {
                // If the global room was taken exactly while we tried to become host:
                if (e.type === 'unavailable-id') {
                    // Start over as a normal peer
                    isHost = false;
                    initPeer(nickname);
                }
            });
        }
    });
}

function connectToPeer(targetId, isRetry = false) {
    if (!peer || targetId === myPeerId || connections[targetId]) return;

    const conn = peer.connect(targetId, {
        metadata: { nickname: myNickname },
        reliable: true
    });

    setupConnectionEvents(conn);
}

function setupConnectionEvents(conn) {
    conn.on('open', () => {
        if (!connections[conn.peer]) {
            connections[conn.peer] = conn;

            // When a peer connects TO us, their nickname is in conn.metadata.
            // When we connect TO a peer, we might not get their metadata implicitly unless they mesh_sync it.
            // However, we just added their connection. If they initiated, conn.metadata has it.

            // Broadcast the entire list of peers we know about to the new connection
            // This is how the mesh forms: tell them who else is here.
            // Format: id -> nickname
            const meshPeers = {};
            Object.keys(connections).forEach(id => {
                if (id !== conn.peer) {
                    meshPeers[id] = connections[id].metadata?.nickname || 'Anonymous';
                }
            });
            meshPeers[myPeerId] = myNickname;

            conn.send({ type: 'mesh_sync', peers: meshPeers });

            updatePeersUI();
            sendTileTimestamps(conn);
        }
    });

    conn.on('data', (data) => {
        handlePeerData(conn.peer, data);
    });

    conn.on('close', () => {
        delete connections[conn.peer];
        updatePeersUI();

        // If the disconnected peer was the global room host, and we are not the host,
        // we should try to become the host or reconnect to the new host after a slight delay
        // to let the mesh settle.
        if (conn.peer === GLOBAL_ROOM && !isHost) {
            setTimeout(() => {
                connectToPeer(GLOBAL_ROOM);
            }, 2000);
        }
    });
}

function broadcast(msg) {
    Object.values(connections).forEach(conn => {
        if (conn.open) conn.send(msg);
    });
}

// --- DATA SYNC (Tile-based LWW) ---

// 1. Send all our timestamps to let peer know what we have
function sendTileTimestamps(conn) {
    const manifest = {};
    for (const key in tileGrid) {
        manifest[key] = tileGrid[key].ts;
    }
    conn.send({ type: 'manifest', manifest });
}

function broadcastTileTimestamps() {
    if (Object.keys(connections).length === 0) return;
    const manifest = {};
    for (const key in tileGrid) {
        manifest[key] = tileGrid[key].ts;
    }
    broadcast({ type: 'manifest', manifest });
}

// 2. Handle data from peer
function handlePeerData(peerId, msg) {
    if (msg.type === 'manifest') {
        // Peer sent timestamps. Compare with ours.
        const requests = [];
        for (const key in msg.manifest) {
            const peerTs = msg.manifest[key];
            const localTs = tileGrid[key] ? tileGrid[key].ts : 0;
            if (peerTs > localTs) {
                // Peer has newer tile. Request it.
                requests.push(key);
            }
        }
        if (requests.length > 0) {
            connections[peerId].send({ type: 'request_tiles', keys: requests });
        }
    }
    else if (msg.type === 'peer_joined') {
        const targetId = msg.peerId;
        if (targetId && targetId !== myPeerId && !connections[targetId]) {
            connectToPeer(targetId);
        }
    }
    else if (msg.type === 'mesh_sync') {
        if (msg.peers && typeof msg.peers === 'object' && !Array.isArray(msg.peers)) {
            let uiNeedsUpdate = false;
            Object.keys(msg.peers).forEach(targetId => {
                if (targetId !== myPeerId) {
                    const targetNickname = msg.peers[targetId];
                    if (connections[targetId]) {
                        if (targetNickname && targetNickname !== 'Anonymous') {
                            connections[targetId].metadata = connections[targetId].metadata || {};
                            if (connections[targetId].metadata.nickname !== targetNickname) {
                                connections[targetId].metadata.nickname = targetNickname;
                                uiNeedsUpdate = true;
                            }
                        }
                    } else {
                        const conn = peer.connect(targetId, {
                            metadata: { nickname: myNickname },
                            reliable: true
                        });
                        if (conn) {
                            conn.metadata = conn.metadata || {};
                            conn.metadata.nickname = targetNickname;
                            setupConnectionEvents(conn);
                        }
                    }
                }
            });
            if (uiNeedsUpdate) updatePeersUI();
        }
    }
    else if (msg.type === 'request_tiles') {
        // Peer wants our tiles
        const response = {};
        msg.keys.forEach(key => {
            if (tileGrid[key]) {
                response[key] = tileGrid[key];
            }
        });
        connections[peerId].send({ type: 'tiles_data', tiles: response });
    }
    else if (msg.type === 'tiles_data') {
        // Peer sent us tile data
        let boardUpdated = false;
        for (const key in msg.tiles) {
            const peerTile = msg.tiles[key];
            const localTs = tileGrid[key] ? tileGrid[key].ts : 0;

            if (peerTile.ts > localTs) {
                tileGrid[key] = peerTile;
                boardUpdated = true;
            }
        }

        if (boardUpdated) {
            saveTilesToStorage();
            renderAllTiles();
        }
    }
    else if (msg.type === 'clear') {
        tileGrid = {};
        saveTilesToStorage();
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    }
}


// --- DRAWING LOGIC ---

function setupCanvasEvents() {
    // Use pointer events for both mouse and touch
    mainCanvas.addEventListener('pointerdown', startDrawing);
    mainCanvas.addEventListener('pointermove', draw);
    window.addEventListener('pointerup', stopDrawing);
    window.addEventListener('pointercancel', stopDrawing);

    // Cursor tracking
    window.addEventListener('pointermove', updateCursor);
}

function updateCursor(e) {
    if (!myPeerId) {
        customCursor.style.display = 'none';
        mainCanvas.style.cursor = 'auto'; // ensure standard cursor before login
        return;
    }

    if (e.target === mainCanvas || e.target === uiOverlay) {
        mainCanvas.style.cursor = 'none'; // hide standard cursor over canvas
        customCursor.style.display = 'block';
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
        const renderThickness = currentTool === 'eraser' ? currentThickness * 2 : currentThickness;
        customCursor.style.width = renderThickness + 'px';
        customCursor.style.height = renderThickness + 'px';
    } else {
        customCursor.style.display = 'none';
        mainCanvas.style.cursor = 'auto';
    }
}

function getPos(e) {
    const rect = mainCanvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function startDrawing(e) {
    if (e.target !== mainCanvas && e.target !== uiOverlay) return;
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;

    // Reset bounds for the current stroke
    activeStrokeBounds = {
        minX: lastX, minY: lastY,
        maxX: lastX, maxY: lastY
    };

    mainCtx.lineCap = 'round';
    mainCtx.lineJoin = 'round';
    mainCtx.lineWidth = currentTool === 'eraser' ? currentThickness * 2 : currentThickness;

    if (currentTool === 'eraser') {
        mainCtx.globalCompositeOperation = 'destination-out';
        mainCtx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        mainCtx.globalCompositeOperation = 'source-over';
        mainCtx.strokeStyle = currentColor;
    }

    mainCtx.beginPath();
    mainCtx.moveTo(lastX, lastY);
    mainCtx.lineTo(lastX, lastY);
    mainCtx.stroke();

    mainCanvas.setPointerCapture(e.pointerId);
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling

    const pos = getPos(e);

    mainCtx.beginPath();
    mainCtx.moveTo(lastX, lastY);
    mainCtx.lineTo(pos.x, pos.y);
    mainCtx.stroke();

    // Expand bounds (incorporating line width)
    const margin = currentTool === 'eraser' ? currentThickness * 2 : currentThickness;
    activeStrokeBounds.minX = Math.min(activeStrokeBounds.minX, pos.x - margin);
    activeStrokeBounds.minY = Math.min(activeStrokeBounds.minY, pos.y - margin);
    activeStrokeBounds.maxX = Math.max(activeStrokeBounds.maxX, pos.x + margin);
    activeStrokeBounds.maxY = Math.max(activeStrokeBounds.maxY, pos.y + margin);

    lastX = pos.x;
    lastY = pos.y;
}

function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    try {
        mainCanvas.releasePointerCapture(e.pointerId);
    } catch (err) { }

    commitActiveStroke();
}

function commitActiveStroke() {
    if (!activeStrokeBounds) return;

    // 1. Determine affected tiles
    const minTX = Math.floor(activeStrokeBounds.minX / TILE_SIZE);
    const minTY = Math.floor(activeStrokeBounds.minY / TILE_SIZE);
    const maxTX = Math.floor(activeStrokeBounds.maxX / TILE_SIZE);
    const maxTY = Math.floor(activeStrokeBounds.maxY / TILE_SIZE);

    const now = Date.now();

    // 2. We already drew directly onto mainCtx during pointermove/pointerdown.
    // There's no longer a need to copy from activeCanvas.

    // 3. Extract the updated tiles from the main canvas and save to grid
    for (let ty = minTY; ty <= maxTY; ty++) {
        for (let tx = minTX; tx <= maxTX; tx++) {
            const key = `${tx},${ty}`;
            const startX = tx * TILE_SIZE;
            const startY = ty * TILE_SIZE;

            // Clear tile canvas
            tileCtx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

            // Grab pixel data from main canvas for this tile
            // Note: we can't just drawImage if it's partly offscreen, but get/putImageData is safe.
            const imgData = mainCtx.getImageData(startX, startY, TILE_SIZE, TILE_SIZE);
            tileCtx.putImageData(imgData, 0, 0);

            // Only save if the tile isn't completely empty? 
            // Actually, we must save even empty tiles if an eraser erased them, 
            // otherwise peers won't know it was erased.
            const base64 = tileCanvas.toDataURL('image/png', 0.5); // Compress slightly

            tileGrid[key] = {
                ts: now + Math.random(), // Add slight jitter to avoid exact collisions
                data: base64
            };
        }
    }

    // 4. Reset bounds state
    activeStrokeBounds = null;

    // 5. Save and sync
    saveTilesToStorage();
    broadcastTileTimestamps(); // Immediately notify peers of update
}


// --- RENDERING & STORAGE ---

function renderAllTiles() {
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    for (const key in tileGrid) {
        const [tx, ty] = key.split(',').map(Number);
        const tile = tileGrid[key];

        if (tile.data) {
            const img = new Image();
            img.onload = () => {
                // Redraw only this tile. Since images are fully independent tiles, 
                // we can just draw them over the cleared board.
                mainCtx.clearRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                mainCtx.drawImage(img, tx * TILE_SIZE, ty * TILE_SIZE);
            };
            img.src = tile.data;
        }
    }
}

function clearBoard() {
    tileGrid = {};
    saveTilesToStorage();
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    broadcast({ type: 'clear' });
}

function saveTilesToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tileGrid));
    } catch (e) {
        console.warn("Storage quota exceeded or unavailable:", e);
    }
}

function loadTilesFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            tileGrid = JSON.parse(stored);
            // We must wait for fonts / DOM to be fully ready before rendering to canvas
            requestAnimationFrame(() => {
                renderAllTiles();
            });
        }
    } catch (e) {
        console.error("Failed to load tiles:", e);
    }
}

// ---------------------------
// Kickoff
init();
