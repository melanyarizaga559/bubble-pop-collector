const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const msgEl = document.getElementById("msg");

let score = 0;
let lives = 3;
let gameOver = false;

const basket = {
w: 90,
h: 18,
x: canvas.width / 2 - 45,
y: canvas.height - 35,
speed: 7,
dx: 0
};

let bubbles = [];
let spawnTimer = 0;
let spawnEvery = 55;
let difficultyTimer = 0;

function updateHUD(){
scoreEl.textContent = score;
livesEl.textContent = lives;
}

function resetGame(){
score = 0;
lives = 3;
gameOver = false;
bubbles = [];
spawnTimer = 0;
spawnEvery = 55;
difficultyTimer = 0;
basket.x = canvas.width / 2 - basket.w / 2;
basket.dx = 0;
msgEl.textContent = "";
updateHUD();
}

function clamp(n, min, max){
return Math.max(min, Math.min(max, n));
}

function rand(min, max){
return Math.random() * (max - min) + min;
}

function spawnBubble(){
const r = rand(12, 24);
const x = rand(r, canvas.width - r);
const y = -r;

const type = Math.random() < 0.75 ? "good" : "bad";
const vy = type === "good" ? rand(2.5, 4.2) : rand(3.0, 5.0);

bubbles.push({ x, y, r, vy, type });
}

function circleRectHit(c, r){
const closestX = clamp(c.x, r.x, r.x + r.w);
const closestY = clamp(c.y, r.y, r.y + r.h);
const dx = c.x - closestX;
const dy = c.y - closestY;
return (dx * dx + dy * dy) <= (c.r * c.r);
}

function endGame(){
gameOver = true;
msgEl.textContent = "GAME OVER — Press R to restart";
}

function keyDown(e){
const k = e.key.toLowerCase();
if (k === "arrowleft" || k === "a") basket.dx = -basket.speed;
if (k === "arrowright" || k === "d") basket.dx = basket.speed;
if (k === "r") resetGame();
}

function keyUp(e){
const k = e.key.toLowerCase();
if ((k === "arrowleft" || k === "a") && basket.dx < 0) basket.dx = 0;
if ((k === "arrowright" || k === "d") && basket.dx > 0) basket.dx = 0;
}

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function draw(){
ctx.clearRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = "rgba(0,0,0,0.05)";
ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

ctx.fillStyle = "#222";
ctx.fillRect(basket.x, basket.y, basket.w, basket.h);
ctx.fillStyle = "#555";
ctx.fillRect(basket.x, basket.y - 6, basket.w, 6);

for (const b of bubbles){
ctx.beginPath();
ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
ctx.fillStyle = (b.type === "good")
? "rgba(0, 140, 255, 0.65)"
: "rgba(255, 60, 60, 0.65)";
ctx.fill();
ctx.closePath();
}
}

function update(){
if (gameOver) return;

basket.x += basket.dx;
basket.x = clamp(basket.x, 0, canvas.width - basket.w);

spawnTimer++;
if (spawnTimer >= spawnEvery){
spawnBubble();
spawnTimer = 0;
}

difficultyTimer++;
if (difficultyTimer >= 360){
spawnEvery = Math.max(22, spawnEvery - 4);
for (const b of bubbles) b.vy += 0.25;
difficultyTimer = 0;
}

for (let i = bubbles.length - 1; i >= 0; i--){
const b = bubbles[i];
b.y += b.vy;

if (circleRectHit(b, basket)){
if (b.type === "good"){
score += 1;
} else {
lives -= 1;
if (lives <= 0){
lives = 0;
updateHUD();
endGame();
}
}
bubbles.splice(i, 1);
updateHUD();
continue;
}

if (b.y - b.r > canvas.height){
if (b.type === "good"){
score = Math.max(0, score - 1);
updateHUD();
}
bubbles.splice(i, 1);
}
}
}

function loop(){
draw();
update();
requestAnimationFrame(loop);
}

resetGame();
loop();
