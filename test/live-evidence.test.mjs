import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isUnfinishedQuestion, newTranscriptQuestions } from '../src/transcript.mjs';
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


test('holds the real split utterance and resolves its bare transcribed price', () => {
  const first = 'Does the 49';
  const complete = first + ' Option Include active noise cancellation';
  assert.equal(isUnfinishedQuestion(first), true);
  assert.equal(isUnfinishedQuestion(complete), false);
  const scope = productEvidenceForSpeech(complete, product);
  const answer = renderLiveEvidence('LINE 1', scope);
  assert.match(answer, /The Essential variant does not include active noise cancellation/);
  assert.doesNotMatch(answer, /The Plus variant/);
});


test('extracts two new verbatim spans, skips an overlap, and ignores invented text', () => {
  const text = 'Does the 49 option include ANC? Nice. How long does the 79 variant last?';
  const earlyEnd = 'Does the 49 option include ANC'.length;
  const questions = ['Does the 49 option include ANC?', 'How long does the 79 variant last?', 'Are they waterproof?', 'Does the 49'];
  assert.deepEqual(newTranscriptQuestions(questions, text, 100, 100 + earlyEnd).map(x => x.question), [
    'How long does the 79 variant last'
  ]);
  assert.equal(newTranscriptQuestions(questions, text, 100, 0).length, 2);
});


test('drops declarative speech misclassified by Nano and keeps its two real questions', () => {
  const text = 'I commute daily. Does the 49 option include ANC? How long does the 79 option last? I might shop next week.';
  const proposals = ['Does the 49 option include ANC?', 'How long does the 79 option last?', 'I might shop next week.'];
  assert.deepEqual(newTranscriptQuestions(proposals, text, 0, 0).map(span => span.question), proposals.slice(0, 2).map(q => q.slice(0, -1)));
});
