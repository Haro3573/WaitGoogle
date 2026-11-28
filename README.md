# WaitGoogle

WaitGoogle is a Chrome extension that helps a shopper understand a clicked image ad. Gemini Nano reads the captured ad on-device and prepares an opening prompt. After the shopper approves the text, Gemini opens a conversation explaining the offer.

## Install

Download the [prebuilt Chrome ZIP](https://github.com/Haro3573/WaitGoogle/releases/latest/download/waitgoogle-chrome.zip). Extract it and use **Load unpacked** in `chrome://extensions` with Developer mode enabled.

To build from source, use Node.js 24.12 or newer, run `npm ci`, copy `.env.example` to `.env.local`, and enter the Firebase web app configuration. Enable Firebase AI Logic with the Gemini Developer API in that project, then run `npm run build` and load `dist`.

Use desktop Chrome with [on-device Gemini Nano support](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started). Open WaitGoogle and choose **Set up local AI** to download the model if needed. For the cloud conversation, enter the privately supplied Firebase App Check debug token in the extension's Options page.

## Shop with WaitGoogle

1. On a regular site, open the extension and choose **Enable on this site** once. Left-click a labelled image ad. The extension captures the visible image and text before the page leaves and opens the side panel. Ordinary links keep their usual behavior.
2. Nano prepares an opening prompt immediately. WaitGoogle adds product-page text when it has access to the destination. For a cross-site destination, open WaitGoogle from the toolbar on that page and choose **Capture product details** if you want to include it.
3. Review or edit the opening prompt and choose **Approve and start conversation**. Gemini explains the offer, flags gaps in the evidence, and asks what matters to you. You can reply about the same offer.

The prototype recognizes linked images in containers marked as sponsored, promoted, or ads. Cross-origin image restrictions can leave the captured caption as the available evidence. The cloud request carries reviewed text. The image itself stays on the device.

## Try the sample

Choose **Open the sample ad**, then left-click the $49 Tide Buds ad. The fictional product page shows that the $49 Essential variant lacks active noise cancellation, while the $79 Plus variant includes it. The sample requires no merchant account and attaches the product evidence automatically.

MIT license.
