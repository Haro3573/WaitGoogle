chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message?.captureAdClick || !sender.tab?.id || sender.frameId !== 0) return;
  // Call open before any asynchronous work while Chrome still has the click gesture.
  chrome.sidePanel.open({ tabId: sender.tab.id }).catch(() => {});
  captureOffer(message, sender.tab).catch(console.error);
});

async function captureOffer(message, tab) {
  const destination = new URL(message.destination);
  const source = new URL(message.source);
  if (!['http:', 'https:'].includes(destination.protocol)) return;
  const ad = message.ad;
  if (!ad || typeof ad.text !== 'string' || typeof ad.image !== 'string') return;
  const image = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(ad.image) ? ad.image : '';
  if (!ad.text && !image) return;
  const offer = {
    id: crypto.randomUUID(), tabId: tab.id, source: source.href, destination: destination.href,
    ad: { text: ad.text.slice(0, 3000), image }, product: null,
    pendingLanding: message.sameTab === true
  };
  await chrome.storage.session.set({ offer });
  if (offer.pendingLanding) {
    const current = await chrome.tabs.get(tab.id);
    if (current.status === 'complete') await captureLanding(tab.id);
  }
}

chrome.tabs.onUpdated.addListener((tabId, changes) => {
  if (changes.status === 'complete') captureLanding(tabId).catch(console.error);
});

async function captureLanding(tabId) {
  const { offer } = await chrome.storage.session.get('offer');
  if (!offer?.pendingLanding || offer.tabId !== tabId) return;
  try {
    const [capture] = await chrome.scripting.executeScript({ target: { tabId }, func: readLanding });
    if (!capture?.result || capture.result.url === offer.source) return;
    const captured = new URL(capture.result.url);
    const destination = new URL(offer.destination);
    captured.hash = '';
    destination.hash = '';
    if (captured.href !== destination.href) return;
    const { offer: latest } = await chrome.storage.session.get('offer');
    if (latest?.id !== offer.id || !latest.pendingLanding) return;
    await chrome.storage.session.set({
      offer: { ...latest, product: capture.result.text ? { text: capture.result.text } : null, pendingLanding: false }
    });
  } catch {
    // A landing page outside the permitted site can be attached from the panel.
  }
}

function readLanding() {
  const root = document.querySelector('[data-waitgoogle-product], main, article') || document.body;
  return { url: location.href, text: (root?.innerText || '').trim().slice(0, 6500) };
}
