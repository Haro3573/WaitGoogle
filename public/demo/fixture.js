const ads = document.querySelectorAll('[data-waitgoogle-ad]');
if (ads.length) {
  for (const ad of ads) ad.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const image = ad.querySelector('img');
      const canvas = document.createElement('canvas');
      await image.decode();
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d').drawImage(image, 0, 0);
      await chrome.storage.session.set({ offer: {
        id: crypto.randomUUID(), tabId: (await chrome.tabs.getCurrent()).id,
        ad: { text: ad.innerText, image: canvas.toDataURL('image/jpeg', 0.9) },
        product: null, sample: true
      } });
      location.assign(ad.href);
    } catch {
      document.querySelector('[role=status]').textContent = 'Could not save the sample advertisement. Try again.';
    }
  });
} else {
  if (new URLSearchParams(location.search).get('offer') === 'unclear') {
    for (const standard of document.querySelectorAll('[data-standard-offer]')) standard.hidden = true;
    document.querySelector('[data-unclear-offer]').hidden = false;
  }
  const tab = await chrome.tabs.getCurrent();
  const { offer } = await chrome.storage.session.get('offer');
  if (offer?.sample && tab.id === offer.tabId) {
    const text = document.querySelector('[data-waitgoogle-product]').innerText;
    await chrome.storage.session.set({ offer: { ...offer, product: { text } } });
  }
}
