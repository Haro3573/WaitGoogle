import assert from 'node:assert/strict';
import { test } from 'node:test';
import { productEvidenceForSpeech, renderLiveEvidence } from '../src/live-evidence.mjs';

const product = [
  'Tide Buds Essential — $49',
  'The Essential variant does not include active noise cancellation.',
  'Tide Buds Plus — $79',
  'The Plus variant includes active noise cancellation.'
].join('\n');

test('shows $49 evidence even when Nano claims the $49 variant has ANC', () => {
  const scope = productEvidenceForSpeech('Just a dollar 49 option include active noise cancellation', product);
  const answer = renderLiveEvidence('The $49 option includes active noise cancellation.', scope);
  assert.match(answer, /does not include active noise cancellation/);
  assert.doesNotMatch(answer, /The Plus variant/);
});

test('shows $79 evidence when asked for the $79 option', () => {
  const scope = productEvidenceForSpeech('Do the 79 dollars earbuds have ANC?', product);
  assert.match(renderLiveEvidence('LINE 2', scope), /The Plus variant includes/);
});

test('never uses an unrelated price or an unverified free-text answer', () => {
  const scope = productEvidenceForSpeech('Does the $61 option include ANC?', product);
  assert.equal(renderLiveEvidence('LINE 4', scope), 'I couldn’t verify that from the captured product page.');
  assert.equal(renderLiveEvidence('SKIP', scope), '');
});

test('approves only existing source lines when there is no price in the question', () => {
  const scope = productEvidenceForSpeech('Does Essential include ANC?', product);
  assert.match(renderLiveEvidence('LINE 2', scope), /The Essential variant does not include/);
  assert.equal(renderLiveEvidence('LINE 999', scope), 'I couldn’t verify that from the captured product page.');
});
