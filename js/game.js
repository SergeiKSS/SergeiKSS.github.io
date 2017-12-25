function Game () {
    this.lastTime = 0;
    this.player = {
        pos: [0, 0],
        sprite: new Sprite('img/sprites.png', [0, 0], [39, 39], 16, [0, 1])
    };

    this.bullets = [];
    this.enemies = [];
    this.explosions = [];

    this.lastFire = Date.now();
    this.gameTime = 0;
    this.isGameOver = false;
    this.terrainPattern = 0;

    this.score = 0;
    this.scoreEl = document.getElementById('score');

    this.playerSpeed = 200;
    this.bulletSpeed = 500;
    this.enemySpeed = 100;    
};

//Main game loop
Game.prototype.main = function () {
    this.now = Date.now();
    this.dt = (this.now - this.lastTime) / 1000.0;

    this.update(this.dt);
    this.render();

    this.lastTime = this.now;
    requestAnimationFrame(Game.prototype.main.bind(myGame));
};

Game.prototype.init = function () {
    var img = new Image();
    img.src = 'img/terrain.png';
    img.onload = function() {
        this.terrainPattern = ctx.createPattern(img, 'repeat');
        ctx.fillStyle = this.terrainPattern;
        ctx.fillRect(0, 0, 512, 480);
     };
    
    this.reset();
    this.lastTime = Date.now();
    this.main();
};

// Reset game to original state
Game.prototype.reset =  function () {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over-overlay').style.display = 'none';
    this.isGameOver = false;
    this.gameTime = 0;
    this.score = 0;

    this.enemies = [];
    this.bullets = [];

    this.player.pos = [50, canvas.height / 2];
};

Game.prototype.update = function (dt) {
    this.gameTime += dt;

    this.handleInput(dt);
    this.updateEntities(dt);

    if(Math.random() < 1 - Math.pow(.993, this.gameTime)) {
        this.enemies.push({
            pos: [canvas.width,
                  Math.random() * (canvas.height - 39)],
            sprite: new Sprite('img/sprites.png', [0, 78], [80, 39],
                               6, [0, 1, 2, 3, 2, 1])
        });
    }

    this.checkCollisions();
    this.scoreEl.innerHTML = this.score;
};

Game.prototype.handleInput = function (dt) {
    if(input.isDown('DOWN') || input.isDown('s')) {
        this.player.pos[1] += this.playerSpeed * dt;
    }

    if(input.isDown('UP') || input.isDown('w')) {
        this.player.pos[1] -= this.playerSpeed * dt;
    }

    if(input.isDown('LEFT') || input.isDown('a')) {
        this.player.pos[0] -= this.playerSpeed * dt;
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
        this.player.pos[0] += this.playerSpeed * dt;
    }

    if(input.isDown('SPACE') && !this.isGameOver && Date.now() - this.lastFire > 100) {
        var x = this.player.pos[0] + this.player.sprite.size[0] / 2;
        var y = this.player.pos[1] + this.player.sprite.size[1] / 2;

        this.bullets.push({ pos: [x, y],
                       dir: 'forward',
                       sprite: new Sprite('img/sprites.png', [0, 39], [18, 8]) });
        this.bullets.push({ pos: [x, y],
                       dir: 'up',
                       sprite: new Sprite('img/sprites.png', [0, 50], [9, 5]) });
        this.bullets.push({ pos: [x, y],
                       dir: 'down',
                       sprite: new Sprite('img/sprites.png', [0, 60], [9, 5]) });

        this.lastFire = Date.now();
    }
};

Game.prototype.updateEntities = function (dt) {
    this.player.sprite.update(dt);

    for(var i=0; i<this.bullets.length; i++) {
        var bullet = this.bullets[i];

        switch(bullet.dir) {
        case 'up': bullet.pos[1] -= this.bulletSpeed * dt; break;
        case 'down': bullet.pos[1] += this.bulletSpeed * dt; break;
        default:
            bullet.pos[0] += this.bulletSpeed * dt;
        }

        if(bullet.pos[1] < 0 || bullet.pos[1] > canvas.height ||
           bullet.pos[0] > canvas.width) {
            this.bullets.splice(i, 1);
            i--;
        }
    }

    for(var i=0; i<this.enemies.length; i++) {
        this.enemies[i].pos[0] -= this.enemySpeed * dt;
        this.enemies[i].sprite.update(dt);

        if(this.enemies[i].pos[0] + this.enemies[i].sprite.size[0] < 0) {
            this.enemies.splice(i, 1);
            i--;
        }
    }

    for(var i=0; i<this.explosions.length; i++) {
        this.explosions[i].sprite.update(dt);

        if(this.explosions[i].sprite.done) {
            this.explosions.splice(i, 1);
            i--;
        }
    }
};

// Collisions
Game.prototype.checkCollisions =  function () {
    this.checkPlayerBounds();

    function collides(x, y, r, b, x2, y2, r2, b2) {
        return !(r <= x2 || x > r2 ||
                 b <= y2 || y > b2);
    };

    function boxCollides(pos, size, pos2, size2) {
    return collides(pos[0], pos[1],
                    pos[0] + size[0], pos[1] + size[1],
                    pos2[0], pos2[1],
                    pos2[0] + size2[0], pos2[1] + size2[1]);
    };
    
    for(var i=0; i<this.enemies.length; i++) {
        var pos = this.enemies[i].pos;
        var size = this.enemies[i].sprite.size;

        for(var j=0; j<this.bullets.length; j++) {
            var pos2 = this.bullets[j].pos;
            var size2 = this.bullets[j].sprite.size;

            if(boxCollides(pos, size, pos2, size2)) {
                this.enemies.splice(i, 1);
                i--;
                this.score += 100;
                this.explosions.push({
                    pos: pos,
                    sprite: new Sprite('img/sprites.png',
                                       [0, 117],
                                       [39, 39],
                                       16,
                                       [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                       null,
                                       true)
                });
                this.bullets.splice(j, 1);
                break;
            }
        }

        if(boxCollides(pos, size, this.player.pos, this.player.sprite.size)) {
            this.gameOver();
        }
    }
};

Game.prototype.checkPlayerBounds = function () {
    if(this.player.pos[0] < 0) {
        this.player.pos[0] = 0;
    }
    else if(this.player.pos[0] > canvas.width - this.player.sprite.size[0]) {
        this.player.pos[0] = canvas.width - this.player.sprite.size[0];
    }

    if(this.player.pos[1] < 0) {
        this.player.pos[1] = 0;
    }
    else if(this.player.pos[1] > canvas.height - this.player.sprite.size[1]) {
        this.player.pos[1] = canvas.height - this.player.sprite.size[1];
    }
};

Game.prototype.render =  function () {
    function renderEntities(list) {
        for(var i=0; i<list.length; i++) {
            renderEntity(list[i]);
        }    
    };

    function renderEntity(entity) {
        ctx.save();
        ctx.translate(entity.pos[0], entity.pos[1]);
        entity.sprite.render(ctx);
        ctx.restore();
    };

    ctx.fillStyle = this.terrainPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render the player if the game isn't over
    if(!this.isGameOver) {
        renderEntity(this.player);
    }

    renderEntities(this.bullets);
    renderEntities(this.enemies);
    renderEntities(this.explosions);
};

Game.prototype.gameOver = function () {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('game-over-overlay').style.display = 'block';
    this.isGameOver = true;
};