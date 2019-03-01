jQuery('document').ready(function() {
	const FPS = 25;
	const SHIP_SIZE = 35;
	const SHIP_DURATION = 0.3;
	const SHIP_INV_DURATION = 3;
	const SHIP_BLINK_DURATION = 0.1;
	const ROIDS_SUM = 7;
	const ROIDS_JAG = 0.4;
	const ROIDS_SIZE = 50;
	const ROIDS_SPEED = 50;
	const ROIDS_VERT = 10;
	const TURN_SPEED = 189;
	const FRICTION = 0.4;
	const SHIP_THRUST = 1.5;
	const LASER_MAX = 10;
	const LASER_SPEED = 500;
	const LEFT_ARROW = 37;
	const RIGHT_ARROW = 38;
	const UP_ARROW = 39;
	const SPACEBAR = 32;

	var canvas = document.getElementById("gameCanvas");
	var context = canvas.getContext("2d");
	var ship = newShip();
	var roids = [];
	createAsteroids();
	var exploding = false;

	function update() {
		drawSpace();
		drawShip();
		drawAsteroids();
		drawCenterDot();
		drawLazers();
		checkCollisions();
		rotateShip();
		moveShip();
		moveLasers();
		thrustShip();
		handleEdgeArea();
	}

	function drawSpace() {
		context.fillStyle = "black";
		context.fillRect(0,0, canvas.width, canvas.height);
	}

	function createAsteroids() {
		roids = [];
		var xCoordinateRoid,yCoordinateRoid;
		for (var i = 0; i < ROIDS_SUM; i++) {
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
				roids.push(newAsteroid(xCoordinateRoid,yCoordinateRoid));
		}
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
			lasers: [],
			rotation: 0,
			thrusting: false,
			thrust: {
				xCoordinateTrust:0,
				yCoordinateTrust:0
			}
		}
	}

	function newAsteroid(xRoid,yRoid) {
		var roid = {
			xRoid:xRoid,
			yRoid:yRoid,
			xSpeedRoid: Math.random() * ROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1: -1),
			ySpeedRoid: Math.random() * ROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1: -1),
			rRoid: ROIDS_SIZE / 2,
			aRoid: Math.random() * Math.PI * 2,
			vertRoid: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
			offsRoid: []
		};

		for (var i = 0; i < roid.vertRoid; i++) {
			roid.offsRoid.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
		}

		return roid;
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

	function drawShip() {
		if (ship.rotation == 0) {
			context.strokeStyle = "red";	
		} else {
			context.strokeStyle = "yellow";
		}

		if (ship.thrusting) {
			context.strokeStyle = "green";
		}
		drawShape();
		moveAsteroid();

	}


	function drawShape() {
		context.lineWidth = SHIP_SIZE / 20;
		context.beginPath();
		var noseShip = context.moveTo(
			ship.xCoordinate + 4 / 3 * ship.radius * Math.cos(ship.angle),
			ship.yCoordinate - 4 / 3 * ship.radius * Math.sin(ship.angle)
			);
		var rearLeft = context.lineTo(
			ship.xCoordinate - ship.radius * (2 / 3 *Math.cos(ship.angle) + Math.sin(ship.angle)),
			ship.yCoordinate + ship.radius * (2 / 3 *Math.sin(ship.angle) - Math.cos(ship.angle))
			);
		var rearRight = context.lineTo(
			ship.xCoordinate - ship.radius * (2 / 3 *Math.cos(ship.angle) - Math.sin(ship.angle)),
			ship.yCoordinate + ship.radius * (2 / 3 *Math.sin(ship.angle) + Math.cos(ship.angle))
			);
		context.closePath();
		context.stroke();
		

	}

	function drawLazers() {
		for (var i = 0; i < ship.lasers.length; i++) {
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
			ship.xCoordinate - ship.radius * (6 / 3 *Math.cos(ship.angle)),
			ship.yCoordinate + ship.radius * (6 / 3 *Math.sin(ship.angle))
			);
		var rearRight = context.lineTo(
			ship.xCoordinate - ship.radius * (2 / 3 *Math.cos(ship.angle) - 0.5 * Math.sin(ship.angle)),
			ship.yCoordinate + ship.radius * (2 / 3 *Math.sin(ship.angle) + 0.5 * Math.cos(ship.angle))
			);
		context.closePath();
		context.fill();
		context.stroke();
	}

	function drawCenterDot() {
		context.fillStyle = getRandomColor();
		context.fillRect(ship.xCoordinate - 1, ship.yCoordinate - 1,2,2);
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
		ship.xCoordinate = canvas.width / 2;
		ship.yCoordinate = canvas.height / 2;
		ship.thrusting = false;
		exploding = false;
		context.fillStyle = getRandomColor();
		context.fill();
	}

	function checkCollisions() {
		for (var i = 0; i < roids.length; i++) {
			if (distBetweenPoints(
				ship.xCoordinate,
				ship.yCoordinate,
				roids[i].xRoid,
				roids[i].yRoid) < ship.radius + roids[i].rRoid) {
				explodeShip();
			}
		}
	}

	function handleEdgeArea() {
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

	function rotateShip() {
		ship.angle += ship.rotation;
	}

	function moveShip() {
		ship.xCoordinate += ship.thrust.xCoordinateTrust
		ship.yCoordinate += ship.thrust.yCoordinateTrust
	}

	function thrustShip() {
		if (ship.thrusting) {
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
		for (var i = 0; i < ship.lasers.length; i++) {
			ship.lasers[i].xLaser += ship.lasers[i].xSpeedLaser;
			ship.lasers[i].yLaser += ship.lasers[i].ySpeedLaser;
		}
	}

	function shootLaser() {
		if (ship.canShoot && ship.lasers.length < LASER_MAX) {
			ship.lasers.push({
				xLaser:ship.xCoordinate + 4 / 3 * ship.radius * Math.cos(ship.angle),
				yLaser:ship.yCoordinate - 4 / 3 * ship.radius * Math.sin(ship.angle),
				xSpeedLaser:LASER_SPEED * Math.cos(ship.angle) / FPS,
				ySpeedLaser: -LASER_SPEED * Math.sin(ship.angle) / FPS
			});
		}
		ship.canShoot = false;
		console.log(ship.lasers);
	}

	function moveAsteroid() {
		for (var i = 0; i < roids.length; i++) {
			//move the asteroid
			roids[i].xRoid += roids[i].xSpeedRoid;
			roids[i].yRoid += roids[i].ySpeedRoid;

				// handle edge of screen
				if (roids[i].xRoid < 0 - roids[i].rRoid) {
					roids[i].xRoid = canvas.width + roids[i].rRoid
				}
				else if(roids[i].xRoid > canvas.width + roids[i].rRoid) {
					roids[i].xRoid = 0 - roids[i].rRoid
				}

				if (roids[i].yRoid < 0 - roids[i].radius) {
					roids[i].yRoid = canvas.height + roids[i].rRoid
				}
				else if(roids[i].yRoid > canvas.height + roids[i].rRoid) {
					roids[i].yRoid = 0 - roids[i].rRoid
				}
			}
		}

	document.addEventListener("keydown",keyPressed);
	document.addEventListener("keyup",keyReleased);

	function keyPressed(ev) { // pressed
		switch(ev.keyCode) {
			case SPACEBAR:
			shootLaser();
			break;
			case LEFT_ARROW: 
			ship.rotation = TURN_SPEED / 100 * Math.PI / FPS
			break;
			case RIGHT_ARROW:
			ship.thrusting = true;
			break;
			case UP_ARROW:
			ship.rotation = -TURN_SPEED / 100 * Math.PI / FPS
			break;
		}
	}

	function keyReleased(ev) { // released
		switch(ev.keyCode) {
			case SPACEBAR:
			ship.canShoot = true;
			break;
			case LEFT_ARROW: 
			ship.rotation = 0
			break;
			case RIGHT_ARROW:
			ship.thrusting = false;
			break;
			case UP_ARROW:
			ship.rotation = 0
			break;
		}
	}

	setInterval(update, 1000 / FPS);
});