const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 480;

/* ======================
   ЗАГРУЗКА КАРТИНОК
====================== */
const bg = new Image();
bg.src = "bg.png";

const birdImg = new Image();
birdImg.src = "bird.png";

const pipeImg = new Image();
pipeImg.src = "pipe.png";

const groundImg = new Image();
groundImg.src = "ground.png";

/* ======================
   СОСТОЯНИЕ ИГРЫ
====================== */
let gameOver = false;
let gameStarted = true; // игра сразу активна

/* ======================
   ПТИЧКА
====================== */
const bird = {
  x: 50,
  y: 150,
  width: 34,
  height: 24,
  gravity: 1.5,
  lift: -25,
  velocity: 0
};

/* ======================
   ТРУБЫ
====================== */
const pipes = [];
const pipeGap = 120;
const pipeWidth = 52;

/* ======================
   СЧЁТ
====================== */
let score = 0;

/* ======================
   УПРАВЛЕНИЕ (ТОЛЬКО ПРОБЕЛ)
====================== */
document.addEventListener("keydown", function (e) {
  if (e.code !== "Space") return;

  // если игра идёт — птичка взлетает
  if (!gameOver) {
    bird.velocity = bird.lift;
  }
  // если игра окончена — перезапуск
  else {
    location.reload();
  }
});

/* ======================
   ОСНОВНОЙ ЦИКЛ
====================== */
function draw() {
  if (gameOver) return;

  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // ПТИЧКА
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;
  ctx.drawImage(birdImg, bird.x, bird.y);

  // ЗЕМЛЯ
  ctx.drawImage(groundImg, 0, canvas.height - groundImg.height);

  // ТРУБЫ
  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 150) {
    pipes.push({
      x: canvas.width,
      y: Math.floor(Math.random() * -200) - 50
    });
  }

  pipes.forEach((pipe, index) => {
    pipe.x -= 2;

    // верхняя труба
    ctx.drawImage(pipeImg, pipe.x, pipe.y);
    // нижняя труба
    ctx.drawImage(
      pipeImg,
      pipe.x,
      pipe.y + pipeImg.height + pipeGap
    );

    // СТОЛКНОВЕНИЕ
    if (
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + pipeWidth &&
      (
        bird.y < pipe.y + pipeImg.height ||
        bird.y + bird.height >
          pipe.y + pipeImg.height + pipeGap
      )
    ) {
      gameOver = true;
    }

    // СЧЁТ
    if (pipe.x + pipeWidth === bird.x) {
      score++;
    }

    // удаляем старые трубы
    if (pipe.x + pipeWidth < 0) {
      pipes.splice(index, 1);
    }
  });

  // ПАДЕНИЕ НА ЗЕМЛЮ
  if (bird.y + bird.height >= canvas.height - groundImg.height) {
    gameOver = true;
  }

  // СЧЁТ НА ЭКРАНЕ
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);

  // ТЕКСТ ПОСЛЕ ПРОИГРЫША
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "16px Arial";
    ctx.fillText(
      "Press SPACE to restart",
      canvas.width / 2,
      canvas.height / 2 + 20
    );
    return;
  }

  requestAnimationFrame(draw);
}

/* ======================
   СТАРТ
====================== */
draw();
