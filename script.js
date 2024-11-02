const canvas = document.getElementById("tetrisCanvas");
const ctx = canvas.getContext("2d");

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

document.addEventListener('keydown', handleKeyPress);

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let currentPiece;
let currentPiecePosition;
let dropInterval = 1000;
let dropTime = 0;
let gameInterval; // Variable para almacenar el intervalo del juego
let isGameRunning = false; // Controlar el estado del juego

const pieces = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1, 0]], // S
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 1, 0], [0, 1, 1]] // Z
];

function handleKeyPress(event) {
    if (!isGameRunning) return; // No hacer nada si el juego está detenido
    switch (event.key) {
        case 'ArrowLeft':
            movePieceLeft();
            break;
        case 'ArrowRight':
            movePieceRight();
            break;
        case ' ':
            dropPieceInstantly();
            break;
    }
}

function movePieceLeft() {
    currentPiecePosition.x--;
    if (collision()) {
        currentPiecePosition.x++;
    }
}

function movePieceRight() {
    currentPiecePosition.x++;
    if (collision()) {
        currentPiecePosition.x--;
    }
}

function dropPieceInstantly() {
    while (!collision()) {
        currentPiecePosition.y++;
    }
    currentPiecePosition.y--; // Retrocede una posición
    merge();
    clearLines();
    spawnPiece();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                ctx.fillStyle = "white";
                ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawPiece(piece, offset) {
    piece.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value) {
                ctx.fillStyle = "white";
                ctx.fillRect((offset.x + c) * BLOCK_SIZE, (offset.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function spawnPiece() {
    const rand = Math.floor(Math.random() * pieces.length);
    currentPiece = pieces[rand];
    currentPiecePosition = { x: Math.floor(COLS / 2) - Math.floor(currentPiece[0].length / 2), y: 0 };

    // Verificar si la nueva pieza colisiona al generarse en la parte superior
    if (collisionAtCurrentPosition()) {
        isGameRunning = false; // Detener el juego
        alert("You lose!"); // Mostrar el mensaje de pérdida
        clearInterval(gameInterval); // Detener el intervalo de actualización
    }
}

// Nueva función para verificar colisión en la posición actual de la pieza
function collisionAtCurrentPosition() {
    return currentPiece.some((row, r) =>
        row.some((value, c) =>
            value &&
            (board[currentPiecePosition.y + r] &&
                board[currentPiecePosition.y + r][currentPiecePosition.x + c]) !== 0)
    )
}


function update() {
    if (!isGameRunning) return; // No hacer nada si el juego está detenido

    dropTime += 16; // Simulando el tiempo que pasa
    if (dropTime > dropInterval) {
        currentPiecePosition.y++;
        dropTime = 0;

        if (collision()) {
            currentPiecePosition.y--;
            merge();
            clearLines();
            spawnPiece();
        }
    }
    drawBoard();
    drawPiece(currentPiece, currentPiecePosition);
}

function collision() {
    return currentPiece.some((row, r) =>
        row.some((value, c) => value && (board[currentPiecePosition.y + r] && board[currentPiecePosition.y + r][currentPiecePosition.x + c]) !== 0)
    );
}

function merge() {
    currentPiece.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value) {
                board[currentPiecePosition.y + r][currentPiecePosition.x + c] = value;
            }
        });
    });
}

function clearLines() {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(value => value !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(0));
            score += 10;
            document.getElementById("score").textContent = `Puntuación: ${score}`;
        }
    }
}

function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    document.getElementById("score").textContent = `Puntuación: ${score}`;
    spawnPiece(); // Generar una nueva pieza
}

document.getElementById("startBtn").addEventListener("click", () => {
    resetGame(); // Reiniciar el juego al iniciar
    gameInterval = setInterval(update, 16); // Iniciar el intervalo de actualización
    isGameRunning = true; // Establecer el juego como en ejecución
});
