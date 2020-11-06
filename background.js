// webRequest lifecycles: https://developer.chrome.com/extensions/webRequest
// RequestFilter attributes: https://developer.chrome.com/extensions/webRequest#type-RequestFilter
// filter.types: https://developer.chrome.com/extensions/webRequest#type-ResourceType
// webrequest samples: https://developer.chrome.com/extensions/samples#search:webrequest

// console.log('Loading background.js in extension _generate_background_page.html');

// Set consoleLogSettings to 1 to console log the corresponding lifecycle event
const lifeCycleNames = {
  onBeforeRequest: {
    consoleLogSettings: 0,
    opt_extraInfoSpec: ["blocking"],
  },
  onBeforeSendHeaders: {
    consoleLogSettings: 0,
    opt_extraInfoSpec: ["blocking", "requestHeaders"],
  },
  onSendHeaders: {
    consoleLogSettings: 0,
    opt_extraInfoSpec: ["requestHeaders"],
  },
  onHeadersReceived: {
    consoleLogSettings: 0,
    opt_extraInfoSpec: ["responseHeaders"],
  },
  onAuthRequired: {
    consoleLogSettings: 1,
    opt_extraInfoSpec: ["blocking", "responseHeaders"],
  },
  onBeforeRedirect: {
    consoleLogSettings: 0,
    opt_extraInfoSpec: ["extraHeaders", "responseHeaders"],
  },
  onResponseStarted: {
    consoleLogSettings: 1,
    opt_extraInfoSpec: ["responseHeaders"],
  },
};
const pendingAuthRequests = [];


/**
 * Invoke chrome.webRequest[lifeCycleName].addListener()
 *
 * @param {string} lifeCycleName
 * @param {object} filter             Valid filter.types: main_frame, sub_frame, image, xmlhttprequest
 * @param {array}  opt_extraInfoSpec  "blocking": Callback function is handled synchronously, extraHeaders, requestBody
 */
function createListener(lifeCycleName, filter, opt_extraInfoSpec) {
  const callback = (details) => {
    // Possible returns:
    //   • onBeforeRequest: { redirectUrl: '...' };
    //   • onBeforeSendHeaders: { requestHeaders: '...:...' }
    //   • onAuthRequired: { cancel: ..., authCredentials: {...} }

    // Note: Match condition not necessary if hosts are filtered by the `matches` configuration in `manifest.json`
    const re = new RegExp(/http[s]*:\/\/test.ivan-lim.com\/(.)*/, 'g');
    if (!details.url.match(re)) {
      return;
    }

    if (lifeCycleNames[lifeCycleName].consoleLogSettings) {
      console.log(
        `[background.js] webRequest.${lifeCycleName}, triggered by fetch()`,
        {
          method: details.method,
          requestHeaders: details.requestHeaders,
          responseHeaders: details.responseHeaders,
          timeStamp: details.timeStamp,
          type: details.type,
          url: details.url,
          details,
        }
      );
    }

    // Examples: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onAuthRequired#Examples
    if (lifeCycleName === 'onAuthRequired') {
      // Note: details.requestId should be unique for the same request
      if (pendingAuthRequests.indexOf(details.requestId) === -1) {
        // First attempt as requestId is not in `pendingAuthRequests`
        pendingAuthRequests.push(details.requestId);

        // Note: authCredentials should be retrieved from a server
        const authCredentials = {
          username: "root",
          password: "root",
        };

        return { authCredentials };
      }

      // Password did not work
      console.log(`Auto authentication failed for ${details.url}`);
      return { cancel: true };
    }
  };

  chrome.webRequest[lifeCycleName].addListener(callback, filter, opt_extraInfoSpec);
}


const filter = {
  urls: ["*://*.ivan-lim.com/*"],
};
for (const lifeCycleName of Object.keys(lifeCycleNames)) {
  // console.log(lifeCycleName, lifeCycleNames[lifeCycleName].opt_extraInfoSpec);
  createListener(lifeCycleName, filter, lifeCycleNames[lifeCycleName].opt_extraInfoSpec);
}
