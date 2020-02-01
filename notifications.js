const alert_str = "[SwagLyrics for Spotify]";
console.log(alert_str, "initializing (available: " + (typeof window.Notification != 'undefined') + ")");
const stay = 4000;
let isFirst = true;
const interval = 1000;
const checkInterval = 400;
let hash = hex_md5("temp");
const selectors = {
  albumArt:
    '.cover-art-image',
  trackName: '.track-info__name a',
  artistName: '.track-info__artists a',
  playPauseBtnTitle:
    '#main > div > div.Root__top-container > div.Root__now-playing-bar > footer > div > div.now-playing-bar__center > div > div.player-controls__buttons > div:nth-child(3) button'
};
const checks = {
  art: function () {
    let $img = $('.cover-art-image')
    if ($img !== null) {
      return document.querySelector(`${selectors.albumArt}`).style.backgroundImage.slice(5, -2);
    }
    return null;
  },
  name: function () {
    element = document.querySelector(`${selectors.trackName}`);
    if (element !== null){
    return element.innerText;
    }
    return null;
  },
  artist: function () {
    element = document.querySelector(`${selectors.artistName}`);
    if (element !== null){
      return element.innerText;
    }
    return null;
  },
  playState: function () {
    element = document.querySelector(`${selectors.playPauseBtnTitle}`);
    if (element !== null){
    return element.getAttribute("title");
    }
    return null;
  }

};

const testConnection = new XMLHttpRequest();
const url = "http://127.0.0.1:5043/ping";
openTestConnection();
testServerConnection();

function openTestConnection() {
  testConnection.open("GET", url, true);
  testConnection.setRequestHeader("Content-type", "application/json");
  testConnection.setRequestHeader("Access-Control-Allow-Origin", "*");
  testConnection.setRequestHeader("Access-Control-Allow-Headers", "*");
}

if (window.Notification) {
  onWindowNotification();
}

function testServerConnection() {
  setInterval(() => {
    console.log("Testing connection...");
      openTestConnection();
      testConnection.send();
      testConnection.onreadystatechange = function () {
        if (testConnection.readyState == 4 && (testConnection.status == 200 || testConnection.status == 105)) {
          console.log("Connection established");
          sendToSwSpotify();
        }
      }
  }, checkInterval);
}

function sendToSwSpotify() {
  xhr2 = new XMLHttpRequest();
  const url = "http://127.0.0.1:5043/getSong";
  xhr2.open("POST", url, true);
  xhr2.setRequestHeader("Content-type", "application/json");
  xhr2.setRequestHeader("Access-Control-Allow-Origin", "*");
  xhr2.setRequestHeader("Access-Control-Allow-Headers", "*");
  let result = {};
  let text = null;
  for (let i in checks) {
    if (checks.hasOwnProperty(i)) {
      text = checks[i].call();
      if (typeof text != "undefined" && text != null && text.length > 0) {
        result[i] = text;
        cont = true;
      }
    }
  }
  const data = JSON.stringify({ title: result.name, artist: result.artist, playState: result.playState });
  xhr2.send(data);
}


function onWindowNotification() {
  console.log(alert_str, "requesting permission");
  window.Notification.requestPermission(function () {
    console.log(alert_str, "permission granted");
    if (!localStorage.scn_hash) {
      localStorage.scn_hash = hash;
    }
    setInterval(function () {
      let result = {};
      let hash = null;
      let text = null;
      let cont = false;
      for (let i in checks) {
        if (checks.hasOwnProperty(i)) {
          text = checks[i].call();
          if (typeof text != "undefined" && text != null && text.length > 0) {
            result[i] = text;
            cont = true;
          }
        }
      }

      xhr = new XMLHttpRequest();
      const url = "http://127.0.0.1:5042/getsong";
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
      xhr.setRequestHeader("Access-Control-Allow-Headers", "*");


      const data = JSON.stringify({ title: result.name, artist: result.artist, playState: result.playState });
      if (isFirst) {
        xhr.send(data);
        isFirst = false;
      }

      if (cont) {
        setTimeout(function () {
          hash = hex_md5(JSON.stringify(result));
          if (localStorage.scn_hash !== hash) {
            localStorage.scn_hash = hash;
            console.log(alert_str, "new song", result);

            if (xhr.status == 200) {
              xhr.send(data)
            }
            let notification = new window.Notification(result.name, {
              body: result.artist,
              icon: result.art
            });
            setTimeout(function () {
              notification.close.bind(notification);
            }, stay);
          }
        }, 200);
      }
    }, interval);
  });
}