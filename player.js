module.exports = function(nickname, x, y, w, h) {
    this.nickname = nickname;

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.xSpeed = 0;
    this.xAccel = 0;
    this.ySpeed = 0;
    this.yAccel = 0;
    this.jumpAccel = 0;

    this.airborn = true;
    this.wall = false;

    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;

    this.move = function() {
        //apply force acceleration
        if(this.airborn) {
            this.yAccel -= this.jumpAccel;
            this.yAccel += ACCEL_GRAV;
            this.yAccel -= this.ySpeed * DECEL_AIR;
            this.xAccel -= this.xSpeed * DECEL_AIR;
        } else {
            this.xAccel -= this.xSpeed * (DECEL_AIR + DECEL_LAND);
        }

        //apply player acceleration
        if(this.up) {
            if(!this.airborn) {
                this.jumpAccel = ACCEL_JUMP;
                this.airborn = true;
            } else if(this.jumpAccel > 0) {
                this.yAccel -= this.jumpAccel;
                this.jumpAccel -= DECEL_JUMP;
            } else {
                this.jumpAccel = 0;
            }
        } else {
            this.jumpAccel = 0;
        }

        if(this.left && !this.right) {
            if(this.airborn) {
                this.xAccel -= ACCEL_AIR;
            } else {
                this.xAccel -= ACCEL_LAND;
            }
        } else if(this.right && !this.left) {
            if(this.airborn) {
                this.xAccel += ACCEL_AIR;
            } else {
                this.xAccel += ACCEL_LAND;
            }
        } else {
        }

        //update speed
        this.ySpeed += this.yAccel;
        this.xSpeed += this.xAccel;

        //move player vertically
        if(this.ySpeed != 0) {
            this.y += Math.round(this.ySpeed);

            platform = this.collidePlatforms();
            if(platform) {
                if(this.ySpeed <= 0) { //hit bottom of platform
                    this.y = platform.y + platform.h;
                    this.ceilingStop();
                } else {
                    this.y = platform.y - this.h;
                    this.floorStop();
                }
            }

            player = this.collidePlayers();
            if(player) {
                if(this.ySpeed <= 0) { //top edge hit player
                    this.y = player.y + player.h;
                    this.ceilingStop();
                } else if(this.ySpeed >= SPLATTER) { //hit player at lethal speed
                    player.reset();
                    this.ySpeed /= 2;
                    this.yAccel /= 2;
                } else {
                    this.y = player.y - this.h;
                    this.floorStop();
                }
            }

            if(this.y < 0) {
                this.y = 0;
                this.ceilingStop();
            } else if(this.y > CANVAS_H - this.h) {
                this.y = CANVAS_H - this.h;
                this.floorStop();
            }
        }

        //move player horizontally
        if(this.xSpeed != 0) {
            this.x += this.xSpeed;

            platform = this.collidePlatforms();
            if(platform) {
                if(this.xSpeed < 0) { //left edge hit platform
                    this.x = platform.x + platform.w;
                } else {
                    this.x = platform.x - this.w;
                }
                this.wallStop();
            }

            player = this.collidePlayers();
            if(player) {
                if(this.xSpeed < 0) { //left edge hit player
                    this.x = player.x + player.w;
                } else {
                    this.x = player.x - this.w;
                }
                this.wallStop();
            }

            if(this.x < 0) {
                this.x = 0;
                this.wallStop();
            } else if(this.x > CANVAS_W - this.w) {
                this.x = CANVAS_W - this.w;
                this.wallStop();
            }
        }
    }

    this.ceilingStop = function() {
        this.ySpeed = 0;
        this.yAccel = 0;
        this.jumpAccel = 0;
    }

    this.floorStop = function() {
        this.ySpeed = 0;
        this.yAccel = 0;
        this.airborn = false;
    }

    this.wallStop = function() {
        this.xSpeed = 0;
        this.xAccel = 0;
    }

    this.keyDown = function(key) {
        switch(key) {
            case 'up':
                this.up = true;
                break;
            case 'down':
                this.down = true;
                break;
            case 'left':
                this.left = true;
                break;
            case 'right':
                this.right = true;
                break;
        }
    }

    this.keyUp = function(key) {
        switch(key) {
            case 'up':
                this.up = false;
                break;
            case 'down':
                this.down = false;
                break;
            case 'left':
                this.left = false;
                break;
            case 'right':
                this.right = false;
                break;
        }
    }

    this.collidePlatforms = function() {
        var platform;
        for(var p in platforms) {
            platform = platforms[p];
            if(this.collide(platform)) {
                return platform;
            }
        }
        return false;
    }

    this.collidePlayers = function() {
        var player;
        for(var p in players) {
            player = players[p];
            if(player == this) continue;
            if(this.collide(player)) {
                return player;
            }
        }
    }

    this.collide = function(obj) {
        return this.collision(this.x, this.y, this.w, this.h, obj.x, obj.y, obj.w, obj.h);
    }

    this.collision = function(x,y,w,h,xx,yy,ww,hh) {
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

    this.reset = function() {
        this.x = 0;
        this.y = 0;
        this.airborn = false;
        this.ySpeed = 0;
    }
}
