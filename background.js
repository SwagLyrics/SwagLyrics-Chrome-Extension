// Connector between the content script and bridge

let bridge = chrome.runtime.connectNative("com.swspotify.bridge");
let ports = [];

bridge.onMessage.addListener(function(msg) {
  // Send data from bridge to content script
  console.log("Received ", msg);
  let port = ports[0];
  if(port !== undefined){
    console.log(port);
    port.postMessage(msg);
  }else{
    bridge.postMessage("");
  }
});

bridge.onDisconnect.addListener(function() {
  console.log("Disconnected");
});

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    // When there is a message coming from the content script, send it to the bridge
    console.log("Received from Client", msg);
    bridge.postMessage(msg);
  });
  port.onDisconnect.addListener(function(port) {
    ports.splice(ports.indexOf(port), 1);
  });

  ports.push(port);
});
