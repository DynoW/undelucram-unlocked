# Undelucram Unlocked

> [🇷🇴 Citește în Română](README.md)

A tiny cross-browser (Chrome + Firefox, Manifest V3) extension that lets you read
**gated** company review pages on `undelucram.ro`.

The site gates full reviews behind a "contribute a review to view everything"
wall. That wall is enforced **server-side, keyed on the `Referer` request
header**: when the request looks like it came from a search engine, the full page
is returned. This extension rewrites the outgoing `Referer` to a search-engine
URL, so the page loads ungated.

No account, no analytics, no remote calls, no content scripts.

## Install

### Firefox (recommended)

Install the signed `.xpi` from the
[latest release](https://github.com/DynoW/undelucram-unlocked/releases/latest).
It is AMO-**unlisted** (signed but not published), so installation is
warning-light and survives restarts.

1. Download `undelucram-unlocked.xpi`.
2. Drag and drop the `.xpi` into Firefox (or open it via `Ctrl+O` / `Cmd+O`) and
   click **Add**.
3. Pin the extension and verify the toggle is **on**.

*(Developers testing unpacked changes can load `manifest.json` temporarily via
`about:debugging`.)*

Requires Firefox **113+** (first version with `declarativeNetRequest`).

### Chrome / Edge / Brave / Chromium

1. Download `undelucram-unlocked.zip` from the
   [latest release](https://github.com/DynoW/undelucram-unlocked/releases/latest).
2. Unzip it to a folder you will keep (don't delete it afterwards).
3. Go to `chrome://extensions` (or `edge://extensions`).
4. Turn on **Developer mode** (top-right).
5. Click **Load unpacked** and select the unzipped folder.
6. Pin the extension, open any `undelucram.ro` review page, and make sure the
   popup toggle is **on**.

> Chrome will show a "Developer mode extensions" notice on startup. This is
> expected for any extension not installed from the Web Store and cannot be
> avoided without a store listing.

### Uninstall

Chrome: `chrome://extensions` → **Remove**.
Firefox: `about:addons` → **Remove**.

## How it works

A single `declarativeNetRequest` (DNR) static rule sets the `Referer` header to
`https://www.google.com/` on requests to `undelucram.ro`:

```json
{
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      { "header": "Referer", "operation": "set", "value": "https://www.google.com/" }
    ]
  },
  "condition": {
    "urlFilter": "||undelucram.ro/",
    "resourceTypes": ["main_frame", "sub_frame", "xmlhttprequest", "other"]
  }
}
```

The popup toggle enables/disables this ruleset via
`chrome.declarativeNetRequest.updateEnabledRulesets()`, which persists the state
itself — so no `storage` permission is needed. Turning the toggle reloads the
active `undelucram.ro` tab so you get immediate confirmation.

Verified behavior against a real gated page:

| `Referer` sent                       | Response size | Paywall present |
| ------------------------------------ | ------------- | --------------- |
| _(none)_                             | 146,555 B     | yes             |
| `https://www.google.com/`            | 259,801 B     | no              |
| `https://www.undelucram.ro/somepage` | 146,555 B     | yes             |

## Testing

1. Open the popup — the toggle should reflect the ruleset state and the status
   line should read "Active on undelucram.ro".
2. DevTools → **Network** → the `undelucram.ro` document request shows
   `Referer: https://www.google.com/`.
3. The paywall copy is gone and full reviews render.
4. Toggling **off** restores the gated page.
5. Confirm other domains are unaffected.

## Caveats

- **This deliberately circumvents a site's access control.** That may violate
  `undelucram.ro`'s Terms of Service. Use at your own discretion; you are
  responsible for compliance with the site's terms and local law.
- The gate is a **server-side heuristic**. If the site changes its allowlist or
  keys on `Origin` / `Sec-Fetch-*` instead, the extension may stop working.
- The legitimate path already exists: **leaving a review unlocks the content by
  design**. Consider using that instead.
- Not affiliated with or endorsed by `undelucram.ro`.

## Project layout

```
manifest.json      # MV3, cross-browser
rules/referer.json # DNR static ruleset
src/popup.html     # popup UI
src/popup.js       # enable/disable the ruleset
icons/             # 16/32/48/128 png + svg
```

## Development

No build step. Edit the files and reload the extension:

- Chrome: `chrome://extensions` → the reload icon on the card.
- Firefox: `about:debugging` → **Reload**.

## License

[MIT](LICENSE).
