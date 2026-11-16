const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const catalog = vm.runInNewContext(`${fs.readFileSync(path.join(root, 'js/stock-pitches.js'), 'utf8')}\nSTOCK_PITCHES`);

test('published pitches have unique identities and valid viewing PDFs', () => {
  assert.ok(catalog.length > 0, 'the published library must contain decks');
  const ids = new Set();
  for (const pitch of catalog) {
    assert.equal(ids.has(pitch.id), false, `duplicate pitch: ${pitch.id}`);
    ids.add(pitch.id);
    assert.ok(pitch.title && pitch.company && pitch.ticker && pitch.summary);
    assert.match(pitch.pdf, /^\/assets\/stock-pitches\/[a-z0-9-]+\.pdf$/);
    const content = fs.readFileSync(path.join(root, pitch.pdf));
    assert.ok(content.length > 1000, `${pitch.id} PDF must not be empty`);
    assert.equal(content.subarray(0, 5).toString(), '%PDF-');
  }
});

test('presentation dates and data cutoffs are distinguished in the catalog', () => {
  for (const pitch of catalog) {
    assert.ok(!(pitch.date && pitch.asOf), `${pitch.id} must not label a cutoff as a presentation date`);
    for (const value of [pitch.date, pitch.asOf].filter(Boolean)) {
      assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10), value);
    }
  }
  assert.equal(catalog.find(pitch => pitch.id === 'teva').asOf, '2025-11-26');
  const flywire = catalog.find(pitch => pitch.id === 'flywire');
  assert.ok(!flywire.date && !flywire.asOf, 'do not infer an unstated Flywire date');
});

test('each gallery exhibit has an accessible label and a valid painted WebP asset', () => {
  for (const pitch of catalog) {
    assert.ok(pitch.exhibit && pitch.theme && pitch.artAlt, `${pitch.id} needs gallery labels`);
    assert.match(pitch.art, /^\/assets\/gallery\/[a-z0-9-]+\.webp$/);
    const image = fs.readFileSync(path.join(root, pitch.art));
    assert.equal(image.subarray(0, 4).toString(), 'RIFF');
    assert.equal(image.subarray(8, 12).toString(), 'WEBP');
  }
});


test('stock-pitch downloads and editable sources are not exposed by the site', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const viewer = html.slice(html.indexOf('id="overlay-room-pitch"'), html.indexOf('<!-- Portfolio overlays -->'));
  assert.doesNotMatch(viewer, /\bdownload(?:\s|=|>)/i);
  assert.doesNotMatch(html, /id="pitch-(?:download|open|slides)"/);
  assert.match(html, /id="resume-viewer"/);
  assert.match(html, /class="resume-download-btn"/);
  for (const pitch of catalog) assert.equal(Object.hasOwn(pitch, 'slides'), false);
  const files = fs.readdirSync(path.join(root, 'assets/stock-pitches'));
  assert.equal(files.some(name => /\.(pptx?|potx)$/i.test(name)), false);
  for (const file of ['.gitignore', '.vercelignore']) {
    assert.ok(fs.readFileSync(path.join(root, file), 'utf8').includes('assets/stock-pitches/*.pptx'));
  }
});
