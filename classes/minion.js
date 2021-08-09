class Minion extends GameObject {
    constructor(spriteX, spriteY, args) {
        if (!args) {
            args = {};
        }

        args.img = images["img/rotmg.png"];
        args.sx = Minion.SPRITE_WIDTH * spriteX;
        args.sy = Minion.SPRITE_HEIGHT * spriteY;
        args.sWidth = Minion.SPRITE_WIDTH;
        args.sHeight = Minion.SPRITE_HEIGHT;
        args.size = new Vector(Minion.SPRITE_WIDTH, Minion.SPRITE_HEIGHT);

        super(args);
    }


    shootTimer = 0;
    shootDelay = 2;

    update(deltaTime) {

        // shooting on delay
        if ((this.shootTimer += deltaTime) >= this.shootDelay) {
            this.shootTimer = 0;

            //console.log("minion shoot: ", this.position);
            let bullet = new MinionBullet({
                position: this.position.copy(),
                angle: this.angleTo(Player.gameObject.position)
            });

            bullets.push(bullet)
        }

        this.draw();

    }
}
Minion.SPRITE_WIDTH = 40;
Minion.SPRITE_HEIGHT = 40;