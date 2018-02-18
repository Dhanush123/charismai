var mongoSettings = {
  "async": true,
  "crossDomain": true,
  "url": "https://api.mlab.com/api/1/databases/th18/collections/analyses?apiKey=keHd4eKyrvVivRJk-LlGKbVlAwVezEtE",
  "method": "GET",
  "headers": {
    "content-type": "application/json; charset=utf-8",
  }
};

function getData () {
  $.ajax(mongoSettings).done(function (res) {
    var data = res;
    
  });
}