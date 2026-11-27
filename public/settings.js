document.querySelector('form').onsubmit = async event => {
  event.preventDefault();
  const field = document.querySelector('#token');
  const token = field.value.trim();
  if (token) await chrome.storage.local.set({ appCheckDebugToken: token });
  else await chrome.storage.local.remove('appCheckDebugToken');
  field.value = '';
  document.querySelector('[role=status]').textContent = 'Saved. Reopen the side panel to apply.';
};
