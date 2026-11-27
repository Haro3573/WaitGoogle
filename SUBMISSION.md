# WaitGoogle Devpost draft

## Elevator pitch

WaitGoogle helps shoppers compare the ad they clicked with the offer they actually landed on. Gemini Nano handles the private consultation in Chrome. For deeper research, shoppers see and approve the text before Cloud Gemini receives it.

## Project description

An ad can show a feature and a price together even when that price applies to a different product variant. WaitGoogle preserves the ad before the shopper leaves it and keeps the ad and product-page evidence together in a Chrome side panel.

In the demo, an ad promotes wireless earbuds with active noise cancellation for $49. The product page shows that the $49 Essential variant lacks that feature. The $79 Plus variant includes it. The shopper can inspect the evidence and ask about tradeoffs for their budget and commute.

The extension invokes Firebase AI Logic in local-only mode for the image-and-text comparison and follow-up consultation. When Chrome supports local speech, shoppers can speak their question and review its transcript. The extension can draft a limited cloud request. The shopper can edit it, cancel it, or explicitly approve sending that exact text through an App Check-protected Firebase AI Logic request.

The sample merchant and offers are fictional. The browser extension was built during the hackathon. Installation and reviewer instructions are in the source repository README.

## Recording outline

- **0:00–0:20** Open the sample and click the $49 ad. Show the saved image and exact landing-page text.
- **0:20–0:55** Compare with Gemini Nano. Show the two variants and the evidence for the mismatch.
- **0:55–1:25** Ask about a $60 commute budget using the microphone. Show the transcript and local answer.
- **1:25–1:50** Prepare a cloud request, show its text, and cancel. Show that the draft disappears.
- **1:50–2:25** Prepare it again, edit it, approve it, and show the Cloud Gemini response.
- **2:25–2:50** Show a local comparison while offline after model setup. End with the Chrome and Firebase AI Logic implementation.
