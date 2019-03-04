jQuery('document').ready(() => {
	let userPoint = 0;
	let computerPoint = 0;
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

	function win(userChoice) {
		userPoint++;
		userScore.innerHTML = userPoint;
		result.innerHTML = "USER WIN ROUND";
		document.getElementById(userChoice).classList.add("green-glow");
		setTimeout(
			() => document.getElementById(userChoice).classList.remove("green-glow")
			, 1000);
	}

	function lose(userChoice) {
		computerPoint++;
		computerScore.innerHTML = computerPoint;
		result.innerHTML = "COMPUTER WIN ROUND";
		document.getElementById(userChoice).classList.add("red-glow");
		setTimeout(
			() => document.getElementById(userChoice).classList.remove("red-glow")
			, 1000);
	}

	function draw(userChoice) {
		result.innerHTML = "DRAW";
		document.getElementById(userChoice).classList.add("gray-glow");
		setTimeout(
			() => document.getElementById(userChoice).classList.remove("gray-glow")
			, 1000);
	}

	function game(userChoice) {
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
			console.log("user choice => " + userChoice);
			console.log("computer choice => " + computerChoice);
			console.log("USER WIN");
			win(userChoice);
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
			console.log("user choice => " + userChoice);
			console.log("computer choice => " + computerChoice);
			console.log("COMPUTER WIN");
			lose(userChoice);
			break;
			case "scissorsscissors":
			case "rockrock":
			case "paperpaper":
			case "spockspock":
			case "lizardlizard":
			console.log("user choice => " + userChoice);
			console.log("computer choice => " + computerChoice);
			console.log("DRAW");
			draw(userChoice);
			break;

		}
	}

	function main() {
		rock.addEventListener("click", () => game("rock"));	
		paper.addEventListener("click", () => game("paper"));		
		scissors.addEventListener("click", () => game("scissors"));		
		spock.addEventListener("click", () => game("spock"));		
		lizard.addEventListener("click", () => game("lizard"));		
	}

	main();
});