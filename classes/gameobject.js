class GameObject {
    constructor(args) {
        if (typeof args !== "object") {
            args = {};
        }

        // defaulting properties when not provided in args (or invalid) 
        this.img = args.img instanceof Image ? args.img : null;
        this.position = args.position instanceof Vector ? args.position : new Vector(0, 0);
        this.velocity = args.velocity instanceof Vector ? args.velocity : new Vector(0, 0);
        this.size = args.size instanceof Vector ? args.size : new Vector(10, 10);
        this.radius = Math.max(this.size.x / 2, this.size.y / 2);
        this.angle = typeof args.angle === "number" ? args.angle : 0;
        this.color = typeof args.color === "string" ? args.color : "rgb(0, 255, 0)";

   
        this.sx = typeof args.sx === "number" ? args.sx : 0;
        this.sy = typeof args.sy === "number" ? args.sy : 0;
        this.sWidth = typeof args.sWidth === "number" ? args.sWidth : this.img ? this.img.width : 0;
        this.sHeight = typeof args.sHeight === "number" ? args.sHeight : this.img ? this.img.height : 0;
        
    }

    move() {
        let delta = this.velocity.rotate(this.angle);
        this.position = this.position.add(delta);

        this.position.x = this.position.x.clamp(0, canvas.width - this.radius);
        this.position.y = this.position.y.clamp(0, canvas.height - this.radius);

    }

    draw() {
        const half_width = this.size.x / 2;
        const half_height = this.size.y / 2;
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);

        if (this.img) {
            //if (this.sx) {
            ctx.drawImage(this.img, this.sx, this.sy, this.sWidth, this.sHeight, -half_width, -half_height, this.size.x, this.size.y);
            //}
            //else {
            //    ctx.drawImage(this.img, -half_width, -half_height, this.size.x, this.size.y);
            //} 
        }
        else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
            ctx.fill();
            //ctx.fillRect(-half_width, -half_height, this.size.x, this.size.y);
        }
        
        if (debug) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = this.color;
            ctx.fillStyle = this.color;
            ctx.strokeStyle = "rgb(0,255,0)";
            //ctx.strokeRect(-half_width, -half_height, this.size.x, this.size.y);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.fillRect(-2, -2, 4, 4);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -10);
            ctx.stroke();

        }

        ctx.rotate(-this.angle);
        ctx.translate(-this.position.x, -this.position.y);
        ctx.closePath();
    }

    isColliding(other) {
        let x_diff = this.position.x - other.position.x;
        let y_diff = this.position.y - other.position.y;
        let dist = Math.sqrt(x_diff * x_diff + y_diff * y_diff);
        return dist < this.radius || dist < other.radius;
    }

    angleTo(vector) {
        let x_diff = this.position.x - vector.x;
        let y_diff = this.position.y - vector.y;
        return Math.atan2(y_diff, x_diff) - (Math.PI / 2);;
    }

    lookAt(vector) {
        this.angle = this.angleTo(vector);
	}
}
