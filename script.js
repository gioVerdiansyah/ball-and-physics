const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth / 2;
canvas.height = innerHeight;

const g = 9.81;
const Fpush = 9000;
const frictionCoef = 0.5; // koefisien gesek udara
const mu = 5; // koefisien gesek papan
const restitution = 0.9; // koefisien restitusi pantulan

const ringPosition = {
  ty: 20,
  lx: 20,
  by: canvas.height - 20,
  rx: canvas.width - 20,
  mv: canvas.height / 2
};

const player1 = { // bottom
  r: 40,
  x: canvas.width / 2,
  y: canvas.height - 80,
  color: "yellow"
};

const player2 = { // top
  r: 40,
  x: canvas.width / 2,
  y: 80,
  color: "red"
};

const ball = {
  color: "white",
  m: 0.5,
  r: 18,
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
  ax: 0,
  ay: 0
};

const offsetAreaSize = ball.r * 3;

const keyboard = {
  KeyA: false,
  KeyW: false,
  KeyS: false,
  KeyD: false
};

document.addEventListener("keydown", e => keyboard[e.code] = true);
document.addEventListener("keyup", e => keyboard[e.code] = false);

const drawBackground = () => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const drawRing = () => {
  // middle circle
  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height / 2, (player1.r * 1.8), 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.fillStyle = "black";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fill();
  ctx.closePath()

  // middle line
  ctx.beginPath();
  ctx.moveTo(ringPosition.lx, canvas.height / 2);
  ctx.lineTo(ringPosition.rx, canvas.height / 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "white";
  ctx.stroke();
  ctx.closePath();

  // square lines
  ctx.beginPath();
  ctx.moveTo(ringPosition.lx, ringPosition.ty);
  ctx.lineTo(ringPosition.rx, ringPosition.ty);
  ctx.lineTo(ringPosition.rx, ringPosition.by);
  ctx.lineTo(ringPosition.lx, ringPosition.by);
  ctx.lineTo(ringPosition.lx, ringPosition.ty);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "white";
  ctx.stroke();
  ctx.closePath();
}

const drawOffsetArea = () => {
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.arc(20, 20, offsetAreaSize, 0, Math.PI / 2);
  ctx.stroke();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.arc(canvas.width - 20, 20, offsetAreaSize, (90 * Math.PI / 180), Math.PI);
  ctx.stroke();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.arc(canvas.width - 20, (canvas.height - 20), offsetAreaSize, (180 * Math.PI / 180), (270 * Math.PI / 180));
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(20, (canvas.height - 20), offsetAreaSize, (270 * Math.PI / 180), (360 * Math.PI / 180));
  ctx.stroke();
  ctx.closePath();
}

const drawPlayersBall = () => {
  // player 1
  ctx.beginPath();
  ctx.arc(player1.x, player1.y, player1.r, 0, Math.PI * 2);
  ctx.fillStyle = player1.color;
  ctx.fill();

  // player 2
  ctx.beginPath();
  ctx.arc(player2.x, player2.y, player2.r, 0, Math.PI * 2);
  ctx.fillStyle = player2.color;
  ctx.fill();

  // ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
}

const reset = () => {
  player1.x = canvas.width / 2;
  player1.y = canvas.height - 80;

  player2.x = canvas.width / 2;
  player2.y = 80;

  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = 0;
  ball.vy = 0;
  ball.ax = 0;
  ball.ay = 0;

  keyboard.KeyA = false;
  keyboard.KeyW = false;
  keyboard.KeyS = false;
  keyboard.KeyD = false;
}

function collision(px, py, bx, by) {
  const dx = bx - px;
  const dy = by - py;
  return Math.sqrt((dx ** 2) + (dy ** 2));
}

function playerController(dt) {
  const moveSpeed = 350; // px/s

  if (keyboard.KeyW && player1.y > (ringPosition.mv + player1.r))
    player1.y -= moveSpeed * dt;

  if (keyboard.KeyS && player1.y < (ringPosition.by - player1.r))
    player1.y += moveSpeed * dt;

  if (keyboard.KeyA && player1.x > (ringPosition.lx + player1.r))
    player1.x -= moveSpeed * dt;

  if (keyboard.KeyD && player1.x < (ringPosition.rx - player1.r))
    player1.x += moveSpeed * dt;
}

function botMoveLogic(dt) {
  const speed = 350; // px/s
  
  if (ball.y < ringPosition.mv - 20) {
    if (ball.x < player2.x) player2.x -= speed * dt;
    if (ball.x > player2.x) player2.x += speed * dt;
    if (ball.y < player2.y) player2.y -= speed * dt;
    if (ball.y > player2.y) player2.y += speed * dt;
  } else if (ball.y > ringPosition.mv + 20) {
    if (ball.x < player2.x && player2.x > (ringPosition.lx + player2.r))
      player2.x -= (speed * dt) / 2;

    if (ball.x > player2.x && player2.x < (ringPosition.rx - player2.r))
      player2.x += (speed * dt) / 2;

    if (ball.y < (ringPosition.mv + (ringPosition.mv / 2.5)) - 20 && (player2.y < (ringPosition.mv - (player2.r + 5))))
      player2.y += (speed * dt);

    if (ball.y > player2.y && player2.y > (ringPosition.ty + (player2.r + 20)))
      player2.y -= (speed * dt) / 5;

  }
}

function handleCollisions(dt) {
  // collision player1 & ball
  const d1 = collision(player1.x, player1.y, ball.x, ball.y);
  if (d1 <= ball.r + player1.r) {
    const nx = (ball.x - player1.x) / d1;
    const ny = (ball.y - player1.y) / d1;

    const overlap = ball.r + player1.r - d1;
    ball.x += nx * overlap;
    ball.y += ny * overlap;

    // Fv = F * n
    const Fvx = Fpush * nx;
    const Fvy = Fpush * ny;

    // a = Fv / m
    ball.ax += Fvx / ball.m;
    ball.ay += Fvy / ball.m;
  }

  // collision player2 & ball
  const d2 = collision(player2.x, player2.y, ball.x, ball.y);
  if (d2 <= ball.r + player2.r) {
    const nx = (ball.x - player2.x) / d2;
    const ny = (ball.y - player2.y) / d2;
    
    const overlap = ball.r + player2.r - d2;
    ball.x += nx * overlap;
    ball.y += ny * overlap;

    const Fvx = Fpush * nx;
    const Fvy = Fpush * ny;

    ball.ax += Fvx / ball.m;
    ball.ay += Fvy / ball.m;
  }

  // wall bounce
  if (ball.x - ball.r < ringPosition.lx) {
    ball.x = ringPosition.lx + ball.r; // bola agar langsung menempel dan pantulan jadi lebih akurat / elastis
    ball.vx *= -restitution;
  }
  if (ball.x + ball.r > ringPosition.rx) {
    ball.x = ringPosition.rx - ball.r;
    ball.vx *= -restitution;
  }
  if (ball.y - ball.r < ringPosition.ty) {
    ball.y = ringPosition.ty + ball.r;
    ball.vy *= -restitution;
  }
  if (ball.y + ball.r > ringPosition.by) {
    ball.y = ringPosition.by - ball.r;
    ball.vy *= -restitution;
  }

  // Offset Area Collision
  if (collision(ball.x, ball.y, 20, 20) <= (ball.r + (offsetAreaSize))) reset();
  if (collision(ball.x, ball.y, canvas.width - 20, 20) <= (ball.r + (offsetAreaSize))) reset();
  if (collision(ball.x, ball.y, canvas.width - 20, canvas.height - 29) <= (ball.r + (offsetAreaSize))) reset();
  if (collision(ball.x, ball.y, 20, canvas.height - 20) <= (ball.r + (offsetAreaSize))) reset();
}

function updateBall(dt) {
  // GLBB
  ball.vx += ball.ax * dt;
  ball.vy += ball.ay * dt;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // gesekan udara
  const drag = Math.pow(1 - frictionCoef * dt, dt * 60);
  ball.vx *= drag;
  ball.vy *= drag;

  // Gesekan papan
  const ballV = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
  if (ballV > 0){
    // arah kecepatan
    const vxNorm = ball.vx / ballV;
    const vyNorm = ball.vy / ballV;

    // a
    const af = mu * g;

    ball.vx -= vxNorm * af * dt;
    ball.vy -= vyNorm * af * dt;

    if (Math.abs(ball.vx) < 0.01) ball.vx = 0;
    if (Math.abs(ball.vy) < 0.01) ball.vy = 0;
  }

  ball.ax = 0;
  ball.ay = 0;
}

function update(dt) {
  playerController(dt);
  botMoveLogic(dt);
  updateBall(dt);
  handleCollisions(dt);
}

function draw() {
  drawBackground();
  drawRing();
  drawOffsetArea();
  drawPlayersBall();
}

// loop utama
let lastTime = performance.now();

function main(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  update(dt);
  draw();

  // renderFormulas();
  requestAnimationFrame(main);
}

requestAnimationFrame(main);
