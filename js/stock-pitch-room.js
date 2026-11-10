// Render only published, supplied pitch decks. No stock opinions are generated here.
const pitchSearch = document.getElementById('pitch-search');
const pitchYear = document.getElementById('pitch-year');

function pitchUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
        const url = new URL(value, window.location.origin);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
}
function pitchDate(date) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
    const parsed = new Date(`${date}T12:00:00Z`);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleDateString('en-CA', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}
function publishedPitches() {
    return STOCK_PITCHES.filter(pitch => pitch && typeof pitch.id === 'string' && typeof pitch.title === 'string' && pitchUrl(pitch.pdf))
        .slice().sort((a, b) => String(b.date || b.asOf || '').localeCompare(String(a.date || a.asOf || '')));
}
function pitchMetadata(pitch) {
    const date = pitch.date ? pitchDate(pitch.date) : pitch.asOf ? `Data as of ${pitchDate(pitch.asOf)}` : '';
    return [pitch.company, pitch.ticker, date].filter(Boolean).join(' · ');
}
function renderStockPitch(pitch) {
    const pdf = pitchUrl(pitch.pdf);
    if (!pdf) return;
    document.getElementById('pitch-viewer-title').textContent = pitch.title;
    document.getElementById('pitch-viewer-meta').textContent = pitchMetadata(pitch);
    document.getElementById('pitch-viewer-summary').textContent = pitch.summary || '';
    const frame = document.getElementById('pitch-viewer');
    frame.src = `${pdf.split('#')[0]}#toolbar=0`;
    frame.title = `${pitch.title} presentation`;
    document.getElementById('pitch-download').href = pdf;
    document.getElementById('pitch-open').href = pdf;
    const slides = document.getElementById('pitch-slides');
    const slidesUrl = pitchUrl(pitch.slides);
    slides.hidden = !slidesUrl;
    if (slidesUrl) slides.href = slidesUrl;
    else slides.removeAttribute('href');
    return true;
}
function openStockPitch(pitch) {
    if (!renderStockPitch(pitch)) return;
    setRoute('/common-room', { scene: 'commonRoom', overlayId: 'room-pitch', pitchId: pitch.id });
    openOverlay('room-pitch', false);
}
function renderStockPitches() {
    const all = publishedPitches();
    const query = pitchSearch.value.trim().toLowerCase();
    const pitches = all.filter(pitch => (!pitchYear.value || (pitchYear.value === 'undated' ? !pitch.date && !pitch.asOf : String(pitch.date || pitch.asOf || '').startsWith(pitchYear.value))) &&
        (!query || [pitch.title, pitch.company, pitch.ticker, pitch.summary].join(' ').toLowerCase().includes(query)));
    const grid = document.getElementById('pitch-grid');
    grid.replaceChildren();
    for (const pitch of pitches) {
        const card = document.createElement('article');
        card.className = 'pitch-card';
        const meta = document.createElement('p');
        meta.className = 'pitch-meta';
        meta.textContent = pitchMetadata(pitch);
        const title = document.createElement('h3');
        title.textContent = pitch.title;
        const summary = document.createElement('p');
        summary.textContent = pitch.summary || '';
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Read presentation →';
        button.setAttribute('aria-label', `Read ${pitch.title}`);
        button.addEventListener('click', () => openStockPitch(pitch));
        card.append(meta, title, summary, button);
        grid.appendChild(card);
    }
    document.getElementById('pitch-filters').hidden = all.length === 0;
    document.getElementById('pitch-count').textContent = all.length ? `${pitches.length} ${pitches.length === 1 ? 'presentation' : 'presentations'}` : '';
    document.getElementById('pitch-empty').hidden = pitches.length > 0;
    document.getElementById('pitch-empty-title').textContent = all.length ? 'No pitches match this search' : 'The first pitch is on its way';
    document.getElementById('pitch-empty-copy').textContent = all.length ? 'Try a different company, ticker, or year.' : 'Stock-pitch presentations will be published here.';
    document.getElementById('pitch-reset').hidden = all.length === 0;
}
function stockPitchOverlayOpened(id) {
    if (id === 'room-pitch') {
        const selected = publishedPitches().find(pitch => pitch.id === history.state?.pitchId);
        if (selected) renderStockPitch(selected);
    }
    if (id === 'room-pitches') {
        const currentYear = pitchYear.value;
        const years = [...new Set(publishedPitches().map(pitch => String(pitch.date || pitch.asOf || '').slice(0, 4)).filter(year => /^\d{4}$/.test(year)))].sort().reverse();
        pitchYear.replaceChildren(new Option('All years', ''));
        years.forEach(year => pitchYear.appendChild(new Option(year, year)));
        const hasUndated = publishedPitches().some(pitch => !pitch.date && !pitch.asOf);
        if (hasUndated) pitchYear.appendChild(new Option('Date not specified', 'undated'));
        if (years.includes(currentYear) || hasUndated && currentYear === 'undated') pitchYear.value = currentYear;
        renderStockPitches();
        renderPitchGallery();
        setPitchLibraryView(galleryListView);
    }
}
pitchSearch.addEventListener('input', renderStockPitches);
pitchYear.addEventListener('change', renderStockPitches);
document.getElementById('pitch-reset').addEventListener('click', () => {
    pitchSearch.value = '';
    pitchYear.value = '';
    renderStockPitches();
    pitchSearch.focus();
});
document.getElementById('pitch-back').addEventListener('click', () => openOverlay('room-pitches'));

// A visitor-led exhibition: arrows, keyboard, thumbnails, or a horizontal swipe.
let galleryIndex = 0;
let galleryListView = false;
let galleryPointer = null;
let gallerySuppressClick = false;
function renderPitchGallery() {
    const pitches = publishedPitches();
    if (!pitches.length) { setPitchLibraryView(true); return; }
    galleryIndex = (galleryIndex + pitches.length) % pitches.length;
    const pitch = pitches[galleryIndex];
    const image = document.getElementById('gallery-art');
    image.src = pitchUrl(pitch.art) || '';
    image.alt = pitch.artAlt || `${pitch.company} exhibit`;
    document.getElementById('gallery-art-button').setAttribute('aria-label', `Open ${pitch.title}`);
    document.getElementById('gallery-number').textContent = `EXHIBIT ${String(galleryIndex + 1).padStart(2, '0')} / ${String(pitches.length).padStart(2, '0')}`;
    document.getElementById('gallery-theme').textContent = pitch.theme || 'Investment research';
    document.getElementById('gallery-title').textContent = pitch.exhibit || pitch.company;
    document.getElementById('gallery-meta').textContent = pitchMetadata(pitch);
    document.getElementById('gallery-summary').textContent = pitch.summary || '';
    const tabs = document.getElementById('gallery-tabs');
    // Keep the controls in place so keyboard focus survives selection changes.
    if (tabs.children.length !== pitches.length) {
        tabs.replaceChildren();
        pitches.forEach((item, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('aria-label', `Show ${item.company} exhibit`);
            const thumbnail = document.createElement('img');
            thumbnail.src = pitchUrl(item.art) || '';
            thumbnail.alt = '';
            const label = document.createElement('span');
            label.textContent = item.ticker;
            button.append(thumbnail, label);
            button.addEventListener('click', () => { galleryIndex = index; renderPitchGallery(); });
            tabs.appendChild(button);
        });
    }
    [...tabs.children].forEach((button, index) => button.setAttribute('aria-pressed', String(index === galleryIndex)));
}
function moveGallery(direction) {
    galleryIndex += direction;
    renderPitchGallery();
}
function setPitchLibraryView(listView) {
    galleryListView = listView;
    document.getElementById('pitch-list-view').hidden = !listView;
    document.getElementById('pitch-gallery').hidden = listView;
    const toggle = document.getElementById('pitch-view-toggle');
    toggle.textContent = listView ? '← Back to gallery' : 'View all pitches';
    toggle.setAttribute('aria-expanded', String(listView));
}
function openGalleryPitch() {
    if (gallerySuppressClick) return;
    const pitch = publishedPitches()[galleryIndex];
    if (pitch) openStockPitch(pitch);
}
document.getElementById('pitch-view-toggle').addEventListener('click', () => setPitchLibraryView(!galleryListView));
document.getElementById('gallery-previous').addEventListener('click', () => moveGallery(-1));
document.getElementById('gallery-next').addEventListener('click', () => moveGallery(1));
document.getElementById('gallery-open').addEventListener('click', openGalleryPitch);
document.getElementById('gallery-art-button').addEventListener('click', openGalleryPitch);
document.getElementById('pitch-gallery').addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        if (event.key === 'Home') galleryIndex = 0;
        else if (event.key === 'End') galleryIndex = publishedPitches().length - 1;
        else galleryIndex += event.key === 'ArrowRight' ? 1 : -1;
        renderPitchGallery();
    }
});
const galleryStage = document.getElementById('gallery-art-stage');
galleryStage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    galleryPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
});
galleryStage.addEventListener('pointermove', event => {
    if (!galleryPointer || galleryPointer.id !== event.pointerId) return;
    const dx = Math.abs(event.clientX - galleryPointer.x);
    const dy = Math.abs(event.clientY - galleryPointer.y);
    if (dx > 10 && dx > dy) galleryStage.setPointerCapture(event.pointerId);
});
galleryStage.addEventListener('pointerup', event => {
    if (!galleryPointer || galleryPointer.id !== event.pointerId) return;
    const dx = event.clientX - galleryPointer.x;
    const dy = event.clientY - galleryPointer.y;
    galleryPointer = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        gallerySuppressClick = true;
        moveGallery(dx < 0 ? 1 : -1);
        setTimeout(() => { gallerySuppressClick = false; }, 0);
    }
});
galleryStage.addEventListener('pointercancel', () => { galleryPointer = null; });
