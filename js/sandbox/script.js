const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth / 1.5;
canvas.height = canvas.clientHeight;

const dt = 1 / 30;
const Fpush = 800; // N
const frictionCoef = 0.0001;

const ringPosition = {
  ty: 20,
  lx: 20,
  by: canvas.height - 20,
  rx: canvas.width - 20
}

const player1 = { // bottom
  r: 40,
  x: canvas.width / 2,
  y: canvas.height - 80,
  color: "yellow"
}

const player2 = { // top
  r: 40,
  x: canvas.width / 2,
  y: 80,
  color: "red"
}

const ball = {
  color: "white",
  m: 1,
  r: 18,
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
  ax: 0,
  ay: 0
}

const keyboard = {
  KeyA: false,
  KeyW: false,
  KeyS: false,
  KeyD: false,
}

const drawPlayersBall = () => {
  // Player 1
  ctx.beginPath();
  ctx.arc(player1.x, player1.y, player1.r, 0, Math.PI * 2);
  ctx.fillStyle = player1.color;
  ctx.fill();
  ctx.closePath();

  // Player 2
  // ctx.beginPath();
  // ctx.arc(player2.x, player2.y, player2.r, 0, Math.PI * 2);
  // ctx.fillStyle = player2.color;
  // ctx.fill();
  // ctx.closePath();

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.closePath();
}

const drawBackground = () => {
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();
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

// Keyboard event handler
document.addEventListener('keydown', function (e) {
  keyboard[e.code] = true
})
document.addEventListener('keyup', function (e) {
  keyboard[e.code] = false
})

const init = () => {
  drawBackground();
  drawRing();
  drawPlayersBall();
}

const collision = (px, py, bx, by) => {
  const distX = px - bx;
  const distY = py - by;
  const distMag = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
  return distMag;
}

const controller = () => {
  // Keyboard controller (AWSD)
  if (keyboard.KeyW && (player1.y > (ringPosition.ty + player1.r + 20))) {
    player1.y -= 5
  }
  if (keyboard.KeyS && (player1.y < (ringPosition.by - player1.r - 20))) {
    player1.y += 5
  }
  if (keyboard.KeyA && (player1.x > (ringPosition.lx + player1.r + 20))) {
    player1.x -= 5
  }
  if (keyboard.KeyD && (player1.x < (ringPosition.rx - player1.r - 20))) {
    player1.x += 5
  }

  // Collision logic
  if (collision(player1.x, player1.y, ball.x, ball.y) <= (ball.r + player1.r)) {
    const dx = ball.x - player1.x;
    const dy = ball.y - player1.y;

    const Fvx = Fpush * dx;
    const Fvy = Fpush * dy;

    ball.ax += Fvx / ball.m;
    ball.ay += Fvy / ball.m;
  }

  // if (collision(player2.x, player2.y, ball.x, ball.y) <= (ball.r + player2.r)) {
  //   const dx = ball.x - player2.x;
  //   const dy = ball.y - player2.y;

  //   const Fvx = Fpush * dx;
  //   const Fvy = Fpush * dy;

  //   ball.ax += Fvx / ball.m;
  //   ball.ay += Fvy / ball.m;
  // }

  // GLBB
  // v = v0 + a * dt
  ball.vx += ball.ax * dt;
  ball.vy += ball.ay * dt;

  // s = s0 + v0*dt + 1/2 *a*dt^2
  ball.x += ball.vx * dt + 0.5 * ball.ax * dt ** 2;
  ball.y += ball.vy * dt + 0.5 * ball.ay * dt ** 2;

  // friction
  ball.vx *= (1 - frictionCoef);
  ball.vy *= (1 - frictionCoef);

  ball.ax = 0;
  ball.ay = 0;

  // Wall Bouncing
  // Top wall
  if ((ball.y - ball.r) < (ringPosition.ty)) ball.vy *= -1;

  // Bottom wall
  if ((ball.y + ball.r) > (ringPosition.by)) ball.vy *= -1;

  // Left wall
  if ((ball.x - ball.r) < (ringPosition.lx)) ball.vx *= -1;

  // Right wall
  if ((ball.x + ball.r) > (ringPosition.rx)) ball.vx *= -1;


  // Computer AUTO Algorithm
  // if ((ball.x != canvas.width / 2) || (ball.y != canvas.height / 2)) {
  //   if (ball.x < player2.x && player2.x - player2.r > (ringPosition.lx + 20)) {
  //     player2.x -= 5;
  //   }
  //   if (ball.x > player2.x && player2.x + player2.r < (ringPosition.rx + 20)) {
  //     player2.x += 5;
  //   }
  //   if (ball.y < player2.y && player2.y - player2.r > (ringPosition.ty + 20)) {
  //     player2.y -= 5;
  //   }
  //   if (ball.y > player2.y && player2.y + player2.r < (ringPosition.by + 20)) {
  //     player2.y += 5;
  //   }
  // }
}

// Time interval render (FPS)

const main = async () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  init();
  controller();
  renderFormulas();
  requestAnimationFrame(main);
}

main()