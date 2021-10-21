$(document).ready(function(){

	//START GAME
	var $body = $('body'),
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
		} else if (pixelType == 'river') {
			whichPixel = '<river-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></river-pixel>';
		} else if (pixelType == 'coast') {
			whichPixel = '<coast-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></coast-pixel>';
		}

		thisRow.append(whichPixel)
	}

	function philRow(numberOfPixelsW,rowIndex,pixelSize,difficulty,gameScreen) {
		gameScreen.append('<screen-row id="row' + rowIndex + '"></screen-row');
		
		var thisRow = $('#row' + rowIndex),
			getDiff = setDifficulty(pixelSize,difficulty);
			howMuchGrass = getRandomInt(getDiff.from,getDiff.to),
			leftGrass = Math.floor(howMuchGrass / 2),
			leftGrassStart = 0,
			riverWidth = numberOfPixelsW - howMuchGrass,
			riverStart = leftGrassStart + leftGrass,
			rightGrass = howMuchGrass - leftGrass,
			rightGrassStart = riverStart + riverWidth;

		for (let j = 0; j < numberOfPixelsW; j++) {
			switch (true) {
				case (j >= leftGrassStart && j < riverStart):
					generatePixel(thisRow, j, pixelSize, 'grass')
					break;
				case (j >= riverStart && j < rightGrassStart):
					if (j == riverStart || j == rightGrassStart - 1) {
						generatePixel(thisRow, j, pixelSize, 'coast');
						break;
					} else {
						generatePixel(thisRow, j, pixelSize, 'river');
						break;
					}
					
				case (j >= rightGrassStart && j < numberOfPixelsW):
					generatePixel(thisRow, j, pixelSize, 'grass')
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
		$('screen-row').first().remove()
	}

	function scrollPlayer() {
		var playerPixel = $('player-pixel'),
			playerCurrentPixelID = playerPixel.parent().attr('id'),
			playerCurrentRow = playerPixel.parents('screen-row'),
			playerNextRow = playerCurrentRow.next(),
			playerNextPixel = playerNextRow.find('#' + playerCurrentPixelID);

		playerPixel.detach().appendTo(playerNextPixel)
	}

	//SETUP PLAYER
	function setupPlayer() {
		var initialRow = $('#row1'),
			middlePixel = initialRow.find('*').length / 2 - 1,
			initialPixel = initialRow.find('#pixel' + middlePixel);

		initialPixel.append('<player-pixel></player-pixel>')
	}

	//CONTROL PLAYER
	function fire() {
		console.log('123123123')
	}

	//KEYBOARD CONTROLS
	document.addEventListener('keydown', function(e) {
		var isStarted = $body.attr('data-gamestarted');
		switch (event.keyCode) {
		case 32: //SPACEBAR
			e.preventDefault();
			if (isStarted == "no") {
				initTimingStuff(gameSpeed)
				$body.attr('data-gamestarted','yes');
			} else if (isStarted == "yes") {
				fire();
			}
			break;
		case 37: // LEFT ARROW
			e.preventDefault();
			if (isStarted == "yes") {
				var playerPixel = $('player-pixel'),
					playerCurrentPixelID = playerPixel.parent().attr('id'),
					playerCurrentIDNum = playerCurrentPixelID.substring(5)
					playerCurrentRow = playerPixel.parents('screen-row'),
					playerNextPixel = playerCurrentRow.find('#pixel' + (Number(playerCurrentIDNum) - 1));

				console.log(playerNextPixel)

				if (playerNextPixel.length) {
					playerPixel.detach().appendTo(playerNextPixel);	
				}
			}
			break;
		case 39: // RIGHT ARROW
			e.preventDefault();
			if (isStarted == "yes") {
				var playerPixel = $('player-pixel'),
					playerCurrentPixelID = playerPixel.parent().attr('id'),
					playerCurrentIDNum = playerCurrentPixelID.substring(5)
					playerCurrentRow = playerPixel.parents('screen-row'),
					playerNextPixel = playerCurrentRow.find('#pixel' + (Number(playerCurrentIDNum) + 1));

				if (playerNextPixel.length) {
					playerPixel.detach().appendTo(playerNextPixel)
				}
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
		var	interval,
			startMoment = Date.now();

		interval = setInterval(function() {
			difficulty = $body.attr('data-diff');
			
			scrollScreen(startMoment,gameSpeed);
			sanitizeRowsAfterScroll();
			scrollPlayer();

		}, gameSpeed);

		// clearInterval(interval);
		// interval = null;
	}

});