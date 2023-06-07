let gttsBtn = document.getElementById('gtts-btn');
let cameraBtn = document.getElementById('camera-btn');
let uploadBtn = document.querySelector('#upload-btn');
let textArea = document.querySelector('#textarea');
let line = document.createElement('p');
line.className = "line"
line.id = "last-line"
line.innerHTML = `Ready to roll!`
textArea.appendChild(line)
line.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "nearest"
});

//open github repo
document.querySelector('#webcam-banner').addEventListener('click', function () {
    window.open('https://github.com/Syntaaax/CSEL-302/tree/main/FINALS/', '_blank');
})

async function addTestLines(totalLines) {
    for (let i = 1; i < totalLines + 1; i++) {
        let line = document.createElement('p');
        line.className = "line"
        line.innerHTML = `Hello`
        textArea.appendChild(line)
        line.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest"
        });
    }
}

uploadBtn.addEventListener('click', function () {
    uploadBtn.style.background = "#D4EC7E";
    let text = 'Coming Soon!'
    addNewTranslateLine(text)
    tts(text)
    uploadBtn.style.background = "#EAF1C5"
})

async function addNewTranslateLine(text) {
    let lastLine = textArea.lastElementChild;
    try {
        document.querySelector('#last-line').id = '';
    } catch (err) {
        console.log(err)
    }

    let newLine = document.createElement('p');
    newLine.innerHTML = text;
    newLine.className = "line";
    newLine.id = 'last-line';
    textArea.appendChild(newLine);
    newLine.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest"
    })
}

cameraBtn.addEventListener("click", function () {
    if (cameraBtn.style.backgroundColor === 'rgb(212, 236, 126)') {
        cameraBtn.style.background = "#EAF1C5"; 
        alert('stopping... Press OK')
        location.reload()

    } else {
        cameraBtn.style.background = "#D4EC7E";
        document.getElementById("webcam-banner").style.display = "none"; 
        document.getElementById("canvas").style.display = "block"; 
        alert('starting.... Press OK')
        init();
    }
});

gttsBtn.addEventListener("click", function () {
    if (gttsBtn.style.backgroundColor === 'rgb(212, 236, 126)') {
        gttsBtn.style.background = "#EAF1C5"; 

    } else {
        gttsBtn.style.background = "#D4EC7E";
    }
});

async function tts(text) {
    if ('speechSynthesis' in window) {
        console.log('');
    } else {
        alert('Text to speech not available 😞');
        location.reload();
    }

    let msg = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(msg);

}

const delay = ms => new Promise(res => setTimeout(res, ms));

let model, webcam, ctx, labelContainer, maxPredictions;
async function init() {
    const modelURL = "https://vivekkushalch.github.io/Indian-Sign-Language-Recognition-System/model.json";
    const metadataURL = "https://vivekkushalch.github.io/Indian-Sign-Language-Recognition-System/metadata.json";

    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    const size = 200;
    const flip = true; 
    webcam = new tmPose.Webcam(size, size, flip); 
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);


    const canvas = document.getElementById("canvas");
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext("2d");
}

async function loop(timestamp) {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const {
        pose,
        posenetOutput
    } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability.toFixed(2) == 1.00) {
            if (document.querySelector('#last-line').innerHTML != prediction[i].className) {
                await addNewTranslateLine(prediction[i].className);
                if (gttsBtn.style.backgroundColor === 'rgb(212, 236, 126)') {
                    await tts(prediction[i].className)
                } else {
                    console.log('')
                }
            }
        }

    }
    drawPose(pose);
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        if (pose) {
            const minPartConfidence = 0.5; 
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}