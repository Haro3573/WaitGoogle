export function isUnfinishedQuestion(speech) {
  const text = speech.trim();
  if (/[?!.]$/.test(text)) return false;
  const startsQuestion = /^(?:does|do|did|is|are|can|could|would|will|what|which|how|should)\b/i.test(text);
  return startsQuestion && /(?:\b(?:the|a|an|this|that|with|for|include|have|support)|\d)\s*$/i.test(text);
}

export function newTranscriptQuestions(questions, transcript, offset, answeredThrough) {
  if (!Array.isArray(questions)) return [];
  const lowerTranscript = transcript.toLowerCase();
  const spans = [];
  for (const question of questions.slice(0, 6)) {
    if (typeof question !== 'string') continue;
    const quote = question.trim().replace(/[?!.]+$/, '');
    if (!quote || isUnfinishedQuestion(quote)) continue;
    const searchStart = Math.max(0, answeredThrough - offset - quote.length + 1);
    const index = lowerTranscript.indexOf(quote.toLowerCase(), searchStart);
    if (index < 0) continue;
    const end = offset + index + quote.length;
    spans.push({ question: transcript.slice(index, index + quote.length), start: offset + index, end });
  }
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  return spans.filter(span => {
    if (span.start < answeredThrough) return false;
    answeredThrough = span.end;
    return true;
  });
}
