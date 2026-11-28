import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const worker = await readFile(new URL('../public/background.js', import.meta.url), 'utf8');

function loadWorker(landing) {
  const log = [];
  let offer;
  let click;
  let complete;
  const saved = new Promise(resolve => { complete = resolve; });
  const chrome = {
    runtime: { onInstalled: { addListener() {} }, onMessage: { addListener(fn) { click = fn; } } },
    sidePanel: { async open() { log.push('panel opened'); } },
    scripting: { async executeScript() { return [{ result: landing }]; } },
    storage: { session: {
      async get() { return { offer }; },
      async set(value) {
        offer = value.offer;
        log.push(offer.product ? 'product attached' : 'ad saved');
        if (!landing || offer.product) complete();
      }
    } },
    tabs: { async get() { return { status: 'complete' }; }, onUpdated: { addListener() {} } }
  };
  runInNewContext(worker, { chrome, console, crypto, URL });
  return { click, log, saved, getOffer: () => offer };
}

const message = {
  captureAdClick: true, sameTab: true, source: 'https://example.test/ads', destination: 'https://example.test/offer',
  ad: { text: 'Ad for earbuds', image: 'data:image/jpeg;base64,AAAA' }
};
const sender = { tab: { id: 7 }, frameId: 0 };

test('a click opens the panel and saves the ad before attaching its landing evidence', async () => {
  const fixture = loadWorker({ url: message.destination, text: 'The $49 offer lacks ANC.' });
  fixture.click(message, sender);
  await fixture.saved;
  assert.deepEqual(fixture.log, ['panel opened', 'ad saved', 'product attached']);
  assert.equal(fixture.getOffer().ad.image, message.ad.image);
  assert.equal(fixture.getOffer().product.text, 'The $49 offer lacks ANC.');
});

test('text-only ad capture starts without a screenshot or landing evidence', async () => {
  const fixture = loadWorker(null);
  fixture.click({ ...message, ad: { text: 'Ad for earbuds', image: '' }, sameTab: false }, sender);
  await fixture.saved;
  assert.equal(fixture.getOffer().ad.image, '');
  assert.equal(fixture.getOffer().product, null);
  assert.deepEqual(fixture.log, ['panel opened', 'ad saved']);
});
