"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// palette
// $color1: rgba(223, 154, 87, 1);
// $color2: rgba(252, 122, 87, 1);
// $color3: rgba(252, 215, 87, 1);
// $color4: rgba(238, 252, 87, 1);
// $color5: rgba(94, 91, 82, 1);

var backgroundCol = [94, 91, 82];
var basicStrokeCol = [252, 215, 87, 1];
var tileGrid = void 0;
var config = void 0;
var gridSize = 48;

var levelsPerTile = 12;
var stopsPerTile = 8;
var minThickness = 1;
var maxThickness = 3;

var layers = 1;

function setup() {
	createCanvas(windowWidth, windowHeight);
	var ts = min(width, height) * 0.7 / gridSize;
	config = new TileGridConfig(gridSize, // gridSize - # of tiles per side ?
	ts, // no tileSize - maximum sized, still fitting the screen decently
	true);
	createMyTileGrid();
	colorMode(RGB, 255, 255, 255, 1);
}

function draw() {
	background(backgroundCol);

	tileGrid.applyEach(drawTile);

	// repeat overlapping grid
	for (var i = 0; i < layers - 1; i++) {
		createMyTileGrid();
		tileGrid.applyEach(drawTile);
	}

	noLoop();
}

function createMyTileGrid() {
	tileGrid = TileGrid.createInstance(config);
	tileGrid.applyEach(function (tile) {
		return tile.strokeWeight = floor(random(minThickness, maxThickness));
	});
	tileGrid.applyEach(function (tile) {
		return tile.strokeCol = basicStrokeCol;
	});

	tileGrid.applyEach(function (tile) {
		var commandVals = new Array(levelsPerTile + 1).fill();
		var seed = floor(random(0, stopsPerTile + 1));
		var lastComVal = seed;
		for (var i = 0; i < commandVals.length; i++) {
			var currentComVal = void 0;
			if (lastComVal === 0) {
				currentComVal = random([0, 1]);
			} else if (lastComVal === stopsPerTile) {
				currentComVal = random([stopsPerTile - 1, stopsPerTile]);
			} else {
				currentComVal = random([lastComVal - 1, lastComVal, lastComVal + 1]);
			}
			commandVals[i] = currentComVal;
			lastComVal = currentComVal;
		}

		tile.direction = commandVals;
	});
}

function drawTile(tile) {
	if (tile.isEvenCol()) {
		strokeWeight(tile.strokeWeight);
		stroke.apply(undefined, _toConsumableArray(tile.strokeCol));

		var createChangePoints = function createChangePoints(commandVals, stops) {
			var stepX = tile.size / stops;
			var stepY = tile.size / (commandVals.length - 1);
			return commandVals.map(function (command, index) {
				return {
					x: tile.x + stepX * command,
					y: tile.y + stepY * index
				};
			});
		};

		var changePoints = createChangePoints(tile.direction, stopsPerTile);

		changePoints.forEach(function (p, index) {
			if (index === changePoints.length - 1) {
				return;
			}

			var nextP = changePoints[index + 1];
			line(p.x, p.y, nextP.x, nextP.y);
		});
	}
}

// ========================== //

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	createMyTileGrid();
	loop();
}

function mouseWheel(event) {
	var newSize = tileGrid.gridSize - event.delta / 100;
	if (newSize < 100 && newSize > 10) {
		config.gridSize = newSize;
		createMyTileGrid();
		loop();
	}
}

function reset() {
	createMyTileGrid();
	loop();
}