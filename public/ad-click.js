(() => {
  if (globalThis.waitGoogleAdClick) return;
  globalThis.waitGoogleAdClick = true;
  const marker = /(?:^|[\s_-])(?:ad|ads|advertisement|sponsored|promoted)(?=$|[\s_-])/i;
  const labelled = element => marker.test([
    element.getAttribute('aria-label'), element.getAttribute('data-ad-label'),
    element.getAttribute('data-testid'), element.id, element.getAttribute('class')
  ].filter(Boolean).join(' ')) || element.hasAttribute('data-waitgoogle-ad') ||
    element.hasAttribute('data-ad') || element.hasAttribute('data-sponsored');

  document.addEventListener('click', event => {
    if (!event.isTrusted || event.button !== 0 || event.altKey || event.metaKey ||
        event.ctrlKey || event.shiftKey || !(event.target instanceof Element)) return;
    const link = event.target.closest('a[href]');
    if (!link || !/^https?:$/.test(link.protocol)) return;
    const img = event.target.closest('img') || link.querySelector('img');
    if (!img) return;

    let element = link;
    let adContainer = null;
    for (let depth = 0; element && depth < 4 && element !== document.body; depth += 1, element = element.parentElement) {
      const marked = labelled(element);
      if (!marked && element.querySelectorAll('a[href]:has(img)').length > 1) break;
      const label = element.querySelector('[data-ad-disclosure], [aria-label="Sponsored"], [aria-label="Advertisement"]');
      const visibleDisclosure = /^(?:sponsored|advertisement|promoted)(?:\s|$)/i.test((element.innerText || '').trim());
      if (marked || label || visibleDisclosure) {
        adContainer = element;
        break;
      }
    }
    if (!adContainer) return;

    const text = [link.innerText, img.alt, img.title, link.getAttribute('aria-label')].filter(Boolean).join('\n').slice(0, 3000);
    let image = '';
    if (img.complete && img.naturalWidth && img.naturalHeight) {
      try {
        const ratio = Math.min(1, 720 / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        image = canvas.toDataURL('image/jpeg', 0.85);
      } catch {
        // Some third-party images cannot be read from the page canvas.
      }
    }

    chrome.runtime.sendMessage({
      captureAdClick: true,
      ad: { text, image },
      destination: link.href,
      source: location.href,
      sameTab: !link.target || link.target.toLowerCase() === '_self'
    }).catch(() => {});
  }, { capture: true });
})();
