const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bird = {
  x: 50,
  y: 150,
  width: 34,
  height: 24,
  gravity: 0.25,
  lift: -6,
  velocity: 0,
  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  },
  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
  },
  flap() {
    this.velocity = this.lift;
  }
};

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    bird.flap();
  }
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bird.update();
  bird.draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
