jQuery('document').ready(function() {
	const FPS = 25;
	const SHIP_SIZE = 35;
	const SHIP_INV_DURATION = 3;
	const SHIP_BLINK_DURATION = 0.1;
	const SHIP_THRUST = 1.5;
	const SHIP_LIVES = 3;
	const TURN_SPEED = 189;
	const FRICTION = 0.4;
	const ROIDS_AMOUNT = 1;
	const ROIDS_JAG = 0.4;
	const ROIDS_SIZE = 50;
	const ROIDS_SPEED = 50;
	const ROIDS_VERT = 10;
	const LASER_MAX = 10;
	const LASER_DISTANCE = 0.3;
	const LASER_SPEED = 500;
	const LASER_EXPLODE_DURATION = 0.1;
	const TEXT_FADE_TIME = 2.5;
	const TEXT_SIZE = 30;
	const LEFT_ARROW = 37;
	const RIGHT_ARROW = 38;
	const UP_ARROW = 39;
	const SPACEBAR = 32;

	var canvas = document.getElementById("gameCanvas");
	var context = canvas.getContext("2d");
	var level, lives, roids, ship, text, textAlpha;
	newGame();
	var exploding = false;

	function update() {
		drawSpace();
		drawShip(ship.xCoordinate,ship.yCoordinate,ship.angle);
		thrustShip();
		drawAsteroids();
		drawCenterDot();
		drawLazers();
		drawLives();
		checkCollisions();
		rotateShip();
		moveShip();
		moveLasers();
		handleEdgeAreaForShip();
		handleEdgeAreaForAsteroids();
		handleEdgeAreaForLasers();
		detectLaserHitOnAsteroid();
		gameText(); 
	}

	function newGame() {
		level = 0;
		lives = SHIP_LIVES;
		ship = newShip();
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
			xCoordinate: canvas.width / 2,
			yCoordinate: canvas.height / 2,
			radius: SHIP_SIZE / 5,
			angle: 90 / 180 * Math.PI,
			blinkNum: Math.ceil(SHIP_INV_DURATION / SHIP_BLINK_DURATION * FPS),
			blinkTime: Math.ceil(SHIP_BLINK_DURATION * FPS),
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

	function drawShip(x,y,angle, color = "green") {
		if (!ship.dead) {
		context.strokeStyle = color;
		context.lineWidth = SHIP_SIZE / 20;
		context.beginPath();
		var noseShip = context.moveTo(
			x + 4 / 3 * ship.radius * Math.cos(angle),
			y - 4 / 3 * ship.radius * Math.sin(angle)
			);
		var rearLeft = context.lineTo(
			x - ship.radius * (2 / 3 * Math.cos(angle) + Math.sin(angle)),
			y + ship.radius * (2 / 3 * Math.sin(angle) - Math.cos(angle))
			);
		var rearRight = context.lineTo(
			x - ship.radius * (2 / 3 * Math.cos(angle) - Math.sin(angle)),
			y + ship.radius * (2 / 3 * Math.sin(angle) + Math.cos(angle))
			);
		context.closePath();
		context.stroke();
		}
		moveAsteroid();

	}

	function createAsteroids() {
		roids = [];
		var xCoordinateRoid,yCoordinateRoid;
		for (var i = 0; i < ROIDS_AMOUNT + level; i++) {
			do {
				xCoordinateRoid = Math.floor(Math.random() * canvas.width);
				yCoordinateRoid = Math.floor(Math.random() * canvas.height);
			}
			while (distBetweenPoints(
				ship.xCoordinate,
				ship.yCoordinate,
				xCoordinateRoid,
				yCoordinateRoid) < ROIDS_SIZE * 2 + ship.radius
				);
				roids.push(newAsteroid(
					xCoordinateRoid,
					yCoordinateRoid,
					Math.ceil(ROIDS_SIZE / 2))
			);
		}
	}

	function newAsteroid(xRoid,yRoid,rRoid) {
		var lvlMult = 1 + 0.1 * level;
		var roid = {
			xRoid:xRoid,
			yRoid:yRoid,
			xSpeedRoid: Math.random() * ROIDS_SPEED * lvlMult / FPS * (Math.random() < 0.5 ? 1: -1),
			ySpeedRoid: Math.random() * ROIDS_SPEED * lvlMult / FPS * (Math.random() < 0.5 ? 1: -1),
			rRoid: rRoid,
			aRoid: Math.random() * Math.PI * 2,
			vertRoid: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
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
		var rAst = roids[index].rRoid;

		if (rAst == Math.ceil(ROIDS_SIZE / 2)) {
			roids.push(newAsteroid(xAst,yAst,Math.ceil(ROIDS_SIZE / 4)));
			roids.push(newAsteroid(xAst,yAst,Math.ceil(ROIDS_SIZE / 4)));
		}
		else if(rAst == Math.ceil(ROIDS_SIZE / 4)) {
			roids.push(newAsteroid(xAst,yAst,Math.ceil(ROIDS_SIZE / 8)));
			roids.push(newAsteroid(xAst,yAst,Math.ceil(ROIDS_SIZE / 8)));
		}
		roids.splice(index,1);

		if (roids.length == 0) {
			level++;
			newLevel();
		}

	}

	function drawAsteroids() {
		var xRoid,yRoid,rRoid,aRoid,vertRoid, offsRoid;
		for (var i = 0; i < roids.length; i++) {
			context.strokeStyle = "slategrey";
			context.lineWidth = SHIP_SIZE / 20;
			xRoid = roids[i].xRoid;
			yRoid = roids[i].yRoid;
			rRoid = roids[i].rRoid;
			aRoid = roids[i].aRoid;
			vertRoid = roids[i].vertRoid;
			offsRoid = roids[i].offsRoid;
			//draw a path
			context.beginPath();
			context.moveTo(
				xRoid + rRoid * offsRoid[0] * Math.cos(aRoid),
				yRoid + rRoid * offsRoid[0] * Math.sin(aRoid)
				);
			//draw polygon
			for (var j = 1; j < vertRoid; j++) {
				context.lineTo(
					xRoid + rRoid * offsRoid[j] * Math.cos(aRoid + j * Math.PI * 2 / vertRoid),
					yRoid + rRoid * offsRoid[j] * Math.sin(aRoid + j * Math.PI * 2 / vertRoid)
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
					ship.radius * 1.75,
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
					ship.radius * 1.5,
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
					ship.radius * 1.25,
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
			ship.xCoordinate - ship.radius * (2 / 3 * Math.cos(ship.angle) + 0.5 * Math.sin(ship.angle)),
			ship.yCoordinate + ship.radius * (2 / 3 * Math.sin(ship.angle) - 0.5 * Math.cos(ship.angle))
			);
		var rearCenter = context.lineTo(
			ship.xCoordinate - ship.radius * (6 / 3 * Math.cos(ship.angle)),
			ship.yCoordinate + ship.radius * (6 / 3 * Math.sin(ship.angle))
			);
		var rearRight = context.lineTo(
			ship.xCoordinate - ship.radius * (2 / 3 * Math.cos(ship.angle) - 0.5 * Math.sin(ship.angle)),
			ship.yCoordinate + ship.radius * (2 / 3 * Math.sin(ship.angle) + 0.5 * Math.cos(ship.angle))
			);
		context.closePath();
		context.fill();
		context.stroke();
	}

	function drawCenterDot() {
		if (!ship.dead) {
		context.fillStyle = getRandomColor();
		context.fillRect(ship.xCoordinate - 1, ship.yCoordinate - 1,2,2);
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
			ship.xCoordinate,
			ship.yCoordinate,
			ship.radius *1.5,
			0,
			Math.PI * 2,
			false);
		context.fill();
		context.stroke();
		ship.thrusting = false;
		context.fillStyle = "darkred";
		context.fill();
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
					ship.xCoordinate,
					ship.yCoordinate,
					roids[i].xRoid,
					roids[i].yRoid) < ship.radius + roids[i].rRoid) {
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
		if (ship.xCoordinate < 0 - ship.radius) {
			ship.xCoordinate = canvas.width + ship.radius;
		}
		else if (ship.xCoordinate > canvas.width + ship.radius) {
			ship.xCoordinate = 0 - ship.radius;
		}

		if (ship.yCoordinate < 0 - ship.radius) {
			ship.yCoordinate = canvas.height + ship.radius;
		}
		else if (ship.yCoordinate > canvas.height + ship.radius) {
			ship.yCoordinate = 0 - ship.radius;
		}
	}

	function handleEdgeAreaForAsteroids() {
		for (var i = 0; i < roids.length; i++) {
			if (roids[i].xRoid < 0 - roids[i].rRoid) {
				roids[i].xRoid = canvas.width + roids[i].rRoid;
			}
			else if(roids[i].xRoid > canvas.width + roids[i].rRoid) {
				roids[i].xRoid = 0 - roids[i].rRoid;
			}
			if (roids[i].yRoid < 0 - roids[i].radius) {
				roids[i].yRoid = canvas.height + roids[i].rRoid;
			}				
			else if(roids[i].yRoid > canvas.height + roids[i].rRoid) {
				roids[i].yRoid = 0 - roids[i].rRoid;
			}

		}
	}

	function handleEdgeAreaForLasers() {
		for (var i = ship.lasers.length - 1; i >= 0; i--) {
			// handle edge of screen
			if (ship.lasers[i].xLaser < 0 ) {
						ship.lasers[i].xLaser = canvas.width;
			}
			else if(ship.lasers[i].xLaser > canvas.width) {
				ship.lasers[i].xLaser = 0;
			}

			if (ship.lasers[i].yLaser < 0 ) {
				ship.lasers[i].yLaser = canvas.height;
			}
			else if(ship.lasers[i].yLaser > canvas.height) {
				ship.lasers[i].yLaser = 0;
			}
		}
	}

	function rotateShip() {
		ship.angle += ship.rotation;
	}

	function moveShip() {
		ship.xCoordinate += ship.thrust.xCoordinateTrust;
		ship.yCoordinate += ship.thrust.yCoordinateTrust;
	}

	function moveAsteroid() {
		for (var i = 0; i < roids.length; i++) {
			roids[i].xRoid += roids[i].xSpeedRoid;
			roids[i].yRoid += roids[i].ySpeedRoid;
		}
	}

	function thrustShip() {
		if (ship.thrusting && !ship.dead) {
			ship.thrust.xCoordinateTrust += SHIP_THRUST * Math.cos(ship.angle) / FPS;
			ship.thrust.yCoordinateTrust -= SHIP_THRUST * Math.sin(ship.angle) / FPS;
			drawThruster();
		} 
		else {
			ship.thrust.xCoordinateTrust -= FRICTION * ship.thrust.xCoordinateTrust / FPS;
			ship.thrust.yCoordinateTrust -= FRICTION * ship.thrust.yCoordinateTrust / FPS;
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
				xLaser:ship.xCoordinate + 4 / 3 * ship.radius * Math.cos(ship.angle),
				yLaser:ship.yCoordinate - 4 / 3 * ship.radius * Math.sin(ship.angle),
				xSpeedLaser:LASER_SPEED * Math.cos(ship.angle) / FPS,
				ySpeedLaser: -LASER_SPEED * Math.sin(ship.angle) / FPS,
				distance: 0,
				explodeTime:0
			});
		}
		ship.canShoot = false;
	}

	function detectLaserHitOnAsteroid() {
		var asteroidX,asteroidY,asteroidRadius,laserX,laserY;
		for (var i = roids.length - 1; i >= 0; i--) {
			asteroidX = roids[i].xRoid;
			asteroidY = roids[i].yRoid;
			asteroidRadius = roids[i].rRoid;

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

	setInterval(update, 1000 / FPS);
});