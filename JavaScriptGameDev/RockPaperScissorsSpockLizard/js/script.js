let userPoint = 0;
let computerPoint = 0;
let userVictories = 0;
let computerVictories = 0;
const userScore = document.getElementById("user-score");
const computerScore = document.getElementById("computer-score");
const scoreBoard = document.querySelector(".score-board");
const result = document.querySelector(".result > p");
const rock = document.getElementById("rock");
const paper = document.getElementById("paper");
const scissors = document.getElementById("scissors");
const spock = document.getElementById("spock");
const lizard = document.getElementById("lizard");

function getComputerChoice() {
  const choices = ["rock","paper","scissors","spoke","lizard"];
  const randomNumber = Math.floor(Math.random() * 5);

  return choices[randomNumber];
}

function showWin(userChoice) {
  userPoint++;
  userScore.innerHTML = userPoint;
  result.innerHTML = "USER WIN ROUND";

  document.getElementById(userChoice).classList.add("green-glow");
  setTimeout(
	() => document.getElementById(userChoice).classList.remove("green-glow")
	, 1000);
}

function showLose(userChoice) {
  computerPoint++;
  computerScore.innerHTML = computerPoint;
  result.innerHTML = "COMPUTER WIN ROUND";

  document.getElementById(userChoice).classList.add("red-glow");
  setTimeout(
    () => document.getElementById(userChoice).classList.remove("red-glow")
	, 1000);
}

function showDraw(userChoice) {
  result.innerHTML = "DRAW ROUND";

  document.getElementById(userChoice).classList.add("gray-glow");
  setTimeout(
	() => document.getElementById(userChoice).classList.remove("gray-glow")
	, 1000);
}

function createGameMatch() {
   if (userPoint == 16 && computerPoint != 16) {
	++userVictories;

	if (userVictories == 1) {
	  document.getElementById("matchUser1").classList.add("winMatch");
	  document.querySelector(".result > p").classList.add("winMatch");
	} else if (userVictories == 2) {
	  document.getElementById("matchUser2").classList.add("winMatch");
	  document.querySelector(".result > p").classList.add("winMatch");
	} else if (userVictories == 3) {
	  document.getElementById("matchUser3").classList.add("winMatch");
	}

    result.innerHTML = "USER WIN MATCH";
	setTimeout(() => resetScoreBoard(), 1000);
	setTimeout(() => sleep(1000), 1);
	console.log(`userVictories: ${userVictories}`);
	} else if (userPoint != 16 && computerPoint == 16) {
	  ++computerVictories;
			
	  if (computerVictories == 1) {
	    document.getElementById("matchComputer1").classList.add("winMatch");
		document.querySelector(".result > p").classList.add("loseMatch");
		} else if (computerVictories == 2) {
		  document.getElementById("matchComputer2").classList.add("winMatch");
		  document.querySelector(".result > p").classList.add("loseMatch");
		} else if (computerVictories == 3) {
		  document.getElementById("matchComputer3").classList.add("winMatch");
		}

	  result.innerHTML = "COMPUTER WIN MATCH";
	  setTimeout(() => resetScoreBoard(), 1000);
	  setTimeout(() => sleep(1000), 1);
	  console.log(`computerVictories: ${computerVictories}`);
	  }
    }

function createEndGame() {
	if (userVictories == 3 || computerVictories == 3) {
	  document.querySelector(".result > p").classList.add("winGame");
			
	if (userVictories == 3 && computerVictories != 3) {
	  result.innerHTML = "USER WIN GAME";
	  console.log("USER WIN GAME");
	} else if (userVictories != 3 && computerVictories == 3) {
	  result.innerHTML = "COMPUTER WIN GAME";
	  console.log("COMPUTER WIN GAME");
	}

	setTimeout(() => newGame(), 1000);
	}
}

function resetScoreBoard() {
  computerScore.innerHTML = 0;
  userScore.innerHTML = 0;
  userPoint = 0;
  computerPoint = 0;
  result.innerHTML = "";

  document.querySelector(".result > p").classList.remove("winMatch","loseMatch","winGame");
}

function newGame() {
  let elements = document.getElementsByClassName('winMatch');

  while (elements.length > 0) {
   	elements[0].classList.remove('winMatch');
  }

  resetScoreBoard();
  setTimeout(() => sleep(1000), 1);

  userVictories = 0;
  computerVictories = 0;
  }

function createGameStrategy(userChoice) {
  const computerChoice = getComputerChoice();

  switch (userChoice + computerChoice) {
	case "rockscissors":
	case "rocklizard":
	case "paperrock":
	case "paperspock":
	case "lizardpaper":
	case "lizardspock":
	case "spockscissors":
	case "spokerock":
	case "scissorspaper":
	case "scissorslizard":
	console.log(`user choice => ${userChoice}`);
	console.log(`computer choice => ${computerChoice}`);
	console.log("USER WIN");
	showWin(userChoice);
	break;
	case "scissorsrock":
	case "lizardrock":
	case "rockpaper":
	case "spockpaper":
	case "paperlizard":
	case "spocklizard":
	case "scissorsspock":
	case "rockspoke":
	case "paperscissors":
	case "lizardscissors":
	console.log(`user choice => ${userChoice}`);
	console.log(`computer choice => ${computerChoice}`);
	console.log("COMPUTER WIN");
	showLose(userChoice);
	break;
	case "scissorsscissors":
	case "rockrock":
	case "paperpaper":
	case "spockspock":
	case "lizardlizard":
	console.log(`user choice => ${userChoice}`);
	console.log(`computer choice => ${computerChoice}`);
	console.log("DRAW");
	showDraw(userChoice);
	break;
  }

  createGameMatch();
  createEndGame();
}

function createIconsListener() {
  rock.addEventListener("click", () => createGameStrategy("rock"));	
  paper.addEventListener("click", () => createGameStrategy("paper"));		
  scissors.addEventListener("click", () => createGameStrategy("scissors"));		
  spock.addEventListener("click", () => createGameStrategy("spock"));		
  lizard.addEventListener("click", () => createGameStrategy("lizard"));		
}

function sleep(ms) {
  ms += new Date().getTime();

  while (new Date() < ms){}
} 

createIconsListener();