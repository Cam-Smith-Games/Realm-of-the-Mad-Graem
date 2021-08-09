class Sound {

    constructor(src, onload) {
        this.sound = document.createElement("audio");
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        this.sound.volume = 0.2;
        document.body.appendChild(this.sound);

     
        this.sound.oncanplaythrough = () => {
            onload();
            this.sound.oncanplaythrough = null;
        };
        this.sound.src = src;
    }

    play(currentTime) {
        this.sound.currentTime = typeof currentTime === "number" ? currentTime : 0;
        this.sound.play();
    }
    stop() {
        this.sound.pause();
    }
}