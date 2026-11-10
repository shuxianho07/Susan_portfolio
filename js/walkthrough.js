// Action-driven onboarding. No modal, autoplay, or "Next" button stands in for play.
const walkthrough = { active: false, step: 0, startX: 0, archive: null, target: null };
const WALKTHROUGH_KEY = 'hogwarts.walkthrough.v2';
const walkthroughPanel = document.getElementById('walkthrough');
const walkthroughRing = document.getElementById('walkthrough-target');
const walkthroughSteps = [
    { title: 'Take a few steps', desktop: 'Use ← → or A / D to move your character.', mobile: 'Hold a bottom arrow to walk.', desktopKeys: ['←', '→'], mobileKeys: ['←', '→'] },
    { title: 'Try a jump', desktop: 'Press Space, W, or ↑. Give it a try!', mobile: 'Tap the ↑ button to jump.', desktopKeys: ['Space'], mobileKeys: ['↑'] },
    { title: 'Enter the castle', desktop: 'Walk toward the glowing door, then press E.', mobile: 'Walk toward the door, then tap Enter Inside.', desktopKeys: ['→', 'E'], mobileKeys: ['→', 'Tap door'] },
    { title: 'Open a glowing object', desktop: 'Click a highlighted object, or walk up and press E.', mobile: 'Tap a highlighted object to open its archive.', desktopKeys: ['Click', 'E'], mobileKeys: ['Tap object'] },
    { title: 'Back to exploring', desktop: 'Press Esc or click the highlighted ×.', mobile: 'Tap the highlighted × to close the archive.', desktopKeys: ['Esc'], mobileKeys: ['×'] },
    { title: 'Open your field guide', desktop: 'Click the glowing guide to see your discoveries.', mobile: 'Tap the glowing guide above the movement buttons.', desktopKeys: ['Open guide'], mobileKeys: ['Tap guide'] }
];

function renderWalkthrough() {
    const touch = matchMedia('(pointer: coarse)').matches;
    const complete = walkthrough.step === walkthroughSteps.length;
    const step = walkthroughSteps[walkthrough.step];
    walkthroughPanel.dataset.step = complete ? 'complete' : String(walkthrough.step);
    document.getElementById('walkthrough-progress').textContent = complete ? 'WALKTHROUGH COMPLETE' : `LEARN BY EXPLORING · ${walkthrough.step + 1} / ${walkthroughSteps.length}`;
    document.getElementById('walkthrough-title').textContent = complete ? 'You’re ready to explore' : step.title;
    document.getElementById('walkthrough-cue').textContent = complete ? 'Four archives, one castle. Follow your curiosity.' : step[touch ? 'mobile' : 'desktop'];
    document.getElementById('walkthrough-skip').hidden = complete;
    document.getElementById('walkthrough-finish').hidden = !complete;
    const keysEl = document.getElementById('walkthrough-keys');
    keysEl.replaceChildren();
    for (const label of complete ? [] : step[touch ? 'mobileKeys' : 'desktopKeys']) {
        const key = document.createElement('span');
        key.className = 'walkthrough-key';
        key.textContent = label;
        keysEl.appendChild(key);
    }
    const dots = document.getElementById('walkthrough-dots');
    dots.replaceChildren();
    walkthroughSteps.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = index < walkthrough.step ? 'done' : index === walkthrough.step ? 'current' : '';
        dots.appendChild(dot);
    });
}

function advanceWalkthrough() {
    if (!walkthrough.active || walkthrough.step >= walkthroughSteps.length) return;
    walkthrough.step++;
    walkthrough.target = null;
    renderWalkthrough();
    if (walkthrough.step === walkthroughSteps.length) {
        try { localStorage.setItem(WALKTHROUGH_KEY, 'done'); } catch { /* Persistence is optional. */ }
    }
}

function finishWalkthrough(skipped = false) {
    walkthrough.active = false;
    walkthroughPanel.hidden = true;
    walkthroughRing.hidden = true;
    document.body.classList.remove('walkthrough-active');
    document.querySelectorAll('.walkthrough-control').forEach(el => el.classList.remove('walkthrough-control'));
    try { localStorage.setItem(WALKTHROUGH_KEY, skipped && walkthrough.step < walkthroughSteps.length ? 'skipped' : 'done'); } catch {}
    clearMovement();
    if (!overlayOpen) gameEl.focus({ preventScroll: true });
    resetIdleChatTimer();
}

function showTutorial() {
    if (overlayOpen || sceneTransitioning || enterAnimRunning) return;
    document.getElementById('explorer-guide').open = false;
    setupScene('outside');
    setRoute('/', { scene: 'outside' });
    hide(chatEl);
    hide(instructionsEl);
    if (chatTimerId) clearTimeout(chatTimerId);
    if (idleChatTimerId) clearTimeout(idleChatTimerId);
    Object.assign(walkthrough, { active: true, step: 0, startX: charX, archive: null, target: null });
    document.body.classList.add('walkthrough-active');
    walkthroughPanel.hidden = false;
    renderWalkthrough();
    gameEl.focus({ preventScroll: true });
}

function maybeShowTutorial() {
    // A direct archive/room link should keep its destination.
    if (scene !== 'outside') return;
    try { if (localStorage.getItem(WALKTHROUGH_KEY)) return; } catch {}
    showTutorial();
}

function walkthroughOpened(id) {
    if (walkthrough.active && walkthrough.step === 3 && scene !== 'outside' && (Object.hasOwn(discoveryLabels, id) || CONFIG.commonRoom.hotspots.some(hotspot => hotspot.overlay === id))) {
        walkthrough.archive = id;
        advanceWalkthrough();
    }
}

function walkthroughClosed(id) {
    if (walkthrough.active && walkthrough.step === 4 && id === walkthrough.archive) advanceWalkthrough();
}

function walkthroughTarget() {
    if (walkthrough.step < 2) return charEl;
    if (walkthrough.step === 2) return currentInteraction === 'door' ? interactBtn : worldEl.querySelector('.door-marker');
    if (walkthrough.step === 3) {
        if (walkthrough.target?.isConnected) return walkthrough.target;
        const markers = [...worldEl.querySelectorAll('.hotspot-marker')];
        markers.sort((a, b) => Math.abs(a.getBoundingClientRect().left - (charX - cameraX)) - Math.abs(b.getBoundingClientRect().left - (charX - cameraX)));
        walkthrough.target = markers[0];
        return walkthrough.target;
    }
    if (walkthrough.step === 4) return document.querySelector('.overlay:not(.hidden) .overlay-close');
    if (walkthrough.step === 5) return document.querySelector('#explorer-guide summary');
    return null;
}

function positionWalkthroughTarget(target) {
    if (!target || !target.getClientRects().length) {
        walkthroughRing.hidden = true;
        return;
    }
    let rect = target.getBoundingClientRect();
    if (target === charEl && charEl.naturalHeight) {
        // Highlight the painted sprite, rather than the empty object-fit box.
        const scale = Math.min(rect.width / charEl.naturalWidth, rect.height / charEl.naturalHeight);
        const width = charEl.naturalWidth * scale;
        const height = charEl.naturalHeight * scale;
        rect = { left: rect.left + (rect.width - width) / 2, right: rect.left + (rect.width + width) / 2, top: rect.bottom - height, bottom: rect.bottom, width, height };
    }
    const centerX = rect.left + rect.width / 2;
    const offscreen = centerX < 24 || centerX > innerWidth - 24;
    const left = offscreen ? (centerX < 24 ? 12 : innerWidth - 60) : Math.max(12, rect.left - 8);
    const top = offscreen ? Math.max(260, Math.min(innerHeight * 0.5, innerHeight - 140)) : Math.max(52, rect.top - 8);
    const width = offscreen ? 48 : Math.max(32, Math.min(rect.right + 8, innerWidth - 12) - left);
    const height = offscreen ? 48 : Math.max(32, Math.min(rect.bottom + 8, innerHeight - 12) - top);
    walkthroughRing.hidden = false;
    walkthroughRing.classList.toggle('offscreen', offscreen);
    walkthroughRing.style.cssText = `left:${left}px;top:${top}px;width:${width}px;height:${height}px`;
    walkthroughRing.querySelector('span').textContent = offscreen ? (centerX < 24 ? '←' : '→') : '↓';
}

function updateWalkthrough() {
    if (!walkthrough.active) return;
    if (!overlayOpen && !sceneTransitioning && !enterAnimRunning) {
        if (walkthrough.step === 0 && isMoving && Math.abs(charX - walkthrough.startX) >= 80) advanceWalkthrough();
        else if (walkthrough.step === 1 && !onGround && charY < getGroundY() - 20) advanceWalkthrough();
        else if (walkthrough.step === 2 && scene !== 'outside') advanceWalkthrough();
        else if (walkthrough.step === 5 && document.getElementById('explorer-guide').open) advanceWalkthrough();
    }
    // Unrelated archives remain usable without accidentally advancing the lesson.
    walkthroughPanel.hidden = overlayOpen && walkthrough.step !== 4;
    walkthroughPanel.classList.toggle('over-archive', overlayOpen && walkthrough.step === 4);
    if (sceneTransitioning || enterAnimRunning || walkthroughPanel.hidden) walkthroughRing.hidden = true;
    else positionWalkthroughTarget(walkthroughTarget());
    document.querySelectorAll('.touch-btn').forEach(button => {
        const key = button.dataset.key;
        button.classList.toggle('walkthrough-control', !overlayOpen && (walkthrough.step === 0 && key !== 'up' || walkthrough.step === 1 && key === 'up'));
    });
    document.querySelectorAll('.walkthrough-key').forEach(key => {
        const pressed = key.textContent === '←' ? isLeft() : key.textContent === '→' ? isRight() : ['Space', '↑'].includes(key.textContent) && isJump();
        key.classList.toggle('pressed', Boolean(pressed));
    });
}

document.getElementById('walkthrough-skip').addEventListener('click', () => finishWalkthrough(true));
document.getElementById('walkthrough-finish').addEventListener('click', () => finishWalkthrough());
document.getElementById('tutorial-replay').addEventListener('click', showTutorial);
document.getElementById('explorer-guide').addEventListener('toggle', () => {
    if (walkthrough.active && walkthrough.step === 5 && document.getElementById('explorer-guide').open) advanceWalkthrough();
});
window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && walkthrough.active && !overlayOpen && !event.defaultPrevented) finishWalkthrough(true);
});
window.addEventListener('resize', () => {
    if (walkthrough.active) { walkthrough.target = null; renderWalkthrough(); }
});
