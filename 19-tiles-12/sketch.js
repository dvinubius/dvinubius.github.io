"use strict";

// palette
// $color1: rgba(211, 189, 176, 1);
// $color2: rgba(193, 174, 159, 1);
// $color3: rgba(137, 147, 124, 1);
// $color4: rgba(113, 91, 100, 1);
// $color5: rgba(105, 56, 92, 1);


var backgroundCol = [255, 255, 255, 1];
var basicStrokeCol = [105, 56, 92, 1];
var strokeCol2 = [193, 174, 159];
var fillCol = [137, 147, 124];
var tileGrid = void 0;
var config = void 0;
var gridSize = 42;

var minThickness = 1;
var maxThickness = 2;

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

	noLoop();
}

function createMyTileGrid() {
	tileGrid = TileGrid.createInstance(config);
	var commandVals = createCommandValGrid(tileGrid.gridSize);

	tileGrid.applyEach(function (tile, x, y) {
		return tile.direction = commandVals.get(x, y);
	});
}

function createCommandValGrid(size) {
	var vals = [];

	// 0 - line, 1 - triangle down, 2 - triangle up

	for (var i = 0; i < size; i++) {
		vals[i] = [];
		for (var j = 0; j < size; j++) {
			var rand = floor(random(0, 3000));
			vals[i][j] = rand < 2200 ? 0 : rand < 2985 ? 1 : 2;
		}
	}
	return Grid.createFromMatrix(vals);
}

function drawTile(tile) {
	stroke(basicStrokeCol);
	// strokeWeight(minThickness);
	strokeWeight(random([minThickness, maxThickness]));

	if (tile.isEvenCol()) {
		if (tile.direction === 0) {
			// stroke(strokeCol2);
			// strokeWeight(minThickness);
			// draw line
			line(tile.x + tile.size * 0.5, tile.y, tile.x + tile.size * 0.5, tile.y + tile.size);
		} else {
			var gutter = 1;
			// triangle
			var p1 = {},
			    p2 = {},
			    p3 = {};
			if (tile.direction === 1) {
				p1.x = tile.x;
				p1.y = tile.y + gutter;
				p2.x = tile.x + tile.size;
				p2.y = tile.y + gutter;
				p3.x = tile.x + tile.size * 0.5;
				p3.y = tile.y + tile.size - gutter;
				noFill();
			} else {
				p1.x = tile.x + tile.size * 0.5;
				p1.y = tile.y + gutter;
				p2.x = tile.x;
				p2.y = tile.y + tile.size - gutter;
				p3.x = tile.x + tile.size;
				p3.y = tile.y + tile.size - gutter;
				fill(fillCol);
				noStroke();
			}
			triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
		}
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