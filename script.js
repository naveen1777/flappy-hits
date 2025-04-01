// Game elements
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const playerNameInput = document.getElementById("player-name");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const finalScoreDisplay = document.getElementById("final-score");
const highScoreDisplay = document.getElementById("high-score");

// Game settings
canvas.width = 800;
canvas.height = 600;
let birdY = canvas.height / 2;
let birdVelocity = 0.5;
const gravity = 0.5;
const jumpForce = -10;
let pipes = [];
let score = 0;
let highScore = localStorage.getItem("flappyHitsHighScore") || 0;
let playerName = "";
let gameOver = false;
let gameStarted = false;

// Load HITS logo
const hitsLogo = new Image();
hitsLogo.src = "hits-logo.png";

// Start game when button clicked
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

// Also start when Enter is pressed
playerNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") startGame();
});

function startGame() {
    playerName = playerNameInput.value.trim() || "Player";
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    resetGame();
    if (!gameStarted) {
        gameStarted = true;
        gameLoop();
    }
}

function restartGame() {
    endScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    resetGame();
    gameLoop();
}

function resetGame() {
    birdY = canvas.height / 1.5;
    birdVelocity = 0.5;
    pipes = [];
    score = 0;
    gameOver = false;
}

function gameLoop() {
    if (gameOver) {
        endGame();
        return;
    }

    // Clear canvas
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background elements
    drawBackground();

    // Update bird
    birdVelocity += gravity;
    birdY += birdVelocity;

    // Draw bird (HITS logo)
    if (hitsLogo.complete) {
        ctx.drawImage(hitsLogo, 100, birdY, 40, 40);
    } else {
        // Fallback
        ctx.fillStyle = "#003366";
        ctx.beginPath();
        ctx.arc(120, birdY + 20, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("HITS", 105, birdY + 25);
    }

    // Pipes logic
    updatePipes();

    // Draw score
    ctx.fillStyle = "#003366";
    ctx.font = "24px Poppins";
    ctx.fillText(`${playerName}: ${score}`, 20, 30);

    // Check boundaries
    if (birdY > canvas.height || birdY < 0) {
        gameOver = true;
    }

    requestAnimationFrame(gameLoop);
}

function drawBackground() {
    // Draw clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.arc(50, 80, 30, 0, Math.PI * 2);
    ctx.arc(80, 80, 40, 0, Math.PI * 2);
    ctx.arc(120, 80, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(300, 150, 40, 0, Math.PI * 2);
    ctx.arc(340, 150, 30, 0, Math.PI * 2);
    ctx.arc(370, 150, 20, 0, Math.PI * 2);
    ctx.fill();
}

function updatePipes() {
    // Pipe settings
    const pipeWidth = 60;
    const pipeGap = 250;
    const pipeSpeed = 2.5;

    // Generate pipes
    if (pipes.length === 0 || canvas.width - pipes[pipes.length - 1].x > 200) {
        const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
        pipes.push({
            x: canvas.width,
            height: pipeHeight,
            passed: false
        });
    }

    // Update and draw pipes
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipeSpeed;

        // Draw top pipe (green with border)
        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(pipes[i].x, 0, pipeWidth, pipes[i].height);
        ctx.strokeStyle = "#2E7D32";
        ctx.lineWidth = 3;
        ctx.strokeRect(pipes[i].x, 0, pipeWidth, pipes[i].height);

        // Draw bottom pipe
        ctx.fillRect(
            pipes[i].x,
            pipes[i].height + pipeGap,
            pipeWidth,
            canvas.height - pipes[i].height - pipeGap
        );
        ctx.strokeRect(
            pipes[i].x,
            pipes[i].height + pipeGap,
            pipeWidth,
            canvas.height - pipes[i].height - pipeGap
        );

        // Check collision
        if (
            100 + 40 > pipes[i].x &&
            100 < pipes[i].x + pipeWidth &&
            (birdY < pipes[i].height || birdY + 40 > pipes[i].height + pipeGap)
        ) {
            gameOver = true;
        }

        // Check if passed pipe
        if (!pipes[i].passed && 100 > pipes[i].x + pipeWidth) {
            pipes[i].passed = true;
            score++;
        }

        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }
}

function endGame() {
    gameScreen.classList.add("hidden");
    endScreen.classList.remove("hidden");
    finalScoreDisplay.textContent = score;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("flappyHitsHighScore", highScore);
    }
    highScoreDisplay.textContent = highScore;
}

// Controls
function jump() {
    if (!gameStarted) return;
    birdVelocity = jumpForce;
}

// Keyboard control
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        jump();
    }
});

// Touch control
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    jump();
});

// Initial high score display
highScoreDisplay.textContent = highScore;