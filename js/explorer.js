// A small field guide keeps exploration optional and portfolio content easy to find.
const discoveryLabels = { skills: 'Skills & Spells', experience: 'Work Experience', projects: 'Projects', about: 'About Susan' };
let discoveries = new Set();
try {
    const saved = JSON.parse(localStorage.getItem('hogwarts.discoveries') || '[]');
    if (Array.isArray(saved)) discoveries = new Set(saved.filter(id => Object.hasOwn(discoveryLabels, id)));
} catch { /* Exploration works without persistent storage. */ }

function updateExplorer() {
    const count = discoveries.size;
    document.getElementById('explorer-count').textContent = `${count} / 4 discovered`;
    document.getElementById('explorer-location').textContent = { outside: 'Castle Grounds', inside: 'Portfolio Corridor', commonRoom: 'Common Room' }[scene];
    document.getElementById('explorer-objective').textContent = count === 4
        ? 'All four pages discovered. Thank you for exploring!'
        : scene === 'outside' ? 'Walk right to the castle door and press E, or tap Enter Inside.'
        : scene === 'inside' ? 'Explore the glowing objects, or open a page below.'
        : 'Open the project desk, skills library, experience map, or introduction. Back returns to the corridor.';
    document.querySelectorAll('[data-discover]').forEach(button => {
        const visited = discoveries.has(button.dataset.discover);
        button.classList.toggle('discovered', visited);
        button.querySelector('.discovery-status').textContent = visited ? '✓' : '○';
        button.setAttribute('aria-label', `${discoveryLabels[button.dataset.discover]}${visited ? ', discovered' : ', not yet discovered'}`);
    });
}

function recordDiscovery(id) {
    if (!Object.hasOwn(discoveryLabels, id) || discoveries.has(id)) return;
    discoveries.add(id);
    try { localStorage.setItem('hogwarts.discoveries', JSON.stringify([...discoveries])); } catch { /* Optional persistence. */ }
    updateExplorer();
    if (discoveries.size === 4) showChat('All four pages discovered — thank you for exploring!', 5000);
}

document.querySelectorAll('[data-discover]').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('explorer-guide').open = false;
        openOverlay(button.dataset.discover);
    });
});
document.getElementById('explorer-guide').addEventListener('toggle', clearMovement);
window.addEventListener('keydown', event => {
    const guide = document.getElementById('explorer-guide');
    if (event.key === 'Escape' && guide.open && !overlayOpen) {
        guide.open = false;
        guide.querySelector('summary').focus();
    }
});

