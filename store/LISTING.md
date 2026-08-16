# Chrome Web Store Listing

## Product identity

- **Name:** AgentMore Markdown Reader
- **Publisher:** AgentMore
- **Category:** Tools
- **Language:** English
- **Homepage:** https://agentmore.app
- **Suggested privacy-policy URL:** https://agentmore.app/privacy/markdown-reader

## Summary

Read local and remote Markdown files in a fast, private, GitHub-style view with GFM, Raw mode, copy, and history.

## Detailed description

AgentMore Markdown Reader turns raw `.md` and `.markdown` files into a clean, GitHub-style reading view directly in your browser.

Everything is rendered locally. Documents are never uploaded to AgentMore or sent to a third-party rendering service.

Features:

- GitHub Flavored Markdown tables, task lists, autolinks, and strikethrough
- Readable YAML frontmatter
- Syntax-highlighted code with copy buttons
- Preview and source-faithful Raw modes
- Open, copy, and download controls
- Local history for up to 30 recently viewed Markdown files
- Responsive light and dark themes
- Automatic handling of local and remote `.md` and `.markdown` files

The extension has one purpose: make Markdown files easy to read. It does not include analytics, advertising, tracking, accounts, or remote code.

## Single purpose

Render local and remote Markdown documents as a readable, GitHub-style browser view.

## Permission justifications

### storage

Stores the user's theme and Preview/Raw preferences plus up to 30 recent Markdown locations, filenames, and timestamps locally so the reader and history popup remember their state. Files explicitly chosen through the extension picker are also stored locally so they can be reopened and copied from history. This information is never transmitted.

### Host access

The content script is limited to local files and HTTP/HTTPS paths ending in `.md` or `.markdown`. This match scope is required to detect and render the Markdown document the user opens. A content-type check prevents the extension from changing ordinary HTML pages whose path happens to end in `.md`. The extension does not request a separate host-permissions block or make cross-origin requests.

## Privacy-practices answers

- **Website content:** Processed locally to render the Markdown document; not collected or transmitted.
- **Web history:** The URL, filename, and timestamp of up to 30 viewed Markdown documents are stored locally for the user-facing history popup; not transmitted.
- **User-generated content:** Local Markdown files may contain user-generated content. Picker-opened files are retained in local extension storage for history reopening and are never transmitted.
- **Data sale:** No.
- **Advertising:** No.
- **Analytics or tracking:** No.
- **Third-party sharing:** No.
- **Remote code:** No.

Certify compliance with the Chrome Web Store User Data Policy and Limited Use requirements.

## Reviewer test instructions

1. Install the extension and allow access to file URLs.
2. Open `https://agentmore.app/skill.md` to verify automatic GFM rendering.
3. Use Preview and Raw to verify both views preserve the source.
4. Use the file icon to open a local `.md` file.
5. Copy a code block and copy/download the whole document.
6. Click the extension icon to verify recent-document history.

No account, credentials, payment, or external setup is required.

## Required listing assets

- `assets/store-icon.png` — 128×128 store icon
- `assets/small-promo.png` — 440×280 promotional tile
- At least one current product screenshot — 1280×800 or 640×400

Use an actual screenshot of the extension rendering a representative Markdown file. Do not use the GitHub website as the product screenshot.
