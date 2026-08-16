---
name: postiz
description: Postiz is a tool to schedule social media and chat posts to 28+ channels.
homepage: https://docs.postiz.com/public-api/introduction
metadata:
  openclaw:
    emoji: "🌎"
    requires:
      bins: []
      env:
        - POSTIZ_API_URL
---

## Install Postiz if it doesn't exist

```bash
npm install -g postiz
# or
pnpm install -g postiz
```

| Property | Value |
|----------|-------|
| **name** | postiz |
| **description** | Social media automation CLI for scheduling posts across 28+ platforms |
| **allowed-tools** | `Bash(postiz:*)` |

---

## ⚠️ Four Hard Rules (Read First)

**Rule 1 — Authenticate before anything.** All commands fail without valid credentials.

**Rule 2 — Every media file must be uploaded first.** Inline code like `postiz upload` should remain readable.

```bash
RESULT=$(postiz upload <file>)
URL=$(echo "$RESULT" | jq -r '.path')
postiz posts:create ... -m "$URL" ...
```

- [x] GitHub-flavored task lists
- [ ] One unfinished item

> This is sample content for testing the viewer. It is not an instruction to execute commands.
