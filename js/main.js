$(document).ready(function() {
    $.ajax("audio/format").done(SoundBoard.getFormat);
});

var SoundBoard = {

    getFormat: function(data, _status, xhr) {
        var format = JSON.parse(data);
        SoundBoard.render(format.tracks);
    },

    render: function(tracks) {
        var table = $("#soundboard");
        var numTracks = tracks.length;
        var cellTemplate = Handlebars.compile($("#sound-cell").html());
        for (var i = 0; i < numTracks; i++) {
            var tdEl = $(cellTemplate(tracks[i]));

            if (i % 5 === 0) {
                var row = $(document.createElement("tr"));
                table.append(row);
            }
            row.append(tdEl);
            
            var button = tdEl.find("button");
            var audioEl = tdEl.find("audio")[0];

            audioEl.onplay = function() {
                var _button = button;
                return function() {
                    _button.css("background-color", "#9e0");
                }
            }();

            audioEl.onended = function() { 
                var _button = button;
                return function() {
                    _button.css("background-color", "");
                }
            }();

            button.click(function() {
                var _audioEl = audioEl;
                return function() { _audioEl.play() };
            }());
        }
        //SoundBoard.postRender();
    },

    postRender: function() {
    
        var audioCtx = new (window.AudioContext 
            || window.webkitAudioContext)();
        
        var audioElements = document.getElementsByTagName("audio");
        var analyser = audioCtx.createAnalyser();
        var dataArray = new Uint8Array(analyser.fftSize);
        console.log(dataArray);
        
        for (var i = 0, l = audioElements.length; i < l; i++) { 
            var audioEl = audioElements[i];
            var source = audioCtx.createMediaElementSource(audioEl);
            var filter = audioCtx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 500;
            source.connect(filter);
            filter.connect(audioCtx.destination);
        }
    }
};



/*
var source = audioCtx.createMediaElementSource(audioElement);
var filter = audioCtx.createBiquadFilter();
var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
var dataArray = new Float32Array(analyser.frequencyBinCount);
analyser.getFloatTimeDomainData(dataArray);
filter.type = "lowpass";
filter.frequency.value = 500;
source.connect(filter);
filter.connect(audioCtx.destination);
*/

