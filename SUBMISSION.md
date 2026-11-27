# WaitGoogle Devpost draft

## Elevator pitch

WaitGoogle helps shoppers compare the ad they clicked with the offer they actually landed on. Gemini Nano handles the private consultation in Chrome. For deeper research, shoppers see and approve the text before Cloud Gemini receives it.

## Project description

An ad can show a feature and a price together even when that price applies to a different product variant. WaitGoogle preserves the ad before the shopper leaves it and keeps the ad and product-page evidence together in a Chrome side panel.

In the demo, an ad promotes wireless earbuds with active noise cancellation for $49. The product page shows that the $49 Essential variant lacks that feature. The $79 Plus variant includes it. The shopper can inspect the evidence and ask about tradeoffs for their budget and commute.

The extension invokes Firebase AI Logic in local-only mode for the image-and-text comparison and follow-up consultation. When Chrome supports local speech, shoppers can speak their question and review its transcript. The extension can draft a limited cloud request. The shopper can edit it, cancel it, or explicitly approve sending that exact text through an App Check-protected Firebase AI Logic request.

The sample merchant and offers are fictional. The browser extension was built during the hackathon. Installation and reviewer instructions are in the source repository README.

## Demo recording script

Target runtime is 2:50. Record the real extension and keep the side panel visible wherever it shows evidence, model output, or a consent decision. Record with English narration or align English captions to the final footage.

| Time | Show on screen | Suggested English narration |
| --- | --- | --- |
| 0:00–0:20 | Open the sample and click the $49 sponsored offer. Let the saved image and the product page appear together. | “The ad promises noise-canceling earbuds for forty-nine dollars. WaitGoogle saves that offer before we leave the ad and puts it next to the actual product page.” |
| 0:20–0:55 | Select **Compare with Gemini Nano**. Hold on the real answer and the Essential and Plus evidence. | “The forty-nine-dollar Essential variant lacks active noise cancellation. The seventy-nine-dollar Plus variant includes it. Gemini Nano compares the evidence on this device through Firebase AI Logic.” |
| 0:55–1:25 | Select **Start microphone**, then **Start local transcription** in the WaitGoogle tab. Speak the question and show the transcript back in the side panel before selecting **Ask locally**. | “I need these for my train commute and my budget is sixty dollars. What would I give up if I buy the Essential variant?” |
| 1:25–1:50 | Select **Prepare cloud request**. Show its text and size, then cancel. | “For a deeper comparison, WaitGoogle drafts a request I can edit. I can review what it would share, or cancel it.” |
| 1:50–2:25 | Draft the request again, edit it, choose **Approve and send**, and show the real Cloud Gemini response. | “I’ll ask for a checklist to compare the two variants for a noisy commute. Cloud Gemini receives the text I approved.” |
| 2:25–2:50 | Show that networking is off and run a new local comparison. End on the local result and WaitGoogle name. | “With the model installed, I can still compare an ad and its offer offline. The shopping context stays on this device until I choose what to share.” |

Capture the microphone transcript and successful local output before using the corresponding lines. If the live result differs from the suggested narration, revise the narration to match the footage. Keep the cloud token, browser profile details, and private tabs outside the recording.
