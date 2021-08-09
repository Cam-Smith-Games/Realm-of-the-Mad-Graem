class Shooter extends GameObject {
    constructor(args) {
        super(args);

        this.shootTimer = 0;
        this.shootDelay = typeof args.shootDelay === "number" ? args.shootDelay : 0;
        this.spawnBullet = typeof args.spawnBullet === "function" ? args.spawnBullet : () => { };
    }


    update(deltaTime) {
        this.shootTimer += deltaTime;
        if (this.shootTimer > this.shootDelay) {
            this.shootTimer = 0;
            this.spawnBullet();
        }

    }
}