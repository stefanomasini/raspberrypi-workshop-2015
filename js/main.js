// -- Libraries ------------
var GPIO = require('onoff').Gpio;
var piblaster = require('pi-blaster.js');
var sensorLib = require('node-dht-sensor');
var read = require('read');
var EventEmitter = require('events').EventEmitter;
var eventEmitter = new EventEmitter();
var startLEDLight = require('./led-light');


// -- Hardware configuration ------------

var GPIO_CONFIG_BCM = {
    BUTTON: 17,
    LED: 21,
    PIR: 18,
    TEMPERATURE: 4
};

// Function to activate the LED
var setLEDValue = function (value) {
    // value = 0 .. 1.0
    piblaster.setPwm(GPIO_CONFIG_BCM.LED, value);
};

// React to button press
new GPIO(GPIO_CONFIG_BCM.BUTTON, 'in', 'both').watch(function (err, state) {
    if (state == 0) {
        eventEmitter.emit('button-down');
    } else {
        eventEmitter.emit('button-up');
    }
});

// React to proximity detection
new GPIO(GPIO_CONFIG_BCM.PIR, 'in', 'both').watch(function (err, state) {
    if (state === 1) {
        eventEmitter.emit('proximity');
    }
});

// Provide temperature/humidity sensor reading function
var readTemperature = null;
var DHT_SENSOR_TYPE = 22;
if (sensorLib.initialize(DHT_SENSOR_TYPE, GPIO_CONFIG_BCM.TEMPERATURE)) {
    readTemperature = function () {
        return sensorLib.read();
    }
}


// -- Software logic ------------

// This function will be defined as soon as the Socket.io library is initialized
var sendMessageToClient = null;

var LEDLight = startLEDLight(setLEDValue);

eventEmitter.on('button-down', function () {
    LEDLight.setBlinking('fast');
});
eventEmitter.on('button-up', function () {
    LEDLight.setBlinking(null);
});

eventEmitter.on('web-button-down', function () {
    LEDLight.setBlinking('fast');
});
eventEmitter.on('web-button-up', function () {
    LEDLight.setBlinking(null);
});

eventEmitter.on('read-humidity', function () {
    if (readTemperature && sendMessageToClient) {
        sendMessageToClient({
            'msg': 'temperature',
            'reading': readTemperature()
        });
    }
    LEDLight.blinkForAWhile('slow');
});

eventEmitter.on('proximity', function () {
    if (sendMessageToClient) {
        sendMessageToClient({'msg': 'proximity'});
    }
});



// -- Web application: Express + Socket.IO ------------

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/../public'));
app.use(express.static(__dirname + '/../bower_components'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/../public/index.html');
});

io.on('connection', function(socket){
    sendMessageToClient = function (data) {
        io.emit('message', JSON.stringify(data));
    };
    socket.on('message', function(msg){
        var msg = JSON.parse(msg);
        if (msg.event) {
            eventEmitter.emit(msg.event);
        }
    });
});

http.listen(80, function(){
    console.log('listening on *:80');
});
