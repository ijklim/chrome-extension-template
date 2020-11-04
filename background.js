// webRequest lifecycles: https://developer.chrome.com/extensions/webRequest
// RequestFilter attributes: https://developer.chrome.com/extensions/webRequest#type-RequestFilter
// filter.types: https://developer.chrome.com/extensions/webRequest#type-ResourceType
// webrequest samples: https://developer.chrome.com/extensions/samples#search:webrequest

// console.log('Loading background.js in extension _generate_background_page.html');

let callback, filter, opt_extraInfoSpec;
let lifeCycleName;

// Set to 1 to console log the corresponding lifecycle event
const consoleLogSettings = {
  onBeforeRequest: 0,
  onBeforeSendHeaders: 0,
  onSendHeaders: 0,
  onHeadersReceived: 0,
  onAuthRequired: 1,
};
let consoleLogSettingIndex = 0;
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

    if (consoleLogSettings[lifeCycleName]) {
      console.log(
        `[background.js] webRequest.${lifeCycleName}, triggered by fetch()`,
        {
          method: details.method,
          requestHeaders: details.requestHeaders,
          responseHeaders: details.responseHeaders,
          timeStamp: details.timeStamp,
          type: details.type,
          url: details.url,
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


// onBeforeRequest
lifeCycleName = Object.keys(consoleLogSettings)[consoleLogSettingIndex++];
filter = {
  urls: ["*://*.ivan-lim.com/*"],
  types: ["main_frame"]
};
opt_extraInfoSpec = ["blocking"];
createListener(lifeCycleName, filter, opt_extraInfoSpec);

// onBeforeSendHeaders
lifeCycleName = Object.keys(consoleLogSettings)[consoleLogSettingIndex++];
opt_extraInfoSpec = ["blocking", "requestHeaders"];
createListener(lifeCycleName, filter, opt_extraInfoSpec);

// onSendHeaders
lifeCycleName = Object.keys(consoleLogSettings)[consoleLogSettingIndex++];
opt_extraInfoSpec = ["requestHeaders"];
createListener(lifeCycleName, filter, opt_extraInfoSpec);

// onHeadersReceived
lifeCycleName = Object.keys(consoleLogSettings)[consoleLogSettingIndex++];
opt_extraInfoSpec = ["responseHeaders"];
createListener(lifeCycleName, filter, opt_extraInfoSpec);

// onAuthRequired
lifeCycleName = Object.keys(consoleLogSettings)[consoleLogSettingIndex++];
opt_extraInfoSpec = ["blocking", "responseHeaders"];
createListener(lifeCycleName, filter, opt_extraInfoSpec);

