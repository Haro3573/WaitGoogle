# WaitGoogle

WaitGoogle is a desktop Chrome extension that preserves an image ad, compares it with the actual product offer, and helps shoppers decide what to buy. Firebase AI Logic runs the comparison and consultation on-device with Gemini Nano. For deeper research, the shopper reviews and approves the exact text sent to Cloud Gemini.

## Install for judging

1. Use desktop Google Chrome on a machine that supports Gemini Nano. See [Firebase's Chrome and model setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started), including the multimodal Prompt API setting for your browser version.
2. Use Node.js 22.12 or newer. Run `npm ci`. Copy `.env.example` to `.env.local` and supply the Firebase web app's API key, project ID, and app ID. The project must have Firebase AI Logic with the Gemini Developer API enabled.
3. Run `npm run build`. In `chrome://extensions`, enable Developer mode, select **Load unpacked**, and choose `dist`.
4. In Firebase App Check, register a judge-specific debug token for the web app. Enter it in the extension's **Options** page. Share judge tokens privately. The MV3 build uses the SDK's debug token exchange without loading remote reCAPTCHA scripts.
5. Pin WaitGoogle, open its side panel, and select **Set up local AI**. Allow any model download to finish before testing offline.

## Try the demo

Open **Open the sample ad**, and click the sponsored offer. The side panel saves the ad before navigation and reads the two variants on the destination page. On normal websites, click the extension toolbar icon on the current site if Chrome asks for page access. The fictional $49 Tide Buds Essential variant lacks active noise cancellation. The $79 Plus variant includes it. Select **Compare with Gemini Nano** and ask a follow-up about your commute and budget.

**Start microphone** uses the English on-device speech pack when Chrome supports it. Review the transcript and select **Ask locally**. The reply uses a local English speech synthesis voice when one is available.

**Prepare cloud request** creates an editable draft. Cancel to discard it, or select **Approve and send** to share the text with Cloud Gemini. Current cloud responses reason over the approved text. They do not fetch live listings.

## License

MIT.

## Verification

The sample ad opens from the extension itself and requires no merchant account. Use a separate Chrome profile for reviewer setup. Verify the local path after model download by turning off networking, comparing the ad with the offer, and asking a follow-up. Reconnect before testing the consent flow. The extension keeps the captured evidence in Chrome's session storage. Consultation turns are kept in the open panel.

Two additional fictional offers appear below the main sample. **Tide Buds Plus** is a match at $79 with ANC. **Tide Buds from $49** is inconclusive because the destination omits the per-variant prices and features. Compare each offer separately and check whether the response quotes the relevant text and distinguishes missing evidence from a mismatch.
