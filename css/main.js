'use strict';

/* globals MediaRecorder */
var recognition;
var recordedVideo;
var final_transcript = '';

var webm_filename = '';

var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;

var gumVideo = document.querySelector('video#gum');
var recordedVideo = document.querySelector('video#recorded');
// var recordedVideo = document.getElementById('recorded');
var recordButton = document.querySelector('button#record');
var playButton = document.querySelector('button#play');
var downloadButton = document.querySelector('button#download');
recordButton.onclick = toggleRecording;
playButton.onclick = play;
downloadButton.onclick = download;
recordButton.textContent = 'Start';

// window.isSecureContext could be used for Chrome
// var isSecureOrigin = location.protocol === 'https:' ||
// location.hostname === 'localhost';
// if (!isSecureOrigin) {
//   alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
//     '\n\nChanging protocol to HTTPS');
//   location.protocol = 'HTTPS';
// }

var constraints = {
  audio: true,
  video: {
    width: { max: 550 },
    height: { max: 550 }
  }
};

function handleSuccess(stream) {
  recordButton.disabled = false;
  console.log('getUserMedia() got stream: ', stream);
  window.stream = stream;
  gumVideo.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

recordedVideo.addEventListener('error', function(ev) {
  console.error('MediaRecording.recordedMedia.error()');
  alert('Your browser can not play\n\n' + recordedVideo.src
    + '\n\n media clip. event: ' + JSON.stringify(ev));
}, true);

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function handleStop(event) {
  console.log('Recorder stopped: ', event);
}

function toggleRecording() {
  if (recordButton.textContent === 'Start') {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Start';
    playButton.disabled = false;
    downloadButton.disabled = false;
  }
}

function startRecording() {
  recordedBlobs = [];
  var options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + ' is not Supported');
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported');
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: ''};
      }
    }
  }
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e);
    alert('Exception while creating MediaRecorder: '
      + e + '. mimeType: ' + options.mimeType);
    return;
  }
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop';
  playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported...");
  } else {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = function(event) { }
      recognition.onerror = function(event) { }
      recognition.onend = function() {}
      recognition.lang = "en-US";
      recognition.start();

      recognition.onresult = function(event) {
        var interim_transcript = '';

        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
            document.getElementById("voiceTranscript").value = final_transcript;
          } else {
            interim_transcript += event.results[i][0].transcript;
            document.getElementById("voiceTranscript").value = interim_transcript;
          }
        }
        final_transcript = capitalize(final_transcript);
        var lb = linebreak(final_transcript);
        //document.getElementById("voiceTranscript").value = lb;
        console.log("transcript:",lb);
        var transcript_p = document.getElementById("voiceTranscript");
        console.log(transcript_p);
        transcript_p.innerHTML = lb;
        // interim_span.innerHTML = linebreak(interim_transcript);
      };
    }
}


var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function stopRecording() {
  mediaRecorder.stop();
  console.log('Recorded Blobs: ', recordedBlobs);
  recordedVideo.controls = true;

  var formData = new FormData();
  var blob = new Blob(recordedBlobs, { type: 'video/webm' });

  webm_filename = prompt('What would you like to name your recording?') + ".webm";
  fetch('http://968fc626.ngrok.io/record', {
    method: 'POST',
    headers: {
    },
    body: webm_filename
  }).then(r => console.log('r', r));

  setupVolumeGraph();
}

function play() {
  var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  // workaround for non-seekable video taken from
  // https://bugs.chromium.org/p/chromium/issues/detail?id=642012#c23
  recordedVideo.addEventListener('loadedmetadata', function() {
    if (recordedVideo.duration === Infinity) {
      recordedVideo.currentTime = 1e101;
      recordedVideo.ontimeupdate = function() {
        recordedVideo.currentTime = 0;
        recordedVideo.ontimeupdate = function() {
          delete recordedVideo.ontimeupdate;
          recordedVideo.play();
        };
      };
    }
  });
}

function download() {
  var blob = new Blob(recordedBlobs, {type: 'video/webm'});
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = webm_filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

function setupVolumeGraph() {
  var volGraph = [];
  var clean_volData = [];
  var counter = 0;
  for (var i = 0; i < volData.length; i++) {
    if (volData[i] != "0.00") {
      clean_volData[counter] = volData[i];
      counter++;
    }
  }
  volGraph[0] = {
    x: Array.apply(null, {length: volData.length}).map(Function.call, Number),
    y: clean_volData,
    line: {shape: 'spline'},
    type: "scatter"
  };
  Plotly.newPlot('volume', volGraph, {title: "Confidence", width: 800, autosize: true,paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)'});
}