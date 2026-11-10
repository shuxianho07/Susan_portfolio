// INPUT
// =============================================
const touchState = { left: false, right: false, up: false };
let touchJumpTriggered = false;

window.addEventListener('keydown', (e) => {
    if (overlayOpen) {
        const overlay = document.querySelector('.overlay:not(.hidden)');
        if (e.key === 'Escape' && overlay) {
            e.preventDefault();
            closeOverlay(overlay.id.replace('overlay-', ''));
        } else if (e.key === 'Tab' && overlay) {
            const focusable = [...overlay.querySelectorAll('a[href], button, input, iframe, [tabindex="0"]')]
                .filter(el => el.getClientRects().length && !el.disabled);
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) {
                e.preventDefault();
                last?.focus();
            } else if (!e.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) {
                e.preventDefault();
                first?.focus();
            }
        }
        return;
    }
    if (gameEl.classList.contains('hidden') || e.target.closest('a, button, summary, input, textarea, select, [contenteditable="true"]')) return;
    const key = e.key.toLowerCase();
    if (['a', 'arrowleft', 'd', 'arrowright', 'w', 'arrowup', ' ', 'enter', 'e'].includes(key)) {
        e.preventDefault();
        resetIdleChatTimer();
        if (key === 'e' || key === 'enter') {
            if (!e.repeat) performInteraction();
        } else {
            if (['w', 'arrowup', ' '].includes(key) && !e.repeat) jumpRequested = true;
            keys.add(key);
        }
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    keys.delete(key);
});

function clearMovement() {
    keys.clear();
    Object.keys(touchState).forEach(key => { touchState[key] = false; });
    touchJumpTriggered = false;
    jumpRequested = false;
    document.querySelectorAll('.touch-btn.active').forEach(btn => btn.classList.remove('active'));
}
window.addEventListener('blur', clearMovement);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearMovement();
});

function isLeft() { return keys.has('a') || keys.has('arrowleft') || touchState.left; }
function isRight() { return keys.has('d') || keys.has('arrowright') || touchState.right; }
function isJump() { return keys.has('w') || keys.has('arrowup') || keys.has(' ') || touchState.up; }
function isAction() { return keys.has('enter') || keys.has('e'); }

// =============================================
// TOUCH CONTROLS
// =============================================
function setupTouchControls() {
    if (!('ontouchstart' in window)) return;
    show(touchControlsEl);

    touchControlsEl.querySelectorAll('.touch-btn').forEach(btn => {
        const key = btn.dataset.key;

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchState[key] = true;
            btn.classList.add('active');
            if (key === 'up' && onGround && !touchJumpTriggered) {
                jumpRequested = true;
                touchJumpTriggered = true;
            }
        }, { passive: false });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchState[key] = false;
            btn.classList.remove('active');
            if (key === 'up') touchJumpTriggered = false;
        });

        btn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            touchState[key] = false;
            btn.classList.remove('active');
            if (key === 'up') touchJumpTriggered = false;
        });

        btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });
}

// =============================================
// SCENE TRANSITIONS
// =============================================
function fadeOutIn(callback) {
    if (sceneTransitioning) return;
    sceneTransitioning = true;
    show(fadeEl);

    requestAnimationFrame(() => {
        fadeEl.classList.add('show');

        const doTransition = async () => {
            if (callback) await callback();

            requestAnimationFrame(() => {
                fadeEl.classList.remove('show');

                // Rely on timeout purely instead of transitionend for game state stability
                setTimeout(() => {
                    hide(fadeEl);
                    sceneTransitioning = false;
                }, 450); // 400ms CSS transition + 50ms buffer
            });
        };

        // Rely on timeout for the fade-in half too
        setTimeout(doTransition, 450);
    });
}

function enterHouse(pushState = true) {
    playEnterAnimation(() => {
        fadeOutIn(() => {
            setupScene('inside');
            showChat('Explore to find my portfolio...');
            if (window.va) va('event', 'enter_inside');
            if (pushState) setRoute('/inside', { scene: 'inside' });
        });
    });
}

function enterCommonRoom(pushState = true) {
    fadeOutIn(() => {
        setupScene('commonRoom');
        showChat('Welcome to the investment study. Open the desk to browse my stock-pitch presentations.');
        if (window.va) va('event', 'enter_common_room');
        if (pushState) setRoute('/common-room', { scene: 'commonRoom' });
    });
}

function exitHouse(pushState = true) {
    fadeOutIn(() => {
        setupScene('outside');
        showChat('I see you coming back. Want to take another look around?');
        if (window.va) va('event', 'exit_castle');
        if (pushState) setRoute('/', { scene: 'outside' });
    });
}

function exitCommonRoom(pushState = true) {
    fadeOutIn(() => {
        setupScene('inside');
        showChat('Back in the corridor.');
        if (pushState) setRoute('/inside', { scene: 'inside' });
    });
}

// =============================================
// INTERACTIONS
// =============================================
function showChat(text, duration = 3000) {
    chatEl.textContent = text;
    show(chatEl);
    positionChatAboveCharacter();

    if (chatTimerId) clearTimeout(chatTimerId);
    chatTimerId = setTimeout(() => {
        hide(chatEl);
        chatTimerId = null;
    }, duration);
}

function resetIdleChatTimer() {
    if (idleChatTimerId) clearTimeout(idleChatTimerId);
    // Only start when game is running and not in a transition/overlay
    if (overlayOpen || sceneTransitioning || walkthrough.active) return;

    idleChatTimerId = setTimeout(() => {
        const line = IDLE_CHAT_LINES[Math.floor(Math.random() * IDLE_CHAT_LINES.length)];
        showChat(line, 2500);
        resetIdleChatTimer();
    }, 10000);
}

function positionChatAboveCharacter() {
    const { w } = viewportSize();
    const screenX = charX - cameraX;
    const screenY = charY - CONFIG.character.height - 65;
    chatEl.style.left = clamp(screenX - chatEl.offsetWidth / 2, 12, Math.max(12, w - chatEl.offsetWidth - 12)) + 'px';
    chatEl.style.top = Math.max(90, screenY) + 'px';
}

// Vertical offset for the interact prompt (higher = more negative)
const INTERACT_BUTTON_VERTICAL_OFFSET = 140;

function positionInteractButton(worldX, worldY) {
    const screenX = worldX - cameraX;
    const screenY = worldY;
    interactBtn.style.left = clamp(screenX - interactBtn.offsetWidth / 2, 12, Math.max(12, window.innerWidth - interactBtn.offsetWidth - 12)) + 'px';
    interactBtn.style.top = clamp(screenY - INTERACT_BUTTON_VERTICAL_OFFSET, 80, Math.max(80, window.innerHeight - interactBtn.offsetHeight - 100)) + 'px';
}

function setRoute(path, state = {}) {
    try {
        if (window.location.protocol === 'file:') {
            const hash = path === '/' ? '' : '#' + path.replace(/^\//, '');
            history.pushState(state, '', window.location.pathname + hash + window.location.search);
        } else {
            history.pushState(state, '', path);
        }
    } catch (e) {
        console.warn('History API failed', e);
    }
}

let overlayOpener = null;

function openOverlay(id, pushState = true) {
    const overlay = document.getElementById('overlay-' + id);
    if (!overlay) return;
    if (!overlayOpen) overlayOpener = document.activeElement;
    document.querySelectorAll('.overlay:not(.hidden)').forEach(other => {
        if (other !== overlay) hide(other);
    });
    clearMovement();
    overlayOpen = true;
    document.body.classList.add('portfolio-open');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', overlay.dataset.dialogLabel || `${id.charAt(0).toUpperCase() + id.slice(1)} portfolio section`);
    
    // Update z-index: make sure the newly opened overlay is on top
    const allOverlays = document.querySelectorAll('.overlay:not(.hidden)');
    let maxZ = 200;
    allOverlays.forEach(o => {
        const currentZ = parseInt(window.getComputedStyle(o).zIndex) || 200;
        if (currentZ >= maxZ) maxZ = currentZ + 1;
    });
    overlay.style.zIndex = maxZ;
    
    show(overlay);
    if (typeof recordDiscovery === 'function') recordDiscovery(id);
    if (typeof walkthroughOpened === 'function') walkthroughOpened(id);
    if (typeof stockPitchOverlayOpened === 'function') stockPitchOverlayOpened(id);
    overlay.querySelector('.overlay-close')?.focus();
    if (window.va) va('event', 'open_overlay', { id: id });
    
    if (pushState) {
        const path = id.startsWith('room-') ? '/common-room' : '/' + id;
        setRoute(path, { overlayId: id, scene });
    }
}

function closeOverlay(id, pushState = true) {
    const overlay = document.getElementById('overlay-' + id);
    if (!overlay) return;
    hide(overlay);
    overlay.style.zIndex = '200'; // Reset z-index when closing
    overlayOpen = false;
    document.body.classList.remove('portfolio-open');
    canInteract = false;
    currentInteraction = null;
    // Consume key so it doesn't re-trigger
    keys.delete('enter');
    keys.delete('e');

    // Re-grab keyboard focus after overlay closes
    if (overlayOpener?.isConnected && overlayOpener !== document.body && overlayOpener.getClientRects().length) {
        overlayOpener.focus();
        if (document.activeElement !== overlayOpener) gameEl.focus();
    } else gameEl.focus();
    overlayOpener = null;
    if (typeof walkthroughClosed === 'function') walkthroughClosed(id);
    resetIdleChatTimer();
    
    if (pushState) {
        let path = '/';
        if (scene === 'inside') path = '/inside';
        if (scene === 'commonRoom') path = '/common-room';
        setRoute(path, { scene: scene });
    }
}

window.addEventListener('popstate', (e) => {
    if (e.state && e.state.overlayId) {
        openOverlay(e.state.overlayId, false);
    } else {
        const allOverlays = document.querySelectorAll('.overlay:not(.hidden)');
        allOverlays.forEach(o => {
            const id = o.id.replace('overlay-', '');
            closeOverlay(id, false);
        });

        const targetScene = (e.state && e.state.scene) ? e.state.scene : 'outside';
        if (scene !== targetScene) {
            fadeOutIn(() => {
                setupScene(targetScene);
            });
        }
    }
});

// Close overlay on backdrop/close button click
document.querySelectorAll('.overlay-backdrop, .overlay-close').forEach(el => {
    el.addEventListener('click', () => {
        const closeId = el.dataset.close;
        if (closeId) closeOverlay(closeId);
    });
});

// Open secondary overlays (from inner items like Suitcase icons)
document.querySelectorAll('[data-open]').forEach(el => {
    el.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent clicking suitcase items from closing things
        const openId = el.dataset.open;
        if (openId) openOverlay(openId);
    });
});

// Interact button click
function performInteraction() {
    if (!canInteract || overlayOpen || sceneTransitioning || enterAnimRunning) return;
    if (currentInteraction === 'door') {
        enterHouse();
    } else if (currentInteraction === 'exit') {
        exitHouse();
    } else if (currentInteraction === 'commonRoom') {
        enterCommonRoom();
    } else if (currentInteraction?.startsWith('commonroom-')) {
        const hotspot = CONFIG.commonRoom.hotspots.find(hs => hs.id === currentInteraction);
        if (hotspot) openOverlay(hotspot.overlay);
    } else if (currentInteraction) {
        openOverlay(currentInteraction);
    }
}
interactBtn.addEventListener('click', performInteraction);

// Back button
backButton.addEventListener('click', () => {
    if (!overlayOpen && !sceneTransitioning) {
        if (scene === 'commonRoom') {
            exitCommonRoom(); // Returns to corridor
        } else {
            exitHouse();     // Returns to outside
        }
    }
});

// Global Navigation Links
const navProjectsLink = document.getElementById('nav-projects-link');
const navAboutLink = document.getElementById('nav-about-link');

if (navProjectsLink) {
    navProjectsLink.addEventListener('click', (e) => {
        e.preventDefault();
        openOverlay('projects');
    });
}

if (navAboutLink) {
    navAboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        openOverlay('about');
    });
}

// =============================================
