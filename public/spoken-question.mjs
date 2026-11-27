export function isUnfinishedQuestion(speech) {
  const text = speech.trim();
  if (/[?!.]$/.test(text)) return false;
  const startsQuestion = /^(?:does|do|did|is|are|can|could|would|will|what|which|how|should)\b/i.test(text);
  return startsQuestion && /(?:\b(?:the|a|an|this|that|with|for|include|have|support)|\d)\s*$/i.test(text);
}
