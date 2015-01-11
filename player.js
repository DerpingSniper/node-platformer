module.exports = function(nickname, x, y, w, h) {
    this.nickname = nickname;

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.xSpeed = 0;
    this.ySpeed = 0;
    this.fall = false;

    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;

    this.move = function(platforms) {
        if(this.fall) {
            this.ySpeed++;
            this.y += Math.ceil(this.ySpeed/ACCEL_TICKS);
            platform = this.collidePlatforms(platforms);
            if(platform) {
                if(this.ySpeed <= 0) {
                    this.y = platform.y + platform.h;
                    this.ySpeed = 1;
                } else {
                    this.y = platform.y - this.h;
                    this.fall = false;
                    this.ySpeed = 0;
                }
            }
        } else if(this.up) {
            this.fall = true;
            this.ySpeed = -JUMP;
            this.y -= JUMP/ACCEL_TICKS;
            platform = this.collidePlatforms(platforms);
            if(platform) {
                this.y = platform.y + platform.h;
                this.ySpeed = 1;
            }
            if(this.xSpeed < -(MAX_SPEED - 1)) {
                this.xSpeed++;
            } else if(this.xSpeed > (MAX_SPEED - 1)) {
                this.xSpeed--;
            }
        } else {
            this.y += 1;
            platform = this.collidePlatforms(platforms);
            if(platform) {
                this.y = platform.y - this.h;
            } else {
                this.fall = true;
                this.ySpeed = 1;
            }
        }
        if(this.left) {
            if(this.fall) {
                if(this.xSpeed > -(MAX_SPEED - 1)) this.xSpeed--;
            } else {
                if(this.xSpeed > -MAX_SPEED) this.xSpeed--;
            }
            this.x += this.xSpeed;
            platform = this.collidePlatforms(platforms);
            if(platform) {
                this.x = platform.x + platform.w;
            }
        } else if(this.right) {
            if(this.fall) {
                if(this.xSpeed < (MAX_SPEED - 1)) this.xSpeed++;
            } else {
                if(this.xSpeed < MAX_SPEED) this.xSpeed++;
            }
            this.x += this.xSpeed;
            platform = this.collidePlatforms(platforms);
            if(platform) {
                this.x = platform.x - this.w;
            }
        } else {
            this.xSpeed = 0;
        }

        if(this.x < 0) this.x = 0;
        if(this.x > CANVAS_W - this.w) this.x = CANVAS_W - this.w;
        if(this.y < 0) this.y = 0;
        if(this.y > CANVAS_H - this.h) {
            this.y = CANVAS_H - this.h;
            this.fall = false;
            this.ySpeed = 0;
        }
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

    this.collidePlatforms = function(platforms) {
        var platform;
        for(var p in platforms) {
            platform = platforms[p];
            if(this.collide(platform)) {
                return platform;
            }
        }
        return false;
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
        this.fall = false;
        this.ySpeed = 0;
    }
}
