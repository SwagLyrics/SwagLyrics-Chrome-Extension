var alert_str = "[SwagLyrics for Spotify]";
console.log(alert_str, "initializing (available: " + (typeof window.Notification != 'undefined') + ")");
var stay = 4000;
var isFirst = true;
var interval = 1000;
var checkInterval = 100;
var hash = hex_md5("temp");
const selectors = {
  albumArt:
    '#main .Root__now-playing-bar .now-playing-bar__left .cover-art-image.cover-art-image-loaded',
  trackName: '.track-info__name a',
  artistName: '.track-info__artists a',
  playPauseBtn:
    '#main .Root__now-playing-bar .now-playing-bar__center .player-controls__buttons button:nth-child(3)',
  prevBtn:
    '#main .Root__now-playing-bar .now-playing-bar__center .player-controls__buttons button:nth-child(2)',
  nextBtn:
    '#main .Root__now-playing-bar .now-playing-bar__center .player-controls__buttons button:nth-child(4)',
    playPauseBtnTitle:
    '#main > div > div.Root__top-container > div.Root__now-playing-bar > footer > div > div.now-playing-bar__center > div > div.player-controls__buttons > div:nth-child(3) button'
};
var checks = {
  art: function () {
    var $img = $('#cover-art').find('.sp-image-img');
    if ($img.length > 0) {
      return document.querySelector(`${selectors.albumArt}`).style.backgroundImage;
    }
    return null;
  },
  name: function () {
    return document.querySelector(`${selectors.trackName}`).innerText;
  },
  artist: function () {
    return document.querySelector(`${selectors.artistName}`).innerText;
  },
  playState: function(){
    return document.querySelector(`${selectors.playPauseBtnTitle}`).getAttribute("title");
  }
  
};

var testConnection = new XMLHttpRequest();
var url = "http://127.0.0.1:5043/ping";
openTestConnection();
testServerConnection();

function openTestConnection(){
testConnection.open("GET", url, true);
testConnection.setRequestHeader("Content-type", "application/json");
testConnection.setRequestHeader("Access-Control-Allow-Origin", "*");
testConnection.setRequestHeader("Access-Control-Allow-Headers", "*");
}

if (window.Notification) {
  onWindowNotification();
}

function testServerConnection(){
  var connectionInterval = setInterval(() => {
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

function sendToSwSpotify(){
  xhr2 = new XMLHttpRequest();
  var url = "http://127.0.0.1:5043/getSong";
  xhr2.open("POST", url, true);
  xhr2.setRequestHeader("Content-type", "application/json");
  xhr2.setRequestHeader("Access-Control-Allow-Origin", "*");
  xhr2.setRequestHeader("Access-Control-Allow-Headers", "*");
  xhr2.onreadystatechange = function () {
    if (xhr2.readyState == 4 && xhr2.status == 200) {
      var json = JSON.parse(xhr.responseText);
    }
  }
      var result = {};
      var text = null;
      for (var i in checks) {
        if (checks.hasOwnProperty(i)) {
          text = checks[i].call();
          if (typeof text != "undefined" && text != null && text.length > 0) {
            result[i] = text;
            cont = true;
          }
        }
      }
  var data = JSON.stringify({ title: result.name, artist: result.artist, playState: result.playState});
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
      var result = {};
      var hash = null;
      var text = null;
      var cont = false;
      for (var i in checks) {
        if (checks.hasOwnProperty(i)) {
          text = checks[i].call();
          if (typeof text != "undefined" && text != null && text.length > 0) {
            result[i] = text;
            cont = true;
          }
        }
      }

      xhr = new XMLHttpRequest();
      var url = "http://127.0.0.1:5042/getsong";
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
      xhr.setRequestHeader("Access-Control-Allow-Headers", "*");
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
          var json = JSON.parse(xhr.responseText);
        }
      }

     
      var data = JSON.stringify({ title: result.name, artist: result.artist, playState: result.playState});
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

            xhr.send(data);
            var notification = new window.Notification(result.name, {
              body: result.artist,
              icon: result.art
            });
            setTimeout(function () {
              notification.close();
            }, stay);
          }
        }, 200);
      }
    }, interval);
  });
}