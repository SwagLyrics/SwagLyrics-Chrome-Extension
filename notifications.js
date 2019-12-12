var alert_str = "[SwagLyrics for Spotify]";
console.log(alert_str, "initializing (available: " + (typeof window.Notification != 'undefined') + ")");
var stay = 4000;
var isFirst=true;
var interval = 1000;
var hash = hex_md5("temp");
var current;
var port = chrome.runtime.connect({});
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
  paused: "spoticon-play-16",
  playing: "spoticon-pause-16"
};
var checks = {
  art: function() {
    var $img = $('#cover-art').find('.sp-image-img');
    if ($img.length > 0) {
      return document.querySelector(`${selectors.albumArt}`).style.backgroundImage;
    }
    return null;
  },
  name: function() {
    return document.querySelector(`${selectors.trackName}`).innerText;
  },
  artist: function() {
    return document.querySelector(`${selectors.artistName}`).innerText;
  },
  isPlaying: function() {
    if(document.getElementsByClassName(selectors.paused).length > 0){
      return false;
    }else if(document.getElementsByClassName(selectors.playing).length > 0){
      return true;
    }
  }
};

port.onMessage.addListener(function(msg, sender, sendResponse) {
  // When the background script asks for the current track-artist, send the data
  console.log("Received", msg);
  port.postMessage(current);
});

if (window.Notification) {
  console.log(alert_str, "requesting permission");
  window.Notification.requestPermission(function() {
    console.log(alert_str, "permission granted");
    if (!localStorage.scn_hash) {
      localStorage.scn_hash = hash;
    }
    setInterval(function() {
      var result = {};
      var hash = null;
      var text = null;
      var cont = false;
      for (var i in checks) {
        if (checks.hasOwnProperty(i)) {
          text = checks[i].call();
          if (typeof text != "undefined" && text != null && text.toString().length > 0) {
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
xhr.setRequestHeader("Access-Control-Allow-Headers","*");
xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
        var json = JSON.parse(xhr.responseText);
    }
}
var data = JSON.stringify({title:result.name,artist:result.artist});
if(isFirst){
  xhr.send(data);
  isFirst=false;
}

      if (cont) {
        setTimeout(function() {
          hash = hex_md5(JSON.stringify(result));
          current = result;
          if (localStorage.scn_hash !== hash) {
            localStorage.scn_hash = hash;
            console.log(alert_str, "new song", result);


            xhr.send(data);
            var notification = new window.Notification(result.name, {
              body: result.artist,
              icon: result.art
            });
            setTimeout(function() {
              notification.close();
            }, stay);
          }
        }, 50);
      }
    }, interval);
  });
}
