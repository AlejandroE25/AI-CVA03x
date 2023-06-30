export const audio = document.getElementById("audio");

// on touch
document.addEventListener("touchstart", function (event) {
    if (audio.src === "") {
        audio.src = "";
        audio.play();
    }
});

export function play(src) {
    audio.src = src;
    audio.play();
}
