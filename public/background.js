const menuId = 'capture-ad';
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  chrome.contextMenus.create({
    id: menuId,
    title: 'Save image ad and open its offer',
    contexts: ['image'],
    documentUrlPatterns: ['https://*/*', 'http://*/*']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== menuId || !tab?.id) return;
  chrome.sidePanel.open({ tabId: tab.id }).catch(() => {});
  captureImageOffer(info, tab.id).catch(error => {
    chrome.storage.session.set({ captureNotice: error.message });
  });
});

async function captureImageOffer(info, tabId) {
  const destination = new URL(info.linkUrl || 'about:blank');
  if (!['http:', 'https:'].includes(destination.protocol)) {
    throw new Error('Choose an ad image that links to a product page.');
  }
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: readSelectedImage,
    args: [info.srcUrl, destination.href]
  });
  if (!result?.text && !result?.image) throw new Error('The selected ad could not be captured.');
  const captureNotice = result.image ? 'Ad saved. Capture the product page after it opens.' :
    'Ad text saved. The image could not be copied from this site.';
  await chrome.storage.session.set({ ad: result, product: null, captureNotice });
  await chrome.tabs.update(tabId, { url: destination.href });
}

function readSelectedImage(imageUrl, destination) {
  const images = [...document.images];
  const img = images.find(image => (image.currentSrc === imageUrl || image.src === imageUrl) &&
    image.closest('a[href]')?.href === destination);
  if (!img) return null;
  const link = img.closest('a[href]');
  const text = [link.innerText, img.alt, img.title, link.getAttribute('aria-label')]
    .filter(Boolean).join('\n').slice(0, 3000);
  let image = '';
  if (img.complete && img.naturalWidth && img.naturalHeight) {
    try {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(1, 720 / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      image = canvas.toDataURL('image/jpeg', 0.85);
    } catch {
      // Cross-origin images may block pixel access.
    }
  }
  return { text, image };
}
