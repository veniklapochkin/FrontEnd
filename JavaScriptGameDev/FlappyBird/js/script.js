let canvas = document.getElementById("gameCanvas");
let contex = canvas.getContext("2d");
let bird = new Image();
let birdDown = new Image();
let birdUp = new Image();
let background = new Image();
let field = new Image();
let upperPipe = new Image();
let lowerPipe = new Image();
let flySound = new Audio();
let scoreSound = new Audio();
let xBird = 10;
let yBird = 150;
let score = 0;
let highScore = 0;
let pipe = [];
const GRAVITY = 1.5;
const SAVE_KEY_SCORE = "highscore";

canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 50;
bird.src = "resources/images/character/bird.png";
birdDown.src = "resources/images/character/bird-down.png";
birdUp.src = "resources/images/character/bird-up.png";
background.src = "resources/images/environment/background.png";
field.src = "resources/images/environment/field.png";
upperPipe.src = "resources/images/environment/upperPipe.png";
lowerPipe.src = "resources/images/environment/lowerPipe.png";
flySound.src = "resources/sounds/fly.mp3";
scoreSound.src = "resources/sounds/score.mp3";

document.addEventListener("keydown",moveUp);
document.addEventListener("keyup",moveDown);

pipe[0] = {
  x : canvas.width,
  y : 0
};


function moveUp() {
 bird = birdUp;
 yBird -= 25;

 flySound.play();
}

function moveDown() {
  bird = birdDown;
}

function draw() {
  contex.drawImage(background,0,0,canvas.width,canvas.height);

  for(let i = 0; i < pipe.length; i++) {
    let gap = upperPipe.height+80;

    contex.drawImage(upperPipe,pipe[i].x,pipe[i].y, upperPipe.width, upperPipe.height) * 2;
    contex.drawImage(lowerPipe,pipe[i].x,pipe[i].y+gap, lowerPipe.width, lowerPipe.height * 2);

    pipe[i].x--;
        
    if(pipe[i].x == canvas.width - 250) {
      pipe.push({
        x : canvas.width,
        y : Math.floor(Math.random()*upperPipe.height)-upperPipe.height
      }); 
    }
        
    if(xBird + bird.width >= pipe[i].x && 
      xBird <= pipe[i].x + upperPipe.width && 
      (yBird <= pipe[i].y + upperPipe.height || yBird+bird.height >= pipe[i].y+gap)
      || yBird + bird.height >=  canvas.height - field.height
      || yBird < 0) {
        location.reload(); 
    }

    if(pipe[i].x == 5){
      score++;
    scoreSound.play();
    }
  }

  yBird += GRAVITY;

  contex.drawImage(field,0,canvas.height - field.height,canvas.width,canvas.height / 4);    
  contex.drawImage(bird,xBird,yBird);
  drawScore();
  drawHighScore(); 
  saveHighScore();
  requestAnimationFrame(draw);
}

function saveHighScore() {
  let scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
  
  if (scoreStr == null) {
    highscore = 0;
  } else {
    highscore = parseInt(scoreStr);
  }

  if(score > highScore) {
   highScore = score;

   try {
     localStorage.setItem(SAVE_KEY_SCORE,highScore);
   } catch (e) {
      if (e == QUOTA_EXCEEDED_ERR) {
        alert('limit exceed');
      }
    }
  }
}

function drawScore() {
  contex.fillStyle = "#000";
  contex.font = "20px Verdana";
  contex.fillText(`Score ${score}`,10,canvas.height-20);
}

function drawHighScore() {
  contex.fillStyle = "#000";
  contex.font = "20px Verdana";
  contex.fillText(`HighScore ${highScore}`,canvas.width-150,canvas.height-20);
}

draw();
























