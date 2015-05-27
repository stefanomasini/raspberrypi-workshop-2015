'use strict';

var UPDATE_FREQUENCY_IN_MS = 3;
var BREATHING_CYCLE_IN_MS = 500;
var FAST_BLINKING_FREQUENCY_IN_MS = 20;
var SLOW_BLINKING_FREQUENCY_IN_MS = 40;
var TRIGGERED_BLINKING_DURATION_IN_MS = 1000;


var startLEDLight = function (setLED) {
    var blinkingMode = null;
    var startTime = new Date().getTime();

    var breathingLed = function (now) {
        var cycle = (now - startTime) / BREATHING_CYCLE_IN_MS;
        return Math.max((Math.sin(cycle)+1)/2, 0);
    };

    var blinkingLed = function (now, blinkingFrequencyInMs) {
        var cycle = (now - startTime) / blinkingFrequencyInMs;
        return (Math.sin(cycle) > 0) ? 1 : 0;
    };

    var updateLED = function () {
        var now = new Date().getTime();
        if (blinkingMode !== null) {
            setLED(blinkingLed(now, (blinkingMode === 'fast') ? FAST_BLINKING_FREQUENCY_IN_MS : SLOW_BLINKING_FREQUENCY_IN_MS));
        } else {
            setLED(breathingLed(now));
        }
    };

    setInterval(updateLED, UPDATE_FREQUENCY_IN_MS);

    return {
        blinkForAWhile: function (mode) {
            blinkingMode = mode;
            startTime = new Date().getTime();
            setTimeout(function () {
                blinkingMode = null;
            }, TRIGGERED_BLINKING_DURATION_IN_MS);
        },
        setBlinking: function (mode) {
            blinkingMode = mode;
            if (mode !== null) {
                startTime = new Date().getTime();
            }
        }
    };
};

module.exports = startLEDLight;
