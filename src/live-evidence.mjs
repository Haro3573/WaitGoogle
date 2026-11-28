const pricePattern = /\$\s*(\d[\d,]*(?:\.\d{1,2})?)(?!\d|\.\d)/g;
const spokenPricePattern = /(?:\$\s*|\bdollars?\s+)(\d[\d,]*(?:\.\d{1,2})?)(?!\d|\.\d)|\b(\d[\d,]*(?:\.\d{1,2})?)\s+dollars?\b/gi;

const optionPricePattern = /\b(\d[\d,]*(?:\.\d{1,2})?)\s+(?:option|variant|model|offer|version)\b/gi;

const bareVariantPricePattern = /\bthe\s+(\d[\d,]*(?:\.\d{1,2})?)(?!\d|\.\d)/gi;

function amounts(text, pattern) {
  return [...text.matchAll(pattern)].map(match => Number((match[1] ?? match[2]).replaceAll(',', '')));
}

export function productEvidenceForSpeech(speech, productText = '') {
  const lines = productText.split('\n').map(line => line.trim()).filter(Boolean);
  const headings = lines.flatMap((line, index) => {
    const linePrices = amounts(line, pricePattern);
    return linePrices.length ? [{ index, linePrices }] : [];
  });
  const onPage = new Set(headings.flatMap(heading => heading.linePrices));
  const explicitPrices = [...amounts(speech, spokenPricePattern), ...amounts(speech, optionPricePattern)];
  const prices = explicitPrices.length
    ? explicitPrices
    : amounts(speech, bareVariantPricePattern).filter(price => onPage.has(price));
  if (prices.length === 0) return { lines, priceScoped: false };

  const matches = [];
  for (const [index, heading] of headings.entries()) {
    if (heading.linePrices.length !== 1 || !prices.includes(heading.linePrices[0])) continue;
    const next = headings[index + 1]?.index ?? lines.length;
    matches.push(...lines.slice(heading.index, Math.min(next, heading.index + 5)));
  }
  return { lines: matches, priceScoped: true };
}

export function renderLiveEvidence(selection, { lines, priceScoped }) {
  if (/^SKIP[.!]?$/i.test(selection.trim())) return '';
  if (priceScoped && lines.length) return 'The captured product page says:\n' + lines.join('\n');

  const match = /^LINE\s+(\d+)[.!]?$/i.exec(selection.trim());
  const line = match && lines[Number(match[1]) - 1];
  return line ? 'The captured product page says:\n' + line
    : 'I couldn’t verify that from the captured product page.';
}
