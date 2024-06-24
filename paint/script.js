const canvas = document.getElementById('canvas');
const ctx = setupCanvas(canvas);
let currentTool = 'brush';
let currentColor = '#000000';
let currentSize = 5;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let scale = 1;
let gridVisible = false;
let texts = [];

function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = (window.innerHeight - document.getElementById('toolbar').offsetHeight) * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
}

function selectTool(tool) {
    currentTool = tool;
    document.querySelectorAll('#toolbar button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tool).classList.add('active');
    document.getElementById('textInput').style.display = tool === 'text' ? '' : 'none';
    document.getElementById('fontSize').style.display = tool === 'text' ? '' : 'none';
    document.getElementById('fontFamily').style.display = tool === 'text' ? '' : 'none';
}

function changeColor(color) {
    currentColor = color;
}

function changeSize(size) {
    currentSize = size;
}

function startDrawing(e) {
    if (e.target === canvas) {
        isDrawing = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
    }
}

function draw(e) {
    if (!isDrawing) return;
    if (currentTool === 'brush') {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
        ctx.stroke();
        lastX = e.offsetX;
        lastY = e.offsetY;
    } else if (currentTool === 'erase') {
        erase(e.offsetX, e.offsetY, currentSize);
    }
}

function stopDrawing() {
    isDrawing = false;
}

function erase(x, y, size) {
    ctx.clearRect(x - size / 2, y - size / 2, size, size);
}

function zoom(factor) {
    scale *= factor;
    canvas.style.transform = `scale(${scale})`;
}

function toggleGrid() {
    gridVisible = !gridVisible;
    if (gridVisible) {
        drawGrid();
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function drawGrid() {
    const gridSize = 20;
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    if (touch.target === canvas) {
        startDrawing(touch);
    }
});
canvas.addEventListener('touchmove', e => {
    const touch = e.touches[0];
    if (touch.target === canvas) {
        draw(touch);
    }
});
canvas.addEventListener('touchend', stopDrawing);

function saveAsPNG() {
    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    link.click();
}
