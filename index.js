$(document).ready(function(){

	//SET DEFAULT VALUES FOR PERSISTENCY
	localStorage.getItem('RUN') != null ? "" : localStorage.setItem('RUN','1');
	localStorage.getItem('BRIDGE') != null ? "" : localStorage.setItem('BRIDGE','0');
	localStorage.getItem('PILOT') != null ? "" : localStorage.setItem('PILOT','Bob');
	localStorage.getItem('BOSS') != null ? "" : localStorage.setItem('BOSS','false');
	localStorage.getItem('WON') != null ? "" : localStorage.setItem('WON','no');

	//SET GLOBAL VARS
	var $body = $('body'),interval,
		screenWidth = $body.attr('data-width'),
		screenHeight = $body.attr('data-height'),
		pixelSize = $body.attr('data-pxsize'),
		playWidth = Number($body.attr('data-playwidth')),
		riverMeander = Number($body.attr('data-meander')),
		whenToChangePlayWidth = 11,
		gameScreen = $('game-screen'),
		gameSpeed = Number($body.attr('data-spid'));
		gameScore = 0,
		storageCurrentRun = localStorage.getItem('RUN'),
		storageTotalBridge = localStorage.getItem('BRIDGE'),
		storageLastPilot = localStorage.getItem('PILOT'),
		storageBoss = localStorage.getItem('BOSS'),
		storageWon = localStorage.getItem('WON'),
		pilotNames = $('pilot-list').attr('data-pilotlist'),
		listOfPilots = pilotNames.split(','),
		fuelAmount = Number($body.attr('data-fuel')),
		fuelLeakSpeed = Number($body.attr('data-fueleak'));

	//OVERRIDE SPECIFIC PILOT CONFIG
	if (storageLastPilot == 'Speedking') {
		gameSpeed = Math.floor(gameSpeed / 2);
		fuelLeakSpeed = 1;
	} else if (storageLastPilot == 'Betty') {
		gameSpeed = Math.floor(gameSpeed / 1.230);
		fuelLeakSpeed = 1.25;
	} else if (storageLastPilot == 'Jack') {
		var jackLeftOrRight = getRandomIntIncInc(0,1);
		jackLeftOrRight == 0 ? $body.addClass('left') : $body.addClass('right')
	}

	//SETUP GAME
	if(storageTotalBridge < 10) {
		$body.addClass("pilot-" + storageLastPilot.toLowerCase())
		setupBottomStatsScreen();
		localStorage.setItem('BOSS', 'false');
		switch(storageCurrentRun) {
		case '1':
			showSelectScreen(gameScreen,'start');
			break;
		default:
			setupGamingScreen(screenWidth,screenHeight,gameScreen)
			philScreen(screenWidth,screenHeight,pixelSize,playWidth,gameScreen,0,riverMeander);
			setupPlayer();
			$body.attr('data-gamestarted','yes');
			initTimingStuff(gameSpeed)
			break;
		}
	} else {
		localStorage.setItem('BOSS', 'true');
		$body.addClass("pilot-" + storageLastPilot.toLowerCase())
		$body.addClass('win-screen')
		setupBottomStatsScreen();
		setupGamingScreen(screenWidth,screenHeight,gameScreen)
		bossScreen(screenWidth,screenHeight,pixelSize,playWidth,gameScreen,0,riverMeander);
		setupPlayer();
		setupBoss();
		$body.attr('data-gamestarted','yes');
		initTimingStuff(gameSpeed)
	}

	//GENERATE SCREEN
	function setupGamingScreen(screenWidth,screenHeight,gameScreen) {
		gameScreen.css('width',screenWidth).css('height',screenHeight)
	}

	function setupBottomStatsScreen() {
		storageCurrentRun = localStorage.getItem('RUN'),
		storageTotalBridge = localStorage.getItem('BRIDGE'),
		storageLastPilot = localStorage.getItem('PILOT');

		$('game-stats').append('<game-label><span>Bridge</span><label id="bridge-label">&nbsp;</label></game-label><game-label><span>Score</span><label id="score-label">0</label></game-label><game-label><span>Fuel</span><label><progress id="fuel-bar" value="' + fuelAmount + '" max="125"></progress></label></game-label><game-label><span>Pilot</span><label id="score-pilot">&nbsp;</label></game-label><game-label><span>Run</span><label id="score-run">&nbsp;</label></game-label>')

		$('#bridge-label').html(storageTotalBridge)
		$('#score-pilot').html(storageLastPilot)
		$('#score-run').html(storageCurrentRun)
	}

	//ROW OF PIXELS PHILES IT
	function generatePixel(thisRow,pixelIndex,pixelSize,pixelType) {
		var whichPixel = '';
			enemyDirection = getRandomIntIncInc(0,1),
			whichGraph = getRandomIntIncInc(1,3);

		switch(pixelType) {
			case 'grass':
				whichPixel = '<grass-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></grass-pixel>';
				break;
			case 'island':
				whichPixel = '<island-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></island-pixel>';
				break;
			case 'island-forest':
				whichPixel = '<island-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><img src="graphics/forest-' + whichGraph + '.svg" /></island-pixel>';
				break;
			case 'forest':
				whichPixel = '<forest-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><img src="graphics/forest-' + whichGraph + '.svg" /></forest-pixel>';
				break;
			case 'mountain':
				whichPixel = '<mountain-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><img src="graphics/mountain-' + whichGraph + '.svg" /></mountain-pixel>';
				break;
			case 'river':
				whichPixel = '<river-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></river-pixel>';
				break;
			case 'sea':
				whichPixel = '<river-pixel class="sea" id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></river-pixel>';
				break;
			case 'deepsea':
				whichPixel = '<river-pixel class="deepsea" id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></river-pixel>';
				break;
			case 'fuel':
				whichPixel = '<fuel-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><img src="graphics/fuel.svg" /></fuel-pixel>';
				break;
			case 'coastleft':
				whichPixel = '<coast-pixel class="left" id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></coast-pixel>';
				break;
			case 'coastright':
				whichPixel = '<coast-pixel class="right" id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"></coast-pixel>';
				break;
			case 'enemy-boat':
				whichPixel = '<river-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><enemy-pixel class="boat"><img src="graphics/boat.svg" /></enemy-pixel></river-pixel>';
				break;
			case 'enemy-chopper':
				whichPixel = '<river-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><enemy-pixel data-direction="' + enemyDirection + '-direction" class="chopper"><img src="graphics/chopper.svg" /></enemy-pixel></river-pixel>';
				break;
			case 'enemy-baloon':
				whichPixel = '<river-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><enemy-pixel data-direction="' + enemyDirection + '-direction" data-move="no" class="baloon"><img src="graphics/ballon.svg" /></enemy-pixel></river-pixel>';
				break;
			case 'bridge-pixel':
				whichPixel = '<bridge-pixel id="pixel' + pixelIndex + '" style="width:' + pixelSize + 'px;height:' + pixelSize + 'px"><img src="graphics/bridge-' + 3 + '.svg" /></bridge-pixel>';
				break;
		}

		thisRow.append(whichPixel)
	}

	function philStartRow(numberOfPixelsW,rowID,pixelSize,playWidth,gameScreen) {
		gameScreen.append('<screen-row data-rowidth="rowidth-' + playWidth + '" class="start-row" style="transition: height 0.' + ((gameSpeed / 10) + 4) + 's ease-out; height:' + pixelSize + 'px" id="row' + rowID + '"></screen-row');
		var thisRow = $('#row' + rowID),
			getDiff = setplayWidth(pixelSize,playWidth);
			howMuchGrass = getRandomIntIncInc(numberOfPixelsW - 5,numberOfPixelsW - 5),
			leftGrass = Math.floor(howMuchGrass / 2),
			leftGrassStart = 0,
			riverWidth = numberOfPixelsW - howMuchGrass,
			riverStart = leftGrassStart + leftGrass,
			rightGrass = howMuchGrass - leftGrass,
			rightGrassStart = riverStart + riverWidth;
		for (let pixelIndex = 0; pixelIndex < numberOfPixelsW; pixelIndex++) {
			switch (true) {
				case (pixelIndex >= leftGrassStart && pixelIndex < riverStart || pixelIndex >= rightGrassStart && pixelIndex < numberOfPixelsW):
					generatePixel(thisRow, pixelIndex, pixelSize, 'grass');
					break;
				case (pixelIndex >= riverStart && pixelIndex < rightGrassStart):
					if (pixelIndex == riverStart) {
						generatePixel(thisRow, pixelIndex, pixelSize, 'coastleft');
						break;
					} else if (pixelIndex == rightGrassStart - 1) {
						generatePixel(thisRow, pixelIndex, pixelSize, 'coastright');
						break;
					} else {
						generatePixel(thisRow, pixelIndex, pixelSize, 'river');
						break;
					}
			}
		}
	}

	function philBridgeRow(numberOfPixelsW,rowID,pixelSize,playWidth,gameScreen) {
		gameScreen.append('<screen-row data-rowidth="rowidth-' + playWidth + '" class="bridge-row" style="transition: height 0.' + ((gameSpeed / 10) + 4) + 's ease-out; height:' + pixelSize + 'px" id="row' + rowID + '"></screen-row');
		var thisRow = $('#row' + rowID),
			getDiff = setplayWidth(pixelSize,playWidth);
			howMuchGrass = getRandomIntIncInc(numberOfPixelsW - 3,numberOfPixelsW - 3),
			leftGrass = Math.floor(howMuchGrass / 2),
			leftGrassStart = 0,
			riverStart = 5
			riverWidth = numberOfPixelsW - riverStart,
			rightGrass = howMuchGrass - leftGrass,
			rightGrassStart = riverStart + riverWidth;
		for (let pixelIndex = 0; pixelIndex < numberOfPixelsW; pixelIndex++) {
			switch (true) {
				case (pixelIndex >= leftGrassStart && pixelIndex < riverStart || pixelIndex >= rightGrassStart && pixelIndex < numberOfPixelsW):
					generatePixel(thisRow, pixelIndex, pixelSize, 'grass');
					break;
				case (pixelIndex >= riverStart && pixelIndex < rightGrassStart):
					if (pixelIndex == riverStart) {
						generatePixel(thisRow, pixelIndex, pixelSize, 'coastleft');
						break;
					} else if (pixelIndex == rightGrassStart - 1) {
						generatePixel(thisRow, pixelIndex, pixelSize, 'coastright');
						break;
					} else {
						generatePixel(thisRow, pixelIndex, pixelSize, 'bridge-pixel');
						break;
					}
			}
		}
	}

	function philSeaRow(numberOfPixelsW,rowID,pixelSize,playWidth,gameScreen) {
		gameScreen.append('<screen-row data-rowidth="rowidth-' + playWidth + '" class="sea-row" style="transition: height 0.' + ((gameSpeed / 10) + 4) + 's ease-out; height:' + pixelSize + 'px" id="row' + rowID + '"></screen-row');
		var thisRow = $('#row' + rowID),
			getDiff = setplayWidth(pixelSize,playWidth);
			howMuchGrass = getRandomIntIncInc(numberOfPixelsW - 15,numberOfPixelsW - 25),
			leftGrass = Math.floor(howMuchGrass / 2),
			leftGrassStart = 0,
			riverWidth = numberOfPixelsW - howMuchGrass,
			riverStart = leftGrassStart + leftGrass,
			rightGrass = howMuchGrass - leftGrass,
			rightGrassStart = riverStart + riverWidth;
		for (let pixelIndex = 0; pixelIndex < numberOfPixelsW; pixelIndex++) {
			switch (true) {
				case (pixelIndex >= leftGrassStart && pixelIndex < riverStart || pixelIndex >= rightGrassStart && pixelIndex < numberOfPixelsW):
					generatePixel(thisRow, pixelIndex, pixelSize, 'sea');
					break;
				case (pixelIndex >= riverStart && pixelIndex < rightGrassStart):
					if (pixelIndex == riverWidth/getRandomIntIncInc(1,5) && !$('game-screen').find('fuel-pixel').length) {
						generatePixel(thisRow, pixelIndex, pixelSize, 'fuel');
					} else {
						generatePixel(thisRow, pixelIndex, pixelSize, 'deepsea');
					}		
					break;
			}
		}
	}

	function philRegularRow(numberOfPixelsW,rowID,pixelSize,playWidth,gameScreen,willRiverHaveIsland,riverMeander) {
		gameScreen.append('<screen-row class="regular-row" data-rowmeander="' + riverMeander + '" data-rowidth="rowidth-' + playWidth + '" style="transition: height 0.' + ((gameSpeed / 10) + 4) + 's ease-out; height:' + pixelSize + 'px" id="row' + rowID + '"></screen-row');
		var thisRow = $('#row' + rowID),
			thisRowMeander = Number(thisRow.attr('data-rowmeander')),
			getDiff = setplayWidth(pixelSize,playWidth);
			howMuchGrass = getRandomIntIncInc(getDiff.from,getDiff.to),
			thisRowRiverMeander = riverMeander / 100,
			leftGrass = Math.floor(howMuchGrass / thisRowRiverMeander),
			leftGrassStart = 0,
			riverWidth = numberOfPixelsW - howMuchGrass,
			riverStart = leftGrassStart + leftGrass,
			middleOfRiverWide = numberOfPixelsW / 2 - 1,
			rightGrass = howMuchGrass - leftGrass,
			rightGrassStart = riverStart + riverWidth,
			willRowContainForest = getRandomIntIncInc(0,1),
			willRowContainForestControl = getRandomIntIncInc(0,1),
			willContaintMountain = getRandomIntIncInc(0,5),
			willContaintMountainControl = getRandomIntIncInc(0,5),
			willRowContainEnemy = getRandomIntIncExc(0,Math.abs(playWidth-4)),
			willRowContainEnemyControl = getRandomIntIncExc(0,Math.abs(playWidth-4)),
			fuelLeftOrRight = getRandomIntIncInc(0,1);

		//RIVER MEANDERING
		if (playWidth == 2) { //WIDE RIVER RESET MEANDER
			$('body').attr('data-meander', '200')
		} else {
			var meanderModifier = 10,
				willGoLeftOrRight = getRandomIntIncInc(0,1);

			if (modifyMeander < 110) {
				willGoLeftOrRight = 1;
			} else if (modifyMeander >= 500) {
				willGoLeftOrRight = 0;
			}

			if (willGoLeftOrRight) {//MEANDER LEFT
				var modifyMeander = thisRowMeander - meanderModifier
			} else {//MEANDER RIGHT
				var modifyMeander = thisRowMeander + meanderModifier
			}

			$('body').attr('data-meander', modifyMeander)	
		}

		//WILL RIVER ROW HAVE ISLANDS LOGIC
		if (thisRow.attr('data-rowidth') == 'rowidth-2' && thisRow.prev().attr('data-rowidth') != 'rowidth-2') {
			willRiverHaveIsland = false;
		} else if (thisRow.attr('data-rowidth') == 'rowidth-2' && thisRow.prev().attr('data-rowidth') == 'rowidth-2' && thisRow.prev().prev().attr('data-rowidth') != 'rowidth-2') {
			willRiverHaveIsland = false;
		} else if (thisRow.attr('data-rowidth') == 'rowidth-2' && thisRow.prev().attr('data-rowidth') == 'rowidth-2' && thisRow.prev().prev().attr('data-rowidth') == 'rowidth-2' && thisRow.prev().prev().prev().attr('data-rowidth') != 'rowidth-2') {
			willRiverHaveIsland = false;
		} 

		if (thisRow.attr('data-rowidth') == 'rowidth-0' && thisRow.prev().attr('data-rowidth') == 'rowidth-2' || thisRow.attr('data-rowidth') == 'rowidth-1' && thisRow.prev().attr('data-rowidth') == 'rowidth-2') {
			var prevPixelToBeReplaced = thisRow.prev().find('island-pixel'),
				prevPrevPixelToBeReplaced = thisRow.prev().prev().find('island-pixel')
			prevPixelToBeReplaced.each(function() {
				replaceIslandWithRiver( $(this) )
			})
			prevPrevPixelToBeReplaced.each(function() {
				replaceIslandWithRiver( $(this) )
			})
			function replaceIslandWithRiver(pixel) {
				pixelID = pixel.attr('id');
				pixel.replaceWith('<river-pixel id="' + pixelID + '" style="width:32px;height:32px"></river-pixel>')	
			}
		}

		for (let pixelIndex = 0; pixelIndex < numberOfPixelsW; pixelIndex++) {
			switch (true) {
				case (pixelIndex >= leftGrassStart && pixelIndex < riverStart):
					if (willRowContainForest == willRowContainForestControl && pixelIndex == leftGrassStart + getRandomIntIncInc(0,leftGrassStart + riverStart - 1)) {
						if (thisRow.prev().find('#pixel' + pixelIndex).is('grass-pixel')) {
							generatePixel(thisRow, pixelIndex, pixelSize, 'forest');
						} else {
							generatePixel(thisRow, pixelIndex, pixelSize, 'grass');
						}
					} else if (willContaintMountain == willContaintMountainControl && pixelIndex == leftGrassStart + getRandomIntIncInc(0,leftGrassStart + riverStart - 1)) {
						if (thisRow.prev().find('#pixel' + pixelIndex).is('grass-pixel')) {
							generatePixel(thisRow, pixelIndex, pixelSize, 'mountain');
						} else {
							generatePixel(thisRow, pixelIndex, pixelSize, 'grass');
						}
					} else {
						generatePixel(thisRow, pixelIndex, pixelSize, 'grass');
					}
					break;
				case (pixelIndex >= riverStart && pixelIndex < rightGrassStart):
					if (pixelIndex == riverStart) {
						generatePixel(thisRow, pixelIndex, pixelSize, 'coastleft');
						break;
					} else if (pixelIndex == rightGrassStart - 1) {
						generatePixel(thisRow, pixelIndex, pixelSize, 'coastright');
						break;
					} else {

						if (playWidth == 2) { //WIDE RIVER
							var islandRowStart = middleOfRiverWide - getRandomIntIncInc(1,3),
								islandRowEnd = middleOfRiverWide + getRandomIntIncInc(2,4);

							if (willRiverHaveIsland == true) {
								if (rowID > 5 && !$('game-screen').find('fuel-pixel').length) {
									if (fuelLeftOrRight) {
										if (pixelIndex == islandRowStart - 3) {
											generatePixel(thisRow, pixelIndex, pixelSize, 'fuel');
										} else {
											generatePixel(thisRow, pixelIndex, pixelSize, 'river');
										}			
									} else {
										if (pixelIndex == islandRowEnd + 3) {
											generatePixel(thisRow, pixelIndex, pixelSize, 'fuel');
										} else {
											generatePixel(thisRow, pixelIndex, pixelSize, 'river');
										}
									}
								} else if (rowID > 10 && willRowContainEnemy == willRowContainEnemyControl && pixelIndex == riverStart + getRandomIntIncInc(0,islandRowStart-2)) {
									var whatTypeOfEnemy = getRandomIntIncInc(0,20);
									switch (true) {
										case (whatTypeOfEnemy < 10):
											generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-boat');
											break;
										case (whatTypeOfEnemy >= 10 && whatTypeOfEnemy <= 15):
											if(thisRow.find('.chopper').length == 0 && thisRow.find('.baloon').length == 0) {
												generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-chopper');
											} else {
												generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-boat');
											}
											break;
										case (whatTypeOfEnemy > 5):
											if(thisRow.find('.chopper').length == 0 && thisRow.find('.baloon').length == 0) {
												generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-baloon');
											} else {
												generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-boat');
											}
											break;
									}
								} else if (rowID > 10 && willRowContainEnemy == willRowContainEnemyControl && pixelIndex == islandRowEnd + getRandomIntIncInc(0,rightGrassStart)) {
									var whatTypeOfEnemy = getRandomIntIncInc(0,20);
									switch (true) {
										case (whatTypeOfEnemy < 10):
											generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-boat');
											break;
										case (whatTypeOfEnemy >= 10 && whatTypeOfEnemy <= 15):
											if(thisRow.find('.chopper').length == 0 && thisRow.find('.baloon').length == 0) {
												generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-chopper');
											} else {
												generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-boat');
											}
											break;
										case (whatTypeOfEnemy > 5):
											if(thisRow.find('.chopper').length == 0 && thisRow.find('.baloon').length == 0) {
												generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-baloon');
											} else {
												generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-boat');
											}
											break;
									}
								} else if (pixelIndex > islandRowStart && pixelIndex < islandRowEnd) {
									if (getRandomIntIncInc(0,1)) {
										generatePixel(thisRow, pixelIndex, pixelSize, 'island');
									} else {
										generatePixel(thisRow, pixelIndex, pixelSize, 'island-forest');
									}
								} else {
									generatePixel(thisRow, pixelIndex, pixelSize, 'river');
								}
							}  else {
								if (rowID > 5 && !$('game-screen').find('fuel-pixel').length) {
									if (pixelIndex == riverStart + Math.ceil(islandRowStart / 2)) {
										generatePixel(thisRow, pixelIndex, pixelSize, 'fuel');
									} else {
										generatePixel(thisRow, pixelIndex, pixelSize, 'river');
									}
								} else if (rowID > 10 && willRowContainEnemy == willRowContainEnemyControl && pixelIndex == riverStart + getRandomIntIncInc(0,riverWidth)) {
									var whatTypeOfEnemy = getRandomIntIncInc(0,20);
									switch (true) {
									case (whatTypeOfEnemy < 10):
										generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-boat');
										break;
									case (whatTypeOfEnemy >= 10 && whatTypeOfEnemy <= 15):
										if(thisRow.find('.chopper').length == 0 && thisRow.find('.baloon').length == 0) {
											generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-chopper');
										} else {
											generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-boat');
										}
										break;
									case (whatTypeOfEnemy > 5):
										if(thisRow.find('.chopper').length == 0 && thisRow.find('.baloon').length == 0) {
											generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-baloon');
										} else {
											generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-boat');
										}
										break;
									}
								} else {
									generatePixel(thisRow, pixelIndex, pixelSize, 'river');
								}
							}
						} else { //NARROW RIVER OR DEFAULT RIVER
							if (rowID > 5 && !$('game-screen').find('fuel-pixel').length) {
								if (pixelIndex == riverStart + Math.ceil(riverWidth / (getRandomIntIncInc(1,3) + 0.5))) {
									generatePixel(thisRow, pixelIndex, pixelSize, 'fuel');
								} else {
									generatePixel(thisRow, pixelIndex, pixelSize, 'river');
								}
							} else if (rowID > 10 && willRowContainEnemy == willRowContainEnemyControl && pixelIndex == riverStart + getRandomIntIncInc(0,riverWidth)) {
								var whatTypeOfEnemy = getRandomIntIncInc(0,20);
								switch (true) {
								case (whatTypeOfEnemy < 10):
									generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-boat');
									break;
								case (whatTypeOfEnemy >= 10 && whatTypeOfEnemy <= 15):
									if(thisRow.find('.chopper').length == 0 && thisRow.find('.baloon').length == 0) {
										generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-chopper');
									} else {
										generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-boat');
									}
									break;
								case (whatTypeOfEnemy > 15):
									if(thisRow.find('.chopper').length == 0 && thisRow.find('.baloon').length == 0) {
										generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-baloon');
									} else {
										generatePixel(thisRow, pixelIndex, pixelSize, 'enemy-boat');
									}
									break;
								}
							} else {
								generatePixel(thisRow, pixelIndex, pixelSize, 'river');
							}
						}
						break;
					}
				case (pixelIndex >= rightGrassStart && pixelIndex < numberOfPixelsW):
					if (willRowContainForest == getRandomIntIncInc(0,2) && pixelIndex == rightGrassStart + getRandomIntIncInc(0,numberOfPixelsW - rightGrassStart)) {
						if (thisRow.prev().find('#pixel' + pixelIndex).is('grass-pixel')) {
							generatePixel(thisRow, pixelIndex, pixelSize, 'forest');
						} else {
							generatePixel(thisRow, pixelIndex, pixelSize, 'grass');
						}
					} else if (willContaintMountain == getRandomIntIncInc(0,8) && pixelIndex == rightGrassStart + getRandomIntIncInc(0,numberOfPixelsW - rightGrassStart)) {
						if (thisRow.prev().find('#pixel' + pixelIndex).is('grass-pixel')) {
							generatePixel(thisRow, pixelIndex, pixelSize, 'mountain');
						} else {
							generatePixel(thisRow, pixelIndex, pixelSize, 'grass');
						}
					}else {
						generatePixel(thisRow, pixelIndex, pixelSize, 'grass');
					}
					break;
			}
		}
	}

	function pickARow(typeOfRow,numberOfPixelsW,rowID,pixelSize,playWidth,gameScreen,willRiverHaveIsland,riverMeander) {
		switch(typeOfRow) {
			case 'start':
				philStartRow(numberOfPixelsW,rowID,pixelSize,0,gameScreen)
				break;
			case 'bridge':
				philBridgeRow(numberOfPixelsW,rowID,pixelSize,0,gameScreen)
				break;
			case 'sea':
				philSeaRow(numberOfPixelsW,rowID,pixelSize,0,gameScreen)
				break;
			case 'regular':
				philRegularRow(numberOfPixelsW,rowID,pixelSize,playWidth,gameScreen,willRiverHaveIsland,riverMeander)
				break;
		}
	}

	function bossScreen(screenWidth,screenHeight,pixelSize,playWidth,gameScreen,willRiverHaveIsland,riverMeander) {
		var numberOfPixelsW = screenWidth / pixelSize,
			numberOfPixelsH = screenHeight / pixelSize,
			typeOfRow = '',
			willRiverHaveIsland = 0;

		for (let rowID = 0; rowID < numberOfPixelsH + 1; rowID++) {
			typeOfRow = 'sea';
			pickARow(typeOfRow,numberOfPixelsW,rowID,pixelSize,playWidth,gameScreen,willRiverHaveIsland,riverMeander)
		}
	}

	function philScreen(screenWidth,screenHeight,pixelSize,playWidth,gameScreen,willRiverHaveIsland,riverMeander) {
		var numberOfPixelsW = screenWidth / pixelSize,
			numberOfPixelsH = screenHeight / pixelSize,
			typeOfRow = '',
			willRiverHaveIsland = 0;

		for (let rowID = 0; rowID < numberOfPixelsH + 1; rowID++) {
			switch(rowID) {
			case 0:
				typeOfRow = 'start';
				pickARow(typeOfRow,numberOfPixelsW,rowID,pixelSize,0,gameScreen)
				break;
			case 1:
				typeOfRow = 'start';
				pickARow(typeOfRow,numberOfPixelsW,rowID,pixelSize,0,gameScreen)
				break;
			default:
				typeOfRow = 'regular';
				pickARow(typeOfRow,numberOfPixelsW,rowID,pixelSize,playWidth,gameScreen,willRiverHaveIsland,riverMeander)
				break;
			}
		}
	}

	//SCROLL SCREEN
	function scrollScreen(startMoment,gameSpeed,intervalNewTime,riverMeander,bridgeDestroyed) {
		var timeDiff = Math.floor((Date.now() - startMoment)/gameSpeed),
			numberOfPixelsW = screenWidth / pixelSize,
			numberOfPixelsH = screenHeight / pixelSize,
			rowID = intervalNewTime,
			typeOfRow = 'regular';

		if (bridgeDestroyed < 10) {
			var willRiverHaveIsland = getRandomIntIncInc(1,4) < 4 ? "1" : "0";
			if (rowID % whenToChangePlayWidth == 0) {
				playWidth = getRandomIntIncInc(0,2);
			}

			if (gameScore > 1 && gameScore % 2000 == 0) {
				typeOfRow = 'bridge';
				pickARow(typeOfRow,numberOfPixelsW,rowID,pixelSize,playWidth,gameScreen)
				updategameScore();
			} else {
				typeOfRow = 'regular';
				pickARow(typeOfRow,numberOfPixelsW,rowID,pixelSize,playWidth,gameScreen,willRiverHaveIsland,riverMeander)
			}
		} else {
			typeOfRow = 'sea';
			$('body').addClass('win-screen')
			setupBoss()
			pickARow(typeOfRow,numberOfPixelsW,rowID,pixelSize,playWidth,gameScreen);	
		}
	}

	function sanitizeRowsAfterScroll() {
		$('screen-row').first().css('height','0');

		setTimeout(function() {
			$('screen-row').first().remove();
		},gameSpeed-40)
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

	function showSelectScreen(gameScreen,screenState) {
		$('body').attr('data-screenchoose','yes');
		$('pilot-choose').remove();
		gameScreen.append("<pilot-choose><session-title></session-title><pilot-chooser></pilot-chooser></pilot-choose>");

		switch(screenState) {
			case "win":
				$('session-title').append("<h1>CONGRATULATIONS! <br> YOU WIN!</h2>")
				$('pilot-choose').addClass('win-screen')
				$('pilot-chooser').append("<div class='pilot-list'></div><br/><br/><a href='#' id='restart-game'>Play again?</a>");
				$('pilot-chooser a').focus().addClass('focused');
				break;
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

	function updateAndCheckFuelAmount() {
		var currentFuel = Number($('#fuel-bar').attr('value'))

		if (currentFuel < 1) {
			playSound('crash');
			gameEnded(interval);
		} else {
			currentFuel = currentFuel - fuelLeakSpeed;
			$('#fuel-bar').attr('value', currentFuel)
		}
	}

	//CONTROL PLAYER
	function fire(bridgeDestroyed) {
		var numberOfFirePixelsPerShot = 2;

		if (bridgeDestroyed < 10) {
			if (storageLastPilot == 'Vinston') {
				numberOfFirePixelsPerShot = 3;
			} else if (storageLastPilot == 'Betty') {
				numberOfFirePixelsPerShot = 1;
			}	
		}

		if ($('fire-pixel').length < numberOfFirePixelsPerShot) {
			var firePixel = $('<fire-pixel id="' + Date.now() + '"><img src="graphics/fire.svg"/></fire-pixel>'),
				playerPixel = $('player-pixel'),
				playerCurrentPixelID = playerPixel.parent().attr('id'),
				playerCurrentRow = playerPixel.parents('screen-row'),
				playerNextRow = playerCurrentRow.next(),
				playerNextPixel = playerNextRow.find('#' + playerCurrentPixelID);

			playerNextPixel.append(firePixel);
			playSound('shot');
		}
	}

	function fireSpread() {
		var numberOfFirePixelsPerShot = 1;

		if ($('fire-pixel').length < numberOfFirePixelsPerShot) {
			var firePixel = $('<fire-pixel id="' + Date.now() + '"><img src="graphics/fire.svg"/></fire-pixel>'),
				playerPixel = $('player-pixel'),
				playerCurrentPixelID = playerPixel.parent().attr('id'),
				playerCurrentRow = playerPixel.parents('screen-row'),
				playerNextRow = playerCurrentRow.next(),
				playerNextPixel = playerNextRow.find('#' + playerCurrentPixelID);

			playerNextPixel.append(firePixel);
			firePixel.clone().appendTo(playerNextPixel.prev());
			firePixel.clone().appendTo(playerNextPixel.next());
			playSound('shot');
		}
	}

	function scrollFire(bridgeDestroyed) {
		var firePixel = $('fire-pixel');

		firePixel.each(function() {
			var eachFirePixel = $(this),
				fireCurrentPixelID = eachFirePixel.parent().attr('id'),
				fireCurrentRow = eachFirePixel.parents('screen-row'),
				fireNextRow = fireCurrentRow.next(),
				fireNextPixel = fireNextRow.find('#' + fireCurrentPixelID),
				containingPixel = eachFirePixel.parent('river-pixel'),
				hitEnemy = eachFirePixel.parent('river-pixel').find('enemy-pixel')
				hitFuel = eachFirePixel.parent('fuel-pixel'),
				hitBridge = eachFirePixel.parent('bridge-pixel'),
				shotLength = eachFirePixel.attr('data-shotlength')
				shotLength == undefined ? shotLength = 0 : '';
			eachFirePixel.attr('data-shotlength', shotLength + 1).detach().appendTo(fireNextPixel);

			if (bridgeDestroyed < 10 && storageLastPilot == 'Vinston') {
				if (shotLength > '111111') {
					eachFirePixel.remove();
				}
			}

			if (bridgeDestroyed < 10 && storageLastPilot == 'Betty') {
				if (shotLength > '111111') {

					var thisFirePixel = $(this),
						fireThisPixelID = thisFirePixel.parent().attr('id'),
						fireThisRow = thisFirePixel.parents('screen-row'),
						fireThisNextRow = fireThisRow.next(),
						fireThisNextPixel = fireThisNextRow.find('#' + fireThisPixelID),
						fireThisPrevRow = fireThisRow.prev(),
						fireThisPrevPixel = fireThisPrevRow.find('#' + fireThisPixelID);

					thisFirePixel.parents('river-pixel').addClass('explosion').find('enemy-pixel').addClass('zeds-dead')
					fireThisNextPixel.addClass('explosion').find('enemy-pixel').addClass('zeds-dead')
					fireThisNextPixel.prev().addClass('explosion').find('enemy-pixel').addClass('zeds-dead')
					fireThisNextPixel.next().addClass('explosion').find('enemy-pixel').addClass('zeds-dead')
					eachFirePixel.remove();
				}
			}

			if (hitEnemy.length || hitFuel.length || hitBridge.length) {
				if(!hitEnemy.hasClass('zeds-dead') && !hitFuel.hasClass('zeds-dead') && !hitBridge.hasClass('zeds-dead')) {
					if (storageLastPilot == 'Betty') {
						var thisFirePixel = $(this),
							fireThisPixelID = thisFirePixel.parent().attr('id'),
							fireThisRow = thisFirePixel.parents('screen-row'),
							fireThisNextRow = fireThisRow.next(),
							fireThisNextPixel = fireThisNextRow.find('#' + fireThisPixelID),
							fireThisPrevRow = fireThisRow.prev(),
							fireThisPrevPixel = fireThisPrevRow.find('#' + fireThisPixelID);
						thisFirePixel.parents('river-pixel').addClass('explosion').find('enemy-pixel').addClass('zeds-dead')
						fireThisNextPixel.addClass('explosion').find('enemy-pixel').addClass('zeds-dead')
						fireThisNextPixel.prev().addClass('explosion').find('enemy-pixel').addClass('zeds-dead')
						fireThisNextPixel.next().addClass('explosion').find('enemy-pixel').addClass('zeds-dead')
						eachFirePixel.remove();
					}
					eachFirePixel.remove();
				}

				if (hitBridge.length && !hitBridge.hasClass('zeds-dead')) {
					hitBridge.addClass('zeds-dead');
					hitBridge.parent('screen-row').find('bridge-pixel').addClass('zeds-dead')
					updateBridgeScore();
					playSound('destroy');
				}

				if (hitFuel.length && !hitFuel.hasClass('zeds-dead')) {
					hitFuel.addClass('zeds-dead')
					updategameScore();
					playSound('destroy');
				}

				if (hitEnemy.length && !hitEnemy.hasClass('zeds-dead')) {
					hitEnemy.addClass('zeds-dead');
					updategameScore();
					playSound('destroy');
				}
			} else if (!fireNextRow.length || !containingPixel.length) {
				eachFirePixel.remove();
			}
		})
	}

	function stearLeft(controlledPixel) {
		var controlledCurrentPixelID = controlledPixel.parent().attr('id'),
			controlledCurrentIDNum = controlledCurrentPixelID.substring(5),
			controlledCurrentRow = controlledPixel.parents('screen-row'),
			controlledNextPixel = controlledCurrentRow.find('#pixel' + (Number(controlledCurrentIDNum) - 1));

		if (controlledNextPixel.length) {
			controlledPixel.detach().appendTo(controlledNextPixel);	
		}

		playerCrashCheck(interval);
	}

	function stearRight(controlledPixel) {
		var controlledCurrentPixelID = controlledPixel.parent().attr('id'),
			controlledCurrentIDNum = controlledCurrentPixelID.substring(5),
			controlledCurrentRow = controlledPixel.parents('screen-row'),
			controlledNextPixel = controlledCurrentRow.find('#pixel' + (Number(controlledCurrentIDNum) + 1));

		if (controlledNextPixel.length) {
			controlledPixel.detach().appendTo(controlledNextPixel)
		}

		playerCrashCheck(interval);
	}

	function controlPlayerPixel(eventCode) {
		var isStarted = $body.attr('data-gamestarted'),
			isEnded = $body.attr('data-gameended');

		switch (eventCode) {
		case 32: //SPACEBAR
			playSound('theme')
			var bridgeDestroyed = localStorage.getItem('BRIDGE');
			if (bridgeDestroyed < 10 && storageLastPilot == 'Vinston') {
				fireSpread();
				break;
			} else {
				fire(bridgeDestroyed);
				break;
			}
		case 37: // LEFT ARROW
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
			containingPixel = playerPixel.parent()
			containingPixelHasEnemy = containingPixel.find('enemy-pixel').not('.zeds-dead');

		if (containingPixel.is('fuel-pixel') && !containingPixel.hasClass('zeds-dead')) {
			var thisFuel = Number($('#fuel-bar').attr('value'))
			playSound('fuel');
			thisFuel = 125;
			$('#fuel-bar').attr('value',thisFuel)
		} else if (containingPixel.hasClass('zeds-dead') || containingPixel.length == 0) {
			return;
		} else if (!containingPixel.is('river-pixel') || containingPixelHasEnemy.length) {
			playSound('crash');
			gameEnded(interval);
		}
	}

	//BOSS LOGIC
	function setupBoss() {
		if (!$('enemy-pixel.boss').length && !$('grass-pixel').length ) {
			var initialRow = $('game-screen').find('screen-row').eq(-3),
				middlePosition = 15,
				middlePixel = initialRow.find('#pixel' + middlePosition),
				leftPixel = initialRow.find('#pixel' + (Math.floor(middlePosition / 2))),
				rightPixel = initialRow.find('#pixel' + (Math.floor(middlePosition * 1.5)));

			middlePixel.append('<enemy-pixel class="boss middle turret"><img src="graphics/turret.svg" /><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev></enemy-pixel>')
			leftPixel.append('<enemy-pixel class="boss left turret"><img src="graphics/turret.svg" /><i></i><i></i><i></i><i></i><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev></enemy-pixel>')
			rightPixel.append('<enemy-pixel class="boss right turret"><img src="graphics/turret.svg" /><i></i><i></i><i></i><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev><i-prev></i-prev></enemy-pixel>')	
		}
	}

	function scrollBoss() {
		var bossPixel = $('enemy-pixel.boss'),
			moveLeftOrRight = getRandomIntIncInc(-1,1),
			leftBossID = Number($('enemy-pixel.boss').first().parent().attr('id').slice(5)),
			rightBossID = Number($('enemy-pixel.boss').last().parent().attr('id').slice(5));

		if (leftBossID - moveLeftOrRight < 1) {
			moveLeftOrRight = 3;
		}

		if (rightBossID + moveLeftOrRight > 31) {
			moveLeftOrRight = -3;
		}

		bossPixel.each(function() {
			var thisBossPixel = $(this),
				bossCurrentRow = thisBossPixel.parents('screen-row'),
				bossNextRow = bossCurrentRow.next(),
				bossCurrentPixelID = thisBossPixel.parent().attr('id'),
				nextPixelIDNnumber = Number(bossCurrentPixelID.slice(5)) + moveLeftOrRight,
				bossNextPixel = bossNextRow.find('#pixel' + nextPixelIDNnumber);

			thisBossPixel.detach().appendTo(bossNextPixel)	
		})
	}

	function bossFire() {
		var bossPixels = $('enemy-pixel.boss:not(".zeds-dead")');

		bossPixels.each(function() {
			if(getRandomIntIncInc(1,3) == 2) {
				var firePixel = $('<enemy-pixel class="mine" id="' + Date.now() + '"><img src="graphics/mine.svg"/></enemy-pixel>'),
					thisBossPixels = $(this),
					bossCurrentPixelID = thisBossPixels.parent().attr('id'),
					bossCurrentRow = thisBossPixels.parents('screen-row'),
					bossNextRow = bossCurrentRow.prev(),
					bossNextPixel = bossNextRow.find('#' + bossCurrentPixelID);

				bossNextPixel.append(firePixel);
			}
		})
	}

	//GAME SCORE
	function updategameScore() {
		var scoreForThisPilot = 100;

		if (storageLastPilot == 'Betty' || storageLastPilot == 'Speedking') {
			scoreForThisPilot = 200;
		}

		gameScore = gameScore + scoreForThisPilot;
		$('#score-label').html(gameScore)
		return gameScore;
	}

	function updateBridgeScore() {
		var bridgeScore = localStorage.getItem('BRIDGE');
		bridgeScore = Number(bridgeScore) + 1;
		localStorage.setItem('BRIDGE', bridgeScore);
		$('#bridge-label').html(bridgeScore)
	}

	//GAMEND
	function gameEnded(interval) {
		localStorage.setItem('RUN', Number(storageCurrentRun) + 1);
		clearInterval(interval);
		interval = null;
		$body.attr('data-gameended','yes');
		showSelectScreen(gameScreen,'end');
	}

	//GAMEWIN
	function winGame() {
		clearInterval(interval);
		interval = null;
		$body.attr('data-gameended','yes');
		localStorage.setItem('WON','yes');
		showSelectScreen(gameScreen,'win');
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
			case 0:
				from = Math.floor(pixelSize / 1.3);
				to = from + 1;
				break;
			case 1:
				from = Math.ceil(pixelSize / 1.8);
				to = from + 2;
				break;
			case 2:
				from = Math.ceil(pixelSize / 5);
				to = from + 4;
				break;
			default:
				from = Math.ceil(pixelSize / 1.8);
				to = from + 2;
				break;
		}

		return {from,to};
	}

	function initTimingStuff(gameSpeed,started) {
		var	startMoment = Date.now();

		interval = setInterval(function() {
			var intervalNewTime = Date.now(),
				riverMeander = Number($body.attr('data-meander')),
				bridgeDestroyed = localStorage.getItem('BRIDGE');

			//SCROLL SCREEN
			scrollScreen(startMoment,gameSpeed,intervalNewTime,riverMeander,bridgeDestroyed);
			sanitizeRowsAfterScroll();
			updateAndCheckFuelAmount();
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
			if (storageLastPilot == 'Betty') {
				scrollFire(bridgeDestroyed);
				scrollFire(bridgeDestroyed);	
			} else {
				scrollFire(bridgeDestroyed);
				scrollFire(bridgeDestroyed);
				scrollFire(bridgeDestroyed);
			}
			//SCROLL-CHECK BOSS
			if (bridgeDestroyed > 9 && $('enemy-pixel.boss').length) {
				bossFire();
				$('enemy-pixel.boss').not('.zeds-dead').length ? scrollBoss() : winGame();
			}
		}, gameSpeed);
	}

	//SOUNDS
	function playSound(sound) {
		var whichSound = "snd-" + sound,
			playerID = document.getElementById(whichSound);
		playerID.play();
	}

	//CLICK ON PILOT CHOOSER ACTIONS
	$(document).on('click','pilot-chooser #first-start', function(e) {
		$('body').attr('data-screenchoose','no')
		$('pilot-choose').remove();
		setupGamingScreen(screenWidth,screenHeight,gameScreen)
		philScreen(screenWidth,screenHeight,pixelSize,playWidth,gameScreen,0,riverMeander);
		setupPlayer();
		initTimingStuff(gameSpeed)
		$body.attr('data-gamestarted','yes');
	});

	$(document).on('click','pilot-chooser .pick-a-pilot', function(e) {
		e.preventDefault()
		var isStarted = $body.attr('data-gamestarted'),
			isEnded = $body.attr('data-gameended');
		
		if (isStarted == "yes" && isEnded == "yes") {
			var thisPilot = $(this).attr('data-pilotname');
			localStorage.setItem('PILOT',thisPilot);
			location.reload();
		}
	});

	$(document).on('click','pilot-chooser #restart-game', function(e) {
		console.log('123')
		e.preventDefault()
		localStorage.setItem('RUN','1');
		localStorage.setItem('BRIDGE','0');
		localStorage.setItem('PILOT','Bob');
		localStorage.setItem('WON','no');
		location.reload();
	});

	//CONTROLS EVENTS
	document.addEventListener('keyup', function(e) {
		$('touch-controls').addClass('hidden')
		controlPlayerPixel(e.keyCode);
	});

	$(document).on('touchstart','body', function () {
		$('touch-controls').removeClass('hidden')
	});

	$(document).on('touchend','touch-controls a', function () {
		controlPlayerPixel(Number($(this).attr('id')));
	});
});