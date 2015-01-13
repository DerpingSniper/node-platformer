var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var player = require('./player.js');

//globals
users = {};
players = {};
platforms = [];

CANVAS_W = 600;
CANVAS_H = 600;
PLAYER_W = 50;
PLAYER_H = 50;

TPS = 60; //ticks per second
ACCEL_GRAV = .1; //downward acceleration per tick
DECEL_LAND = .015; //solid-surface decelleration per speed unit per tick
DECEL_AIR = .015; //decelleration per speed unit per tick
ACCEL_LAND = .1; //player controlled acceleration per tick while grounded
ACCEL_AIR = .05; //player controlled acceleration per tick while airborn
SPLATTER = 6; //lethal speed
ACCEL_JUMP = .5; //initial jump accel
DECEL_JUMP = .1; //deceleration per tick while jumping

server.listen(3000);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    socket.on('login', function(data, callback){
        if(data in users) {
            callback(false);
        } else {
            callback({
                CANVAS_W: CANVAS_W,
                CANVAS_H: CANVAS_H,
                platforms: platforms
            });
            socket.nickname = data;
            users[socket.nickname] = socket;
            players[socket.nickname] = new player(socket.nickname, 0, 0, PLAYER_W, PLAYER_H);
            io.sockets.emit('usernames', Object.keys(users));
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
            io.sockets.emit('usernames', Object.keys(users));
        } else {
            return;
        }
    });
});

platforms[platforms.length] = {x: PLAYER_W, y: CANVAS_H - PLAYER_H, w: PLAYER_W, h: PLAYER_H};
platforms[platforms.length] = {x: PLAYER_W*3, y: CANVAS_H - PLAYER_H*2, w: PLAYER_W, h: PLAYER_H};

setInterval(gameLoop, 1000/TPS);

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
            h: player.h
        }
    }
    
    io.sockets.emit('update', update);
}
