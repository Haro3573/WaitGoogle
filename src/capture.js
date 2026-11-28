export async function captureProduct(tabId) {
  try {
    const [capture] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const root = document.querySelector('[data-waitgoogle-product], main, article') || document.body;
        return (root?.innerText || '').trim().slice(0, 6500);
      }
    });
    if (!capture?.result) throw new Error('No product text found.');
    return { text: capture.result };
  } catch (error) {
    if (/permission|cannot access/i.test(error.message)) {
      throw new Error('Open WaitGoogle from the toolbar on the product tab, then try again.');
    }
    throw error;
  }
}

export async function enableAdClicks(tab) {
  const url = new URL(tab.url);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Open a shopping site first.');
  const origin = url.protocol + '//' + url.hostname + '/*';
  if (!await chrome.permissions.request({ origins: [origin] })) return false;
  const id = 'ads-' + url.protocol.slice(0, -1) + '-' + url.hostname.replace(/[^a-z0-9-]/gi, '-');
  const [registered] = await chrome.scripting.getRegisteredContentScripts({ ids: [id] });
  if (!registered) {
    await chrome.scripting.registerContentScripts([{ id, matches: [origin], js: ['ad-click.js'], runAt: 'document_start' }]);
  }
  await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['ad-click.js'] });
  return true;
}
