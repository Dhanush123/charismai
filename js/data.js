var mongoSettings = {
  "async": true,
  "crossDomain": true,
  "url": "https://api.mlab.com/api/1/databases/th18/collections/analyses?apiKey=keHd4eKyrvVivRJk-LlGKbVlAwVezEtE",
  "method": "GET",
  "headers": {
    "content-type": "application/json; charset=utf-8",
  }
};

var data = null;
var numFrames = 15;

var sentX = [];
var sentY = [];


for (var i = 0; i < numFrames; i++) {
    sentY.push(i);
}

function getData () {
  $.ajax(mongoSettings).done(function (res) {
    data = res;
    var length = data.length;
    var i = numFrames;
    while (i > 0 && typeof data[length-i] != 'undefined') {
      sentX.unshift(data[length-i]);
      i -= 1;
    }
  });
}