# Laki (BVM) website

Static website prepared for GitHub Pages.

## Publish
1. Create a public GitHub repository, e.g. `laki-bvm`.
2. Upload `index.html`, `styles.css`, and `script.js` to the repository root.
3. Open **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then save.
6. GitHub will provide a temporary `github.io` URL.

## Before Etherscan token-info submission
Add:
- custom project domain,
- domain email (e.g. `contact@yourdomain.tld`),
- 32×32 SVG token logo,
- founder/team professional profile link if applicable.

## Official BVM contract
`0xC02cd09C60aBc64b0C77720326597430e118B4C1`

## Transparency
The current token contract has owner-controlled capped minting and transfer pause.
Because holders may burn BVM, total supply can fall below the 10,000 BVM cap,
creating minting headroom while ownership remains active.
