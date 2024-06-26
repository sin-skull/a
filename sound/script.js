let audioContext;
let audioSource;
let analyser;
let gainNode;
let canvas;
let ctx;
let dataArray;
let visualizeColor = '#ff0000';
let audio;
let draw;
let drawAnimationFrameId;
let colorMode = 'single';
let backgroundImage = null;
let backgroundVideo = null;
let backgroundToggle = 'off';

document.getElementById('audioFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    audio = new Audio(URL.createObjectURL(file));
    audioContext = new AudioContext();
    audioSource = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();
    gainNode = audioContext.createGain();

    audioSource.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);
    audio.play();

    setupVisualizer();

    audio.addEventListener('loadedmetadata', function() {
        document.getElementById('seekBar').max = audio.duration;
    });

    audio.addEventListener('timeupdate', function() {
        document.getElementById('seekBar').value = audio.currentTime;
    });
});

document.getElementById('playPauseBtn').addEventListener('click', function() {
    if (!audioContext) return;
    if (audioContext.state === 'running') {
        audioContext.suspend();
    } else {
        audioContext.resume();
    }
});

document.getElementById('resetBtn').addEventListener('click', function() {
    if (!audioContext) return;
    audio.currentTime = 0;
    audioContext.suspend();
});

document.getElementById('colorPicker').addEventListener('change', function(event) {
    visualizeColor = event.target.value;
});

document.getElementById('colorMode').addEventListener('change', function(event) {
    colorMode = event.target.value;
});

document.getElementById('volumeSlider').addEventListener('input', function(event) {
    gainNode.gain.value = event.target.value;
});

document.getElementById('seekBar').addEventListener('input', function(event) {
    if (!audio) return;
    audio.currentTime = event.target.value;
    if (backgroundVideo && backgroundToggle === 'video') {
        backgroundVideo.currentTime = event.target.value;
    }
});

document.getElementById('aspectRatio').addEventListener('change', function(event) {
    const aspectRatio = event.target.value;
    adjustCanvasSize(aspectRatio);
});

document.getElementById('backgroundFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        if (file.type.startsWith('image/')) {
            backgroundImage = new Image();
            backgroundImage.src = e.target.result;
            backgroundImage.onload = () => adjustCanvasSizeToBackground();
            backgroundVideo = null;
        } else if (file.type.startsWith('video/')) {
            backgroundVideo = document.createElement('video');
            backgroundVideo.src = e.target.result;
            backgroundVideo.loop = true;
            backgroundVideo.muted = true;
            backgroundVideo.play();
            backgroundVideo.onloadedmetadata = () => adjustCanvasSizeToBackground();
            backgroundImage = null;
        }
    };
    reader.readAsDataURL(file);
});

document.getElementById('backgroundToggle').addEventListener('change', function(event) {
    backgroundToggle = event.target.value;
    draw();
});

const sidebar = document.getElementById('sidebar');
const toggleButton = document.getElementById('toggle-button');

toggleButton.addEventListener('click', function() {
    sidebar.classList.toggle('open');
    if (sidebar.classList.contains('open')) {
        sidebar.style.visibility = 'visible';
        sidebar.style.display = 'block';
    } else {
        sidebar.style.visibility = 'hidden';
        sidebar.style.display = 'none';
    }
    adjustCanvasSize();
});

function adjustCanvasSizeToBackground() {
    const visualizer = document.getElementById('visualizer');
    if (backgroundImage) {
        visualizer.style.height = (visualizer.offsetWidth / backgroundImage.width) * backgroundImage.height + 'px';
    } else if (backgroundVideo) {
        visualizer.style.height = (visualizer.offsetWidth / backgroundVideo.videoWidth) * backgroundVideo.videoHeight + 'px';
    }
}

function adjustCanvasSize(aspectRatio = null) {
    const visualizer = document.getElementById('visualizer');
  {

    } {
       
        if (aspectRatio) {
            switch (aspectRatio) {
                case '16:9':
                    visualizer.style.height = (visualizer.offsetWidth / 16) * 9 + 'px';
                    break;
                case '3:4':
                    visualizer.style.height = (visualizer.offsetWidth / 3) * 4 + 'px';
                    break;
                case '9:16':
                    visualizer.style.height = (visualizer.offsetWidth / 9) * 16 + 'px';
                    break;
            }
        }
    }
}

function setupVisualizer() {
    canvas = document.getElementById('visualizer');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    draw = drawBar;
    draw();
}

function changeVisualizer(newDrawFunction) {
    cancelAnimationFrame(drawAnimationFrameId);
    draw = newDrawFunction;
    draw();
}

function drawBar() {
    drawAnimationFrameId = requestAnimationFrame(drawBar);
    analyser.getByteFrequencyData(dataArray);

    if (backgroundToggle === 'image' && backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    } else if (backgroundToggle === 'video' && backgroundVideo) {
        ctx.drawImage(backgroundVideo, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let barWidth = (canvas.width / dataArray.length) * 2.5 / window.devicePixelRatio;
    let barHeight;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i];
        if (colorMode === 'multi') {
            let hue = i * (360 / dataArray.length);
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        } else {
            ctx.fillStyle = visualizeColor;
        }
        ctx.fillRect(x, canvas.height / window.devicePixelRatio - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
    }
}

function drawWaveform() {
    drawAnimationFrameId = requestAnimationFrame(drawWaveform);
    analyser.getByteTimeDomainData(dataArray);

    if (backgroundToggle === 'image' && backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    } else if (backgroundToggle === 'video' && backgroundVideo) {
        ctx.drawImage(backgroundVideo, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.lineWidth = 2 / window.devicePixelRatio;
    ctx.strokeStyle = visualizeColor;
    ctx.beginPath();

    let sliceWidth = canvas.width * 1.0 / dataArray.length / window.devicePixelRatio;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        let v = dataArray[i] / 128.0;
        let y = v * canvas.height / 2 / window.devicePixelRatio;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }

    ctx.lineTo(canvas.width / window.devicePixelRatio, canvas.height / 2 / window.devicePixelRatio);
    ctx.stroke();
}

function drawCircle() {
    drawAnimationFrameId = requestAnimationFrame(drawCircle);
    analyser.getByteFrequencyData(dataArray);

    if (backgroundToggle === 'image' && backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    } else if (backgroundToggle === 'video' && backgroundVideo) {
        ctx.drawImage(backgroundVideo, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let radius = Math.min(canvas.width, canvas.height) / 3 / window.devicePixelRatio; // 縮小して全体を表示
    let centerX = canvas.width / 2 / window.devicePixelRatio;
    let centerY = canvas.height / 2 / window.devicePixelRatio;

    for (let i = 0; i < dataArray.length; i++) {
        let angle = (i / dataArray.length) * 2 * Math.PI;
        let barHeight = dataArray[i] / 2;
        if (colorMode === 'multi') {
            let hue = i * (360 / dataArray.length);
            ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        } else {
            ctx.strokeStyle = visualizeColor;
        }
        ctx.lineWidth = 2 / window.devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * (radius + barHeight), centerY + Math.sin(angle) * (radius + barHeight));
        ctx.stroke();
    }
}

document.getElementById('barBtn').addEventListener('click', function() {
    changeVisualizer(drawBar);
});

document.getElementById('waveBtn').addEventListener('click', function() {
    changeVisualizer(drawWaveform);
});

document.getElementById('circleBtn').addEventListener('click', function() {
    changeVisualizer(drawCircle);
});
