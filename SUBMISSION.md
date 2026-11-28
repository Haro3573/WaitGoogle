# WaitGoogle Devpost draft

## Elevator pitch

Click an image ad and get a conversation about the actual offer. WaitGoogle uses Gemini Nano on-device to prepare an opening prompt and Cloud Gemini to explain the product after you approve the text.

## Project description

An ad can put a feature and a price together even when that price applies to a different variant. WaitGoogle captures a clicked ad before navigation and keeps the available product-page text alongside it in a Chrome side panel.

Firebase AI Logic runs Gemini Nano locally to prepare a brief from the image and caption. The shopper reviews the opening prompt and decides whether to send it. Gemini explains the offer with the available evidence, identifies what is unclear, and invites a follow-up about the same product. The App Check-protected cloud request contains text. The captured image stays on the device.

The sample merchant and offers are fictional. The extension was built during the hackathon. Source and reviewer instructions are available in the repository README.

## Demo outline

- **0:00–0:30** On a permitted site, left-click a labelled image ad. Show that the original image remains visible as the landing page opens.
- **0:30–1:05** Show the prompt Nano prepared from the ad. Review the $49 Essential and $79 Plus evidence.
- **1:05–1:45** Approve the opening prompt. Show Gemini explaining which variant includes active noise cancellation.
- **1:45–2:15** Ask a follow-up about a $60 commute budget and show Gemini using the same offer.
