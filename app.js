var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var users = {};
var players = {};

var CANVAS_W = 600;
var CANVAS_H = 600;
var PLAYER_W = 50;
var PLAYER_H = 50;

var FPS = 60;
var SPEED = 1;
var JUMP = 40;

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
                cw: CANVAS_W,
                ch: CANVAS_H,
                pw: PLAYER_W,
                ph: PLAYER_H
            });
            socket.nickname = data;
            users[socket.nickname] = socket;
            players[socket.nickname] = {
                x: 0,
                y: (CANVAS_H - PLAYER_H),
                up: false,
                down: false,
                left: false,
                right: false,
                jump: false,
                speed: 0
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
        if(players[p].jump) {
            players[p].speed -= 1;
            players[p].y -= Math.floor(players[p].speed/10) + 1;
        } else if(players[p].up) {
            players[p].jump = true;
            players[p].speed = JUMP;
            players[p].y -= SPEED;
        }
        if(players[p].down) {
            players[p].jump = false;
        }
        if(players[p].left) {
            players[p].x -= SPEED;
        }
        if(players[p].right) {
            players[p].x += SPEED;
        }

        if(players[p].x < 0) players[p].x = 0;
        if(players[p].x > CANVAS_W - PLAYER_W) players[p].x = CANVAS_W - PLAYER_W;
        if(players[p].y < 0) players[p].y = 0;
        if(players[p].y > CANVAS_H - PLAYER_H) {
            players[p].y = CANVAS_H - PLAYER_H;
            players[p].jump = false;
            players[p].speed = 0;
        }
    }
    io.sockets.emit('update', players);
}

function collision(x,y,w,h,xx,yy,ww,hh) {
    var x2 = x + w;
    var y2 = y + h;
    var xx2 = xx + ww;
    var yy2 = yy + hh;
    if (x > xx && x < xx2 && y > yy && y < yy2) {
        return true;
    } else if (x2 > xx && x2 < xx2 && y > yy && y < yy2) {
        return true;
    } else if (x > xx && x < xx2 && y2 > yy && y2 < yy2) {
        return true;
    } else if (x2 > xx && x2 < xx2 && y2 > yy && y2 < yy2) {
        return true;
    } else {
        return false;
    }
}
