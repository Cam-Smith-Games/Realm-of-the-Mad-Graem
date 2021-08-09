// #region global variables 
const images = {}, sounds = {};

var canvas, ctx,
    blurCanvas, blurCtx,
    bullets = [];

var debug = false;


const mouse = {
    down: false,
    x: 0,
    y: 0
};

const keyCodes = {
    87: "W",
    65: "A",
    83: "S",
    68: "D"
}
const keys = {};

let stopped = false;
// #endregion


Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};


$(document).ready(function () {
    // #region UI events
    let motionBlur = 0;
    $("#motionBlur").on("input", function () {
        motionBlur = parseFloat($(this).val());
    }).trigger("input");

    $(document)
        .on("mousedown", e => mouse.down = true)
        .on("mouseup", e => mouse.down = false)
        .on("mousemove", function (e) {

            let rect = canvas.getBoundingClientRect();
            let x = (e.clientX || e.pageX) - rect.left;
            let y = (e.clientY || e.pageY) - rect.top;

            // convert to canvas coordinates (resolution vs actual size)
            x *= canvas.width / rect.width;
            y *= canvas.height / rect.height;

            mouse.x = x.clamp(0, canvas.width);
            mouse.y = y.clamp(0, canvas.height);

            //console.log("mousemove: (" + e.clientX + ", " + e.clientY + ")", mouse);

        })
        .on("keydown", e => {
            if (e.which in keyCodes) {
                keys[keyCodes[e.which]] = true;
            }
        })
        .on("keyup", e => {
            if (e.which in keyCodes) {
                delete keys[keyCodes[e.which]];
            }
        });
    // #endregion

    // #region canvas
    bgCanvas = document.getElementById("background");
    canvas = document.getElementById("canvas");
    blurCanvas = document.getElementById("blur");

    bgCtx = bgCanvas.getContext("2d");
    ctx = canvas.getContext("2d");
    blurCtx = blurCanvas.getContext("2d");
    // #endregion 


    // #region loading images, then starting game

    // #region setting up resources 
    const imagePaths = ["img/graem_sad.png", "img/graem_happy.png", "img/rotmg.png", "img/up.png", "img/down.png"];
    const soundPaths = ["sound/shoot.mp3", "sound/reload.wav"];

    function forEachFrame(func) {
        for (var path in Player.animations) {
            let folder = Player.animations[path];
            for (var subPath in folder) {
                let frameCount = folder[subPath];
                func(path, subPath, frameCount);
            }
        }
    }


    let resourcesLoaded = 0;
    let numResources = imagePaths.length + soundPaths.length;
    forEachFrame((path, subPath, frameCount) => numResources += frameCount);
    // #endregion


    // #region loading resources
    function onload() {
        // TODO: progress bar 

        if (++resourcesLoaded >= numResources) {
            startGame();
        }
    }
    function addImage(path) {
        let img = new Image();
        img.onload = onload;
        img.src = path;
        images[path] = img;
    }
    forEachFrame((path, subPath, frameCount) => {
        for (var i = 0; i < frameCount; i++) {
            addImage("img/tds/" + path + "/" + subPath + "/survivor-" + subPath + "_" + (path == "feet" ? "" : (path + "_")) + i + ".png");
        }
    })
    imagePaths.forEach(path => addImage(path));
    soundPaths.forEach(path => sounds[path] = new Sound(path, onload));
    // #endregion

    // #endregion



    let frameCount = 0, previousTime = 0;
    function loop(currentTime) { 

        // #region tracking fps / delta time
        frameCount++;

        // convert time to seconds
        currentTime *= 0.001;
        const deltaTime = currentTime - previousTime;
        previousTime = currentTime;
        // #endregion

        // #region motion blur
        if (motionBlur > 0) {
            blurCtx.clearRect(0, 0, canvas.width, canvas.height);
            blurCtx.globalAlpha = motionBlur;
            blurCtx.drawImage(canvas, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(blurCanvas, 0, 0);
        }
        else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        // #endregion

        // #region showing mouse position
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 5, 0, 2 * Math.PI);
        ctx.stroke();
        // #endregion

        // #region updating objects
        Graem.update(deltaTime);
        Player.update(deltaTime);     
        for (var i = Graem.minions.length - 1; i > -1; i--) {
            let minion = Graem.minions[i];
            minion.update(deltaTime);
        }
        for (var i = bullets.length - 1; i > -1; i--) {
            let bullet = this.bullets[i];
            let collision = bullet.update(deltaTime);
            if (collision) {
                this.bullets.splice(i, 1);
            }
        }
        // #endregion


  
        if (!stopped) {
            window.requestAnimationFrame(loop);
        }
    }


    function startGame() {
        console.log("STARTING GAME...");

        Graem.init();
        Player.init("handgun", "idle");
        Minion.IMAGE = images["img/rotmg"];


        Graem.spawnMinions(10);

        window.requestAnimationFrame(loop);

        
    
        let fpsInterval = setInterval(() => {
            $("#fps").html(frameCount);
            frameCount = 0;
        }, 1000);
    }
});