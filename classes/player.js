
class Animation {

    constructor(frameCount, frameDelay, onStart, onFinish) {
        this.frameCount = frameCount;
        this.frameDelay = typeof frameDelay === "number" ? frameDelay : 0.01;
        this.onStart = typeof onStart === "function" ? onStart : () => { };
        this.onDelay = typeof onFinish === "function" ? onFinish : () => { };
    }


    frameIndex = 0;
    frameTicker = 0;

    update(deltaTime) {
        this.frameTicker += deltaTime;

        if (this.frameTicker >= this.frameDelay) {
            this.frameTicker = 0;

            if (++this.frameIndex > this.frameCount) {
                this.onFinish();
            }
        }
    }
}


const Player = {
    animations: {
        "feet": {
            "idle": 1,
            "run": 20,
            "reload": 0,
            "shoot": 0
        },
        "flashlight": {
            "idle": 20,
            "meleeattack": 15,
            "move": 20
        },
        "handgun": {
            "idle": 20,
            "meleeattack": 15,
            "move": 20,
            "reload": 15,
            "shoot": 3
        },
        "knife": {
            "idle": 20,
            "meleeattack": 15,
            "move": 20
        },
        "rifle": {
            "idle": 20,
            "meleeattack": 15,
            "move": 20,
            "reload": 20,
            "shoot": 3
        },
        "shotgun": {
            "idle": 20,
            "meleeattack": 15,
            "move": 20,
            "reload": 20,
            "shoot": 3
        }
    },

    getImagePath: function () {
        return "img/tds/" + this.weapon + "/" + this.animation + "/survivor-" + this.animation + "_" + this.weapon + "_" + this.frameIndex + ".png"
    },
    getFrameCount: function () {
        return this.animations[this.weapon][this.animation];
    },

    init: function (weapon, animation) {
        let width = 50;

        this.weapon = weapon;
        this.animation = animation;
        let path = this.getImagePath();
        let img = images[path];

        this.gameObject = new GameObject({
            img: img,
            size: new Vector(width, width * img.height / img.width),
            position: new Vector(canvas.width / 2, canvas.height - 240)
        });

        this.setAmmo(this.clip.size);
    },


    MOVE_SPEED: 500,


    update: function (deltaTime) {
        let obj = this.gameObject;

        // #region pointing player at mouse
        this.gameObject.lookAt(new Vector(mouse.x, mouse.y));
        // #endregion

        // #region  moving
        obj.velocity = new Vector(0, 0);
        if (keys["W"]) {
            obj.velocity.y = -1;
        }
        if (keys["S"]) {
            obj.velocity.y = 1;
        }
        if (keys["A"]) {
            obj.velocity.x = -1;
        }
        if (keys["D"]) {
            obj.velocity.x = 1;
        }

        obj.velocity = obj.velocity.unit().multiply(this.MOVE_SPEED * deltaTime);
        obj.position.x = (obj.position.x + obj.velocity.x).clamp(0, canvas.width - obj.size.x);
        obj.position.y = (obj.position.y + obj.velocity.y).clamp(obj.size.y / 2, canvas.height - obj.size.y / 2);
        // #endregion

        // drawing laser
        ctx.beginPath();
        ctx.strokeStyle = "rgb(0, 255, 0)";
        ctx.moveTo(this.gameObject.position.x, this.gameObject.position.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();

        this.animate(deltaTime);
        this.gameObject.draw();

        this.shootTimer += deltaTime;

        // #region shooting / moving bullets
        if (this.reloading) {
            this.reload();
        }
        else if (this.shooting) {
            this.shoot();
        }
        else if (mouse.down) {
            if (this.shootTimer > this.shootDelay) {
                this.startShooting();
            }
        }
        // #endregion

    },

    // #region health
    health: 100,
    hurt: function (damage) {
        if (this.health > 0) {
            console.log("player hurt (" + damage + ")");
            this.health = (this.health - damage).clamp(0, 100);
            $("#motionBlur").val(1 - (this.health/100)).trigger("input");

            $("#playerHealth").find("> div").css("width", this.health + "%");

            if (this.health <= 0) {
                alert("YOU JUST LOST... TO GRAEM??? AHAHAHAHAHA");
                stopped = true;
            }
        }

    },
    // #endregion

    // #region shooting
    bullets: [],
    isShooting: false,
    shootTimer: 0.2,
    shootDelay: 0.1,
    clip: {
        current: 20,
        size: 20
    },
    setAmmo: function (amt) {
        this.clip.current = amt.clamp(0, this.clip.size);
        $("#ammo").html(this.clip.current + "/" + this.clip.size);
    },

    startShooting: function () {
        this.setAmmo(this.clip.current - 1);

        this.shooting = true;
        this.switchAnimation("shoot");

        sounds["sound/shoot.mp3"].play();
        bullets.push(new PlayerBullet({
            position: this.gameObject.position.copy(), //.add(new Vector(12, -25)),
            angle: this.gameObject.angle,
            velocity: new Vector(0, -10),
            size: new Vector(1, 10),
            color: "rgb(253, 200, 51)"
        }));

        if (this.clip.current < 1) {
            this.startReloading();
        }


    },
    shoot: function () {
        if (this.frameIndex == 2) {
            this.stopShooting();
        }
    },
    stopShooting: function () {
        this.shooting = false;
        this.switchAnimation("idle");
        this.shootTimer = 0;
    },

    startReloading: function () {
        sounds["sound/reload.wav"].play(0.6);
        this.switchAnimation("reload");
        this.reloading = true;
    },
    reload: function () {
        if (this.frameIndex == 14) {
            this.stopReloading();
        }
    },
    stopReloading: function () {
        this.setAmmo(this.clip.size);

        this.reloading = false;
        this.switchAnimation("idle");
        this.shootTimer = 0;
    },
    // #endregion


    // #region animation
    frameIndex: 0,
    frameCount: 20,
    animDelay: 2 / 60, // animations should be 60 fps
    animTick: 0,
    animate: function (deltaTime) {
        this.animTick += deltaTime;
        if (this.animTick > this.animDelay) {
            this.animTick = 0;
            this.frameIndex = (this.frameIndex + 1) % this.getFrameCount();
            let path = this.getImagePath();
            this.gameObject.img = images[path];
        }

        //this.gameObject.width = this.gameObject.img.width;
        //this.gameObject.height = this.gameObject.img.height;
    },
    switchWeapons: function (weapon) {
        this.weapon = weapon;
        this.switchAnimation(this.animation);
    },
    switchAnimation: function (animation) {
        let weapon = this.animations[this.weapon];
        this.animation = (weapon && animation in weapon) ? animation : "idle";
        this.frameIndex = -1;
    }
    // #endregion


};
