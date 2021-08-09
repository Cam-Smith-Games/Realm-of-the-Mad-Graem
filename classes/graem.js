const Graem = {

    init: function () {
        let img = images["img/graem_sad.png"];
        let width = 200;
        let height = width * img.height / img.width;
        this.gameObject = new GameObject({
            img: img,
            size: new Vector(width, height),
            position: new Vector(canvas.width / 2, 20 + height / 2),
            velocity: new Vector(5, 0)
        });
    },



    bobTimer: 0,
    bobDelay: 0.5,
    bobDirection: 1,
    bobSpeed: 1,
    bobAmount: 1,
    bob: function (deltaTime) {
        if ((this.bobTimer += deltaTime) > this.bobDelay) {
            this.bobTimer = 0;
            (this.bobDirection *= -1)
        }

        let sizeChange = this.bobDirection * this.bobAmount;
        this.gameObject.size.x += sizeChange;
        this.gameObject.size.y += sizeChange;
        this.gameObject.radius = this.gameObject.size.x / 2;
    },


    move: function (deltaTime) {
        let obj = this.gameObject;
        obj.move(deltaTime);
        if (obj.position.x >= canvas.width - 100 || obj.position.x <= 100) {
            console.log(obj.position.x + " + " + obj.size.x + " = " + (obj.position.x + obj.size.x));
            console.log("hey");
            obj.velocity.x *= -1;
        }
    },


    shootTimer: 0,
    shootDelay: 3,
    shoot: function (deltaTime) {
        // shooting on delay
        this.shootTimer += deltaTime;
        if (this.shootTimer >= this.shootDelay) {

            this.shootTimer = 0;

            let stocksUp = Math.random() > 0.66;

            this.gameObject.img = stocksUp ? images["img/graem_happy.png"] : images["img/graem_sad.png"];

            let bullet = new GraemBullet({
                stocksUp: stocksUp,
                position: this.gameObject.position.copy(),
                angle: this.gameObject.angleTo(Player.gameObject.position)
            });

            bullets.push(bullet)
        }
    },



    update: function (deltaTime) {
        this.bob(deltaTime);
        this.move(deltaTime);

        this.shoot(deltaTime);    
        this.gameObject.draw();

        // spawning minions
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnDelay) {
            this.spawnTimer = 0;
            let count = Math.floor(Math.random() * 10);
            this.spawnMinions(count);
        }
     },




    spawnTimer: 0,
    spawnDelay: 10,
    minions: [],
    spawnMinions: function (count) {
        console.log("SPAWNING " + count + " MINIONS...");

        const min_sprite_y = 5;
        const max_sprite_y = 20;

        // making sure new minion doesn't collide with anything. this could result in many more than "count" loops
        // theoretically, the arena could get so filled up that there isn't any room left, so i'm creating an limit on number of attempts
        let i = 0, numAttempts = 0;
        while (i < count && ++numAttempts < 50) {
            let spriteX = Math.floor(Math.random() * 24);
            let spriteY = min_sprite_y + Math.floor(Math.random() * (max_sprite_y - min_sprite_y));

            let x = (Math.random() * canvas.width).clamp(Minion.SPRITE_WIDTH, canvas.width - Minion.SPRITE_WIDTH);
            let y = (Math.random() * canvas.height).clamp(Minion.SPRITE_HEIGHT, canvas.height - Minion.SPRITE_HEIGHT);

            let minion = new Minion(spriteX, spriteY, {
                position: new Vector(x, y)
            });

            let collision = minion.isColliding(Player.gameObject) || minion.isColliding(Graem.gameObject);
            if (!collision) {
                for (var j = 0; j < Graem.minions.length; j++) {
                    if (minion.isColliding(Graem.minions[j])) {
                        collision = true;
                        break;
                    }
                }
            }
            if (!collision) {
                this.minions.push(minion);
                i++;
            }
        }      
    },

    health: 100,
    hurt: function (damage) {
        if (this.health > 0) {
            this.health -= damage;

            $("#bossHealth").find("> div").css("width", this.health + "%");

            if (this.health <= 0) {
                alert("YOU WIN. HOLY SHIT WOOOO MY GOD WOWWW");
                stopped = true;
            }
        }

    }
};