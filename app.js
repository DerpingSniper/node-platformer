var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var users = {};
var players = {};
var FPS = 60;
var SPEED = 1;

server.listen(3000);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    socket.on('login', function(data, callback){
        if(data in users) {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            users[socket.nickname] = socket;
            players[socket.nickname] = {
                x: 0,
                y: 0,
                up: false,
                down: false,
                left: false,
                right: false
            };
            io.sockets.emit('usernames', Object.keys(users));
        }
    });
    socket.on('keyDown', function(data) {
        switch(data) {
            case 'up':
                players[socket.nickname].up = true;
                break;
            case 'down':
                players[socket.nickname].down = true;
                break;
            case 'left':
                players[socket.nickname].left = true;
                break;
            case 'right':
                players[socket.nickname].right = true;
                break;
        }
    });
    socket.on('keyUp', function(data) {
        switch(data) {
            case 'up':
                players[socket.nickname].up = false;
                break;
            case 'down':
                players[socket.nickname].down = false;
                break;
            case 'left':
                players[socket.nickname].left = false;
                break;
            case 'right':
                players[socket.nickname].right = false;
                break;
        }
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

setInterval(gameLoop, 1000/FPS);

function gameLoop() {
    for(var p in players) {
        if(players[p].up) {
            players[p].y -= SPEED;
        }
        if(players[p].down) {
            players[p].y += SPEED;
        }
        if(players[p].left) {
            players[p].x -= SPEED;
        }
        if(players[p].right) {
            players[p].x += SPEED;
        }
    }
    io.sockets.emit('update', players);
}
