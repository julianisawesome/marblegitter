var canvas = document.getElementById('gameCanvas');
var tools = canvas.getContext('2d');

canvas.width = document.body.offsetWidth;
canvas.height = document.body.offsetHeight;

var player1xaxis = 0;
var player1yaxis = 0;

var player2xaxis = 0;
var player2yaxis = 0;

var player1score = 0;
var player2score = 0;

var player1status = null;
var player2status = null;

// var speedBoosters = false;
var activePowerup = null;
var activePowerup2 = null;

var gameObjects = [];
function GameObject(x, y, w, h, img) {
	var me = this;
	me.acceleration = 0.01;
	me.type = false;

	me.position = new Vector2D(x, y);
	me.dimensions = new Vector2D(w, h);
	me.velocity = new Vector2D();

	if(img) {
		var imageObj = new Image();
		imageObj.src = img;
		me.imgObj = imageObj;
	} else {
		me.imgObj = false;
	}

	me.color = false;

	me.removeFromGame = function() {
		gameObjects.splice(gameObjects.indexOf(me), 1);
	}

	gameObjects.push(me);
}

function Vector2D(x, y) {
	if(x == null) {
		x = 0;
	}

	if(y == null) {
		y = 0;
	}

	var me = this;
	me.x = x;
	me.y = y;

	me.add = function(vector) {
		var newVector = new Vector2D();
		newVector.x = me.x + vector.x;
		newVector.y = me.y + vector.y;
		return newVector;
	}

	me.subtract = function(vector) {
		var newVector = new Vector2D();
		newVector.x = me.x - vector.x;
		newVector.y = me.y - vector.y;
		return newVector;
	}

	me.getMagnitude = function() {
		return Math.sqrt(me.x * me.x + me.y * me.y);
	}

	me.normalize = function() {
		var magnitude = me.getMagnitude();
		
		if(magnitude != 0) {
			me.x /= magnitude;
			me.y /= magnitude;
		}
		// return new Vector2D(me.x / magnitude, me.y / magnitude);
	}

	me.scale = function(amount) {
		me.x *= amount;
		me.y *= amount;
	}
}

function checkCollision(object1, object2) {
	var object1Width = object1.dimensions.x;
	var object1Height = object1.dimensions.y;

	var veryLeft1 = object1.position.x;
	var veryLeft2 = object2.position.x;
	var veryTop1 = object1.position.y;
	var veryTop2 = object2.position.y;
	var veryRight1 = object1.position.x + object1.dimensions.x;
	var veryRight2 = object2.position.x + object2.dimensions.x;
	var veryBottom1 = object1.position.y - object1.dimensions.y;
	var veryBottom2 = object2.position.y - object2.dimensions.y;

	// console.log([veryLeft1, veryTop1])
	// console.log([veryLeft2, veryTop2, veryRight2, veryBottom2])

	if(veryRight1 < veryLeft2) {
		// NO COLLISION! ACTUALLY MAYYYYY no.
		return false;
	}

	if(veryBottom1 > veryTop2) {
		// STILL NO COLLISION OOOOOOHH YEAHHHHH!!!!
		return false;
	}

	if(veryLeft1 > veryRight2) {
		// THERES A GAP ARRRR IM A PIRATE
		return false;
	}

	if(veryTop1 < veryBottom2) {
		// GAP!!!! NO COLLISION
		return false;
	}

	return true;
}

var player = new GameObject(0, 0, 25, 25);
player.color = 'red';
var player2 = new GameObject(100, 0, 25, 25);
player2.color = 'blue';
var finishline = new GameObject(Math.random() * 501, -Math.random() * 400, 10, 10, 'images/finishline.png');
finishline.type = 'finishline';

newPowerup();
function newPowerup() {
	var block = new GameObject(Math.random() * 500, -Math.random() * 500, 100, 100, 'images/block.png');
	block.type = 'powerupBlock';
	setTimeout(newPowerup, 20000);
}

function update() {
	tools.clearRect(0, 0, document.body.offsetWidth, document.body.offsetHeight);

	if(player1status == 'mindControlled') {
		player.velocity.x += player.acceleration * player2xaxis;
		player.velocity.y += player.acceleration * player2yaxis;
	} else {
		player.velocity.x += player.acceleration * player1xaxis;
		player.velocity.y += player.acceleration * player1yaxis;
	}


	if(player2status == 'mindControlled') {
		player2.velocity.x += player2.acceleration * player1xaxis;
		player2.velocity.y += player2.acceleration * player1yaxis;
	} else {
		player2.velocity.x += player2.acceleration * player2xaxis;
		player2.velocity.y += player2.acceleration * player2yaxis;
	}

	if(activePowerup != false) {
		var image = new Image();

		if(activePowerup == 'speedBoost') {
			image.src = 'images/speed.png';
		} else if(activePowerup == 'invincibility') {
			image.src = 'images/Invince.png';
		}

		tools.drawImage(image, 0,0,25,25);
	}

	for(var goIndex = 0; goIndex < gameObjects.length; goIndex++) {
		var gameObject = gameObjects[goIndex];

		gameObject.position = gameObject.position.add(gameObject.velocity);

		var screenWidth = document.body.offsetWidth;
		var screenHeight = document.body.offsetHeight;
		if(gameObject.position.x < 0 && gameObject.velocity.x < 0) {
			gameObject.velocity.x *= -1;
		}

		if(gameObject.position.x > screenWidth && gameObject.velocity.x > 0) {
			gameObject.velocity.x *= -1;
		}

		if(gameObject.position.y < -screenHeight && gameObject.velocity.y < 0) {
			gameObject.velocity.y *= -1;
		}

		if(gameObject.position.y > 0 && gameObject.velocity.y > 0) {
			gameObject.velocity.y *= -1;
		}

		tools.fillStyle = gameObject.color;
		tools.fillRect(gameObject.position.x, -gameObject.position.y, gameObject.dimensions.x, gameObject.dimensions.y);

		for(var colliderIndex = 0; colliderIndex < gameObjects.length; colliderIndex++){
			var colliderObject = gameObjects[colliderIndex];

			if(colliderObject == gameObject) {
				continue;
			}

			if(checkCollision(gameObject, colliderObject)) {
				if(colliderObject.type == 'finishline') {
					if(gameObject == player) {
						player1score += 1;
						if(player1score >= 10) {
							var windiv = document.getElementById('player1wins');
							windiv.style.display = 'block';
						}

						colliderObject.position.x = Math.random() * 1000;
						colliderObject.position.y = Math.random() * -750;
					}

					if(gameObject == player2) {
						player2score += 1;
						if(player2score >= 10) {
							var windiv = document.getElementById('player2wins');
							windiv.style.display = 'block';
						}

						colliderObject.position.x = Math.random() * 1000;
						colliderObject.position.y = Math.random() * -750;
					}
				}

				if(colliderObject.type == 'powerupBlock') {
					// random powerup time woo hoo!!!!!!!!!!!!!!!!!!!!!!!!!
					colliderObject.removeFromGame();

					if(Math.random() > 0.50000000000000001) {
						// powerup a
						// speedBoosters = true;
						activePowerup = 'speedBoost';
					} else {
						// powerup b
						activePowerup = "mindControl";
					}
				}
			}
		}

		tools.fillText(player1score, 0, 20);
		tools.fillText(player2score, 100, 20);

		if(gameObject.imgObj) {
			tools.drawImage(gameObject.imgObj, gameObject.position.x, -gameObject.position.y, gameObject.dimensions.x, gameObject.dimensions.y);
		}

		if(gameObject != player) {
			if(checkCollision(gameObject, player)) {
			}
		}
	}

	setTimeout(update, 10);
}

update();

window.addEventListener('keydown', function(event) {
	if(event.keyCode == 87) { // w
		player1yaxis = 1;
	}

	if(event.keyCode == 65) { // as
		player1xaxis = -1;
	}

	if(event.keyCode == 83) { // s
		player1yaxis = -1;
	}

	if(event.keyCode == 68) { // d
		player1xaxis = 1;
	}

	if(event.keyCode == 37) { // left arrow
		player2xaxis = -1;          
	}
	if(event.keyCode == 39) { // right arrow
		player2xaxis = 1;
	}
	if(event.keyCode == 38) { // up arrow 
		player2yaxis = 1;
	}
	if(event.keyCode == 40) { // down arrow
		player2yaxis = -1;
	}
	if(event.keyCode == 69) { // e
		// USES THE POWERUP
		if(activePowerup == 'speedBoost') {
			// player.acceleration += 2;
			var normalizedDirection = player.velocity.normalize();
			player.velocity = player.velocity.add(normalizedDirection);
			activePowerup = false;
		} else if (activePowerup == 'mindControl') {
			player2.color = 'purple';
			player2status = 'mindControlled';
			setTimeout(function(){
				player2.color = 'blue';
				player2status = null;
			}, 10000);
		}
	}

	if (event.keyCode == 191) { ///
		if(activePowerup2 == 'speedBoost') {
			// player.acceleration += 2;
			var normalizedDirection = player2.velocity.normalize();
			player2.velocity = player2.velocity.add(normalizedDirection);
			activePowerup2 = null;
		} else if(activePowerup2 == 'mindControl') {
			player.color = 'purple';
			player1status = 'mindControlled';
			setTimeout(function() {
				player.color = 'red';
				player1status = null
			}, 10000);
		}

	}
});

window.addEventListener('keyup', function(event) {
	if(event.keyCode == 87) { // w
		player1yaxis = 0;
	}

	if(event.keyCode == 65) { // as
		player1xaxis = 0;
	}

	if(event.keyCode == 83) { // s
		player1yaxis = 0;
	}

	if(event.keyCode == 68) { // d
		player1xaxis = 0; 
	}

	if(event.keyCode == 37) { // left arrow
		player2xaxis = 0;          
	}
	if(event.keyCode == 39) { // right arrow
		player2xaxis = 0;
	}
	if(event.keyCode == 38) { // up arrow 
		player2yaxis = 0;
	}
	if(event.keyCode == 40) { // down arrow
		player2yaxis = 0;
	}
});
