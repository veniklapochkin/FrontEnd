let canvas = document.getElementById("gameCanvas");
let contex = canvas.getContext("2d");
const background = new Image();
const headSnake = new Image();
const bodySnake = new Image();
const tailSnake = new Image();
const apple = new Image();
const orange = new Image();
const cherry = new Image();
const strawberry = new Image();
const banana = new Image();
const pineapple = new Image();
const deadSound = new Audio();
const downSound = new Audio();
const leftSound = new Audio();
const rightSound = new Audio();
const upSound = new Audio();
const eatSound = new Audio();
const leftArrow = 37;
const upArrow = 38;
const rightArrow = 39;
const downArrow = 40;
const box = 35;
let snake = [];
let direction;
let score = 0;
const SAVE_KEY_SCORE = "highscoreNS";
let highScore = localStorage.getItem(SAVE_KEY_SCORE);
let fruits = [apple,orange,cherry,strawberry,banana,pineapple];
let randomFruit = fruits[Math.floor(Math.random() * fruits.length)];

snake[0] = {
	x: 9 * box,
	y: 10 * box
};

console.log(snake[0]);
let food = {
	x :Math.floor(Math.random()*50) * box,
	y :Math.floor(Math.random()*18) * box
};
console.log(food);

canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 50;
background.src = "resources/images/environment/background/grid.jpg";
headSnake.src = "resources/images/character/head.jpg";
bodySnake.src = "resources/images/character/body.jpg";
tailSnake.src = "resources/images/character/tail.jpg";
apple.src = "resources/images/environment/models/apple.png";
orange.src = "resources/images/environment/models/orange.png";
cherry.src = "resources/images/environment/models/cherry.png";
strawberry.src = "resources/images/environment/models/strawberry.png";
banana.src = "resources/images/environment/models/banana.png";
pineapple.src = "resources/images/environment/models/pineapple.png";
deadSound.src = "resources/sounds/dead.mp3";
downSound.src = "resources/sounds/down.mp3";
leftSound.src = "resources/sounds/left.mp3";
rightSound.src = "resources/sounds/right.mp3";
upSound.src = "resources/sounds/up.mp3";
eatSound.src = "resources/sounds/eat.mp3";
document.addEventListener("keydown" , controls);

function controls(event) {
	let key = event.keyCode;
	if (key == leftArrow && direction != "RIGHT") {
		direction = "LEFT";
		leftSound.play();
	} else if (key == upArrow && direction != "DOWN") {
		direction = "UP";
		upSound.play();
	} else if (key == rightArrow && direction != "LEFT") {
		direction = "RIGHT";
		rightSound.play();
	} else if (key == downArrow && direction != "UP") {
		direction = "DOWN";
		downSound.play();
	}
}

function checkCollision(head,array){
    for(let i = 0; i < array.length; i++){
        if(head.x == array[i].x && head.y == array[i].y){
            return true;
        }
    }
    return false;
}

function draw() {
	contex.drawImage(background,0,0,canvas.width,canvas.height);
	contex.drawImage(randomFruit,food.x,food.y,100,100);
	for(let i = 0; i < snake.length; i++) {
		if (i == 0) {
			contex.drawImage(headSnake,snake[i].x,snake[i].y);
		 } 
		 else {
			contex.drawImage(bodySnake,snake[i].x,snake[i].y);
		}

		if (i == snake.length - 1) {
			contex.drawImage(tailSnake,snake[i].x,snake[i].y);	
		}
	}

	let snakeX = snake[0].x;
	let snakeY = snake[0].y;

	if (direction == "LEFT") snakeX -= box;
	if (direction == "UP") snakeY -= box;
	if (direction == "RIGHT") snakeX += box;
	if (direction == "DOWN") snakeY += box;

	if (snakeX == food.x && snakeY == food.y) {
		score++;

		eatSound.play();
		food = {
			x :Math.floor(Math.random()*50 + 1.5) * box,
			y :Math.floor(Math.random()*21 + 1.5) * box
		};
	} else {
		snake.pop();
	}

	let newHead = {
		x : snakeX,
		y : snakeY
	}

	if (snakeX < 0 || snakeX > box * 51 || snakeY < box * 2 || snakeY > box*24 || checkCollision(newHead,snake)) {
		deadSound.play();
		clearInterval(game); 
		setTimeout(() => location.reload(), 1000);
	}
	snake.unshift(newHead);

	drawScore();
	drawHighScore();
	saveHighScore();
}

function saveHighScore() {
	if (highScore == null) {
		highScore = 0;
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
	contex.fillStyle = "white";
	contex.font = "60px Changa one";
	contex.fillText(score, canvas.width / 6, canvas.height / 12);
}

function drawHighScore() {
	contex.fillStyle = "white";
	contex.font = "60px Changa one";
	contex.fillText(highScore, canvas.width - canvas.width / 12, canvas.height / 12);
}

let game = setInterval(draw,100);