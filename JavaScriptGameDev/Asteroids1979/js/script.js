jQuery('document').ready(function() {
	const FPS = 25;
	const SHIP_SIZE = 35;
	const SHIP_THRUST = 1.5;
	const SHIP_LIVES = 3;
	const TURN_SPEED = 360;
	const FRICTION = 0.4;
	const ROIDS_AMOUNT = 1;
	const ROIDS_JAG = 0.4;
	const ROIDS_SIZE = 50;
	const ROIDS_SPEED = 10;
	const ROIDS_VERTEX = 10;
	const ROIDS_POINTS_LARGE = 20;
	const ROIDS_POINTS_MEDIUM = 50;
	const ROIDS_POINTS_SMALL = 100;
	const SAVE_KEY_SCORE = "highscore";
	const LASER_MAX = 10;
	const LASER_DISTANCE = 0.3;
	const LASER_SPEED = 500;
	const LASER_EXPLODE_DURATION = 0.1;
	const SOUND_ON = true;
	const MUSIC_ON = true;
	const TEXT_FADE_TIME = 2.5;
	const TEXT_SIZE = 30;
	const LEFT_ARROW = 37;
	const RIGHT_ARROW = 38;
	const UP_ARROW = 39;
	const SPACEBAR = 32;

	var canvas = document.getElementById("gameCanvas");
	var context = canvas.getContext("2d");
	var soundLaser = new Sound("resources/sounds/modern/star-wars/blaster.mp3",5,0.5);
	var soundHit = new Sound("resources/sounds/classic/hit.m4a", 5);
	var soundExplode = new Sound("resources/sounds/modern/star-wars/jabba-laugh.mp3");
	var soundThrust = new Sound("resources/sounds/classic/thrust.m4a");
	var musicBackground = new Music("resources/sounds/classic/music-low.m4a","resources/sounds/classic/music-high.m4a");
	var roidsLeft, roidsTotal;
	var level, lives, score, scoreHigh, roids, ship, text, textAlpha;
	newGame();
	var exploding = false;
	setInterval(update, 1000 / FPS);

	function update() {
		drawSpace();
		drawShip(ship.xShip,ship.yShip,ship.angleShip);
		thrustShip();
		drawAsteroids();
		drawCenterDot();
		drawLazers();
		drawLives();
		drawScore();
		drawHighScore();
		checkCollisions();
		rotateShip();
		moveShip();
		moveLasers();
		handleEdgeAreaForShip();
		handleEdgeAreaForAsteroids();
		detectLaserHitOnAsteroid();
		gameText(); 
		musicTick();
	}

	function newGame() {
		level = 0;
		score = 0;
		lives = SHIP_LIVES;
		ship = newShip();
		var scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
		if (scoreStr == null) {
			scoreHigh = 0;
		}
		else {
			scoreHigh = parseInt(scoreStr);
		}
		newLevel();
	}

	function newLevel() {
		text = "Level " + (level + 1);
		textAlpha = 1.0;
		createAsteroids();
	}

	function drawSpace() {
		context.fillStyle = "black";
		context.fillRect(0,0, canvas.width, canvas.height);
	}

	function newShip() {
		return {
			xShip: canvas.width / 2,
			yShip: canvas.height / 2,
			radiusShip: SHIP_SIZE / 5,
			angleShip: 90 / 180 * Math.PI,
			explodeTime: 0,
			canShoot: true,
			dead: false,
			lasers: [],
			rotation: 0,
			thrusting: false,
			thrust: {
				xCoordinateTrust:0,
				yCoordinateTrust:0
			}
		}
	}

	function drawShip(x,y,angleShip, color = "green") {
		if (!ship.dead) {
			context.strokeStyle = color;
			context.lineWidth = SHIP_SIZE / 20;
			context.beginPath();
			var noseShip = context.moveTo(
				x + 4 / 3 * ship.radiusShip * Math.cos(angleShip),
				y - 4 / 3 * ship.radiusShip * Math.sin(angleShip)
				);
			var rearLeft = context.lineTo(
				x - ship.radiusShip * (2 / 3 * Math.cos(angleShip) + Math.sin(angleShip)),
				y + ship.radiusShip * (2 / 3 * Math.sin(angleShip) - Math.cos(angleShip))
				);
			var rearRight = context.lineTo(
				x - ship.radiusShip * (2 / 3 * Math.cos(angleShip) - Math.sin(angleShip)),
				y + ship.radiusShip * (2 / 3 * Math.sin(angleShip) + Math.cos(angleShip))
				);
			context.closePath();
			context.stroke();
		}
		moveAsteroid();

	}

	function createAsteroids() {
		roids = [];
		roidsTotal = (ROIDS_AMOUNT + level) * 7;
		roidsLeft = roidsTotal;
		var xRoid,yRoid;
		for (var i = 0; i < ROIDS_AMOUNT + level; i++) {
			do {
				xRoid = Math.floor(Math.random() * canvas.width);
				yRoid = Math.floor(Math.random() * canvas.height);
			}
			while (distBetweenPoints(
				ship.xShip,
				ship.yShip,
				xRoid,
				yRoid) < ROIDS_SIZE * 2 + ship.radiusShip
				);
				roids.push(newAsteroid(
					xRoid,
					yRoid,
					Math.ceil(ROIDS_SIZE / 2))
			);
		}
	}

	function newAsteroid(xRoid,yRoid,radiusRoid) {
		var lvlMult = 1 + 0.1 * level;
		var roid = {
			xRoid:xRoid,
			yRoid:yRoid,
			xSpeedRoid: Math.random() * ROIDS_SPEED * lvlMult / FPS * (Math.random() < 0.5 ? 1: -1),
			ySpeedRoid: Math.random() * ROIDS_SPEED * lvlMult / FPS * (Math.random() < 0.5 ? 1: -1),
			radiusRoid: radiusRoid,
			angleRoid: Math.random() * Math.PI * 2,
			vertRoid: Math.floor(Math.random() * (ROIDS_VERTEX + 1) + ROIDS_VERTEX / 2),
			offsRoid: []
		};

		for (var i = 0; i < roid.vertRoid; i++) {
			roid.offsRoid.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
		}

		return roid;
	}

	function destroyAsteroid(index) {
		var xAst = roids[index].xRoid;
		var yAst = roids[index].yRoid;
		var radiusAst = roids[index].radiusRoid;

		if (radiusAst == Math.ceil(ROIDS_SIZE / 2)) {
			roids.push(newAsteroid(xAst,yAst,Math.ceil(ROIDS_SIZE / 4)));
			roids.push(newAsteroid(xAst,yAst,Math.ceil(ROIDS_SIZE / 4)));
			score += ROIDS_POINTS_LARGE;
		}
		else if(radiusAst == Math.ceil(ROIDS_SIZE / 4)) {
			roids.push(newAsteroid(xAst,yAst,Math.ceil(ROIDS_SIZE / 8)));
			roids.push(newAsteroid(xAst,yAst,Math.ceil(ROIDS_SIZE / 8)));
			score += ROIDS_POINTS_MEDIUM;
		}
		else {
			score += ROIDS_POINTS_SMALL;
		}

		if (score > scoreHigh) {
			scoreHigh = score;
			localStorage.setItem(SAVE_KEY_SCORE,scoreHigh);
		}
		soundHit.play();
		roids.splice(index,1);

		roidsLeft--;
		musicBackground.setAsteroidRatio(roidsLeft == 0 ? 1: roidsLeft/ roidsTotal);

		if (roids.length == 0) {
			level++;
			newLevel();
		}

	}

	function drawAsteroids() {
		var xRoid,yRoid,radiusRoid,angleRoid,vertRoid, offsRoid;
		for (var i = 0; i < roids.length; i++) {
			context.strokeStyle = "slategrey";
			context.lineWidth = SHIP_SIZE / 20;
			xRoid = roids[i].xRoid;
			yRoid = roids[i].yRoid;
			radiusRoid = roids[i].radiusRoid;
			angleRoid = roids[i].angleRoid;
			vertRoid = roids[i].vertRoid;
			offsRoid = roids[i].offsRoid;
			//draw a path
			context.beginPath();
			context.moveTo(
				xRoid + radiusRoid * offsRoid[0] * Math.cos(angleRoid),
				yRoid + radiusRoid * offsRoid[0] * Math.sin(angleRoid)
				);
			//draw polygon
			for (var j = 1; j < vertRoid; j++) {
				context.lineTo(
					xRoid + radiusRoid * offsRoid[j] * Math.cos(angleRoid + j * Math.PI * 2 / vertRoid),
					yRoid + radiusRoid * offsRoid[j] * Math.sin(angleRoid + j * Math.PI * 2 / vertRoid)
					);
			}

			context.closePath();
			context.stroke();
		}
	}

	function drawLazers() {
		for (var i = 0; i < ship.lasers.length; i++) {
			if (ship.lasers[i].explodeTime == 0) {
				context.fillStyle = "salmon";
				context.beginPath();
				context.arc(
					ship.lasers[i].xLaser,
					ship.lasers[i].yLaser,
					SHIP_SIZE / 15,
					0,
					Math.PI * 2,
					false
					);
				context.fill();
			}
			else {
				context.fillStyle = "salmon";
				context.beginPath();
				context.arc(
					ship.lasers[i].xLaser,
					ship.lasers[i].yLaser,
					ship.radiusShip * 1.75,
					0,
					Math.PI * 2,
					false
					);
				context.fill();
				context.fillStyle = "orangered";
				context.beginPath();
				context.arc(
					ship.lasers[i].xLaser,
					ship.lasers[i].yLaser,
					ship.radiusShip * 1.5,
					0,
					Math.PI * 2,
					false
					);
				context.fill();
				context.fillStyle = "pink";
				context.beginPath();
				context.arc(
					ship.lasers[i].xLaser,
					ship.lasers[i].yLaser,
					ship.radiusShip * 1.25,
					0,
					Math.PI * 2,
					false
					);
				context.fill();
			}
		}
	}

	function drawThruster() {
		context.fillStyle = "red";
		context.strokeStyle = "yellow";
		context.lineWidth = SHIP_SIZE / 40;
		context.beginPath();
		var rearLeft = context.moveTo(
			ship.xShip - ship.radiusShip * (2 / 3 * Math.cos(ship.angleShip) + 0.5 * Math.sin(ship.angleShip)),
			ship.yShip + ship.radiusShip * (2 / 3 * Math.sin(ship.angleShip) - 0.5 * Math.cos(ship.angleShip))
			);
		var rearCenter = context.lineTo(
			ship.xShip - ship.radiusShip * (6 / 3 * Math.cos(ship.angleShip)),
			ship.yShip + ship.radiusShip * (6 / 3 * Math.sin(ship.angleShip))
			);
		var rearRight = context.lineTo(
			ship.xShip - ship.radiusShip * (2 / 3 * Math.cos(ship.angleShip) - 0.5 * Math.sin(ship.angleShip)),
			ship.yShip + ship.radiusShip * (2 / 3 * Math.sin(ship.angleShip) + 0.5 * Math.cos(ship.angleShip))
			);
		context.closePath();
		context.fill();
		context.stroke();
	}

	function drawCenterDot() {
		if (!ship.dead) {
			context.fillStyle = getRandomColor();
			context.fillRect(ship.xShip - 1, ship.yShip - 1,2,2);
		}
	}

	function getRandomColor() {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	function distBetweenPoints(x1,y1,x2,y2) {
		return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2 - y1,2));
	}

	function explodeShip() {
		exploding = true;
		context.beginPath();
		context.arc(
			ship.xShip,
			ship.yShip,
			ship.radiusShip *1.5,
			0,
			Math.PI * 2,
			false);
		context.fill();
		context.stroke();
		ship.thrusting = false;
		context.fillStyle = "darkred";
		context.fill();
		soundExplode.play();
	}

	function gameOver() {
		ship.dead = true;
		text = "Game Over";
		textAlpha = 1.0;
	}

	function checkCollisions() {
			if (!ship.dead) {
				for (var i = 0; i < roids.length; i++) {
					if (distBetweenPoints(
						ship.xShip,
						ship.yShip,
						roids[i].xRoid,
						roids[i].yRoid) < ship.radiusShip + roids[i].radiusRoid) {
						explodeShip();
					destroyAsteroid(i);
					lives--;
					if (lives == 0 ) {
						gameOver();
					}
					else {
						ship = newShip();
					}
					break;
				}
			}
		}
	}

	function handleEdgeAreaForShip() {
		if (ship.xShip < 0 - ship.radiusShip) {
			ship.xShip = canvas.width + ship.radiusShip;
		}
		else if (ship.xShip > canvas.width + ship.radiusShip) {
			ship.xShip = 0 - ship.radiusShip;
		}

		if (ship.yShip < 0 - ship.radiusShip) {
			ship.yShip = canvas.height + ship.radiusShip;
		}
		else if (ship.yShip > canvas.height + ship.radiusShip) {
			ship.yShip = 0 - ship.radiusShip;
		}
	}

	function handleEdgeAreaForAsteroids() {
		for (var i = 0; i < roids.length; i++) {
			if (roids[i].xRoid < 0 - roids[i].radiusRoid) {
				roids[i].xRoid = canvas.width + roids[i].radiusRoid;
			}
			else if(roids[i].xRoid > canvas.width + roids[i].radiusRoid) {
				roids[i].xRoid = 0 - roids[i].radiusRoid;
			}
			if (roids[i].yRoid < 0 - roids[i].radiusRoid) {
				roids[i].yRoid = canvas.height + roids[i].radiusRoid;
			}				
			else if(roids[i].yRoid > canvas.height + roids[i].radiusRoid) {
				roids[i].yRoid = 0 - roids[i].radiusRoid;
			}

		}
	}


	function rotateShip() {
		ship.angleShip += ship.rotation;
	}

	function moveShip() {
		ship.xShip += ship.thrust.xCoordinateTrust;
		ship.yShip += ship.thrust.yCoordinateTrust;
	}

	function moveAsteroid() {
		for (var i = 0; i < roids.length; i++) {
			roids[i].xRoid += roids[i].xSpeedRoid;
			roids[i].yRoid += roids[i].ySpeedRoid;
		}
	}

	function thrustShip() {
		if (ship.thrusting && !ship.dead) {
			ship.thrust.xCoordinateTrust += SHIP_THRUST * Math.cos(ship.angleShip) / FPS;
			ship.thrust.yCoordinateTrust -= SHIP_THRUST * Math.sin(ship.angleShip) / FPS;
			drawThruster();
			soundThrust.play();
		} 
		else {
			ship.thrust.xCoordinateTrust -= FRICTION * ship.thrust.xCoordinateTrust / FPS;
			ship.thrust.yCoordinateTrust -= FRICTION * ship.thrust.yCoordinateTrust / FPS;
			soundThrust.stop();
		}
	}

	function moveLasers() {
			for (var i = ship.lasers.length - 1; i >= 0; i--) {
				if (ship.lasers[i].distance > LASER_DISTANCE * canvas.width) {
					ship.lasers.splice(i,1);
					continue;
				}

				if (ship.lasers[i].explodeTime > 0 ) {
					ship.lasers[i].explodeTime--;
					if (ship.lasers[i].explodeTime == 0 ) {
						ship.lasers.splice(i,1);
						continue;
					}
				}
				else {
				//move the laser
				ship.lasers[i].xLaser += ship.lasers[i].xSpeedLaser;
				ship.lasers[i].yLaser += ship.lasers[i].ySpeedLaser;

				//calculate the distance travelled
				ship.lasers[i].distance += Math.sqrt(
					Math.pow(ship.lasers[i].xSpeedLaser,2) +
					Math.pow(ship.lasers[i].ySpeedLaser,2));
			}
		}
	}

	function shootLaser() {
		if (ship.canShoot && ship.lasers.length < LASER_MAX && !ship.dead) {
			ship.lasers.push({
				xLaser:ship.xShip + 4 / 3 * ship.radiusShip * Math.cos(ship.angleShip),
				yLaser:ship.yShip - 4 / 3 * ship.radiusShip * Math.sin(ship.angleShip),
				xSpeedLaser:LASER_SPEED * Math.cos(ship.angleShip) / FPS,
				ySpeedLaser: -LASER_SPEED * Math.sin(ship.angleShip) / FPS,
				distance: 0,
				explodeTime:0
			});
			soundLaser.play();
		}
		ship.canShoot = false;
	}

	function detectLaserHitOnAsteroid() {
		var asteroidX,asteroidY,asteroidRadius,laserX,laserY;
		for (var i = roids.length - 1; i >= 0; i--) {
			asteroidX = roids[i].xRoid;
			asteroidY = roids[i].yRoid;
			asteroidRadius = roids[i].radiusRoid;

			for (var j = ship.lasers.length - 1; j >= 0; j--) {
				laserX = ship.lasers[j].xLaser;
				laserY = ship.lasers[j].yLaser;

				if (ship.lasers[j].explodeTime == 0 && 
					distBetweenPoints(asteroidX,asteroidY,laserX,laserY) < asteroidRadius) {
					
					destroyAsteroid(i);
				ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DURATION * FPS);
				break;					
			}
		}
	}
	}

	function gameText() {
		if (textAlpha >= 0) {
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = "rgba(255,255,255, " + textAlpha + ")";
			context.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
			context.fillText(text, canvas.width/2, canvas.height * 0.75);
			textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
		}
		else if (ship.dead) {
			newGame();
		}
	}

	function drawLives() {
		var lifeColor;
		for (var i = 0; i < lives; i++) {
			if (lifeColor = exploding && i == lives - 1) {
				lifeColor = "red";
				exploding = false;	
			} 
			else { 
				lifeColor =  "green";
			}
			drawShip(
				-20 + SHIP_SIZE + i * SHIP_SIZE * 0.5, 
				SHIP_SIZE * 0.4, 0.5 * Math.PI,
				lifeColor);
		}
	}

	function drawScore() {
		context.textAlign = "right";
		context.textBaseline = "middle";
		context.fillStyle = "white";
		context.font = "12px dejavu sans mono";
		context.fillText(score, canvas.width - SHIP_SIZE / 4, SHIP_SIZE / 2.5);
	}

	function drawHighScore() {
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillStyle = "white";
		context.font = "12px dejavu sans mono";
		context.fillText("BEST " + scoreHigh, canvas.width / 2, SHIP_SIZE / 2.5);
	}

	document.addEventListener("keydown",keyPressed);
	document.addEventListener("keyup",keyReleased);

	function keyPressed(ev) { 
		if (ship.dead) {
			return;
		}

		switch(ev.keyCode) {
			case SPACEBAR:
			shootLaser();
			break;
			case LEFT_ARROW: 
			ship.rotation = TURN_SPEED / 100 * Math.PI / FPS;
			break;
			case RIGHT_ARROW:
			ship.thrusting = true;
			break;
			case UP_ARROW:
			ship.rotation = -TURN_SPEED / 100 * Math.PI / FPS;
			break;
		}
	}

	function keyReleased(ev) { 
		if (ship.dead) {
			return;
		}
		switch(ev.keyCode) {
			case SPACEBAR:
			ship.canShoot = true;
			break;
			case LEFT_ARROW: 
			ship.rotation = 0;
			break;
			case RIGHT_ARROW:
			ship.thrusting = false;
			break;
			case UP_ARROW:
			ship.rotation = 0;
			break;
		}
	}

	function Sound(src,maxStreams = 1, volume = 1.0) {
		this.streamNum = 0;
		this.streams = [];
		for (var i = 0; i < maxStreams; i++) {
			this.streams.push(new Audio(src));
			this.streams[i].volume = volume;
		}

		this.play = function() {
			if (SOUND_ON) {
				this.streamNum = (this.streamNum + 1) % maxStreams;
				this.streams[this.streamNum].play();
			}
		}

		this.stop = function() {
			this.streams[this.streamNum].pause();
		}
	}

	function Music(srcLow, srcHigh) {
		this.soundLow = new Audio(srcLow);
		this.soundHigh = new Audio(srcHigh);
		this.low = true;
		this.tempo = 1.0;
		this.beatTime = 0;

		this.play = function() {
			if (MUSIC_ON) {
				if (this.low) {
					this.soundLow.play();
				}
				else {
					this.soundHigh.play();
				}
				this.low = !this.low;
			}
		}

		this.setAsteroidRatio = function(ratio) {
			this.tempo = 1.0 - 0.75 * (1.0 - ratio);
		}

		this.tick = function() {
			if (this.beatTime == 0) {
				this.play();
				this.beatTime = Math.ceil(this.tempo * FPS);
			}
			else {
				this.beatTime--;
			}
		}
	}

	function musicTick() {
		musicBackground.tick();
	}

});