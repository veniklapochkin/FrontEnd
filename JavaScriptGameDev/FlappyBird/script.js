let canvas = document.getElementById("gameCanvas");
let contex = canvas.getContext("2d");
let bird = new Image();
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
bird.src = "images/bird.png";
background.src = "images/background.png";
field.src = "images/field.png";
upperPipe.src = "images/upperPipe.png";
lowerPipe.src = "images/lowerPipe.png";
flySound.src = "sounds/fly.mp3";
scoreSound.src = "sounds/score.mp3";

document.addEventListener("keydown",moveUp);

pipe[0] = {
    x : canvas.width,
    y : 0
};


function moveUp(){
    yBird -= 25;
    flySound.play();
}

function draw(){
    contex.drawImage(background,0,0); 
    let scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
    if (scoreStr == null) {
        highScore = 0;
    }
    else {
        highScore = parseInt(scoreStr);
    }
    for(let i = 0; i < pipe.length; i++){
        let gap = upperPipe.height+90;
        contex.drawImage(upperPipe,pipe[i].x,pipe[i].y);
        contex.drawImage(lowerPipe,pipe[i].x,pipe[i].y+gap);

        pipe[i].x--;
        
        if( pipe[i].x == 125 ){
            pipe.push({
                x : canvas.width,
                y : Math.floor(Math.random()*upperPipe.height)-upperPipe.height
            }); 
        }
        
        if( xBird + bird.width >= pipe[i].x && 
            xBird <= pipe[i].x + upperPipe.width &&
            (yBird <= pipe[i].y + upperPipe.height || yBird+bird.height >= pipe[i].y+gap)
            || yBird + bird.height >=  canvas.height - field.height) {
            location.reload(); 
    }

    if(pipe[i].x == 5){
        score++;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem(SAVE_KEY_SCORE,highScore);
        }
        scoreSound.play();
    }
}

yBird += GRAVITY;
contex.drawImage(field,0,canvas.height - field.height);    
contex.drawImage(bird,xBird,yBird);
drawScore();
drawHighScore(); 
requestAnimationFrame(draw);
}

function createLocalStorage() {
    let scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
    if (scoreStr == null) {
        highscore = 0;
    }
    else {
        highscore = parseInt(scoreStr);
    }
}

function drawScore() {
    contex.fillStyle = "#000";
    contex.font = "20px Verdana";
    contex.fillText("Score : "+ score,10,canvas.height-20);
}

function drawHighScore() {
    contex.fillStyle = "#000";
    contex.font = "20px Verdana";
    contex.fillText("HighScore : "+ highScore,canvas.width-150,canvas.height-20);
}

draw();
























