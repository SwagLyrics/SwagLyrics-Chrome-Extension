const alert_str = "[SwagLyrics for Spotify]";
console.log(alert_str, " initializing");
const stay = 4000;
let isFirst = true;
const interval = 1000;
const checkInterval = 400;
let cont = false;
const selectors = {
  albumArt:
    '.cover-art-image',
  trackName: 'div.now-playing-bar__left div.now-playing div._2d35c1726829c507fca5a9b5b1aae1a2-scss.ellipsis-one-line div.c319b99793755cc3bba709fe1b1fda42-scss.ellipsis-one-line div.react-contextmenu-wrapper span a',
  artistName: 'div.now-playing-bar__left div.now-playing div._2d35c1726829c507fca5a9b5b1aae1a2-scss.ellipsis-one-line div._44843c8513baccb36b3fa171573a128f-scss.ellipsis-one-line span span.react-contextmenu-wrapper span a',
  playPauseBtnTitle:
    '#main > div > div.Root__top-container > div.Root__now-playing-bar > footer > div > div.now-playing-bar__center > div > div.player-controls__buttons > div:nth-child(3) button'
};
const checks = {
  art: function () {
    let img = document.querySelector(selectors.albumArt);
    if (img !== null) {
      return img.style.backgroundImage.slice(5, -2);
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

function testServerConnection() {
  setInterval(() => {
    checkServerConnection();
  }, checkInterval);
}


function checkServerConnection(){
  console.log("Testing connection...");
  openTestConnection();
  testConnection.send();
  testConnection.onreadystatechange = function () {
    if (testConnection.readyState == 4 && (testConnection.status == 200 || testConnection.status == 105)) {
      console.log("Connection established");
      sendToSwSpotify(getSongData(true));
    }
  }
}

function getSongData(asJson = false){
  let result = {};
  let text = null;
  cont = false;
  for (let i in checks) {
    if (checks.hasOwnProperty(i)) {
      text = checks[i].call();
      if (typeof text != "undefined" && text != null && text.length > 0) {
        result[i] = text;
        cont = true;
      }
    }
  }
  if(asJson === true){
  return JSON.stringify({ title: result.name, artist: result.artist, playState: result.playState });
  }
  else {
    return result;
  }
}

function sendToSwSpotify(data) {
  xhr2 = new XMLHttpRequest();
  const url = "http://127.0.0.1:5043/getSong";
  xhr2.open("POST", url, true);
  xhr2.setRequestHeader("Content-type", "application/json");
  xhr2.setRequestHeader("Access-Control-Allow-Origin", "*");
  xhr2.setRequestHeader("Access-Control-Allow-Headers", "*");
  xhr2.send(data);
}
