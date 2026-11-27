const ad = document.querySelector('[data-waitgoogle-ad]');
if (ad) {
  ad.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const image = ad.querySelector('img');
      const canvas = document.createElement('canvas');
      await image.decode();
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d').drawImage(image, 0, 0);
      await chrome.storage.session.set({
        sampleTab: (await chrome.tabs.getCurrent()).id,
        ad: { text: ad.innerText, image: canvas.toDataURL('image/jpeg', 0.9) },
        product: null
      });
      location.assign(ad.href);
    } catch {
      document.querySelector('[role=status]').textContent = 'Could not save the sample advertisement. Try again.';
    }
  });
} else {
  const tab = await chrome.tabs.getCurrent();
  const { sampleTab } = await chrome.storage.session.get('sampleTab');
  if (tab.id === sampleTab) {
    const text = document.querySelector('[data-waitgoogle-product]').innerText;
    await chrome.storage.session.set({ product: { text } });
    await chrome.storage.session.remove('sampleTab');
  }
}
