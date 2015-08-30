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
        var content = $("#content");
        var volumeEl = document.getElementById("volume");
        var numTracks = tracks.length;
        var cellTemplate = Handlebars.compile($("#sound-cell").html());
        var audioCtx = new (window.AudioContext 
            || window.webkitAudioContext)();
        var analyser = audioCtx.createAnalyser();
        var smoothAnalyser = audioCtx.createAnalyser();
        var amplifier = audioCtx.createGain();
        var volumeControl = audioCtx.createGain();
        var fftSize = 512;
        analyser.fftSize = fftSize;
        smoothAnalyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = 0;
        smoothAnalyser.smoothingTimeConstant = 0.8;

        volumeEl.oninput = function() {
            volumeControl.gain.value = this.value;
        }

        for (var i = 0; i < numTracks; i++) {
            var tdEl = $(cellTemplate(tracks[i]));

            if (i % 5 === 0) {
                var row = $(document.createElement("tr"));
                table.append(row);
            }
            row.append(tdEl);
            
            var button = tdEl.find("button");
            var audioEl = tdEl.find("audio")[0];
            var source = audioCtx.createMediaElementSource(audioEl);
            source.connect(analyser);
            source.connect(smoothAnalyser);

            audioEl.onplay = function() {
                var _button = button;
                return function() {
                    _button.css("background-color", "#9e0");
                }
            }();

            audioEl.onpause = function() { 
                var _button = button;
                return function() {
                    _button.css("background-color", "");
                }
            }();

            button.click(function() {
                var _audioEl = audioEl;
                return function() { 
                    if (_audioEl.paused) {
                        _audioEl.play(); 
                    } else {
                        _audioEl.pause();
                        _audioEl.currentTime = 0;
                    }
                }
            }());
        }

        analyser.connect(amplifier);
        amplifier.connect(volumeControl);
        volumeControl.connect(audioCtx.destination);

        function process() {
            var freqData = new Uint8Array(analyser.frequencyBinCount);
            var smoothFreqData = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(freqData);
            smoothAnalyser.getByteFrequencyData(smoothFreqData);
            
            var average = 0, smoothAverage = 0;
            for (var i = 0, l = freqData.length; i < l; i++) {
                average += parseFloat(freqData[i]);
                smoothAverage += parseFloat(smoothFreqData[i]);
            }

            average /= freqData.length;
            smoothAverage /= freqData.length;

            if (average  > 5) {
                amplifier.gain.value = 70 / average;
            } 

            content.css({
                "background-size": 500 + smoothAverage * 0.8
            });
            
        }
        setInterval(process, 5);
    },
};

