// SCENE SETUP
// =============================================
function viewportSize() {
    return { w: window.innerWidth, h: window.innerHeight };
}

function getGroundY() {
    if (scene === 'outside') return worldH - CONFIG.physics.groundOffsetOutside;
    if (scene === 'commonRoom') return worldH * 0.91;
    return worldH - CONFIG.physics.groundOffsetInside;
}

function setupScene(sceneName) {
    scene = sceneName;
    clearMovement();
    updateCharacterDimensions();
    const roomHeight = Math.min(500, Math.max(220, window.innerHeight * 0.5));
    if (sceneName === 'commonRoom') {
        CONFIG.character.height = roomHeight;
        CONFIG.character.width = roomHeight * 268 / 509;
        charEl.style.height = roomHeight + 'px';
        charEl.style.width = CONFIG.character.width + 'px';
    } else {
        charEl.style.height = '';
        charEl.style.width = '';
    }
    const { w, h } = viewportSize();

    // Clear existing world decorations
    worldEl.querySelectorAll('.hotspot-marker, .door-marker, .ground-outside, .ground-inside, .ground-commonroom, .torch, .castle-decor, .greeting-text, .instruction-text').forEach(el => el.remove());

    if (sceneName === 'outside') {
        worldW = Math.max(w, h * 1.77); // Ensure it fills the screen width at minimum
        worldH = h;
        bgEl.className = 'scene-outside';
        applyTheme(themeMode);
        bgEl.style.width = worldW + 'px';
        bgEl.style.height = worldH + 'px';
        worldEl.style.width = worldW + 'px';
        worldEl.style.height = worldH + 'px';

        // Add ground
        const ground = document.createElement('div');
        ground.className = 'ground-outside';
        worldEl.appendChild(ground);

        // Add door hotspot over the background illustration
        // In the provided image, the door is perfectly centered
        const doorX = (50 / 100) * worldW;
        const door = document.createElement('div');
        door.className = 'door-marker';
        door.style.left = doorX + 'px';
        door.style.width = '300px';
        // door rests exactly on the ground
        door.style.bottom = CONFIG.physics.groundOffsetOutside + 'px';
        worldEl.appendChild(door);

        // Add castle decorations
        addOutsideDecorations();

        // Hide back button
        backButton.classList.add('hidden');
        
        // Show interact button (outside scene uses it for door interaction)
        interactBtn.classList.remove('inside-scene');

        // Spawn character
        charX = (CONFIG.character.spawnOutside.xPct / 100) * worldW;
        charY = getGroundY();

    } else if (sceneName === 'inside') {
        const { h } = viewportSize();
        worldH = h;
        corridorScale = worldH / 475;
        // Set the world width strictly to the width of the scaled corridor background
        // The background image is 1600px wide naturally
        worldW = Math.max(1600 * corridorScale, window.innerWidth);
        
        bgEl.className = 'scene-inside';
        applyTheme(themeMode);
        bgEl.style.width = worldW + 'px';
        bgEl.style.height = worldH + 'px';
        worldEl.style.width = worldW + 'px';
        worldEl.style.height = worldH + 'px';

        // Add floor
        const floor = document.createElement('div');
        floor.className = 'ground-inside';
        worldEl.appendChild(floor);

        // Add torches
        addInsideDecorations();

        // Update back button label for corridor
        backButton.textContent = '⬅ Back Outside';

        // The shared proximity prompt supports keyboard, click, and touch input.
        interactBtn.classList.add('inside-scene');

        CONFIG.inside.hotspots.forEach(hs => {
            const marker = document.createElement('button');
            marker.type = 'button';
            marker.setAttribute('aria-label', hs.label);
            marker.className = 'hotspot-marker';
            marker.dataset.id = hs.id;

            // Place marker exactly over the corridor.jpg background item
            const hsWorldX = hs.bgImgX * corridorScale;
            const hsWorldY = hs.bgImgY * corridorScale;
            const iconW     = hs.bgImgW * corridorScale;
            const iconH     = hs.bgImgH * corridorScale;

            marker.style.left      = hsWorldX + 'px';
            marker.style.top       = hsWorldY + 'px';
            marker.style.transform = 'none'; // no centering — top-left anchored to item position

            // Icon sized to match the background item
            const iconHtml = hs.iconSrc
                ? `<img class="hotspot-icon-img" src="${hs.iconSrc}" alt="${hs.label}" style="width:${iconW}px;height:${iconH}px;">`
                : '';
            marker.innerHTML = `
        ${iconHtml}
        <span class="hotspot-label">${hs.label}</span>
      `;
            
            // Add click handler to open the overlay
            marker.addEventListener('click', () => {
                if (!overlayOpen) {
                    openOverlay(hs.id);
                }
            });
            
            worldEl.appendChild(marker);
        });

        // Show back button
        backButton.classList.remove('hidden');

        // Spawn character
        charX = (CONFIG.character.spawnInside.xPct / 100) * worldW;
        charY = getGroundY();
    } else if (sceneName == 'commonRoom') {
        const {w, h} = viewportSize();
        worldH = h;
        worldW = Math.max(w, h * 2752 / 1536);

        bgEl.className = 'scene-common-room';
        applyTheme(themeMode);
        bgEl.style.width = worldW + 'px';
        bgEl.style.height = worldH + 'px';
        worldEl.style.width = worldW + 'px';
        worldEl.style.height = worldH + 'px';

        // Add floor
        const floor = document.createElement('div');
        floor.className = 'ground-commonroom';
        worldEl.appendChild(floor);

        // Add Common Room hotspot markers (upstairs, sit, window)
        CONFIG.commonRoom.hotspots.forEach(hs => {
            const marker = document.createElement('button');
            marker.type = 'button';
            marker.setAttribute('aria-label', hs.label);
            marker.className = 'hotspot-marker';
            marker.dataset.id = hs.id;

            // Position as a % of the viewport
            const hsX = (hs.xPct / 100) * worldW;
            const hsY = (hs.yPct / 100) * worldH;
            marker.style.left = hsX + 'px';
            marker.style.top  = hsY + 'px';

            marker.innerHTML = `
                <span class="room-marker-number">${hs.glyph}</span>
                <span class="hotspot-label">${hs.label}</span>
            `;

            marker.addEventListener('click', () => {
                if (!overlayOpen && !sceneTransitioning) openOverlay(hs.overlay);
            });

            worldEl.appendChild(marker);
        });

        // Add decorations
        addCommonRoomDecorations();

        // Show back button with 'Back' label — returns to corridor
        backButton.classList.remove('hidden');
        backButton.textContent = '⬅ Back';

        // Common Room hotspots support both keyboard and touch interaction.
        interactBtn.classList.remove('inside-scene');

        // Spawn character
        charX = (CONFIG.character.spawnCommonRoom.xPct / 100) * worldW;
        charY = getGroundY();
    }

    vy = 0;
    onGround = true;
    lastFacing = 1;
    charEl.style.setProperty('--facing', '1');
    setCharacterSprite(SPRITES.idle);

    // Half-body mode for the corridor scene
    if (sceneName === 'inside') {
        charEl.classList.add('half-body');
    } else {
        charEl.classList.remove('half-body');
    }

    placeCharacter();
    centerCamera();
    if (typeof updateExplorer === 'function') updateExplorer();
}

function addOutsideDecorations() {
    // Fiona Fang style greeting title
    const greeting = document.createElement('div');
    greeting.className = 'greeting-text';
    greeting.innerHTML = `I'm <span class="highlight">Susan Ho</span>,<br>Come in ➔`;
    worldEl.appendChild(greeting);

    // Instructional text at the bottom
    const instruction = document.createElement('div');
    instruction.className = 'instruction-text';
    instruction.innerHTML = `Use arrow or WASD keys to move & press E to interact`;
    worldEl.appendChild(instruction);
}

function addInsideDecorations() {
    // Corridor background already has paintings, sconces, and decor — no overlaid emoji needed.
}

function addCommonRoomDecorations() {
}

// =============================================
// CHARACTER PLACEMENT & CAMERA
// =============================================
function placeCharacter() {
    charEl.style.left = charX + 'px';
    charEl.style.top = charY + 'px';

    // One scale only: the room character uses the same floor plane as the furniture.
    charEl.style.transform = '';
    charEl.style.zIndex = '';

}

function centerCamera() {
    const { w, h } = viewportSize();
    const targetX = clamp(charX - w / 2, 0, Math.max(0, worldW - w));
    cameraX = targetX;
    worldEl.style.transform = `translateX(${-cameraX}px)`;
}

function smoothCamera(dt) {
    const { w } = viewportSize();
    const targetX = clamp(charX - w / 2, 0, Math.max(0, worldW - w));
    cameraX = lerp(cameraX, targetX, Math.min(1, dt * 5));
    worldEl.style.transform = `translateX(${-cameraX}px)`;
}

// =============================================
// UTILITIES
// =============================================
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function show(el) { if (el) el.classList.remove('hidden'); }
function hide(el) { if (el) el.classList.add('hidden'); }

// =============================================