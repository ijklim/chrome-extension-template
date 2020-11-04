# Chrome Extension Template

Standard template for creating Chrome extension


# Installation

* In Chrome, type in `chrome://extensions`
* Turn on `Developer mode`
* Click on [Load unpacked], then select extension code file folder
* Chrome extension can be pinned to the address bar by clicking on the `Extensions` icon


# Development Tools

* In Chrome, open `chrome://extensions/`, click on ↩️ beside on/off toggle to refresh code
* Click on Inspect views `background page`
* Using right click `Inspect popup` to check the messages from browser action popup


# Tips

## manifest.json examples

### permissions

* "<all_urls>", "*://*.ivan-lim.com/"

### matches

* "<all_urls>", "*://test.ivan-lim.com/*"

### To allow external js scripts (e.g. Vue CDN from cloudflare)

* `browser_action` is triggered by clicking the extension icon

* Add `"content_security_policy": "script-src 'self' 'unsafe-eval' https://cdnjs.cloudflare.com; object-src 'self'"`,`

* Both `'unsafe-eval'` and  `https://cdnjs.cloudflare.com` are crucial

* There should not be any inline js script in the html file, extract code into an external script such as `browser-action.js`
