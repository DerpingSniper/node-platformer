var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var users = {};
var players = {};
var platforms = [];

var CANVAS_W = 600;
var CANVAS_H = 600;
var PLAYER_W = 50;
var PLAYER_H = 50;

var FPS = 60;
var SPEED = 1;
var JUMP = 40;
var JUMP_DIV = 10;

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
                ph: PLAYER_H,
                pf: platforms
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
                fall: false,
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

addPlatform(PLAYER_W, CANVAS_H - PLAYER_H, PLAYER_W, PLAYER_H);
addPlatform(PLAYER_W*3, CANVAS_H - PLAYER_H*2, PLAYER_W, PLAYER_H);

setInterval(gameLoop, 1000/FPS);

function gameLoop() {
    movePlayers();
    playerCollision();
    io.sockets.emit('update', players);
}

function movePlayers() {
    var player, plat;
    for(var p in players) {
        player = players[p];
        if(player.fall) {
            player.speed += 1;
            player.y += Math.ceil(player.speed/JUMP_DIV);
            plat = platCollision(player);
            if(plat) {
                if(player.speed <= 0) {
                    player.y = plat.y + plat.h;
                    player.speed = 1;
                } else {
                    player.y = plat.y - PLAYER_H;
                    player.fall = false;
                    player.speed = 0;
                }
            }
        } else if(player.up) {
            player.fall = true;
            player.speed = -JUMP;
            player.y -= JUMP/JUMP_DIV;
            plat = platCollision(player);
            if(plat) {
                player.y = plat.y + plat.h;
                player.speed = 1;
            }
        } else {
            player.y += 1;
            plat = platCollision(player);
            if(plat) {
                player.y = plat.y - PLAYER_H;
            } else {
                player.fall = true;
                player.speed = 1;
            }
        }
        if(player.left) {
            player.x -= SPEED;
            plat = platCollision(player);
            if(plat) {
                player.x = plat.x + plat.w;
            }
        }
        if(player.right) {
            player.x += SPEED;
            plat = platCollision(player);
            if(plat) {
                player.x = plat.x - PLAYER_W;
            }
        }

        if(player.x < 0) player.x = 0;
        if(player.x > CANVAS_W - PLAYER_W) player.x = CANVAS_W - PLAYER_W;
        if(player.y < 0) player.y = 0;
        if(player.y > CANVAS_H - PLAYER_H) {
            player.y = CANVAS_H - PLAYER_H;
            player.fall = false;
            player.speed = 0;
        }
    }
}

function playerCollision() {
    var player, test;
    for(var p in players) {
        player = players[p];
        for(var t in players) {
            test = players[t];
            if(player == test) continue;
            if(collision(player.x, player.y, PLAYER_W, PLAYER_H, test.x, test.y, PLAYER_W, PLAYER_H)) { 
                if(player.y < test.y) {
                    setTimeout(playerReset(test), 3000);
                } else if(test.y < player.y) {
                    setTimeout(playerReset(player), 3000);
                }
            }
        }
    }
}

function platCollision(player) {
    var plat;
    for(var p in platforms) {
        plat = platforms[p];
        if(collision(player.x, player.y, PLAYER_W, PLAYER_H, plat.x, plat.y, plat.w, plat.h)) {
            return plat;
        }
    }
    return false;
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
    } else if (xx > x && xx < x2 && yy > y && yy < y2) {
        return true;
    } else if (xx2 > x && xx2 < x2 && yy > y && yy < y2) {
        return true;
    } else if (xx > x && xx < x2 && yy2 > y && yy2 < y2) {
        return true;
    } else if (xx2 > x && xx2 < x2 && yy2 > y && yy2 < y2) {
        return true;
    } else if (x == xx && x2 == xx2 && ((y > yy && y < yy2) || y2 > yy && y < yy2)) {
        return true;
    } else if (y == yy && y2 == yy2 && ((x > xx && x < xx2) || x2 > xx && x < xx2)) {
        return true;
    } else {
        return false;
    }
}

function playerReset(player) {
    player.x = 0;
    player.y = 0;
    player.fall = true;
    player.speed = 1;
}

function addPlatform(xx,yy,ww,hh) {
    platforms[platforms.length] = {
        x: xx,
        y: yy,
        w: ww,
        h: hh
    }
}
