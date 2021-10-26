$(document).ready(function(){

	//START GAME
	var $body = $('body'),interval,
		screenWidth = $body.attr('data-width'),
		screenHeight = $body.attr('data-height'),
		pixelSize = $body.attr('data-pxsize'),
		playWidth = $body.attr('data-playwidth'),
		gameScreen = $('game-screen'),
		gameSpeed = $body.attr('data-spid');
		score = 0;
	setupGamingScreen(screenWidth,screenHeight,gameScreen)
	philScreen(screenWidth,screenHeight,pixelSize,playWidth,gameScreen);
	setupPlayer();

	//GENERATE SCREEN
	function setupGamingScreen(screenWidth,screenHeight,gameScreen) {
		gameScreen.css('width',screenWidth).css('height',screenHeight)
	}

	//ROW OF PIXELS PHILES IT
	function generatePixel(thisRow,pixelIndex,pixelSize,pixelType) {
		var whichPixel = '';
			enemyDirection = getRandomIntIncInc(0,1),
			whichGraph = getRandomIntIncInc(1,3);

		if (pixelType == 'grass') {
			whichPixel = '<grass-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></grass-pixel>';
		} else if (pixelType == 'forest') {
			whichPixel = '<forest-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><img src="graphics/forest-' + whichGraph + '.svg" /></forest-pixel>';
		} else if (pixelType == 'mountain') {
			whichPixel = '<mountain-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><img src="graphics/mountain-' + whichGraph + '.svg" /></mountain-pixel>';
		} else if (pixelType == 'river') {
			whichPixel = '<river-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></river-pixel>';
		} else if (pixelType == 'coastleft') {
			whichPixel = '<coast-pixel class="left" id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></coast-pixel>';
		} else if (pixelType == 'coastright') {
			whichPixel = '<coast-pixel class="right" id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></coast-pixel>';
		} else if (pixelType == 'enemy-boat') {
			whichPixel = '<river-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><enemy-pixel class="boat"><img src="graphics/boat.svg" /></enemy-pixel></river-pixel>';
		} else if (pixelType == 'enemy-chopper') {
			whichPixel = '<river-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><enemy-pixel data-direction="' + enemyDirection + '-direction" class="chopper"><img src="graphics/chopper.svg" /></enemy-pixel></river-pixel>';
		} else if (pixelType == 'enemy-baloon') {
			whichPixel = '<river-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><enemy-pixel data-direction="' + enemyDirection + '-direction" data-move="no" class="baloon"><img src="graphics/ballon.svg" /></enemy-pixel></river-pixel>';
		}

		thisRow.append(whichPixel)
	}

	function philRow(numberOfPixelsW,rowIndex,pixelSize,playWidth,gameScreen) {
		gameScreen.append('<screen-row style="height:' + pixelSize + 'px" id="row' + rowIndex + '"></screen-row');
		var thisRow = $('#row' + rowIndex),
			getDiff = setplayWidth(pixelSize,playWidth);
			howMuchGrass = getRandomIntIncInc(getDiff.from,getDiff.to),
			leftGrass = Math.floor(howMuchGrass / 2),
			leftGrassStart = 0,
			riverWidth = numberOfPixelsW - howMuchGrass,
			riverStart = leftGrassStart + leftGrass,
			rightGrass = howMuchGrass - leftGrass,
			rightGrassStart = riverStart + riverWidth,
			willRowContainForest = getRandomIntIncInc(0,1),
			willRowContainForestControl = getRandomIntIncInc(0,1),
			willContaintMountain = getRandomIntIncInc(0,5),
			willContaintMountainControl = getRandomIntIncInc(0,5);
		switch (playWidth) {
		case "wide":
			var	willRowContainEnemy = getRandomIntIncExc(0,2),
				willRowContainEnemyControl = getRandomIntIncExc(0,2);
			break;
		case "normal":
			var	willRowContainEnemy = getRandomIntIncExc(0,3),
				willRowContainEnemyControl = getRandomIntIncExc(0,3);
			break;
		case "narrow":
			var	willRowContainEnemy = getRandomIntIncExc(0,4),
				willRowContainEnemyControl = getRandomIntIncExc(0,4);
			break;
		}

		for (let j = 0; j < numberOfPixelsW; j++) {
			switch (true) {
				case (j >= leftGrassStart && j < riverStart):
					if (willRowContainForest == willRowContainForestControl && j == leftGrassStart + getRandomIntIncInc(0,leftGrassStart + riverStart - 1)) {
						if (thisRow.prev().find('#pixel' + j).is('grass-pixel')) {
							generatePixel(thisRow, j, pixelSize, 'forest');
						} else {
							generatePixel(thisRow, j, pixelSize, 'grass');
						}
					} else if (willContaintMountain == willContaintMountainControl && j == leftGrassStart + getRandomIntIncInc(0,leftGrassStart + riverStart - 1)) {
						if (thisRow.prev().find('#pixel' + j).is('grass-pixel')) {
							generatePixel(thisRow, j, pixelSize, 'mountain');
						} else {
							generatePixel(thisRow, j, pixelSize, 'grass');
						}
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
						if (willRowContainEnemy == willRowContainEnemyControl && j == riverStart + getRandomIntIncInc(0,riverWidth)) {
							var whatTypeOfEnemy = getRandomIntIncInc(0,20);
							switch (true) {
							case (whatTypeOfEnemy < 10):
								generatePixel(thisRow, j, pixelSize, 'enemy-boat');
								break;
							case (whatTypeOfEnemy >= 10 && whatTypeOfEnemy <= 15):
								if(thisRow.find('.chopper').length == 0 && thisRow.find('.baloon').length == 0) {
									generatePixel(thisRow, j, pixelSize, 'enemy-chopper');
								} else {
									generatePixel(thisRow, j, pixelSize, 'enemy-boat');
								}
								break;
							case (whatTypeOfEnemy > 15):
								if(thisRow.find('.chopper').length == 0 && thisRow.find('.baloon').length == 0) {
									generatePixel(thisRow, j, pixelSize, 'enemy-baloon');
								} else {
									generatePixel(thisRow, j, pixelSize, 'enemy-boat');
								}
								break;
							}
						} else {
							generatePixel(thisRow, j, pixelSize, 'river');
						}
						break;
					}
				case (j >= rightGrassStart && j < numberOfPixelsW):
					if (willRowContainForest == getRandomIntIncInc(0,2) && j == rightGrassStart + getRandomIntIncInc(0,numberOfPixelsW - rightGrassStart)) {
						if (thisRow.prev().find('#pixel' + j).is('grass-pixel')) {
							generatePixel(thisRow, j, pixelSize, 'forest');
						} else {
							generatePixel(thisRow, j, pixelSize, 'grass');
						}
					} else if (willContaintMountain == getRandomIntIncInc(0,8) && j == rightGrassStart + getRandomIntIncInc(0,numberOfPixelsW - rightGrassStart)) {
						if (thisRow.prev().find('#pixel' + j).is('grass-pixel')) {
							generatePixel(thisRow, j, pixelSize, 'mountain');
						} else {
							generatePixel(thisRow, j, pixelSize, 'grass');
						}
					}else {
						generatePixel(thisRow, j, pixelSize, 'grass');
					}
					break;
			}
		}
	}

	function philScreen(screenWidth,screenHeight,pixelSize,playWidth,gameScreen) {
		var numberOfPixelsW = screenWidth / pixelSize,
			numberOfPixelsH = screenHeight / pixelSize;

		for (let rowIndex = 0; rowIndex < numberOfPixelsH; rowIndex++) {
			philRow(numberOfPixelsW, rowIndex, pixelSize,playWidth,gameScreen)
		}
	}

	//SCROLL SCREEN
	function scrollScreen(startMoment,gameSpeed) {
		var timeDiff = Math.floor((Date.now() - startMoment)/gameSpeed),
			numberOfPixelsW = screenWidth / pixelSize,
			numberOfPixelsH = screenHeight / pixelSize,
			rowIndex = numberOfPixelsH + Number(timeDiff);

		philRow(numberOfPixelsW,rowIndex,pixelSize,playWidth,gameScreen)
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
			middlePixel = 15,
			initialPixel = initialRow.find('#pixel' + middlePixel);

		initialPixel.append('<player-pixel style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><img src="graphics/airplane.svg"/></player-pixel>')
	}

	//CONTROL PLAYER
	function fire() {
		if ($('fire-pixel').length < 2) {
			var firePixel = $('<fire-pixel id="' + Date.now() + '"><img src="graphics/fire.svg"/></fire-pixel>'),
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
				hitEnemy = eachFirePixel.parent('river-pixel').find('enemy-pixel');
			eachFirePixel.detach().appendTo(fireNextPixel);

			if (hitEnemy.length) {
				if(!hitEnemy.hasClass('zeds-dead')) {
					eachFirePixel.remove();	
				}
				hitEnemy.addClass('zeds-dead');
				updateScore();
			} else if (!fireNextRow.length || !containingPixel.length) {
				eachFirePixel.remove();
			}
		})
	}

	function stearLeft(controlledPixel) {
		var controlledCurrentPixelID = controlledPixel.parent().attr('id'),
			controlledCurrentIDNum = controlledCurrentPixelID.substring(5)
			controlledCurrentRow = controlledPixel.parents('screen-row'),
			controlledNextPixel = controlledCurrentRow.find('#pixel' + (Number(controlledCurrentIDNum) - 1));

		if (controlledNextPixel.length) {
			controlledPixel.detach().appendTo(controlledNextPixel);	
		}

		playerCrashCheck(interval);
	}

	function stearRight(controlledPixel) {
		var controlledCurrentPixelID = controlledPixel.parent().attr('id'),
			controlledCurrentIDNum = controlledCurrentPixelID.substring(5)
			controlledCurrentRow = controlledPixel.parents('screen-row'),
			controlledNextPixel = controlledCurrentRow.find('#pixel' + (Number(controlledCurrentIDNum) + 1));

		if (controlledNextPixel.length) {
			controlledPixel.detach().appendTo(controlledNextPixel)
		}

		playerCrashCheck(interval);
	}

	//ENEMY AI
	function moveChoppers () {
		var choppers = $('.chopper').not('.zeds-dead');

		choppers.each(function() {
			var thisChopper = $(this),
				thisChopperDirection = thisChopper.data('direction'),
				thisCurrentPixelID = thisChopper.parent().attr('id'),
				thisCurrentIDNum = thisCurrentPixelID.substring(5)
				thisCurrentRow = thisChopper.parents('screen-row'),
				thisLeftPixel = thisCurrentRow.find('#pixel' + (Number(thisCurrentIDNum) - 1)),
				thisRightPixel = thisCurrentRow.find('#pixel' + (Number(thisCurrentIDNum) + 1)),
				clearToGoLeft = thisLeftPixel.is('river-pixel') && thisLeftPixel.find('enemy-pixel').not('.zeds-dead').length == 0,
				clearToGoRight = thisRightPixel.is('river-pixel') && thisRightPixel.find('enemy-pixel').not('.zeds-dead').length == 0;

			switch (thisChopperDirection) {
			case '0-direction':
				if ( clearToGoLeft ) {
					thisChopper.css('transform','scaleX(-1)');
					stearLeft(thisChopper);
					break;
				} else {
					thisChopper.css('transform','scaleX(1)');
					stearRight(thisChopper);
					thisChopper.data('direction','1-direction');
					break;
				}
			case '1-direction':
				if ( clearToGoRight ) {
					thisChopper.css('transform','scaleX(1)');
					stearRight(thisChopper);
					break;
				} else {
					thisChopper.css('transform','scaleX(-1)');
					stearLeft(thisChopper);
					thisChopper.data('direction','0-direction');
					break;
				}
			}
		})
	}

	function moveBaloon () {
		var baloons = $('.baloon').not('.zeds-dead');

		baloons.each(function() {
			var thisBaloon = $(this),
				thisBaloonDirection = thisBaloon.data('direction'),
				thisBaloonShouldMove = thisBaloon.data('move'),
				thisCurrentPixelID = thisBaloon.parent().attr('id'),
				thisCurrentIDNum = thisCurrentPixelID.substring(5)
				thisCurrentRow = thisBaloon.parents('screen-row'),
				thisLeftPixel = thisCurrentRow.find('#pixel' + (Number(thisCurrentIDNum) - 1)),
				thisRightPixel = thisCurrentRow.find('#pixel' + (Number(thisCurrentIDNum) + 1)),
				clearToGoLeft = thisLeftPixel.is('river-pixel') && thisLeftPixel.find('enemy-pixel').not('.zeds-dead').length == 0,
				clearToGoRight = thisRightPixel.is('river-pixel') && thisRightPixel.find('enemy-pixel').not('.zeds-dead').length == 0;

			switch (thisBaloonDirection) {
			case '0-direction':
				if (thisBaloonShouldMove == 'no') {
					thisBaloon.data('move', 'yes')
				} else {
					if (clearToGoLeft) {
						stearLeft(thisBaloon)
						thisBaloon.data('move', 'no')
						break;
					} else {
						stearRight(thisBaloon)
						thisBaloon.data('direction','1-direction')
						thisBaloon.data('move', 'no')
						break;
					}
				}
			case '1-direction':

				if (thisBaloonShouldMove == 'no') {
					thisBaloon.data('move', 'yes')
				} else {
					if (clearToGoRight) {
						stearRight(thisBaloon)
						thisBaloon.data('move', 'no')
						break;
					} else {
						stearLeft(thisBaloon)
						thisBaloon.data('direction','0-direction')
						thisBaloon.data('move', 'no')
						break;
					}
				}
			}
		})
	}

	//COLLISION DETECTION
	function playerCrashCheck(interval) {
		var playerPixel = $('player-pixel'),
			containingPixel = playerPixel.parent('river-pixel')
			containingPixelHasEnemy = containingPixel.find('enemy-pixel').not('.zeds-dead');

		if (playerPixel.parent().hasClass('zeds-dead')) {
			return;
		} else if (!containingPixel.length || containingPixelHasEnemy.length) {
			gameEnded(interval);
			crashMessage();
		}
	}

	//SCORE
	function updateScore() {
		score = score + 100;
		$('#score-label').html(score)
		return score;
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
	document.addEventListener('keyup', function(e) {
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
				var playerPixel = $('player-pixel');
				stearLeft(playerPixel);
			}
			break;
		case 39: // RIGHT ARROW
			e.preventDefault();
			if (isStarted == "yes" && isEnded == "no") {
				var playerPixel = $('player-pixel');
				stearRight(playerPixel);
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
	function getRandomIntIncInc(min,max) {//MIN and MAX inclusive
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	function getRandomIntIncExc(min,max) {//MIN inclusive and MAX exclusive
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min); 
	}

	function setplayWidth(pixelSize,playWidth) {
		var from = 0,
			to = 0;

		switch(playWidth) {
			case "narrow":
				from = Math.floor(pixelSize / 1.3);
				to = from + 3;
				break;
			case "normal":
				from = Math.ceil(pixelSize / 1.8);
				to = from + 5;
				break;
			case "wide":
				from = Math.ceil(pixelSize / 3.5);
				to = from + 7;
				break;
			default:
				from = Math.ceil(pixelSize / 1.75);
				to = from + 4;
				break;
		}

		return {from,to};
	}

	function initTimingStuff(gameSpeed,started) {
		var	startMoment = Date.now();

		interval = setInterval(function() {
			playWidth = $body.attr('data-playwidth');
			
			//SCROLL SCREEN
			scrollScreen(startMoment,gameSpeed);
			sanitizeRowsAfterScroll();
			//ENEMY AI
			moveChoppers();
			moveBaloon();
			// //SCROLL PLAYER
			scrollPlayer();
			playerCrashCheck(interval);
			//SCROLL FIRE
			scrollFire();
			scrollFire();
			scrollFire();
			scrollFire();
		}, gameSpeed);
	}
});