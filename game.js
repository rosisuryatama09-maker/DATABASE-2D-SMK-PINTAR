// GANTI DENGAN URL GOOGLE APPS SCRIPT ANDA
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz5Wf-B_tG9kAgPAChi5glygejApCpE9CP5SFX8hW3ExSbo9kqzB9-IzzFyNgFxKe9F/exec";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;


// ==============================
// GAME STATE
// ==============================

const MAX_SCORE = 1000000;

let score = 0;
let level = 1;
let gameOver = false;

let bestScore =
  Number(
    localStorage.getItem("fruitQuestBest")
  ) || 0;

let keys = {
  left: false,
  right: false
};


// ==============================
// PLAYER
// ==============================

const player = {

  x: 80,
  y: 350,

  width: 48,
  height: 40,

  velocityX: 0,
  velocityY: 0,

  speed: 5,

  jumpPower: 13,

  onGround: false,

  direction: 1

};


// ==============================
// WORLD
// ==============================

let platforms = [];
let fruits = [];
let spikes = [];
let particles = [];


// ==============================
// FRUIT TYPES
// ==============================

const fruitTypes = [

  {
    emoji: "🍎",
    points: 100
  },

  {
    emoji: "🍌",
    points: 150
  },

  {
    emoji: "🍓",
    points: 200
  },

  {
    emoji: "🍊",
    points: 250
  },

  {
    emoji: "🍇",
    points: 300
  },

  {
    emoji: "🍍",
    points: 400
  },

  {
    emoji: "🍉",
    points: 500
  }

];


// ==============================
// PLATFORM GENERATOR
// ==============================

function generateLevel() {

  platforms = [];
  fruits = [];
  spikes = [];
  particles = [];


  // Lantai utama

  platforms.push({
    x: 0,
    y: 450,
    width: 800,
    height: 50
  });


  const platformCount =
    Math.min(5 + level, 12);


  for (
    let i = 0;
    i < platformCount;
    i++
  ) {

    const width =
      100 +
      Math.random() * 150;

    const x =
      30 +
      Math.random() *
      (760 - width);

    const y =
      120 +
      Math.random() * 280;


    platforms.push({

      x,
      y,

      width,

      height: 28

    });


    // Buah di atas platform

    if (Math.random() > 0.2) {

      const fruit =
        fruitTypes[
          Math.floor(
            Math.random() *
            fruitTypes.length
          )
        ];


      fruits.push({

        x:
          x +
          width / 2 - 15,

        y:
          y - 38,

        size: 32,

        type: fruit,

        collected: false,

        floatOffset:
          Math.random() * 10

      });

    }


    // Duri

    if (
      level >= 2 &&
      Math.random() < 0.35
    ) {

      spikes.push({

        x:
          x +
          15 +
          Math.random() *
          (width - 45),

        y:
          y - 20,

        width: 35,
        height: 20

      });

    }

  }


  // Buah bonus khusus

  if (level % 5 === 0) {

    fruits.push({

      x: 380,
      y: 100,

      size: 45,

      type: {
        emoji: "👑",
        points: 5000
      },

      collected: false,

      floatOffset: 0

    });

  }

}


// ==============================
// DRAW BACKGROUND
// ==============================

function drawBackground() {

  // Langit

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      canvas.height
    );

  gradient.addColorStop(
    0,
    "#71c7ec"
  );

  gradient.addColorStop(
    1,
    "#dff7ff"
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  // Matahari

  ctx.beginPath();

  ctx.arc(
    700,
    70,
    45,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "rgba(255,220,100,.65)";

  ctx.fill();


  // Awan

  ctx.fillStyle =
    "rgba(255,255,255,.3)";

  for (let i = 0; i < 5; i++) {

    const x =
      i * 180 + 30;

    const y =
      70 +
      (i % 2) * 35;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      25,
      0,
      Math.PI * 2
    );

    ctx.arc(
      x + 30,
      y - 10,
      30,
      0,
      Math.PI * 2
    );

    ctx.arc(
      x + 60,
      y,
      25,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

}


// ==============================
// DRAW PLATFORM
// ==============================

function drawPlatforms() {

  platforms.forEach(platform => {

    // Bayangan

    ctx.fillStyle =
      "rgba(0,0,0,.25)";

    ctx.fillRect(
      platform.x + 5,
      platform.y + 6,
      platform.width,
      platform.height
    );


    // Platform

    ctx.fillStyle = "#754629";

    roundRect(
      platform.x,
      platform.y,
      platform.width,
      platform.height,
      8
    );

    ctx.fill();


    // Rumput

    ctx.fillStyle = "#32c447";

    roundRect(
      platform.x,
      platform.y,
      platform.width,
      8,
      7
    );

    ctx.fill();

  });

}


// ==============================
// DRAW SPIKES
// ==============================

function drawSpikes() {

  spikes.forEach(spike => {

    ctx.fillStyle = "#7b8490";

    for (let i = 0; i < 3; i++) {

      const x =
        spike.x + i * 11;

      ctx.beginPath();

      ctx.moveTo(
        x,
        spike.y + spike.height
      );

      ctx.lineTo(
        x + 5,
        spike.y
      );

      ctx.lineTo(
        x + 10,
        spike.y + spike.height
      );

      ctx.fill();
    }

  });

}


// ==============================
// DRAW FRUIT
// ==============================

function drawFruits() {

  fruits.forEach(fruit => {

    if (fruit.collected) return;

    const float =
      Math.sin(
        Date.now() / 300 +
        fruit.floatOffset
      ) * 4;


    ctx.font =
      `${fruit.size}px Arial`;

    ctx.textAlign = "center";

    ctx.fillText(
      fruit.type.emoji,
      fruit.x + fruit.size / 2,
      fruit.y +
      fruit.size +
      float
    );

  });

}


// ==============================
// DRAW PLAYER
// ==============================

function drawPlayer() {

  ctx.save();

  const centerX =
    player.x +
    player.width / 2;

  const centerY =
    player.y +
    player.height / 2;


  ctx.translate(
    centerX,
    centerY
  );

  ctx.scale(
    player.direction,
    1
  );


  // Body

  ctx.fillStyle = "#5dde32";

  roundRect(
    -player.width / 2,
    -player.height / 2,
    player.width,
    player.height,
    15
  );

  ctx.fill();


  // Perut

  ctx.fillStyle = "#8df15d";

  ctx.beginPath();

  ctx.ellipse(
    0,
    8,
    16,
    9,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  // Mata

  ctx.fillStyle = "white";

  ctx.beginPath();

  ctx.arc(
    12,
    -8,
    7,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.fillStyle = "#111";

  ctx.beginPath();

  ctx.arc(
    14,
    -8,
    3,
    0,
    Math.PI * 2
  );

  ctx.fill();


  // Senyum

  ctx.strokeStyle = "#222";

  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.arc(
    10,
    5,
    7,
    0,
    Math.PI
  );

  ctx.stroke();


  ctx.restore();
}


// ==============================
// COLLISION PLATFORM
// ==============================

function updatePlayer() {

  if (keys.left) {

    player.velocityX =
      -player.speed;

    player.direction = -1;

  }

  else if (keys.right) {

    player.velocityX =
      player.speed;

    player.direction = 1;

  }

  else {

    player.velocityX *= 0.75;

  }


  player.x +=
    player.velocityX;


  // Gravity

  player.velocityY += 0.7;

  player.y +=
    player.velocityY;


  player.onGround = false;


  platforms.forEach(platform => {

    const playerBottom =
      player.y + player.height;

    const previousBottom =
      playerBottom -
      player.velocityY;


    const insideX =
      player.x + player.width >
      platform.x &&
      player.x <
      platform.x +
      platform.width;


    if (
      insideX &&
      playerBottom >= platform.y &&
      previousBottom <= platform.y &&
      player.velocityY >= 0
    ) {

      player.y =
        platform.y -
        player.height;

      player.velocityY = 0;

      player.onGround = true;

    }

  });


  // Batas layar

  if (player.x < 0)
    player.x = 0;

  if (
    player.x +
    player.width >
    canvas.width
  ) {

    player.x =
      canvas.width -
      player.width;

  }


  // Jatuh

  if (
    player.y >
    canvas.height + 100
  ) {

    endGame();

  }

}


// ==============================
// JUMP
// ==============================

function jump() {

  if (
    player.onGround &&
    !gameOver
  ) {

    player.velocityY =
      -player.jumpPower;

  }

}


// ==============================
// FRUIT COLLISION
// ==============================

function checkFruitCollision() {

  fruits.forEach(fruit => {

    if (fruit.collected) return;


    const distanceX =
      player.x +
      player.width / 2 -
      (fruit.x + fruit.size / 2);

    const distanceY =
      player.y +
      player.height / 2 -
      (fruit.y + fruit.size / 2);


    const distance =
      Math.sqrt(
        distanceX * distanceX +
        distanceY * distanceY
      );


    if (distance < 35) {

      fruit.collected = true;

      addScore(
        fruit.type.points
      );

      createParticles(
        fruit.x,
        fruit.y,
        fruit.type.emoji
      );

      showMessage(
        "+" +
        fruit.type.points +
        " " +
        fruit.type.emoji
      );

    }

  });

}


// ==============================
// SPIKE COLLISION
// ==============================

function checkSpikeCollision() {

  spikes.forEach(spike => {

    if (
      player.x <
        spike.x + spike.width &&
      player.x + player.width >
        spike.x &&
      player.y + player.height >
        spike.y + 5 &&
      player.y <
        spike.y + spike.height
    ) {

      endGame();

    }

  });

}


// ==============================
// SCORE
// ==============================

function addScore(points) {

  score += points;


  if (score > MAX_SCORE) {

    score = MAX_SCORE;

  }


  // Naik level

  const newLevel =
    Math.min(
      Math.floor(score / 5000) + 1,
      200
    );


  if (newLevel > level) {

    level = newLevel;

    showMessage(
      "🎉 LEVEL " +
      level
    );

    setTimeout(() => {

      generateLevel();

      resetPlayer();

    }, 700);

  }


  updateUI();

}


// ==============================
// PARTICLES
// ==============================

function createParticles(
  x,
  y,
  emoji
) {

  for (let i = 0; i < 8; i++) {

    particles.push({

      x,
      y,

      vx:
        (Math.random() - .5) * 5,

      vy:
        (Math.random() - .5) * 5,

      life: 40,

      emoji

    });

  }

}


function updateParticles() {

  particles.forEach(particle => {

    particle.x += particle.vx;

    particle.y += particle.vy;

    particle.life--;

  });


  particles =
    particles.filter(
      particle =>
        particle.life > 0
    );

}


function drawParticles() {

  particles.forEach(particle => {

    ctx.globalAlpha =
      particle.life / 40;

    ctx.font = "18px Arial";

    ctx.fillText(
      particle.emoji,
      particle.x,
      particle.y
    );

  });

  ctx.globalAlpha = 1;

}


// ==============================
// UI
// ==============================

function updateUI() {

  document
    .getElementById("score")
    .textContent =
    score.toLocaleString("id-ID");


  document
    .getElementById("level")
    .textContent =
    level;


  if (score > bestScore) {

    bestScore = score;

    localStorage.setItem(
      "fruitQuestBest",
      bestScore
    );

  }


  document
    .getElementById("bestScore")
    .textContent =
    bestScore.toLocaleString("id-ID");


  const percentage =
    Math.min(
      100,
      (score / MAX_SCORE) * 100
    );


  document
    .getElementById("progressFill")
    .style.width =
    percentage + "%";


  document
    .getElementById("progressText")
    .textContent =
    Math.floor(percentage) + "%";

}


// ==============================
// MESSAGE
// ==============================

let messageTimer;

function showMessage(text) {

  const message =
    document.getElementById("message");

  message.textContent = text;

  clearTimeout(messageTimer);

  messageTimer =
    setTimeout(() => {

      message.textContent = "";

    }, 1000);

}


// ==============================
// GAME OVER
// ==============================

function endGame() {

  if (gameOver) return;

  gameOver = true;


  document
    .getElementById("finalScore")
    .textContent =
    score.toLocaleString("id-ID");


  let text =
    "Kumpulkan lebih banyak buah! 🍎";


  if (score >= 1000000) {

    text =
      "👑 LEGEND! Kamu mencapai 1.000.000 poin!";

  }

  else if (score >= 500000) {

    text =
      "🔥 Luar biasa! Kamu Fruit Master!";

  }

  else if (score >= 100000) {

    text =
      "🍉 Hebat! Terus kejar 1 juta poin!";

  }


  document
    .getElementById("finalMessage")
    .textContent = text;


  document
    .getElementById("gameOverModal")
    .classList.remove("hidden");

}


// ==============================
// RESET PLAYER
// ==============================

function resetPlayer() {

  player.x = 80;
  player.y = 350;

  player.velocityX = 0;
  player.velocityY = 0;

}


// ==============================
// START GAME
// ==============================

function startGame() {

  score = 0;
  level = 1;
  gameOver = false;

  generateLevel();

  resetPlayer();

  updateUI();


  document
    .getElementById("gameOverModal")
    .classList.add("hidden");

}


// ==============================
// GAME LOOP
// ==============================

function gameLoop() {

  drawBackground();

  if (!gameOver) {

    updatePlayer();

    checkFruitCollision();

    checkSpikeCollision();

    updateParticles();

  }


  drawPlatforms();

  drawSpikes();

  drawFruits();

  drawPlayer();

  drawParticles();


  requestAnimationFrame(
    gameLoop
  );

}


// ==============================
// ROUND RECT
// ==============================

function roundRect(
  x,
  y,
  width,
  height,
  radius
) {

  ctx.beginPath();

  ctx.roundRect(
    x,
    y,
    width,
    height,
    radius
  );

}


// ==============================
// KEYBOARD
// ==============================

window.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "ArrowLeft" ||
      event.key === "a"
    ) {

      keys.left = true;

    }


    if (
      event.key === "ArrowRight" ||
      event.key === "d"
    ) {

      keys.right = true;

    }


    if (
      event.key === " " ||
      event.key === "ArrowUp" ||
      event.key === "w"
    ) {

      event.preventDefault();

      jump();

    }

  }
);


window.addEventListener(
  "keyup",
  event => {

    if (
      event.key === "ArrowLeft" ||
      event.key === "a"
    ) {

      keys.left = false;

    }


    if (
      event.key === "ArrowRight" ||
      event.key === "d"
    ) {

      keys.right = false;

    }

  }
);


// ==============================
// MOBILE BUTTONS
// ==============================

function bindHold(
  id,
  property
) {

  const button =
    document.getElementById(id);


  button.addEventListener(
    "touchstart",
    event => {

      event.preventDefault();

      keys[property] = true;

    }
  );


  button.addEventListener(
    "touchend",
    () => {

      keys[property] = false;

    }
  );


  button.addEventListener(
    "mousedown",
    () => {

      keys[property] = true;

    }
  );


  button.addEventListener(
    "mouseup",
    () => {

      keys[property] = false;

    }
  );

}


bindHold(
  "leftBtn",
  "left"
);

bindHold(
  "rightBtn",
  "right"
);


document
  .getElementById("jumpBtn")
  .addEventListener(
    "click",
    jump
  );


document
  .getElementById("restartBtn")
  .addEventListener(
    "click",
    startGame
  );


// ==============================
// LEADERBOARD
// ==============================

async function saveScore() {

  const input =
    document.getElementById("playerName");

  const name =
    input.value.trim();


  if (!name) {

    alert(
      "Masukkan nama pemain terlebih dahulu!"
    );

    return;
  }


  if (score <= 0) {

    alert(
      "Mainkan game terlebih dahulu!"
    );

    return;
  }


  try {

    const response =
      await fetch(
        "/api/leaderboard",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            name,
            score

          })

        }
      );


    if (!response.ok) {

      throw new Error(
        "Gagal menyimpan skor"
      );

    }


    alert(
      "🏆 Skor berhasil masuk leaderboard!"
    );


    input.value = "";

    loadLeaderboard();

  }

  catch (error) {

    console.error(error);

    alert(
      "Leaderboard belum terhubung."
    );

  }

}


async function loadLeaderboard() {

  const list =
    document.getElementById(
      "leaderboardList"
    );


  try {

    const response =
      await fetch(
        "/api/leaderboard"
      );

    const data =
      await response.json();


    list.innerHTML = "";


    if (!data.length) {

      list.innerHTML =
        "<p>Belum ada pemain.</p>";

      return;
    }


    data.forEach(
      (player, index) => {

        const medals = [
          "🥇",
          "🥈",
          "🥉"
        ];


        const medal =
          medals[index] ||
          "#" + (index + 1);


        const row =
          document.createElement("div");

        row.className =
          "player-row";


        row.innerHTML = `

          <span class="player-name">
            ${medal}
            ${escapeHTML(player.name)}
          </span>

          <span class="player-score">
            ${Number(
              player.score
            ).toLocaleString("id-ID")}
          </span>

        `;


        list.appendChild(row);

      }
    );

  }

  catch (error) {

    list.innerHTML =
      "<p>Leaderboard belum tersedia.</p>";

  }

}


function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent = value;

  return div.innerHTML;

}


document
  .getElementById("saveScore")
  .addEventListener(
    "click",
    saveScore
  );


// START

startGame();

gameLoop();

loadLeaderboard();
