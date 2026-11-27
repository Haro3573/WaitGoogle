// This function runs in the page's isolated world through chrome.scripting.
export function readPage(kind) {
  const visibleText = element => (element?.innerText || '').trim();
  if (kind === 'ad') {
    const ad = document.querySelector('[data-waitgoogle-ad], main a:has(img), article a:has(img)');
    if (!ad) throw new Error('No supported image ad was found on this page.');
    const img = ad.querySelector('img');
    let image = '';
    if (img?.complete && img.naturalWidth) {
      try {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(1, 720 / Math.max(img.naturalWidth, img.naturalHeight));
        canvas.width = Math.round(img.naturalWidth * ratio);
        canvas.height = Math.round(img.naturalHeight * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        image = canvas.toDataURL('image/jpeg', 0.85);
      } catch {
        // Some third-party images cannot be copied. Keep their visible caption.
      }
    }
    return { text: [visibleText(ad), img?.alt].filter(Boolean).join('\n').slice(0, 3000), image };
  }
  const product = document.querySelector('[data-waitgoogle-product], main, article') || document.body;
  return { text: visibleText(product).slice(0, 6500) };
}

export async function capture(kind) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: readPage,
      args: [kind]
    });
    if (!result?.result?.text && !result?.result?.image) throw new Error('No product evidence was found.');
    return result.result;
  } catch (error) {
    if (String(error.message).includes('permission') || String(error.message).includes('Cannot access')) {
      throw new Error('Click the WaitGoogle toolbar icon on this tab to grant page access, then retry.');
    }
    throw error;
  }
}
