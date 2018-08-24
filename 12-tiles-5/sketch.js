"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var backgroundCol = [210, 240, 240];
var basicStrokeCol = [30, 0, 10];
var tileGrid = void 0;
var config = void 0;
var gridSize = 20;

function setup() {
	createCanvas(windowWidth, windowHeight);
	var ts = min(width, height) * 0.7 / gridSize;
	config = new TileGridConfig(gridSize, // gridSize - # of tiles per side ?
	ts, // no tileSize - maximum sized, still fitting the screen decently
	true);
	createMyTileGrid();
}

function draw() {
	background(backgroundCol);

	tileGrid.applyEach(drawTile);

	noLoop();
}

function createMyTileGrid() {
	tileGrid = TileGrid.createInstance(config);
	tileGrid.applyEach(function (tile) {
		return tile.strokeWeight = floor(random(4, 16));
	});
	tileGrid.applyEach(function (tile) {
		return tile.strokeCol = basicStrokeCol;
	});

	tileGrid.applyEach(function (tile) {
		return tile.direction = floor(random(0, 4));
	});
}

function drawTile(tile) {
	strokeWeight(tile.strokeWeight);
	stroke.apply(undefined, _toConsumableArray(tile.strokeCol));
	var hle = tile.size * 0.5;
	var le = tile.size;
	switch (tile.direction) {
		case 0:
			line(tile.x + hle, tile.y, tile.x + le, tile.y + hle);
			break;
		case 1:
			line(tile.x, tile.y + hle, tile.x + hle, tile.y + le);
			break;
		case 2:
			line(tile.x + hle, tile.y, tile.x, tile.y + hle);
			break;
		case 3:
			line(tile.x + hle, tile.y + le, tile.x + le, tile.y + hle);
			break;
	}
}

// ========================== //

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	createMyTileGrid();
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