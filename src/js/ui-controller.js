export function showBoxShadow() {
    let frame = document.getElementById("frame");
    frame.classList.add("box-shadow");
}

export function hideBoxShadow() {
    let frame = document.getElementById("frame");
    frame.classList.remove("box-shadow");
}

export function showLoggedIn() {
    let main = document.getElementById("main");
    main.classList.add("show-main");
}

export function showLoggedOut() {
    let main = document.getElementById("main");
    main.classList.remove("show-main");
    let btn = document.getElementById("btn");
    btn.innerText = "Login";
}

export function displayUserInfo(user) {
    showLoggedIn();
    document.getElementById("btn").innerText = user.email;
}
export function disable() {
    time.style.display = "none";
}

export function enable() {
    time.style.display = "block";
}

export async function addLinesSequentially(lines) {
    let typewriterContainer = document.getElementById("typewriter-container");
    let animationDuration = 800;
    typewriterContainer.innerHTML = "";
    for (const line of lines) {
        const typewriterLine = createTypewriterLine(line);
        typewriterContainer.appendChild(typewriterLine);
        await sleep(animationDuration);
    }
}

function createTypewriterLine(content) {
    const line = document.createElement("div");
    line.classList.add("typewriter-text");
    line.textContent = content;
    return line;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
let transcriptionContainer = document.getElementById("transcription-container");
export function appendTranscription(text) {
    const transcription = document.createElement("p");
    transcription.id = "transcription";
    transcription.innerText = text;
    transcriptionContainer.appendChild(transcription);
    hideBoxShadow();
}
export function resetUI() {
    setTimeout(function () {
        addLinesSequentially([""]);
        time?.classList.add("show");
        transcriptionContainer.innerHTML = "";
        hideBoxShadow();
    }, 5000);
}

export function showLoading() {
    let loader = document.getElementById("loader");
    loader.style.opacity = 1;
}

export function hideLoading() {
    let loader = document.getElementById("loader");
    loader.style.opacity = 0;
}
export function showSpinner() {
    let spinner = document.getElementById("spinner");
    spinner.style.display = "block";
}

export function hideSpinner() {
    let spinner = document.getElementById("spinner");
    spinner.style.display = "none";
}

export function hideIntializeButton() {
    let initializeButton = document.getElementById("initialize");
    initializeButton.style.display = "none";
}
let time = document.getElementById("time");

function updateTime() {
    const today = new Date();
    const timeString = today.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    time.innerText = timeString;
}
updateTime();
setInterval(updateTime, 10000);
