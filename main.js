const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const bg = new Image(); bg.src='bg.png';
const birdImg = new Image(); birdImg.src='bird.png';
const pipeImg = new Image(); pipeImg.src='pipe.png';
const groundImg = new Image(); groundImg.src='ground.png';

let bird = {x:50,y:150,v:0};
let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;

canvas.addEventListener('click',()=>{ if(!gameOver) bird.v = -6; });

function reset(){
  bird.y=150; bird.v=0; pipes=[]; score=0; gameOver=false;
}

function update(){
  if(gameOver) return;
  bird.v += 0.4;
  bird.y += bird.v;

  if(frame % 90 === 0){
    let top = Math.random()*200+50;
    pipes.push({x:288, top});
  }

  pipes.forEach(p=>p.x -= 2);

  pipes.forEach(p=>{
    if(p.x===48) score++;
    if(bird.x+34>p.x && bird.x<p.x+52 &&
      (bird.y<p.top || bird.y+24>p.top+120)){
        gameOver=true;
    }
  });

  if(bird.y>400) gameOver=true;
  frame++;
}

function draw(){
  ctx.drawImage(bg,0,0);
  pipes.forEach(p=>{
    ctx.drawImage(pipeImg,p.x,p.top-320);
    ctx.drawImage(pipeImg,p.x,p.top+120);
  });
  ctx.drawImage(groundImg,0,400);
  ctx.drawImage(birdImg,bird.x,bird.y);

  ctx.fillStyle='#fff';
  ctx.font='24px Arial';
  ctx.fillText(score,140,40);

  if(gameOver){
    ctx.fillText('Game Over',80,200);
    ctx.fillText('Click to restart',60,240);
    canvas.onclick=()=>reset();
  }
}

function loop(){
  update(); draw();
  requestAnimationFrame(loop);
}
loop();
