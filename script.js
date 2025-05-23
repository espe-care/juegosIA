const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let bird = {
    x: 100,
    y: canvas.height / 2 - 15,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.15,
    jumpForce: -5,
    image: new Image()
};
bird.image.src = 'assets/bird.png';

const backgroundImage = new Image();
backgroundImage.src = 'assets/background.png';

let pipes = [];
const pipeWidth = 70;
const pipeGap = 200;
const pipeSpeed = 2;

let lastPipeTime = 0;
const pipeFrequency = 1500;

let apples = [];
const appleSize = 45;
const appleSpeed = pipeSpeed;
let lastAppleTime = 0;
const appleFrequency = 2500;
const appleImage = new Image();
appleImage.src = 'assets/apple.png';

let score = 0;
let appleScore = 0;
const scoreFont = '40px sans-serif';

let gameState = 'start'; // 'start', 'playing', 'gameOver'

// Sonidos
const jumpSound = new Audio('assets/jump.wav');
const hitSound = new Audio('assets/hit.wav');
const pointSound = new Audio('assets/point.wav');

function resetGame() {
    bird.y = canvas.height / 2 - 15;
    bird.velocity = 0;
    pipes = [];
    apples = [];
    score = 0;
    appleScore = 0;
    lastPipeTime = 0;
    lastAppleTime = 0;
    gameState = 'start';
}

function createPipe() {
    const topPipeHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
    const bottomPipeY = topPipeHeight + pipeGap;
    const bottomPipeHeight = canvas.height - bottomPipeY;

    const topPipe = {
        x: canvas.width,
        y: 0,
        width: pipeWidth,
        height: topPipeHeight,
        isTop: true,
        image: new Image()
    };
    topPipe.image.src = 'assets/pipe.png';

    const bottomPipe = {
        x: canvas.width,
        y: bottomPipeY,
        width: pipeWidth,
        height: bottomPipeHeight,
        isTop: false,
        image: new Image()
    };
    bottomPipe.image.src = 'assets/pipe.png';

    pipes.push(topPipe);
    pipes.push(bottomPipe);
}

function updatePipes() {
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        pipe.x -= pipeSpeed;

        if (pipe.isTop) {
            ctx.save();
            ctx.translate(pipe.x + pipe.width / 2, pipe.y + pipe.height / 2);
            ctx.rotate(Math.PI);
            ctx.drawImage(pipe.image, -pipe.width / 2, -pipe.height / 2, pipe.width, pipe.height);
            ctx.restore();
        } else {
            ctx.drawImage(pipe.image, pipe.x, pipe.y, pipe.width, pipe.height);
        }
    }
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    const now = Date.now();
    if (gameState === 'playing' && now - lastPipeTime > pipeFrequency) {
        createPipe();
        lastPipeTime = now;
    }
}

function createApple() {
    const y = Math.random() * (canvas.height - appleSize - 50) + 50;
    apples.push({ x: canvas.width, y: y, width: appleSize, height: appleSize });
}

function updateApples() {
    for (let i = 0; i < apples.length; i++) {
        apples[i].x -= appleSpeed;
        ctx.drawImage(appleImage, apples[i].x, apples[i].y, apples[i].width, apples[i].height);
    }
    apples = apples.filter(apple => apple.x + apple.width > 0);

    const now = Date.now();
    if (gameState === 'playing' && now - lastAppleTime > appleFrequency) {
        createApple();
        lastAppleTime = now;
    }
}

function checkCollision() {
    // Con el suelo o el techo
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameState = 'gameOver';
        hitSound.play();
    }

    // Con las tuberías
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        if (
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.y + pipe.height &&
            bird.y + bird.height > pipe.y
        ) {
            gameState = 'gameOver';
            hitSound.play();
        }
    }

    // Con las manzanas
    for (let i = 0; i < apples.length; i++) {
        const apple = apples[i];
        if (
            bird.x < apple.x + apple.width &&
            bird.x + bird.width > apple.x &&
            bird.y < apple.y + apple.height &&
            bird.y + bird.height > apple.y
        ) {
            apples.splice(i, 1); // Eliminar la manzana
            appleScore += 10;
            pointSound.play();
            break;
        }
    }
}

function drawScore() {
    ctx.font = scoreFont;
    ctx.fillStyle = '#fff';
    ctx.fillText(`Tubos: ${score}`, 20, 50);
    ctx.fillText(`Manzanas: ${appleScore}`, canvas.width - 300, 50);
}

function drawStartScreen() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.font = '48px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Flappy Bird', canvas.width / 2, canvas.height / 3);
    ctx.font = '24px sans-serif';
    ctx.fillText('Presiona ESPACIO o haz clic para empezar', canvas.width / 2, canvas.height / 2);
    ctx.textAlign = 'start';
}

function drawGameOverScreen() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.font = '48px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 3);
    ctx.font = '24px sans-serif';
    ctx.fillText(`Tubos pasados: ${score}`, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`Manzanas recogidas: ${appleScore / 10}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Presiona ESPACIO o haz clic para reiniciar', canvas.width / 2, canvas.height / 2 + 80);
    ctx.textAlign = 'start';
}

function updateScore() {
    for (let i = 0; i < pipes.length; i += 2) {
        const pipe = pipes[i];
        if (pipe && pipe.x + pipe.width < bird.x && !pipe.counted) {
            score++;
            pipe.counted = true;
        }
    }
}

function gameLoop() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'playing') {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        ctx.drawImage(bird.image, bird.x, bird.y, bird.width, bird.height);

        updatePipes();
        updateApples();
        checkCollision();
        updateScore();
        drawScore();
    } else if (gameState === 'gameOver') {
        drawGameOverScreen();
    }

    requestAnimationFrame(gameLoop);
}

let imagesLoaded = 0;
const totalImages = 3; // bird, background, apple

bird.image.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};

backgroundImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};

appleImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        if (gameState === 'start' || gameState === 'gameOver') {
            resetGame();
            gameState = 'playing';
        } else if (gameState === 'playing') {
            bird.velocity = bird.jumpForce;
            jumpSound.play();
        }
    }
});

canvas.addEventListener('mousedown', function() {
    if (gameState === 'start' || gameState === 'gameOver') {
        resetGame();
        gameState = 'playing';
    } else if (gameState === 'playing') {
        bird.velocity = bird.jumpForce;
        jumpSound.play();
    }
});