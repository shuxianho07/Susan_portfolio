let jumpWasDown = false;
// GAME LOOP
// =============================================
function tick(timestamp) {
    if (!lastTime) { lastTime = timestamp; requestAnimationFrame(tick); return; }
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    // Pause normal movement/sprite updates during the enter animation
    if (!overlayOpen && !sceneTransitioning && !enterAnimRunning) {
        updatePhysics(dt);
        updateCharacterSprite(dt);
        updateInteractions();
    }

    smoothCamera(dt);
    updateSpotlight();
    updateWalkthrough();

    // Keep chat following character
    if (!chatEl.classList.contains('hidden')) {
        positionChatAboveCharacter();
    }

    requestAnimationFrame(tick);
}

function updatePhysics(dt) {
    // Faster movement inside the corridor for smoother traversal
    const speed = scene === 'inside' ? 500 : CONFIG.character.speed;
    let moving = false;

    // Horizontal movement
    if (isLeft()) {
        charX -= speed * dt;
        lastFacing = -1;
        moving = true;
    } else if (isRight()) {
        charX += speed * dt;
        lastFacing = 1;
        moving = true;
    }

    isMoving = moving;

    // Show instructions on first move
    if (moving && !hasStartedMoving) {
        hasStartedMoving = true;
        hide(instructionsEl);
    }

    // Jump (allowed in all scenes)
    if ((jumpRequested || (isJump() && !jumpWasDown)) && onGround) {
        vy = -CONFIG.character.jumpSpeed;
        onGround = false;
    }

    jumpRequested = false;
    jumpWasDown = isJump();

    // Gravity + ground collision (all scenes)
    vy += CONFIG.physics.gravity * dt;
    charY += vy * dt;

    const groundY = getGroundY();
    if (charY >= groundY) {
        charY = groundY;
        vy = 0;
        onGround = true;
    }

    // Clamp to constructed bounds (allows tuning movement range independent of world width)
    const sceneBounds = CONFIG.bounds && CONFIG.bounds[scene];
    if (sceneBounds) {
        const minX = (sceneBounds.minPct / 100) * worldW;
        const maxX = (sceneBounds.maxPct / 100) * worldW;
        charX = clamp(charX, minX, maxX);
    } else {
        charX = clamp(charX, CONFIG.character.width / 2, worldW - CONFIG.character.width / 2);
    }

    // Apply facing — only flip for jump-right (since we have dedicated left/right sprites)
    // For all other sprites, --facing stays 1 (no flip) because each direction has its own art
    placeCharacter();
}

function playEnterAnimation(callback) {
    if (enterAnimRunning) return;
    enterAnimRunning = true;

    const origX = charX;
    const origY = charY;

    // Determine a short walk path toward the door (left/up)
    const targetY = Math.max(0, charY - 50);
    const targetX = Math.max(CONFIG.character.width / 2, charX - 40);

    // Turn back (face left/back) immediately
    lastFacing = -1;
    setCharacterSprite(SPRITES.back || SPRITES.idle);

    const duration = 500;
    const turnDuration = 120;
    const walkDuration = duration - turnDuration;

    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;

        if (elapsed < turnDuration) {
            // still “turning back” — hold the back sprite
            requestAnimationFrame(step);
            return;
        }

        const walkElapsed = elapsed - turnDuration;
        const t = Math.min(1, walkElapsed / walkDuration);

        charY = origY + (targetY - origY) * t;
        charX = origX + (targetX - origX) * t;
        placeCharacter();

        if (t < 1) {
            requestAnimationFrame(step);
            return;
        }

        // Finished walking; keep the back view briefly then continue
        setTimeout(() => {
            enterAnimRunning = false;
            if (typeof callback === 'function') callback();
        }, 150);
    }

    requestAnimationFrame(step);
}

function updateCharacterSprite(dt) {
    // Toggle jumping class for CSS (e.g. shadow removal)
    charEl.classList.toggle('jumping', !onGround);

    if (!onGround) {
        // Jumping — use the side-profile jump sprite and mirror for left-facing movement.
        setCharacterSprite(SPRITES.jumpLeft);
        charEl.style.setProperty('--facing', -lastFacing);
    } else if (isMoving) {
        // Corridor uses a slower frame interval for a gentler animation
        const interval = scene === 'inside' ? 0.3 : WALK_FRAME_INTERVAL;
        walkFrameTimer += dt;
        if (walkFrameTimer >= interval) {
            walkFrame = (walkFrame + 1) % 2;
            walkFrameTimer = 0;
        }
        const sprite = walkFrame === 0 ? SPRITES.walkRight1 : SPRITES.walkRight2;
        setCharacterSprite(sprite);
        charEl.style.setProperty('--facing', lastFacing);
    } else {
        // Idle — in the corridor show a side-facing sprite that mirrors based on
        // the last movement direction; outside show the front-facing sprite.
        if (scene === 'inside') {
            setCharacterSprite(SPRITES.walkRight2); // side-facing pose
            charEl.style.setProperty('--facing', lastFacing);
        } else {
            setCharacterSprite(SPRITES.idle);
            charEl.style.setProperty('--facing', '1');
        }
        walkFrameTimer = 0;
        walkFrame = 0;
    }
}

function updateInteractions() {
    canInteract = false;
    currentInteraction = null;

    if (scene === 'outside') {
        // Check door proximity over the painted center door
        const doorX = (50 / 100) * worldW;
        const doorDist = Math.abs(charX - doorX);

        if (doorDist < CONFIG.outside.door.radius) {
            canInteract = true;
            currentInteraction = 'door';
            show(interactBtn);
            interactBtn.textContent = 'Enter Inside ⏎';
            positionInteractButton(doorX, getGroundY() - CONFIG.character.height);
        }
    } else if (scene === 'inside') {
        // Check exit proximity
        const exitX = (CONFIG.inside.exit.xPct / 100) * worldW;
        const exitDist = Math.abs(charX - exitX);

        if (exitDist < CONFIG.inside.exit.radius) {
            canInteract = true;
            currentInteraction = 'exit';
            show(interactBtn);
            interactBtn.textContent = '⬅ Exit to Grounds ⏎';
            positionInteractButton(exitX + 60, getGroundY() - CONFIG.character.height);
        }
        if (charX >= worldW * 0.9) {
            canInteract = true;
            currentInteraction = 'commonRoom';
            show(interactBtn);
            interactBtn.textContent = 'Enter Common Room ⏎';
            positionInteractButton(worldW * 0.9, getGroundY() - CONFIG.character.height);
        }

        // Check hotspot proximity
        CONFIG.inside.hotspots.forEach(hs => {
            const hsX    = (hs.bgImgX + hs.bgImgW / 2) * corridorScale;
            const hsDist = Math.abs(charX - hsX);

            // Update marker glow state
            const marker = worldEl.querySelector(`.hotspot-marker[data-id="${hs.id}"]`);
            if (marker) {
                marker.classList.toggle('near', hsDist < CONFIG.inside.hotspotRadius);
            }

            if (hsDist < CONFIG.inside.hotspotRadius && !canInteract) {
                canInteract = true;
                currentInteraction = hs.id;
                show(interactBtn);
                interactBtn.textContent = `${hs.label} ⏎`;
                // Show interact button just below the background item
                const hsScreenY = hs.bgImgY * corridorScale + hs.bgImgH * corridorScale;
                positionInteractButton(hsX, hsScreenY);
            }
        });
    } else if (scene == 'commonRoom') {
        // Check proximity to each Common Room hotspot
        CONFIG.commonRoom.hotspots.forEach(hs => {
            const hsX = (hs.xPct / 100) * worldW;
            const hsDist = Math.abs(charX - hsX);

            // Glow when near
            const marker = worldEl.querySelector(`.hotspot-marker[data-id="${hs.id}"]`);
            if (marker) {
                marker.classList.toggle('near', hsDist < CONFIG.commonRoom.hotspotRadius);
            }
            if (hsDist < CONFIG.commonRoom.hotspotRadius && !canInteract) {
                canInteract = true;
                currentInteraction = hs.id;
                show(interactBtn);
                interactBtn.textContent = `${hs.label} ⏎`;
                positionInteractButton(hsX, getGroundY() - CONFIG.character.height);
            }
        });
    }

    // Hide interact button if nothing nearby
    if (!canInteract) {
        hide(interactBtn);
    }


}

// =============================================
// SPOTLIGHT
// =============================================
function updateSpotlight() {
    if (!spotlightEl) return;
    const screenX = charX - cameraX;
    const screenY = charY - CONFIG.character.height / 2;
    spotlightEl.style.setProperty('--spotlight-x', screenX + 'px');
    spotlightEl.style.setProperty('--spotlight-y', screenY + 'px');
}

function enableSpotlight() {
    spotlightEl.classList.add('active', 'spotlight');
}

// =============================================
// START GAME
// =============================================
function startGame() {
    show(gameEl);
    setupScene('outside');
    initTheme();
    setupTouchControls();
    enableSpotlight();
    if (window.va) va('event', 'game_start');

    // Make game div focusable and grab focus so keys work on deployed sites
    gameEl.setAttribute('tabindex', '0');
    gameEl.style.outline = 'none';
    gameEl.focus();

    // Keep controls and dialog links focusable when clicked.
    gameEl.addEventListener('click', event => {
        if (!overlayOpen && !event.target.closest('a, button, input, iframe, [contenteditable="true"]')) gameEl.focus();
    });

    // Show instructions
    show(instructionsEl);

    // Welcome chat
    setTimeout(() => {
        if (!walkthrough.active) showChat('Welcome to Susan Ho\'s Personal Space! Use arrow keys to explore.');
        resetIdleChatTimer();
    }, 500);

    // Start game loop
    requestAnimationFrame(tick);
}

// =============================================
// RESIZE HANDLING
// =============================================
window.addEventListener('resize', () => {
    if (gameEl.classList.contains('hidden')) return;
    const position = worldW ? charX / worldW : 0.25;
    const facing = lastFacing;
    updateCharacterDimensions();
    clearMovement();
    setupScene(scene);
    charX = position * worldW;
    lastFacing = facing;
    placeCharacter();
    centerCamera();
});

// =============================================
// INIT
// =============================================
runLoadingScreen();
