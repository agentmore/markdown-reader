# AgentMore Chrome Web Store Release Checklist

## Publisher setup

- Register a Chrome Web Store developer account using an AgentMore-controlled Google account.
- Pay Google's one-time developer registration fee.
- Verify the developer contact email.
- Set the publisher name to **AgentMore**.
- Add trusted AgentMore teammates as publisher members if needed.
- Verify `agentmore.app` in Google Search Console and select it as the official URL.

If the account already owns a publisher, prefer renaming that publisher to AgentMore. Google permits only one additional publisher creation per account lifetime, and deleting it does not restore that allowance.

## Website preparation

- Publish `PRIVACY.md` at `https://agentmore.app/privacy/markdown-reader`.
- Add a product or support page on `agentmore.app` if desired.
- Confirm the privacy-policy URL is public without a login.

## Extension QA

- Reload the unpacked extension from `dist`.
- Enable access to file URLs.
- Test local `.md`, `.markdown`, and `.txt` files.
- Test `https://agentmore.app/skill.md`.
- Test Preview, Raw, copy, download, file open, theme, and history.
- Confirm ordinary GitHub repository HTML pages remain untouched.
- Run `npm test`, `npm run build`, and `npm audit --omit=dev`.

## Submission

- Upload the versioned ZIP from `releases` as a new item.
- Copy the text from `LISTING.md` into the Store listing and Privacy tabs.
- Upload the store icon, promotional tile, and at least one product screenshot.
- Choose public or trusted-tester visibility.
- Complete the single-purpose, permissions, and data-use declarations.
- Submit for review; use deferred publishing if AgentMore wants to choose the launch time.

## Future updates

- Increase the manifest version for every uploaded update.
- Upload a complete replacement ZIP, not only changed files.
- Recheck privacy declarations whenever permissions or data behavior changes.
