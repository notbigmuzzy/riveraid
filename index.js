$(document).ready(function(){

	//START GAME
	var $body = $('body'),interval,
		screenWidth = $body.attr('data-width'),
		screenHeight = $body.attr('data-height'),
		pixelSize = $body.attr('data-pxsize'),
		difficulty = $body.attr('data-diff'),
		gameScreen = $('game-screen'),
		gameSpeed = $body.attr('data-spid');
	setupGamingScreen(screenWidth,screenHeight,gameScreen)
	philScreen(screenWidth,screenHeight,pixelSize,difficulty,gameScreen);
	setupPlayer();

	//GENERATE SCREEN
	function setupGamingScreen(screenWidth,screenHeight,gameScreen) {
		gameScreen.css('width',screenWidth).css('height',screenHeight)
	}

	//ROW OF PIXELS PHILES IT
	function generatePixel(thisRow,pixelIndex,pixelSize,pixelType) {
		var whichPixel = '';

		if (pixelType == 'grass') {
			whichPixel = '<grass-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></grass-pixel>';
		} else if (pixelType == 'forest') {
			whichPixel = '<forest-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><i></i><i></i><i></i><i></i></forest-pixel>';
		} else if (pixelType == 'river') {
			whichPixel = '<river-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></river-pixel>';
		} else if (pixelType == 'coastleft') {
			whichPixel = '<coast-pixel class="left" id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></coast-pixel>';
		} else if (pixelType == 'coastright') {
			whichPixel = '<coast-pixel class="right" id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></coast-pixel>';
		} else if (pixelType == 'enemy') {
			whichPixel = '<enemy-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></enemy-pixel>';
		}

		thisRow.append(whichPixel)
	}

	function philRow(numberOfPixelsW,rowIndex,pixelSize,difficulty,gameScreen) {
		gameScreen.append('<screen-row style="height:' + pixelSize + 'px" id="row' + rowIndex + '"></screen-row');

		var thisRow = $('#row' + rowIndex),
			getDiff = setDifficulty(pixelSize,difficulty);
			howMuchGrass = getRandomInt(getDiff.from,getDiff.to),
			leftGrass = Math.floor(howMuchGrass / 2),
			leftGrassStart = 0,
			riverWidth = numberOfPixelsW - howMuchGrass,
			riverStart = leftGrassStart + leftGrass,
			rightGrass = howMuchGrass - leftGrass,
			rightGrassStart = riverStart + riverWidth,
			willRowContainEnemy = getRandomInt(0,4),
			willRowContainForest = getRandomInt(0,2);

		for (let j = 0; j < numberOfPixelsW; j++) {
			switch (true) {
				case (j >= leftGrassStart && j < riverStart):
					if (willRowContainForest == getRandomInt(0,2) && j == leftGrassStart + getRandomInt(Math.floor(numberOfPixelsW/5),leftGrassStart + riverStart - Math.floor(numberOfPixelsW/5))) {
						generatePixel(thisRow, j, pixelSize, 'forest');
					} else {
						generatePixel(thisRow, j, pixelSize, 'grass');
					}
					break;
				case (j >= riverStart && j < rightGrassStart):
					if (j == riverStart) {
						generatePixel(thisRow, j, pixelSize, 'coastleft');
						break;
					} else if (j == rightGrassStart - 1) {
						generatePixel(thisRow, j, pixelSize, 'coastright');
						break;
					} else {
						if (willRowContainEnemy == getRandomInt(0,4) && j == riverStart + getRandomInt(Math.floor(numberOfPixelsW/5),riverWidth - Math.floor(numberOfPixelsW/5))) {
							generatePixel(thisRow, j, pixelSize, 'enemy');
						} else {
							generatePixel(thisRow, j, pixelSize, 'river');
						}
						break;
					}
					
				case (j >= rightGrassStart && j < numberOfPixelsW):
					if (willRowContainForest == getRandomInt(0,2) && j == rightGrassStart + getRandomInt(Math.floor(numberOfPixelsW/5),numberOfPixelsW - rightGrassStart - Math.floor(numberOfPixelsW/5))) {
						generatePixel(thisRow, j, pixelSize, 'forest');
					} else {
						generatePixel(thisRow, j, pixelSize, 'grass');
					}

					break;
			}
		}
	}

	function philScreen(screenWidth,screenHeight,pixelSize,difficulty,gameScreen) {
		var numberOfPixelsW = screenWidth / pixelSize,
			numberOfPixelsH = screenHeight / pixelSize;

		for (let rowIndex = 0; rowIndex < numberOfPixelsH; rowIndex++) {
			philRow(numberOfPixelsW, rowIndex, pixelSize,difficulty,gameScreen)
		}
	}

	//SCROLL SCREEN
	function scrollScreen(startMoment,gameSpeed) {
		var timeDiff = Math.floor((Date.now() - startMoment)/gameSpeed),
			numberOfPixelsW = screenWidth / pixelSize,
			numberOfPixelsH = screenHeight / pixelSize,
			rowIndex = numberOfPixelsH + Number(timeDiff);

		philRow(numberOfPixelsW,rowIndex,pixelSize,difficulty,gameScreen)
	}

	function sanitizeRowsAfterScroll() {
		$('screen-row').first().css('height','0');

		setTimeout(function() {
			$('screen-row').first().remove();
		},240)
	}

	function scrollPlayer() {
		var playerPixel = $('player-pixel'),
			playerCurrentPixelID = playerPixel.parent().attr('id'),
			playerCurrentRow = playerPixel.parents('screen-row'),
			playerNextRow = playerCurrentRow.next(),
			playerNextPixel = playerNextRow.find('#' + playerCurrentPixelID);

		playerPixel.parent('river-pixel').addClass('plane-was-here');
		playerPixel.detach().appendTo(playerNextPixel)
	}

	//SETUP PLAYER
	function setupPlayer() {
		var initialRow = $('#row1'),
			middlePixel = initialRow.find('*').length / 2 - 1,
			initialPixel = initialRow.find('#pixel' + middlePixel);

		initialPixel.append('<player-pixel style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><i class="body"></i><i class="wings"></i></player-pixel>')
	}

	//CONTROL PLAYER
	function fire() {
		if ($('fire-pixel').length < 3) {
			var firePixel = $('<fire-pixel id="' + Date.now() + '"></fire-pixel>'),
				playerPixel = $('player-pixel'),
				playerCurrentPixelID = playerPixel.parent().attr('id'),
				playerCurrentRow = playerPixel.parents('screen-row'),
				playerNextRow = playerCurrentRow.next(),
				playerNextPixel = playerNextRow.find('#' + playerCurrentPixelID);

			playerNextPixel.append(firePixel);
		}
	}

	function scrollFire() {
		var firePixel = $('fire-pixel');

		firePixel.each(function() {
			var eachFirePixel = $(this),
				fireCurrentPixelID = eachFirePixel.parent().attr('id'),
				fireCurrentRow = eachFirePixel.parents('screen-row'),
				fireNextRow = fireCurrentRow.next(),
				fireNextPixel = fireNextRow.find('#' + fireCurrentPixelID),
				containingPixel = eachFirePixel.parent('river-pixel'),
				hitEnemy = eachFirePixel.parent('enemy-pixel');
			eachFirePixel.detach().appendTo(fireNextPixel);

			if (hitEnemy.length) {
				if(!hitEnemy.hasClass('zeds-dead')) {
					eachFirePixel.remove();	
				}
				hitEnemy.addClass('zeds-dead')
			} else if (!fireNextRow.length || !containingPixel.length) {
				eachFirePixel.remove();
			}
		})
	}

	function stearLeft() {
		var playerPixel = $('player-pixel'),
			playerCurrentPixelID = playerPixel.parent().attr('id'),
			playerCurrentIDNum = playerCurrentPixelID.substring(5)
			playerCurrentRow = playerPixel.parents('screen-row'),
			playerNextPixel = playerCurrentRow.find('#pixel' + (Number(playerCurrentIDNum) - 1));

		if (playerNextPixel.length) {
			playerPixel.detach().appendTo(playerNextPixel);	
		}

		playerCrashCheck(interval);
	}

	function stearRight() {
		var playerPixel = $('player-pixel'),
			playerCurrentPixelID = playerPixel.parent().attr('id'),
			playerCurrentIDNum = playerCurrentPixelID.substring(5)
			playerCurrentRow = playerPixel.parents('screen-row'),
			playerNextPixel = playerCurrentRow.find('#pixel' + (Number(playerCurrentIDNum) + 1));

		if (playerNextPixel.length) {
			playerPixel.detach().appendTo(playerNextPixel)
		}

		playerCrashCheck(interval);
	}

	//COLLISION DETECTION
	function playerCrashCheck(interval) {
		var playerPixel = $('player-pixel'),
			containingPixel = playerPixel.parent('river-pixel');

		if (playerPixel.parent().hasClass('zeds-dead')) {
			return;
		} else if (!containingPixel.length) {
			gameEnded(interval);
			crashMessage();
		}
	}

	//GAMEND
	function gameEnded(interval) {
		clearInterval(interval);
		interval = null;
		$('game-screen').css('opacity','0.25');
		$body.attr('data-gameended','yes');
	}

	function crashMessage() {
		$('body').addClass('end-message crashed')
	}

	//KEYBOARD CONTROLS
	document.addEventListener('keydown', function(e) {
		var isStarted = $body.attr('data-gamestarted'),
			isEnded = $body.attr('data-gameended');
		switch (event.keyCode) {
		case 32: //SPACEBAR
			e.preventDefault();
			if (isStarted == "no" && isEnded == "no") {
				initTimingStuff(gameSpeed)
				$body.attr('data-gamestarted','yes');
			} else if (isStarted == "yes" && isEnded == "no") {
				fire();
			}
			break;
		case 37: // LEFT ARROW
			e.preventDefault();
			if (isStarted == "yes" && isEnded == "no") {
				stearLeft();
			}
			break;
		case 39: // RIGHT ARROW
			e.preventDefault();
			if (isStarted == "yes" && isEnded == "no") {
				stearRight();
			}
			break;
		case 13: //ENTER AFTER END TO START NEW
			e.preventDefault()
			if (isStarted == "yes" && isEnded == "yes") {
				location.reload();
			}
			break;
		}
	});

	//HELPER FUNCT
	function getRandomInt(min,max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min);
	}

	function setDifficulty(pixelSize, difficulty) {
		var from = 0,
			to = 0;

		switch(difficulty) {
			case "hard":
				from = Math.ceil(pixelSize / 1.25);
				to = from + 3;
				break;
			case "normal":
				from = Math.ceil(pixelSize / 1.75);
				to = from + 4;
				break;
			case "easy":
				from = Math.ceil(pixelSize / 2.5);
				to = from + 5;
				break;
			case "journo":
				from = Math.ceil(pixelSize / 5);
				to = from + 3;
				break;
			default:
				console.log('123')
				from = Math.ceil(pixelSize / 1.75);
				to = from + 4;
				break;
		}

		return {from,to};
	}

	function initTimingStuff(gameSpeed, started) {
		var	startMoment = Date.now();

		interval = setInterval(function() {
			//SCROLL SCREEN
			scrollScreen(startMoment,gameSpeed);
			sanitizeRowsAfterScroll();
			// //SCROLL PLAYER
			scrollPlayer();
			playerCrashCheck(interval);
			//SCROLL FIRE
			scrollFire();
			scrollFire();
			scrollFire();
		}, gameSpeed);
	}
});