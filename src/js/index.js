import {play} from './audioController.js'
import {
    showBoxShadow,
    hideBoxShadow,
    addLinesSequentially,
    appendTranscription,
    resetUI,
    showLoading,
    hideLoading,
} from "./ui-controller.js";


let active = false
let lastState = active
let trigger = false

const video = document.getElementById("video");

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
]).then(startWebcam);

function startWebcam() {
    navigator.mediaDevices
        .getUserMedia({
            video: true,
            audio: false,
        })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((error) => {
            console.error(error);
        });
}

video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    faceapi.matchDimensions(canvas, { height: video.height, width: video.width });

    setInterval(async () => {
        let audio;
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

        const resizedDetections = faceapi.resizeResults(detections, {
            height: video.height,
            width: video.width,
        });


        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);


        // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        if (detections.length > 0) {
            active = true
        } else {
            active = false
        }

        if (active !== lastState && active === true) {
            play("./src/js/gotit.mp3")
            trigger = true
        }
        else if (active !== lastState && active === false) {
            play("./src/js/goodbye.mp3")
            hideBoxShadow()
            trigger = true
        }

        lastState = active
    }, 3000);
})


document.addEventListener('DOMContentLoaded', function() {

    let myvad = null;
    let user_id = "Pixel"
    let apiDomain = "https://api.carterlabs.ai/api";
    let token = "36be8e0e-e872-4d67-b30e-62d74d40a18b"

    function speakOutputText(outputText) {
        var firstSentence = outputText.split(/[.!?]/)[0] + ".";
        var restOfText = outputText.substring(firstSentence.length).trim();

        if (restOfText.split(" ").length > 10) {
            speak(firstSentence);

            if (restOfText.length > 3) {
                setTimeout(function () {
                    speak(restOfText);
                }, firstSentence.split(" ").length * 400);
            }
        } else {
            speak(outputText);
        }
    }
    function speak(toSay) {
        fetch(apiDomain + "/speak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: toSay,
                key: token,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                play(data["output"]["audio"]);
            })
            .catch((error) => {
                console.error(error);
            });
    }
    function forceSpeak(text) {
        myvad.pause();
        var audio_duration = text.split(" ") * 1000;
        speakOutputText(text);
        setTimeout(function () {
            myvad.start();
        }, audio_duration);
    }


    function encodeAudioToBase64(audio) {
        const wavBuffer = vad.utils.encodeWAV(audio);
        return vad.utils.arrayBufferToBase64(wavBuffer);
    }

    function postData(url, data) {
        return fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then((response) => response.json());
    }

    function processResponseData(data, audio_duration) {
        const maxLength = 50;
        const outputText = data.output.text;
        const lines = splitText(outputText, maxLength);
        addLinesSequentially(lines);
        speakOutputText(outputText);
        document.body.style.backgroundSize = "40px 40px, 100% 100%";


        setTimeout(function () {
            myvad.start();
        }, audio_duration);
        resetUI();
    }

    function processAudio(audio) {
        showLoading();
        const base64 = encodeAudioToBase64(audio);
        addLinesSequentially([""]);
        document.body.style.backgroundSize = "37px 37px, 100% 100%";

        play("./src/js/gotit.mp3");

        postData(apiDomain + "/transcribe", {
            audio: base64,
            key: token,
        })
            .then((data) => {
                appendTranscription(data.output.text);

                return postData(apiDomain + "/chat", {
                    text: data.output.text,
                    key: token,
                    user_id: user_id,
                    speak: false,
                });
            })
            .then((data) => {
                const audio_duration = audio.duration * 1000;
                processResponseData(data, audio_duration);
                hideLoading()
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function splitText(text, maxLength) {
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";

        for (const word of words) {
            if (currentLine.length + word.length <= maxLength) {
                currentLine += word + " ";
            } else {
                lines.push(currentLine.trim());
                currentLine = word + " ";
            }
        }

        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }

        return lines;
    }

    navigator.mediaDevices
        .enumerateDevices()
        .then(function (devices) {
            const microphoneList = document.getElementById("microphoneList");
            devices.forEach(function (device) {
                if (device.kind === "audioinput") {
                    const option = document.createElement("option");
                    option.value = device.deviceId;
                    option.text =
                        device.label ||
                        "microphone " + (microphoneList.length + 1);
                    microphoneList.appendChild(option);
                }
            });
        })
        .catch(function (err) {
            console.log(err.name + ": " + err.message);
        });

    async function main() {
        myvad = await vad.MicVAD.new({
            positiveSpeechThreshold: 0.8,
            negativeSpeechThreshold: 0.8 - 0.15,
            minSpeechFrames: 0.5,
            preSpeechPadFrames: 1,
            redemptionFrames: 10,

            onSpeechStart: () => {
                console.log("Speech started");
                showBoxShadow()
            },
            onSpeechEnd: (audio) => {
                myvad.pause();

                processAudio(audio);
            },
            onFrameProcessed: (probs) => {
                // console.log("Frame processed", probs);
            },
        });
    }

    main();

    const greetings = ["Hello", "Hey", "Hi there"];

    setInterval(function () {

        console.log("active", active);

        if (!active && trigger) {
            trigger = false
            myvad.pause();
            console.log("waiting")
            resetUI()
        }

        if (active && trigger) {
            console.log("greeting")
            trigger = false
            forceSpeak(
                greetings[Math.floor(Math.random() * greetings.length)]
            );
            myvad.start();
        }
    }, 800);
});



