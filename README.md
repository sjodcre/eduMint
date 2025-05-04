# eduMint

## Project Overview

EduMint is a decentralized platform for publishing and verifying educational content – think of it like TikTok for education. It allows users to create and share concise educational videos (usually 30 seconds or less) so that learning new things is quick and fun.

The twist is that EduMint runs on blockchain technology: the backend uses Arweave and AOtheComputer (often just called AO) to store and verify content. What does that mean for you? Essentially, every video uploaded to EduMint is stored permanently on Arweave’s “permaweb”, and the app’s logic (like verifying content authenticity and handling rewards) runs on Arweave’s AO network.

In plain terms, your educational content on EduMint is censorship-resistant, tamper-proof, and truly owned by you – no centralized service can take it down. This creates a self-sustaining educational community where content is trusted and creators are fairly recognized.

## Features

### Short Video Lessons

EduMint focuses on bite-sized videos for learning. You can record or upload educational clips up to ~30 seconds long, perfect for sharing quick facts, explanations, or how-tos.

This short format makes it easy to learn something new during a coffee break or while scrolling on your phone. Despite being brief, videos often contain rich info – a lot can be taught in 30 seconds!

### Permanent Content Storage

When you publish a video on EduMint, it’s stored on the Arweave blockchain (the “permaweb”). This means your content doesn’t live on a fragile server that might go down – it’s permanently preserved across a distributed network.

Anyone can access it via Arweave at any time, and it won’t get deleted or lost. As a creator, you have peace of mind that your lessons live on and can be referenced in the future. And as a learner, you know the content hasn’t been secretly modified or removed.

### Content Protection & Ownership

EduMint uses decentralized licensing (UDL licenses) to protect creators’ rights.

When you publish content, it’s tagged with a license on-chain that ensures you’re recognized as the creator and controls how others can use your video. This is like built-in copyright for your educational content, but enforced by code! It helps prevent plagiarism and gives creators confidence that sharing their knowledge won’t mean losing ownership of it.

### Verification & Trust

A core aim of EduMint is to combat misinformation and ensure educational content is trustworthy. Using the AO (AOtheComputer) network, EduMint can run verification processes in a decentralized way.

For example, the platform could allow community members or experts to validate a video’s accuracy, and record that verification on-chain. Because all data and actions are on the blockchain, anyone can audit the history of a piece of content – you can see if it’s been verified, flagged, or endorsed, all transparently.

This on-chain logic helps build trust: when you see a video on EduMint, you can check its authenticity and any verification notes, which is especially great for educational material.

### Gamified Engagement

EduMint isn’t just about uploading videos; it’s about building a learning community. Users can like and save videos they find useful, and these interactions aren’t just empty clicks – they translate into points or token rewards for the content creators.

For instance, if your video gets a lot of likes, you might earn EDU tokens or reputation points on the platform. Similarly, active learners who engage positively might earn rewards.

This gamification incentivizes people to contribute quality content and to engage with others’ posts. Essentially, the more you teach and the more you learn, the more you earn (in a fun, encouraging way).

### Upcoming Content Marketplace *(Planned feature)*

EduMint intends to launch a marketplace for educational content.

This would allow creators to optionally sell premium educational resources or courses as NFTs or on-chain assets. Imagine you create a fantastic in-depth tutorial series – you could list it on the marketplace, and interested learners can purchase access, with the transaction happening via the blockchain.

This marketplace will further empower educators to monetize their work and give learners access to high-quality content, all while using crypto and smart contracts to handle the transactions. Stay tuned for this feature as the platform grows!

### Progressive Web App (PWA)

*(If applicable)* EduMint is likely built as a modern web app and might support PWA features. That means you might be able to install it on your mobile device like an app and enjoy offline access to previously loaded content.

## Installation

Setting up EduMint on your local machine involves getting the backend services running and optionally the front-end if you want to interact with it directly. Because EduMint uses blockchain services, there are a few extra steps compared to a typical web app, but we’ll walk through it.

### Prerequisites

- **Node.js (and npm)** – The backend is built with Node.js (JavaScript/TypeScript). Make sure you have Node.js installed (we recommend the latest LTS version). Yarn or npm will be used to install dependencies.
- **Arweave Account** – You’ll need access to the Arweave network. For development, you might use a testnet or Arweave’s local dev tool (called arlocal) to avoid spending real tokens. If you want to test on the live network, you should obtain an Arweave wallet key file (a JSON file) with some AR tokens (the currency used for Arweave transactions) – you can get some test tokens from a faucet if available.
- **AO (Arweave AO) Setup** – AO is relatively new. The public AO network (often in testnet as of now) might require connecting to a specific node or running an AO node yourself. Check EduMint’s documentation for how it connects to AOtheComputer. It could be via an API, or via special Arweave transactions. If there’s a provided API endpoint or SDK for AO, note that you might need credentials or an access URL. (For a simple setup, the EduMint backend might default to a public AO testnet endpoint if one is available.)

### Steps to set up

#### Clone the Repository

```bash
git clone https://github.com/yourusername/eduMint.git
cd eduMint
```

This will pull down the EduMint project files to your machine.

#### Install Dependencies

EduMint’s backend uses several libraries (for interacting with Arweave, etc.). Install them by running:

```bash
npm install
```

This will download all the necessary packages as defined in `package.json`. (If the project uses Yarn, you can run `yarn install` instead.) Expect libraries for Arweave, perhaps Arweave-JS or Warp, and any web framework used.

#### Configure Environment

Before running the app, set up your config. Typically, there might be a `.env` file or a config file. Here’s what to look out for and configure:

- **Arweave Wallet Key** – If required, place your Arweave key file in the project (the location or name might be specified in the docs, e.g., `wallet.json`). Alternatively, set an environment variable pointing to it or containing the key. For example, you might have a `ARWEAVE_KEY` environment variable with the path to your keyfile. If you’re using Arlocal (a local Arweave simulator), the project might have an option to run with that for testing (check docs).
- **AO Node/Endpoint** – If EduMint needs to connect to the AO network, configure the endpoint. This could be something like an environment variable `AO_NODE_URL` or similar. If AO requires its own credentials or keys, provide those as well. (Since AO is new, refer to any documentation or comments in the code for how to set this up. Possibly, the AO integration might be abstracted through Arweave transactions, in which case you might not need a separate config beyond Arweave.)
- **Other Config** – There might be settings for things like the network (e.g., use `DEV_MODE=true` or `USE_TESTNET=true` to avoid using mainnet), or an API key if the project uses any third-party service (though likely most is on-chain). Check for a sample `.env.example` file in the repo – if it exists, copy it to `.env` and fill in the blanks.

### Run the Backend

Now start the EduMint backend server. This could be a Node server that serves a REST API or GraphQL, and possibly the front-end as well. Common commands:

```bash
npm start
```

or

```bash
npm run dev
```

The exact command might vary. If `npm start` launches a production server and you want a dev environment with live reload, try `npm run dev` or see `package.json` scripts for clues. When the server runs, you should see logs indicating it’s connected to Arweave (and maybe AO) and listening on a port (e.g., `http://localhost:4000` or similar).

### Run the Frontend (if applicable)

EduMint’s user interface might be a separate project (since the official app is hosted on Arweave’s permaweb). Check if this repository includes a frontend (maybe a `client` or `frontend` directory). If yes, there might be a separate build step. For instance:

```bash
cd client
npm install
npm run serve
```

This could start a development server for the UI at something like `http://localhost:3000`. In many cases, however, the frontend might be pre-built or served by the backend. If the backend launched a service on a port, try opening that in your browser to see if a UI loads.

You may find a web interface where you can interact with EduMint (create an account, browse content, etc.). If the frontend is not included, you can still use the backend’s API directly (for example, via cURL or Postman) to test content publication and retrieval.

---

That’s it for setup! The key is ensuring you have access to Arweave (and AO). If everything is configured correctly, you now have EduMint running locally.

## Usage

Once your local instance of EduMint is up and running, you can start using the platform to publish and view educational content. There are a couple of ways to interact with EduMint: through a web interface (if available) or via API calls. We’ll cover the typical user experience using a web UI, as that’s the most friendly way.

### 1. Open the EduMint app

In your web browser, navigate to the address where EduMint is running. If you used the default setup, it’s likely:

```
http://localhost:3000
```

If it’s a blank page or you only see a JSON response, that might mean the frontend isn’t running. Double-check if you need to start a separate frontend server.

### 2. Create Your Account (Wallet)

EduMint uses Arweave for authentication, which means you might not have a traditional username/password. Instead, you typically authenticate with your Arweave wallet. If there’s an onboarding flow, you might upload your Arweave key file or connect via a browser wallet extension (e.g., ArConnect).

### 3. Browse Content

Scroll through educational videos posted by others. Each video is short and likely has a title or description. Click a video to play it. If categories or tags are supported, use them to explore topics like `#math` or `#history`.

### 4. Post a New Educational Video

Click the “Upload” or “Create” button to publish content. Fill in:

- **Video File** (up to 30 seconds)
- **Title/Description**
- **License** (e.g., UDL license options)
- **Tags or Categories**

After publishing, your content will be bundled into an Arweave transaction and stored permanently.

### 5. View Your Content

Your new video should appear in the feed and on your profile page. This becomes your on-chain portfolio of educational content.

### 6. Interact with Content

- **Like** – Rewards creators and logs engagement
- **Save/Favorite** – Build a personal learning library
- **Comment/Review** – Ask questions, add context
- **Verify (for experts)** – Endorse accuracy via AO-powered verification

### 7. Earning Rewards

Earn points or tokens (e.g., EDU Points) for creating content and receiving engagement. A future marketplace may let you monetize deeper educational offerings via blockchain.

### 8. Staying Updated

Pull the latest changes from the repo and reinstall dependencies if needed. The live platform is auto-updated when devs deploy new content to Arweave.

### Tips

- If videos don’t load, check browser console or gateway settings.
- Use testnet tools like Arlocal for development.
- AO integration may be quiet but critical. If AO features break, check node status or connection configs.

---

Enjoy using EduMint! Share knowledge, learn something new, and help shape the future of decentralized education.

## Contribution Guidelines

EduMint is an open-source project at the intersection of blockchain and education, and we happily welcome contributions from developers, educators, and enthusiasts alike.

### How to Contribute

1. **Find an Issue or Idea** – Look in the repo's issue tracker or open your own.
2. **Development Setup** – Be sure your local environment works (see Installation section).
3. **Fork & Branch**

```bash
git checkout -b feature/my-awesome-improvement
```

4. **Coding Guidelines** – Use clear, commented code. Follow formatting tools (e.g., ESLint).
5. **Commit Messages** – Write clear, meaningful messages.
6. **Testing** – Manual or automated. Be thorough.
7. **Submit a Pull Request** – Include a helpful description and reference any related issues.

### Collaboration

- Reviews may take time – be patient!
- Engage in PR discussions.
- Join community channels (Discord/Telegram) if available.

---

By contributing to EduMint, you’re helping build a fair, censorship-resistant educational ecosystem. Thank you for being a part of it!
This makes the learning experience smoother, accessible anytime and anywhere.
