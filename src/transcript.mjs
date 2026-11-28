const questionStart = /^(?:(?:and|also|so)\s+)?(?:does|do|did|is|are|can|could|would|will|what|which|where|when|why|how|should|have|has)\b/i;
const requestStart = /^(?:please\s+)?(?:tell me|show me|help me|check|compare|find|i want to know|i(?: am|'m) wondering)\b/i;

export function isUnfinishedQuestion(speech) {
  const text = speech.trim();
  if (/[?!.]$/.test(text)) return false;
  return questionStart.test(text) && /(?:\b(?:the|a|an|this|that|with|for|include|have|support)|\d)\s*$/i.test(text);
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
    const questionText = transcript.slice(index, index + quote.length);
    const hasQuestionMark = transcript[index + quote.length] === '?';
    if (!hasQuestionMark && !questionStart.test(questionText) && !requestStart.test(questionText)) continue;
    const end = offset + index + quote.length;
    spans.push({ question: questionText, start: offset + index, end });
  }
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  return spans.filter(span => {
    if (span.start < answeredThrough) return false;
    answeredThrough = span.end;
    return true;
  });
}
