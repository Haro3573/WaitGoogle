import { initializeApp } from '@firebase/app';
import { initializeAppCheck, CustomProvider, getToken } from '@firebase/app-check';
import { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } from '@firebase/ai';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let localText;
let localImage;
let cloud;
let appCheck;

function firebaseApp() {
  if (Object.values(config).some(value => !value)) {
    throw new Error('Firebase web app configuration is missing. See the setup instructions.');
  }
  return app ??= initializeApp(config);
}

export function localModel(withImage = false) {
  const ai = getAI(firebaseApp(), { backend: new GoogleAIBackend() });
  if (withImage) {
    return localImage ??= getGenerativeModel(ai, { mode: InferenceMode.ONLY_ON_DEVICE });
  }
  return localText ??= getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_ON_DEVICE,
    onDeviceParams: { createOptions: { expectedInputs: [{ type: 'text', languages: ['en'] }] } }
  });
}

export async function sendApprovedText(text, history = []) {
  if (!cloud) {
    const stored = await chrome.storage.local.get('appCheckDebugToken');
    if (!stored.appCheckDebugToken) throw new Error('Register an App Check debug token and add it in the extension settings.');
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = stored.appCheckDebugToken;
    const cloudApp = initializeApp(firebaseApp().options, 'approved-cloud');
    // The debug token is configured on this installation only.
    appCheck = initializeAppCheck(cloudApp, {
      provider: new CustomProvider({
        getToken: async () => { throw new Error('App Check debug mode is required for this extension build.'); }
      })
    });
    cloud = getGenerativeModel(getAI(cloudApp, { backend: new GoogleAIBackend() }), {
      mode: InferenceMode.ONLY_IN_CLOUD,
      model: import.meta.env.VITE_CLOUD_MODEL || 'gemini-3.5-flash-lite'
    });
  }
  await getToken(appCheck);
  const contents = [...history, { role: 'user', parts: [{ text }] }];
  return (await cloud.generateContent({ contents })).response.text();
}
