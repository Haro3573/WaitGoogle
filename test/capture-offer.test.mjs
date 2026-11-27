import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const background = await readFile(new URL('../public/background.js', import.meta.url), 'utf8');

function loadBackground(log, evidence) {
  let click;
  let finish;
  const finished = new Promise(resolve => { finish = resolve; });
  const chrome = {
    runtime: { onInstalled: { addListener() {} } },
    contextMenus: { onClicked: { addListener(callback) { click = callback; } } },
    sidePanel: { async open() {} },
    scripting: { async executeScript() { return [{ result: evidence }]; } },
    storage: { session: { async set(value) { log.push(['saved', value]); if (!value.ad) finish(); } } },
    tabs: { async update(id, value) { log.push(['navigated', id, value]); finish(); } }
  };
  runInNewContext(background, { chrome, URL });
  return { click, finished };
}

test('captures the selected ad and clears the previous offer before navigating', async () => {
  const log = [];
  const evidence = { text: 'Earbuds for $49', image: 'data:image/jpeg;base64,evidence' };
  const { click, finished } = loadBackground(log, evidence);
  const linkUrl = 'https://shop.example/earbuds';
  click({ menuItemId: 'capture-ad', linkUrl, srcUrl: 'https://shop.example/ad.jpg' }, { id: 18 });
  await finished;
  assert.equal(log[0][0], 'saved');
  assert.equal(log[0][1].ad, evidence);
  assert.equal(log[0][1].product, null);
  assert.equal(log[1][0], 'navigated');
  assert.equal(log[1][2].url, linkUrl);
});

test('shows a capture error without navigating when the image has no web destination', async () => {
  const log = [];
  const { click, finished } = loadBackground(log);
  click({ menuItemId: 'capture-ad', srcUrl: 'https://shop.example/ad.jpg' }, { id: 18 });
  await finished;
  assert.equal(log.length, 1);
  assert.match(log[0][1].captureNotice, /links to a product page/);
});
