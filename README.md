# Abstract Licensing Demo

This is a demo that shows minting a legal license on [Abstract](https://docs.abs.xyz). The payment is done with Abstract $ETH, and it mints a license on [Story](https://docs.story.foundation).

This allows developers to integrate licensing into their Abstract apps. For example, this demo shows minting a legal license to have the right to commercialize a song. The license itself costs a small amount of $ETH, and allows the holder to remix and commercialize a song, while preventing AI from training on the song's data.

## Getting Started

1. Clone the repo: `git clone https://github.com/jacob-tucker/abs-story-quickstart`

2. Go to the [Crossmint Dev Dashboard](https://www.crossmint.com/console/projects/apiKeys) on Production (this is a mainnet example) and create a new "Client-side key". Make sure to enable all **Wallet API** and **Users** permissions (you can update these if you want later).

3. `cp .env.example .env`. Make sure to add your crossmint client key.

4. `npm install`

5. `npm run dev`
