"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var backgroundCol = [240, 240, 255];
var basicStrokeCol = [20, 20, 10, 0.8];
var tileGrid = void 0;
var config = void 0;
var gridSize = 12;

var levelsPerTile = 3;
var stopsPerTile = 3;
var minThickness = 3;
var maxThickness = 7;

function setup() {
	createCanvas(windowWidth, windowHeight);
	angleMode(DEGREES);
	var ts = min(width, height) * 0.6 / gridSize;
	config = new TileGridConfig(gridSize, // gridSize - # of tiles per side ?
	ts, // no tileSize - maximum sized, still fitting the screen decently
	true);
	createMyTileGrid();
	colorMode(RGB, 255, 255, 255, 1);
}

function draw() {
	background(backgroundCol);

	translate(-width * 0.2, -height * 0.05);
	scale(1.4, 1);
	tileGrid.applyEach(drawTile);

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
		var commandVals = new Array(levelsPerTile).fill();
		tile.direction = commandVals.map(function () {
			return floor(random(0, stopsPerTile));
		});
	});
}

function drawTile(tile) {
	strokeWeight(tile.strokeWeight);

	var createChangePoints = function createChangePoints(commandVals, stops) {
		var stepX = tile.size / (stops - 1);
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
		var strokeCol = void 0;
		var strokeColBase = void 0;
		var desc = p.x < nextP.x;
		if (desc) {
			strokeColBase = [90, 50, 250];
			strokeCol = [].concat(_toConsumableArray(strokeColBase), [0.8]);
		} else {
			strokeColBase = [150, 20, 20];
			strokeCol = [].concat(_toConsumableArray(strokeColBase), [0.6]);
		}
		stroke(strokeCol);
		line(p.x, p.y, nextP.x, nextP.y);

		var iterations = 64;
		for (var i = 1; i <= iterations; i++) {
			push();
			var diffX = nextP.x - p.x;
			var diffY = nextP.y - p.y;
			if (desc) {
				translate(0, i);
			} else {
				translate(0, i);
			}
			strokeWeight(1);
			stroke.apply(undefined, _toConsumableArray(strokeColBase).concat([0.006 * (iterations - i)]));
			line(p.x, p.y, p.x + diffX, p.y + diffY);
			pop();
		}
	});
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