'use strict';

var volData = [];
// var instantMeter = document.querySelector('#instant meter');
// var slowMeter = document.querySelector('#slow meter');
// var clipMeter = document.querySelector('#clip meter');

// var instantValueDisplay = document.querySelector('#instant .value');
// var slowValueDisplay = document.querySelector('#slow .value');
// var clipValueDisplay = document.querySelector('#clip .value');

try {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  window.audioContext = new AudioContext();
} catch (e) {
  alert('Web Audio API not supported.');
}

// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: true,
  video: false
};

function handleSuccess(stream) {
  // Put variables in global scope to make them available to the
  // browser console.
  window.stream = stream;
  var soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
  soundMeter.connectToSource(stream, function(e) {
    if (e) {
      alert(e);
      return;
    }
    setInterval(function() {
      
    volData.push(soundMeter.instant.toFixed(2));
    console.log(volData);

    }, 200);
  });
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);