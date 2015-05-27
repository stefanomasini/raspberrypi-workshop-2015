(function () {
    'use strict';

    var onMessageReceived = function (data) {
        if (data.msg === 'temperature') {
            writeTemperatureAndHumidity(data.reading);
        }
        if (data.msg === 'proximity') {
            showProximityFlag();
        }
    };

    // -- JQuery buttons configuration ------------

    $('.led-button').mousedown(function () {
        sendMessage({event: 'web-button-down'});
    }).mouseup(function () {
        sendMessage({event: 'web-button-up'});
    });

    $('.temperature-button').click(function () {
        sendMessage({event: 'read-humidity'});
    });

    // -- JQuery DOM manipulation ------------

    var writeTemperatureAndHumidity = function (data) {
        $('.temperature').text('' + data.temperature.toFixed(2) + ' C');
        $('.humidity').text('' + data.humidity.toFixed(0) + ' %');
    };

    var showProximityFlag = function () {
        $('.proximity').show();
        setTimeout(function () {
            $('.proximity').fadeOut();
        }, 4000);
    };

    var addServerMessageToLog = function (data) {
        var now = new Date();
        $('#messages').prepend($('<li>').html('<li>' + now + '<pre>' + JSON.stringify(data, null, 2) + '</pre></li>'));
    };

    var addEventToLog = function (data) {
        var now = new Date();
        $('#events').prepend($('<li>').html('<li>' + now + '<pre>' + JSON.stringify(data, null, 2) + '</pre></li>'));
    };

    // -- Socker.IO configuration ------------

    var socket = io();

    socket.on('message', function (msg) {
        if (msg === 'foo') {
            $('.my-button').removeClass('btn-default').addClass('btn-primary');
        }
        var data = JSON.parse(msg);
        addServerMessageToLog(data);
        onMessageReceived(data);
    });

    var sendMessage = function (data) {
        addEventToLog(data);
        socket.emit('message', JSON.stringify(data));
    };
})();
