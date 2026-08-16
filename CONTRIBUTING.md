# Contributing

Thanks for helping improve AgentMore Markdown Reader.

## Development setup

Use Node.js 22.12 or newer.

```bash
npm ci
npm test
npm run build
```

Load `dist` as an unpacked extension in Chrome or Brave and enable file URL access before testing local Markdown files.

## Pull requests

- Keep changes focused on Markdown reading and closely related controls.
- Preserve the original Markdown source for Raw mode, copy, and download.
- Keep permissions as narrow as possible.
- Add or update tests for behavior changes.
- Run the test suite and production build before opening a pull request.
- Include before-and-after screenshots for visible UI changes.

## Reporting bugs

Include the browser and operating-system versions, the Markdown URL or a minimal reproducible document, expected behavior, and actual behavior. Remove secrets or private content before attaching a Markdown file.

By contributing, you agree that your contributions will be licensed under the MIT License.
