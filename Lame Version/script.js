var canvas, ctx,
    blurCanvas, blurCtx,
    boys = [];

class Boy {
    constructor(args) {
        if (typeof args !== "object") {
            args = {};
        }

        // defaulting properties when not provided in args
        this.img = args.img instanceof Image ? args.img : new Image();
        this.position = args.position instanceof Vector ? args.position : new Vector(0, 0);
        this.velocity = args.velocity instanceof Vector ? args.velocity : new Vector(0, 0);
        this.size     = args.size instanceof Vector ? args.size : new Vector(10, 10);
        this.angle = typeof args.angle === "number" ? args.angle : 0;
        this.color = typeof args.color === "string" ? args.color : "red";

        this.bobTicker = 0;
        this.bobDirection = 1;
    }


    move() {
        // bobbing
        if (++this.bobTicker > bobDelay) {
            this.bobTicker = 0;
            this.bobDirection *= -1;

            let sizeChange = this.bobDirection * bobAmount;
            this.size.x += sizeChange;
            this.size.y += sizeChange;

            let offset = sizeChange / 2;
            this.position.x -= offset;
            this.position.y -= offset;
        }
   
        
    

        let delta = this.velocity.rotate(this.angle);
        this.position = this.position.add(delta);

        //let angleFlipped = false;
        //const flipAngle = () => {
        //    if (!angleFlipped) {
        //        this.angle = this.angle - 180;
        //        angleFlipped = true;
        //    }      
        //}

        if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x *= -1;
            //flipAngle();
        }
        else if (this.position.x + this.size.x > canvas.width) {
            this.position.x = canvas.width - this.size.x;
            this.velocity.x *= -1;
            //flipAngle();
        }

        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y *= -1;
            //flipAngle();
        }
        if (this.position.y + this.size.y > canvas.height) {
            this.position.y = canvas.height - this.size.y;
            this.velocity.y *= -1;
            //flipAngle();
        }
    }


    draw() {
        this.move(); 

        ctx.lineWidth = 2;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;


        const half_width = this.size.x / 2;
        const half_height = this.size.y / 2;
        const offset_x = this.position.x + half_width;
        const offset_y = this.position.y + half_height;

        ctx.translate(offset_x, offset_y);
        ctx.rotate(this.angle);
        //ctx.strokeStyle = "white";
        //ctx.strokeRect(-half_width, -half_height, this.size.x, this.size.y);
        ctx.drawImage(this.img, -half_width, -half_height, this.size.x, this.size.y);
        ctx.rotate(-this.angle);
        ctx.translate(-offset_x, -offset_y);


        ctx.closePath();
    }
}

var bobSpeed, bobAmount;

function start() {
    let motionBlur = 0.25;
    $("#motionBlur").on("input", function () {
        motionBlur = $(this).val();
    });

    let raveTicker = raveSpeed = 20;
    $("#raveSpeed").on("input", function () {
        raveSpeed = 100 - $(this).val();
    });


    $("#bobSpeed").on("input", function () {
        bobDelay =  1000 - parseFloat($(this).val());
    }).trigger("input");

    $("#bobAmount").on("input", function () {
        bobAmount = parseFloat($(this).val());
    }).trigger("input");

    const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
    
    let interval = setInterval(() => {
        // RAVE BACKGROUND
        if (++raveTicker > raveSpeed) {
            bgCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            bgCtx.fillRect(0, 0, canvas.width, canvas.height);
            raveTicker = 0;
        }

        // MOTION BLUR
        blurCtx.clearRect(0, 0, canvas.width, canvas.height);
        blurCtx.globalAlpha = motionBlur;
        blurCtx.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(blurCanvas, 0, 0);

        // DRAW BOYS
        boys.forEach(boy => boy.draw());
    }, 1000 / 60);
}

$(document).ready(function () {
    bgCanvas = document.getElementById("background");
    canvas = document.getElementById("canvas");
    blurCanvas = document.getElementById("blur");

    bgCtx = bgCanvas.getContext("2d");
    ctx = canvas.getContext("2d");
    blurCtx = blurCanvas.getContext("2d");

    let names = ["adrian", "cam", "connor", "graem"];

    let imagesLoaded = 0;
    function imgLoad() {
        let img = this;

        let width = img.width / 2;
        let height = img.height / 2;
        let x = (Math.random() * canvas.width) - (width / 2);
        let y = (Math.random() * canvas.height) - (height / 2);

        boys.push(new Boy({
            img: img,
            position: new Vector(x, y),
            size: new Vector(width, height),
            velocity: new Vector(1 + (Math.random() * 3), 1 + (Math.random() * 3))
            //angle: 45
        }));

        if (++imagesLoaded >= names.length) {
            start();
        }
    }

    names.forEach(name => {
        let img = new Image();
        img.onload = imgLoad;
        img.src = "boys/" + name + ".png";
    })
});