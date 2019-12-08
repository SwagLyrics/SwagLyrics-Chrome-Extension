// Connector between the content script and bridge

var port = chrome.runtime.connectNative("com.swspotify.bridge");
port.onMessage.addListener(function(msg) {
  // Send data from bridge to content script
  console.log("Received ", msg);
  chrome.tabs.query({}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, msg, function(response) {
    });
  });
});
port.onDisconnect.addListener(function() {
  console.log("Disconnected");
});
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  // When there is a message coming from the content script, send it to the bridge
  console.log("Received from Client", msg);
  port.postMessage(msg);
});
