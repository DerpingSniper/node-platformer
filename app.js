var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');

var player = require('./player.js');

//globals
users = {};
players = {};
platforms = [];

CANVAS_W = 600;
CANVAS_H = 600;
PLAYER_W = 50;
PLAYER_H = 50;
JUMP = 40;
MAX_YSPEED = 7;
MAX_XSPEED = 3;
STOMP_SPEED = 3;
ACCEL_TICKS = 10;
FPS = 60;
MAP_FILE = "./testMap.json";

server.listen(3000);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    socket.on('login', function(data, callback){
        if(data in users) {
            callback(false);
        } else if(data) {
            callback({
                CANVAS_W: CANVAS_W,
                CANVAS_H: CANVAS_H,
                platforms: platforms
            });
            socket.nickname = data;
            users[socket.nickname] = socket;
            players[socket.nickname] = new player(socket.nickname, CANVAS_W/2 - PLAYER_W/2, 0, PLAYER_W, PLAYER_H);
            io.sockets.emit('usernames', Object.keys(users));
        } else {
            callback(false);
        }
    });
    socket.on('keyDown', function(data) {
        players[socket.nickname].keyDown(data);
    });
    socket.on('keyUp', function(data) {
        players[socket.nickname].keyUp(data);
    });
    socket.on('disconnect', function(data) {
        if(socket.nickname) {
            delete users[socket.nickname];
            delete players[socket.nickname];
            io.sockets.emit('usernames', Object.keys(users));
        } else {
            return;
        }
    });
});

fs.readFile(MAP_FILE, 'utf8', function(err, data) {
    if(err) {
        return console.log(err);
    }
    var map = JSON.parse(data);

    for(var m in map) {
        platforms[platforms.length] = map[m];
    }
});

setInterval(gameLoop, 1000/FPS);

function gameLoop() {
    var player, test;
    var update = {};

    for(var p in players) {
        players[p].move();
    }

    for(var p in players) {
        player = players[p];
        update[player.nickname] = {
            x: player.x,
            y: player.y,
            w: player.w,
            h: player.h,
            k: player.kills,
            d: player.deaths
        }
    }
    
    io.sockets.emit('update', update);
}
