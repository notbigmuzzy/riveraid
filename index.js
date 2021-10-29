$(document).ready(function(){

	//SET DEFAULT VALUES FOR PERSISTENCY
	localStorage.getItem('RUN') != null ? "" : localStorage.setItem('RUN','1');
	localStorage.getItem('BRIDGE') != null ? "" : localStorage.setItem('BRIDGE','0');
	localStorage.getItem('PILOT') != null ? "" : localStorage.setItem('PILOT','Bob');

	//SET GLOBAL VARS
	var $body = $('body'),interval,
		screenWidth = $body.attr('data-width'),
		screenHeight = $body.attr('data-height'),
		pixelSize = $body.attr('data-pxsize'),
		playWidth = $body.attr('data-playwidth'),
		$gameScreen = $('game-screen'),
		gameSpeed = $body.attr('data-spid');
		gameScore = 0,
		storageCurrentRun = localStorage.getItem('RUN'),
		storageTotalBridge = localStorage.getItem('BRIDGE'),
		storageLastPilot = localStorage.getItem('PILOT'),
		pilotNames = $('pilot-list').attr('data-pilotlist'),
		listOfPilots = pilotNames.split(',');

	//SETUP GAME
	$body.addClass("pilot-" + storageLastPilot.toLowerCase())
	setupBottomStatsScreen();
	switch(storageCurrentRun) {
	case '1':
		showSelectPilotScreen($gameScreen,'start');
		break;
	default:
		setupGamingScreen(screenWidth,screenHeight,$gameScreen)
		philScreen(screenWidth,screenHeight,pixelSize,playWidth,$gameScreen);
		setupPlayer();
		initTimingStuff(gameSpeed)
		$body.attr('data-gamestarted','yes');
		break;
	}

	//GENERATE SCREEN
	function setupGamingScreen(screenWidth,screenHeight,$gameScreen) {
		$gameScreen.css('width',screenWidth).css('height',screenHeight)
	}

	function setupBottomStatsScreen() {
		storageCurrentRun = localStorage.getItem('RUN'),
		storageTotalBridge = localStorage.getItem('BRIDGE'),
		storageLastPilot = localStorage.getItem('PILOT');

		$('game-stats').append('<game-label><span>Bridge</span><label id="score-bridge">&nbsp;</label></game-label><game-label><span>Score</span><label id="score-label">0</label></game-label><game-label><label>River Rogue</label></game-label><game-label><span>Pilot</span><label id="score-pilot">&nbsp;</label></game-label><game-label><span>Run</span><label id="score-run">&nbsp;</label></game-label>')

		$('#score-bridge').html(storageTotalBridge)
		$('#score-pilot').html(storageLastPilot)
		$('#score-run').html(storageCurrentRun)
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

	function philRow(numberOfPixelsW,rowIndex,pixelSize,playWidth,$gameScreen) {
		$gameScreen.append('<screen-row style="height:' + pixelSize + 'px" id="row' + rowIndex + '"></screen-row');
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

	function philScreen(screenWidth,screenHeight,pixelSize,playWidth,$gameScreen) {
		var numberOfPixelsW = screenWidth / pixelSize,
			numberOfPixelsH = screenHeight / pixelSize;

		for (let rowIndex = 0; rowIndex < numberOfPixelsH; rowIndex++) {
			philRow(numberOfPixelsW, rowIndex, pixelSize,playWidth,$gameScreen)
		}
	}

	//SCROLL SCREEN
	function scrollScreen(startMoment,gameSpeed) {
		var timeDiff = Math.floor((Date.now() - startMoment)/gameSpeed),
			numberOfPixelsW = screenWidth / pixelSize,
			numberOfPixelsH = screenHeight / pixelSize,
			rowIndex = numberOfPixelsH + Number(timeDiff);

		philRow(numberOfPixelsW,rowIndex,pixelSize,playWidth,$gameScreen)
	}

	function sanitizeRowsAfterScroll() {
		$('screen-row').first().css('height','0');

		setTimeout(function() {
			$('screen-row').first().remove();
		},280)
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
		var initialRow = $('#row1');
		if (storageLastPilot == 'Betty') {
			initialRow = $('#row0');
		}
		
		var middlePixel = 15,
			initialPixel = initialRow.find('#pixel' + middlePixel);

		initialPixel.append('<player-pixel style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><img src="graphics/airplane.svg"/></player-pixel>')
	}

	function showSelectPilotScreen($gameScreen,screenState) {
		$('body').attr('data-screenchoose','yes');
		$('pilot-choose').remove();
		$gameScreen.append("<pilot-choose><session-title></session-title><pilot-chooser></pilot-chooser></pilot-choose>");

		switch(screenState) {
			case "start":
				$('session-title').append("<h1>River Rogue <br> Legacy Raid</h2>")
				$('pilot-choose').addClass('start-screen')
				$('pilot-chooser').append("<div><a href='#' class='pick-a-pilot' data-pilotname='Bob' id='first-start'><img src='graphics/characters/Bob.svg'/><b>Bob</b><i>(New guy)</i></a></div>")
				$('pilot-chooser a').focus().addClass('focused');
				break;
			case "end":
				$('session-title').append("<h1>Choose your new pilot</h2>")
				$('pilot-choose').addClass('end-screen')
				var useMePilotNames = [];
				while(useMePilotNames.length < 3){
					var r = Math.floor(Math.random() * listOfPilots.length);
					if(useMePilotNames.indexOf(r) === -1) useMePilotNames.push(r);
				}
				$('pilot-chooser').append("<div class='pilot-list'></div><br/><span>OR</span><br/><a href='#' id='restart-game'>Restart Game</a>")
				$(useMePilotNames).each(function(i, name){
					var thisPilot = listOfPilots[name],
						thisPilotDescription = $('pilot-list').attr('data-' + thisPilot);

					$('.pilot-list').append("<a href='#' class='pick-a-pilot' data-pilotname='" + thisPilot + "'><img src='graphics/characters/" + thisPilot + ".svg'/><b>" + thisPilot + "</b><i>(" + thisPilotDescription + ")</i>")
				})
				$('pilot-chooser a').first().next().focus().addClass('focused');
				break;
		}
	}

	//CONTROL PLAYER
	function fire() {
		var numberOfFirePixelsPerShot = 2;

		if (storageLastPilot == 'Alexei' || storageLastPilot == 'Vinston') {
			numberOfFirePixelsPerShot = 3;
		} else if (storageLastPilot == 'Bob' || storageLastPilot == 'Rosanna') {
			numberOfFirePixelsPerShot = 1;
		}

		if ($('fire-pixel').length < numberOfFirePixelsPerShot) {
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
				updategameScore();
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
		}
	}

	//GAME SCORE
	function updategameScore() {
		gameScore = gameScore + 100;
		$('#score-label').html(gameScore)
		return gameScore;
	}

	//GAMEND
	function gameEnded(interval) {
		localStorage.setItem('RUN', Number(storageCurrentRun) + 1);
		clearInterval(interval);
		interval = null;
		$body.attr('data-gameended','yes');
		showSelectPilotScreen($gameScreen,'end');
	}

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
			if (storageLastPilot == 'Betty') {
				moveBaloon();
			} else if (storageLastPilot == 'Vinston') {
				moveChoppers();
				moveBaloon();
			}
			// //SCROLL PLAYER
			scrollPlayer();
			playerCrashCheck(interval);
			//SCROLL FIRE
			scrollFire();
			scrollFire();
			scrollFire();
		}, gameSpeed);
	}

	//CLICK ON PILOT CHOOSER ACTIONS
	$(document).on('click','pilot-chooser #first-start', function(e) {
		$('body').attr('data-screenchoose','no')
		$('pilot-choose').remove();
		setupGamingScreen(screenWidth,screenHeight,$gameScreen)
		philScreen(screenWidth,screenHeight,pixelSize,playWidth,$gameScreen);
		setupPlayer();
		initTimingStuff(gameSpeed)
		$body.attr('data-gamestarted','yes');
	})

	$(document).on('click','pilot-chooser .pick-a-pilot', function(e) {
		e.preventDefault()
		var isStarted = $body.attr('data-gamestarted'),
			isEnded = $body.attr('data-gameended');
		
		if (isStarted == "yes" && isEnded == "yes") {
			var thisPilot = $(this).attr('data-pilotname');
			localStorage.setItem('PILOT',thisPilot);
			location.reload();
		}
	})

	$(document).on('click','pilot-chooser #restart-game', function(e) {
		e.preventDefault()
		localStorage.setItem('RUN','1');
		localStorage.setItem('BRIDGE','0');
		localStorage.setItem('PILOT','Bob');
		location.reload();
	})

	//KEYBOARD CONTROLS
	document.addEventListener('keyup', function(e) {
		var isStarted = $body.attr('data-gamestarted'),
			isEnded = $body.attr('data-gameended');
		switch (event.keyCode) {
		case 32: //SPACEBAR
			e.preventDefault();
			fire();
			break;
		case 37: // LEFT ARROW
			e.preventDefault();
			if (isStarted == 'yes' && isEnded == 'no') {
				var playerPixel = $('player-pixel');
				if (storageLastPilot == 'Alexei') {
					stearRight(playerPixel);
				} else {
					stearLeft(playerPixel);
				}
			}
			if (isStarted == 'yes' && isEnded == 'yes' && $('body').attr('data-screenchoose') == 'yes') {
				if ($('.pick-a-pilot.focused').prev().length) {
					$('.pick-a-pilot.focused').removeClass('focused').prev().addClass('focused').focus()		
				}
			}
			break;
		case 39: // RIGHT ARROW
			e.preventDefault();
			if (isStarted == 'yes' && isEnded == 'no') {
				var playerPixel = $('player-pixel');
				if (storageLastPilot == 'Alexei') {
					stearLeft(playerPixel);
				} else {
					stearRight(playerPixel);
				}
			}
			if (isStarted == 'yes' && isEnded == 'yes' && $('body').attr('data-screenchoose') == 'yes') {
				if ($('.pick-a-pilot.focused').next().length) {
					$('.pick-a-pilot.focused').removeClass('focused').next().addClass('focused').focus()
				}
			}
			break;
		}
	});
});