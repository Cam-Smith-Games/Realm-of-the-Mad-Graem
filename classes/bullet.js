class Bullet extends GameObject {
    constructor(args) {
        super(args);
        this.damage = typeof args.damage === "number" ? args.damage : 0;
    }

    update() {
        // #region moving / drawing
        let delta = this.velocity.rotate(this.angle);
        this.position = this.position.add(delta);
        this.draw();
        // #endregion

        return this.checkCollisions();
    }

    draw() {
        super.draw();
    }
    checkCollisions() {
        // canvas bounds
        if (this.position.x < 0) {
            return true;
        }
        if (this.position.x + this.size.x > canvas.width) {
            return true;
        }
        if (this.position.y < 0) {
            return true;
        }
        if (this.position.y + this.size.y > canvas.height) {
            return true;
        }
        // #endregion

        return false;
    }
}

class MinionBullet extends Bullet {

    constructor(args) {
        args.damage = 1;
        args.size = new Vector(10, 10);
        args.color = "red";
        args.velocity = new Vector(0, -3);
        super(args);


    }

    update() {
        // slightly look away from player
        let angleToPlayer = this.angleTo(Player.gameObject.position);
        let diff = angleToPlayer - this.angle;
        this.angle += (diff / 20).clamp(-0.01, 0.01);

        return super.update();
    }

    checkCollisions() {
        // player
        if (this.isColliding(Player.gameObject)) {
            Player.hurt(this.damage)
            return true;
        }

        return super.checkCollisions();
    }
}

class GraemBullet extends Bullet {
    constructor(args) {
        args.size = new Vector(35, 35);
        args.velocity = new Vector(0, -3);
        args.damage = args.stocksUp ? -5 : 15;
        //args.color = stocksUp ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)";
        args.img = args.stocksUp ? images["img/up.png"] : images["img/down.png"];

        // red arrows track player, green arrows don't
        // (setting this here so it doesn't have to repeat an if statement on every update)
        let update;
        if (args.stocksUp) {
            update = deltaTime => {
                this.lifeSpan -= deltaTime;
                if (this.lifeSpan <= 0) {
                    return true;
                }
                return super.update();
            }
        }
        else {
            update = deltaTime => {
                this.lifeSpan -= deltaTime;
                if (this.lifeSpan <= 0) {
                    return true;
                }
                // track player
                this.lookAt(Player.gameObject.position);
                return super.update();
            }
        }

        super(args);

        this.lifeSpan = 5;
        this.update = update;

 

    }

    checkCollisions() {
        // player
        if (this.isColliding(Player.gameObject)) {
            Player.hurt(this.damage)
            return true;
        }
        return super.checkCollisions();
    }


}

class PlayerBullet extends Bullet {

    constructor(args) {
        args.damage = 1;
        super(args);
    }

    checkCollisions() {
        // graem
        if (this.isColliding(Graem.gameObject)) {
            Graem.hurt(this.damage)
            return true;
        }

        // graems minions
        for (var i = Graem.minions.length - 1; i > -1; i--) {
            let minion = Graem.minions[i];
            if (this.isColliding(minion)) {
                Graem.minions.splice(i, 1);
                return true;
            }
        }

        return super.checkCollisions();
    }
}
