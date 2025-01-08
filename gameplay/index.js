
//let canvas = document.getElementById("game");
//let ctx = canvas.getContext("2d")
let body = document.querySelector("body")
let canvas;
let ctx;

//SET OF VARIABLES

let score; //0 default
let scoreText;
let highscore; // 0 deault
let highscoreText;
let player;
let gravity; //1 default
let enemies = [];
let gameSpeed; //3 default
let keys = {};
let isGameOver = false; //To end the for loop
let gameOverScreen;
let splashScreen;
let canvasContainer;

//IMAGES

let playerImg = new Image();
playerImg.src = "images/player.png";

let enemyImg = new Image();
enemyImg.src = "images/zombie1.png"

//MUSIC

let splashScreenMusic = new Audio();
splashScreenMusic.src = "music/TLOU.song.mp3"

let gameMusic = new Audio();
gameMusic.src = "music/game.music.mp3"

let endGame = new Audio();
endGame.src = "music/end.game.mp3"

//-----------EVENT LISTENERS--------------//
document.addEventListener("keydown", function (even) {
  keys[even.code] = true;
});

document.addEventListener("keyup", function (even){
  keys[even.code] = false;
})


//-----------CLASSES--------------//
// X AXIS, Y AXIS, WIDTH, HEIGHT, COLOUR, DIRECTION Y FORCE
class Player {
  constructor (x, y, width, height, colour) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.colour = colour; // Only necessary if the player is a square
    this.dirY = 0; 
    this.jumpForce = 15; 
    this.originalHeight = height; //Only for shrinking the character
    this.grounded = false;
    this.jumpTimer = 0;
  }

  animation() {

    //JUMP MECHANICS DEL PLAYER
    if (keys["Space"]) { 
      this.jump();
    } else {
        this.jumpTimer = 0;
      }

      //DUCK MECHANICS
      if (keys['KeyS']) {
        this.height = this.originalHeight / 2;
      } else {
        this.height = this.originalHeight;
      }
    
      this.y += this.dirY;

    //GRAVITY SISTEM.
    if (this.y + this.height < canvas.height) {
      this.dirY += gravity;
      this.grounded = false;
    } else {
      this.dirY = 0;
      this.grounded = true;
      this.y = canvas.height - this.height;
    }  

    this.draw()
  }

  jump() {
    if (this.grounded && this.jumpTimer === 0) {
      this.jumpTimer = 1;
      this.dirY = -this.jumpForce;
    } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {       
        this.jumpTimer++;
        this.dirY = -this.jumpForce - (this.jumpTimer /50);
      }
    }

    draw(){ //PLAYER SPRITE
      ctx.drawImage(playerImg, this.x, this.y, this.width, this.height)
    } 

  
  /* PLAYER SQUARE OLD CODE: draw(){
    ctx.beginPath();
    ctx.fillStyle = this.colour;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.closePath();*/
  }  



//ENEMIES
class Enemy {
  constructor (x, y, width, height, colour) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.colour = colour;

    this.dirX = -gameSpeed;
  }

  update() {
    this.x += this.dirX;
    this.draw();
    this.dirX = -gameSpeed;
  }

  draw() { //Crea el enemigo
    ctx.drawImage(enemyImg, this.x, this.y, this.width, this.height)
  }

  /* OLD CODE FOR MAKING THE ENEMIES AS RECTANGLES. draw() {ctx.beginPath();
    ctx.fillStyle = this.colour;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.closePath();}*/
}


//SCORE
class Statistics {
  constructor(text, x, y, alignment, colour, size) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.alignment = alignment;
    this.colour = colour;
    this.size = size;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.colour;
    ctx.font = this.size +"px sans-serif";
    ctx.textAlign = this.alignment
    ctx.fillText(this.text, this.x, this.y);
    ctx.closePath();
  }
}


//-----------FUNCTIONS--------------//



function createEnemies(){ //CREATE ENEMIES WITH RANDOM SIZE
  let size = randomRange(50, 150) // Function debajo, el player es 60x80
  let type = randomRange(0, 1); //Two types of enemies: 0 -> ground / 1 -> fly
  let enemy = new Enemy(canvas.width + size, canvas.height - size, size, size, '#bf1313');

  if (type == 1) {
    enemy.y -= player.originalHeight - 10; //To make them slighter bigger than the player
  }
  enemies.push(enemy);
}


function randomRange(min, max) { //CREATE RANDOM SIZES ENEMIES
  return Math.round(Math.random() * (max - min) + min);
}

//Timer enemies
let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;



//SPLASH SCREEN

function splash(){
  let body = document.querySelector("body")
  splashScreen = document.createElement("div")
  splashScreenMusic.play();
  splashScreenMusic.volume = 0.05
  splashScreen.classList.add("splashScr")
  splashScreen.innerHTML = `
    <button class="start-btn">START GAME</button> 
    <h2 class= "headline">Are you faster than a zombie? </h2>
    <h2 class= "instruccions">Press the spacebar to jump and the S to duck</h2>           
    <img src="images/zombie.hand.png" alt="Start" class="hand">
  `
  body.appendChild(splashScreen)
  let splashBtn = splashScreen.querySelector(".start-btn")
  splashBtn.addEventListener("click", function() {
      splashScreenMusic.pause();
      splashScreen.currentTime = 0
      gameMusic.play()
      gameMusic.volume = 0.05
      startGame();
    })
}

function addCanvas() {
  canvasContainer = document.createElement("div")
  canvasContainer.setAttribute("id", "canvas-container")
  canvasContainer.innerHTML = `<canvas id="game" width="1200" height="700"></canvas>`
  body.appendChild(canvasContainer)
}

//START THE GAME
function startGame(){
  isGameOver = false
  splashScreen.remove()
  addCanvas()
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d")
  console.log("starGame function called")
  //TO MAKE THE CANVAS FULL SCREEN DO THIS
  //canvas.width = window.innerWidth; 
  //canvas.height = window.innerHeight;

  //BASIC CHARACTERISTICS  
  ctx.font = "20px sans-serif"; 
  gameSpeed = 3; 
  gravity = 1; 
  score = 0; 
  highscore = 0; 

  //PLAYER DATA
  player = new Player(120, canvas.height, 60, 90, "#4a823e");

  //DATOS DE LOS STATISTICS. Score and Highscore
  scoreText = new Statistics("Score: " + score, 25, 25, "left", "#bababa", "30")

  highscoreText = new Statistics("Highscore: " + highscore, canvas.width - 25, 25, "right", "#bababa", "30");

  requestAnimationFrame(updateGame)     
}

//GAME OVER SCREEN

function gameOver(){
  //canvas.remove() //First step removing the canvas with element.remove
  endGame.currentTime = 0
  endGame.play();
  endGame.volume = 0.05;
  canvasContainer.remove();
  let body = document.querySelector("body") //I have to fetch it because is not a global variable

  gameOverScreen = document.createElement("div")//IMPORTANT! I already have the variable created as global.
  gameOverScreen.classList.add("gameOverScr")
  gameOverScreen.innerHTML = `
  <button class="reset-btn">RESET</button>
  <div class="score">

  <h2 class = "scoreText">Your Score</h2>
  <h3 class= "scoreNum">${score}</h3>

  <h2 class= "quote"><em>"I like my zombies slow and I like my zombies stupid"</em></h2>
  <h3 class="author">Seth Grahame-Smith</h3>
  <h3 class="authorText"><em>Author of Pride and Prejudice and Zombies<em></h3>
  </div>
  `;  
  body.appendChild(gameOverScreen) //Added to the body with append.child

  let reset = gameOverScreen.querySelector(".reset-btn")
  reset.addEventListener("click", function() {
    //canvasContainer.remove();
    gameMusic.play()
    newGame();
     //Add here the function so when I click the button the next function will execute.
  })  
}

function newGame() { //Finish the game over phase and start a new game
  gameOverScreen.remove();
  
  let body = document.querySelector("body") //fetch again because is not a global varaible.
  //canvas = document.createElement("div"); 
  //canvas.innerHTML = `<canvas id="game" width="1200" height="700" ></canvas>` /
 // addCanvas()
  //Nos crea un nuevo cambas como el anterior
  //body.appendChild(canvas)
  // canvas = document.getElementById("game");
  // ctx = canvas.getContext("2d");
  // canvas.style.border = '2px solid black';
  
    //score = 0; //0 default
    //scoreText;
    highscore = 0; // 0 deault
    highscoreText;
    //player;
    gravity = 1; //1 default
    enemies = [];
    gameSpeed = 3; //3 default
    keys = {};
    isGameOver = false; //Con esto finalizamos el loop
    initialSpawnTimer = 200;
    spawnTimer = 100;
    //gameOverScreen;

  startGame();
}


function updateGame() {
  //requestAnimationFrame(update);
  //if (!isGameOver) requestAnimationFrame(updateGame)
  ctx.clearRect(0, 0, canvas.width, canvas.height) //Clear the canvas every time, if not everything will appear again.

  //SPAWING ENEMIES
  spawnTimer--;
  if (spawnTimer <= 0) {
    createEnemies();
    spawnTimer = initialSpawnTimer - gameSpeed * 50; //The enemies will appear closer together 
    console.log(gameSpeed)
    if (spawnTimer < 100) {
      spawnTimer = 100;
    }
  }

//CREACIÓN DE ENEMIGOS
for (let i = 0; i < enemies.length; i ++) { 
  let e = enemies[i];

  //COLLISION SYSTEM
  //IMPORTANT!! Delete the enemies when they disappear from the canvas screen
  if (e.x + e.width < 0) {
    enemies.splice(i, 1);
  }

  //COLLISION
  if (
    player.x < e.x + e.width && 
    player.x + player.width > e.x &&
    player.y < e.y + e.height &&
    player.y + player.height > e.y
    ){
      //INCLUDE HERE THE GAME OVER
      gameMusic.pause()    
      gameMusic.currentTime = 0  
      enemies = []; //Reset enemies
      //score = 0; //Reset score
      spawnTimer = initialSpawnTimer; //return to the normal spawn time
      gameSpeed = 3; //The original speed
      isGameOver = true
      gameOver();
      
  }

  if (!isGameOver) e.update()
  console.log("game continues")
}

  player.animation();

  gameSpeed += 0.020; // Increase every frame hasta llegar al infinito

  score ++;
  scoreText.text = "Score: " + score;
  scoreText.draw();

  if (score > highscore) {
    highscore = score;
    highscoreText.text = "Highscore: " + highscore;
  }

  //highscoreText.draw();
  if (!isGameOver) requestAnimationFrame(updateGame)
}

//startGame();

window.addEventListener("load", splash)


