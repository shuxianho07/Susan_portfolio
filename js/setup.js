/*
  Welcome to Hogwarts — Interactive Portfolio Game Engine
  DOM-based scene system with physics, camera, and interactive hotspots.
  
  Scenes:
    - outside: Hogwarts grounds (CSS gradient bg). Walk to the door to enter.
    - inside:  Common room. Explore to find portfolio items (Skills, Experience, Projects, About).
*/

// =============================================
// CONFIG
// =============================================
const CONFIG = {
    reference: { width: 1440, height: 900 },
    character: {
        width: 160,
        height: 260,
        speed: 360,        // gentler: px per second
        jumpSpeed: 700,
        spawnOutside: { xPct: 25, yPct: 85 },
        spawnInside: { xPct: 25, yPct: 85 },
        spawnCommonRoom: { xPct: 55, yPct: 85 },
    },
    physics: {
        gravity: 1400,
        groundOffsetOutside: 30,
        groundOffsetInside: 70,
        groundOffsetCommonRoom: 70,
    },
    outside: {
        widthMultiplier: 1.3,   // world is 1.3x viewport width
        door: { xPct: 75, radius: 120 }
    },
    inside: {
        widthMultiplier: 1.3,
        exit: { xPct: 75, radius: 120 },
        hotspots: [
            // bgImg* = pixel coords in corridor.jpg (1600×475).
            // World position is derived at runtime: worldPos = bgImg* × (worldH / 475).
            {
                id: 'skills',
                label: 'Skills & Spells',
                iconSrc: 'assets/icons/skills.png',
                bgImgX: 282, bgImgY: 52, bgImgW: 70, bgImgH: 120
            }, // Positioned over the white wall sconce
            {
                id: 'experience',
                label: 'Work Experience',
                iconSrc: 'assets/icons/experience.png',
                bgImgX: 429, bgImgY: 100, bgImgW: 195, bgImgH: 305
            }, // Exact size of center-left frame
            {
                id: 'projects',
                label: 'Project Archives',
                iconSrc: 'assets/icons/projects.png',
                bgImgX: 1000, bgImgY: 50, bgImgW: 160, bgImgH: 350
            }, // Exact size of right narrow frame
            {
                id: 'about',
                label: 'About Me',
                iconSrc: 'assets/icons/about.png',
                bgImgX: 850, bgImgY: 290, bgImgW: 120, bgImgH: 150
            } // Sitting on wainscoting ledge (y=440)
        ],
        hotspotRadius: 100
    },

    commonRoom: {
        widthMultiplier: 1.0,
        exit: { xPct: 75, radius: 120 },
        hotspots: [
            { id: 'commonroom-pitches', label: 'Stock Pitch Library', xPct: 28, yPct: 57, overlay: 'room-pitches', glyph: '↗' }
        ],
        hotspotRadius: 120
    },

    // How far horizontally the character is allowed to move (as % of world width)
    // Lowering the maxPct “shrinks” the walkable area.
    bounds: {
        outside: { minPct: 17, maxPct: 75 },
        inside: { minPct: 10, maxPct: 90 },
        commonRoom: { minPct: 10, maxPct: 90 }
    },
    transitionMs: 400
};

// =============================================
// CALCULATE PROPORTIONAL CHARACTER DIMENSIONS
// =============================================
function updateCharacterDimensions() {
    // Character dimensions scale with viewport:
    // width: 14.44vw, height: 37.56vh (proportional to 1440×900 reference, original CSS 208×338)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    CONFIG.character.width = viewportWidth * 0.1805;
    CONFIG.character.height = viewportHeight * 0.4695;
}

// Initialize on first load
updateCharacterDimensions();

// =============================================
// STATE
// =============================================
let scene = 'outside';
let keys = new Set();
let jumpRequested = false;
let lastTime = 0;
let worldW = 0, worldH = 0;
let corridorScale = 1; // worldH / 475 — converts corridor.jpg px → world px
let charX = 0, charY = 0;
let cameraX = 0;
let vx = 0;
let vy = 0;
let onGround = false;
let lastFacing = 1;     // 1 = right, -1 = left
let isMoving = false;
let canInteract = false;
let currentInteraction = null;
let overlayOpen = false;
let chatTimerId = null;
let idleChatTimerId = null;
let hasStartedMoving = false;
let sceneTransitioning = false;
let enterAnimRunning = false;

const IDLE_CHAT_LINES = [
    "The house elves have been busy..",
    "Did you know I am Susan's OC?",
    "A good witch should always smile at visitors.",
    "I hope you enjoy looking through the portfolio.",
    "Keep exploring — there are hidden paths everywhere."
];

// Sprite animation state
let walkFrame = 0;
let walkFrameTimer = 0;
const WALK_FRAME_INTERVAL = 0.15; // seconds between walk frames

// =============================================
// DOM ELEMENTS
// =============================================
const loadingScreen = document.getElementById('loading-screen');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const enterBtn = document.getElementById('enter-btn');

const gameEl = document.getElementById('game');
const worldEl = document.getElementById('world');
const bgEl = document.getElementById('bg');
const charEl = document.getElementById('character');

const spotlightEl = document.getElementById('spotlight-overlay');
const interactBtn = document.getElementById('interact');
const chatEl = document.getElementById('chat');
const fadeEl = document.getElementById('fade');
const backButton = document.getElementById('back-button');
const instructionsEl = document.getElementById('movement-instructions');
const touchControlsEl = document.getElementById('touch-controls');

// Theme toggle (Luminus / Nox)
const themeToggleBtn = document.getElementById('theme-toggle');
const THEME_KEY = 'hogwarts.theme';
let themeMode = 'light';

function applyTheme(mode) {
    themeMode = mode === 'nox' ? 'nox' : 'light';

    // Only apply UI background theme when outside.
    if (bgEl.classList.contains('scene-outside')) {
        bgEl.dataset.theme = themeMode;
    }

    if (themeToggleBtn) {
        themeToggleBtn.textContent = themeMode === 'nox' ? 'Luminus' : 'Nox';
    }

    try {
        localStorage.setItem(THEME_KEY, themeMode);
    } catch (e) {
        // Ignore if storage is unavailable.
    }
}

function toggleTheme() {
    const newTheme = themeMode === 'nox' ? 'light' : 'nox';
    applyTheme(newTheme);
    if (window.va) va('event', 'toggle_theme', { theme: newTheme });
}

function initTheme() {
    const saved = (function () {
        try {
            return localStorage.getItem(THEME_KEY);
        } catch (e) {
            return null;
        }
    })();
    applyTheme(saved === 'nox' ? 'nox' : 'light');
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
}

// =============================================
// SPRITES
// =============================================
const SPRITES = {
    idle: 'assets/front.png',
    back: 'assets/back.png',
    walkRight1: 'assets/walking.png',
    walkRight2: 'assets/right_facing.png',
    // Use the same right-facing sprite for left movement and mirror it via CSS.
    walkLeft1: 'assets/walking.png',
    walkLeft2: 'assets/right_facing.png',
    jumpLeft: 'assets/left jump.png',
    // Use the right-facing stop sprite for the mirrored left stop.
    stopLeft: 'assets/right_facing.png',
    stopRight: 'assets/right_facing.png',
    loading: 'assets/loading.png',
    door: 'assets/door.png',
    corridor: 'assets/corridor.jpg',
    projectItems: 'assets/project items.png',
    commonroom: 'assets/Common room.png'
};

// Preload all sprites and remove white backgrounds via canvas
const spriteCache = {};
const processedSprites = {}; // stores data URLs with white removed

function removeWhiteBackground(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    let imageData;
    try {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (e) {
        console.warn('Could not remove white background due to tainted canvas (likely running via file://).', e);
        return img.src;
    }
    const data = imageData.data;

    const isJumpSprite = img.src.includes('jump');

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

            if (a === 0) continue;

            // Specifically for the jump sprite: the drawn grey shadow is at the bottom of the image.
            // Since she's jumping, her feet are higher up. We can just erase the bottom 40 pixels!
            if (isJumpSprite && y > canvas.height - 40) {
                data[i + 3] = 0;
                continue;
            }

            // Safe, conservative white removal (protects skin/hair/leggings).
            // Only strip fully pure white, and only lightly fade values that are very close to white.
            // This avoids removing light-colored pixels like highlights that are part of the sprite.
            if (r === 255 && g === 255 && b === 255) {
                data[i + 3] = 0;
            } else if (r >= 252 && g >= 252 && b >= 252) {
                data[i + 3] = 0;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
}

function preloadSprites() {
    return new Promise((resolve) => {
        // Preload all sprites including the loading background
        const entries = Object.entries(SPRITES);
        const uniquePaths = [...new Set(entries.map(([, v]) => v))];
        let loaded = 0;
        uniquePaths.forEach(src => {
            const img = new Image();
            img.onload = () => {
                spriteCache[src] = img;
                // Process white background removal
                processedSprites[src] = removeWhiteBackground(img);
                loaded++;
                updateLoadingProgress(Math.round((loaded / uniquePaths.length) * 100));
                if (loaded === uniquePaths.length) resolve();
            };
            img.onerror = () => {
                loaded++;
                updateLoadingProgress(Math.round((loaded / uniquePaths.length) * 100));
                if (loaded === uniquePaths.length) resolve();
            };
            img.src = src;
        });
    });
}

let currentSpriteSrc = '';
function setCharacterSprite(src) {
    if (currentSpriteSrc === src) return;
    currentSpriteSrc = src;
    // Use processed (white-removed) version if available
    charEl.src = processedSprites[src] || src;
}

// =============================================
// LOADING SCREEN
// =============================================
function updateLoadingProgress(pct) {
    progressFill.style.width = pct + '%';
    progressText.textContent = pct + '%';
}

async function runLoadingScreen() {
    // Animate loading phrases
    const phrases = [
        'Summoning house elves...',
        'Polishing wands...',
        'Brewing potions...',
        'Consulting the Marauder\'s Map...'
    ];
    let phraseIdx = 0;
    const subtitle = document.querySelector('.loading-subtitle');
    const phraseInterval = setInterval(() => {
        if (phraseIdx < phrases.length) {
            subtitle.textContent = phrases[phraseIdx++];
        }
    }, 600);

    await preloadSprites();
    clearInterval(phraseInterval);

    // Apply the processed loading background
    const loadingBg = processedSprites[SPRITES.loading] || SPRITES.loading;
    loadingScreen.style.setProperty('--loading-bg', `url(${loadingBg})`);

    // Apply the processed projects sprite sheet
    const projectsSprite = processedSprites[SPRITES.projectItems] || SPRITES.projectItems;
    const projectsOverlay = document.getElementById('overlay-projects');
    if (projectsOverlay) {
        projectsOverlay.style.setProperty('--projects-sprite', `url(${projectsSprite})`);
    }

    subtitle.textContent = 'Come in and find out what I\'ve been up to!';

    // Show enter button
    enterBtn.classList.remove('hidden');
}

enterBtn.addEventListener('click', () => {
    loadingScreen.classList.add('fade-out');
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        startGame();
        // Handle initial route
        let path = '';
        if (window.location.protocol === 'file:') {
            path = window.location.hash.replace(/^#\/?/, '');
        } else {
            path = window.location.pathname.replace(/^\/|\/$/g, '');
        }
        
        if (path === 'inside') {
            setupScene('inside');
        } else if (path === 'common-room') {
            setupScene('commonRoom');
        } else if (['skills', 'experience', 'projects', 'about'].includes(path)) {
            openOverlay(path, false);
        }
        if (!overlayOpen && typeof maybeShowTutorial === 'function') maybeShowTutorial();
    }, 800);
});

initTheme();