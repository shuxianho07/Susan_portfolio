const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const catalog = vm.runInNewContext(`${fs.readFileSync(path.join(root, 'js/stock-pitches.js'), 'utf8')}\nSTOCK_PITCHES`);

test('published pitches have unique identities and valid local PDF/PPTX assets', () => {
  assert.ok(catalog.length > 0, 'the published library must contain decks');
  const ids = new Set();
  for (const pitch of catalog) {
    assert.equal(ids.has(pitch.id), false, `duplicate pitch: ${pitch.id}`);
    ids.add(pitch.id);
    assert.ok(pitch.title && pitch.company && pitch.ticker && pitch.summary);
    for (const [field, extension, signature] of [['pdf', '.pdf', '%PDF-'], ['slides', '.pptx', 'PK']]) {
      assert.match(pitch[field], /^\/assets\/stock-pitches\/[a-z0-9-]+\.(pdf|pptx)$/);
      assert.equal(path.extname(pitch[field]), extension);
      const content = fs.readFileSync(path.join(root, pitch[field]));
      assert.ok(content.length > 1000, `${pitch.id} ${field} must not be empty`);
      assert.equal(content.subarray(0, signature.length).toString(), signature);
    }
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
