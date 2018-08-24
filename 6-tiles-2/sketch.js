"use strict";

var backgroundCol = [140, 110, 130];
var basicStrokeCol = [250, 150, 150];
var highlightStrokeCol = [210, 145, 0];
var gridContourCol = [250, 150, 150];

var tileSize = void 0;
var noOfTiles = void 0;

var canvasSize = void 0;
var halfDiag = void 0;
var tileGrid = void 0;

var gridConfig = void 0;

function setup() {
	setupSize();
	createCanvas(windowWidth, windowHeight);
	createMyTileGrid();
}

function draw() {
	background.apply(undefined, backgroundCol);
	tileGrid.applyEach(drawTile);
	tileGrid.drawFrameSelf(gridContourCol, 3);
}

function createMyTileGrid() {
	tileGrid = TileGrid.createInstance(gridConfig);
	tileGrid.applyEach(function (tile) {
		return tile.direction = floor(random(0, 2));
	});
	tileGrid.applyEach(function (tile) {
		return tile.strokeWeight = 1;
	});
	tileGrid.applyEach(function (tile) {
		return tile.strokeCol = basicStrokeCol;
	});
	tileGrid.applyEach(function (tile) {
		tile.circleOffset = random(-0.5 * tile.size, 0.5 * tile.size);
		tile.circleVel = random(0, 2) > 1 ? 1 : -1;
	});
}

function drawTile(tile) {
	var ts = tile.size;
	var tl = { x: tile.x, y: tile.y },
	    tr = { x: tile.x + ts, y: tile.y },
	    bl = { x: tile.x, y: tile.y + ts },
	    br = { x: tile.x + ts, y: tile.y + ts },
	    cen = { x: tile.x + ts / 2, y: tile.y + ts / 2 };


	strokeWeight(tile.strokeWeight);
	stroke(tile.strokeCol);
	if (tile.isEvenCol()) {
		strokeWeight(tile.strokeWeight + 2);
		line(tl.x, tl.y, br.x, br.y);
		strokeWeight(tile.strokeWeight);
	} else {
		line(tr.x, tr.y, bl.x, br.y);
	}

	if (tile.isEvenCol() &&
	// !tile.isEvenRow() && 
	!tileGrid.isOnEdge(tile)) {
		fill(highlightStrokeCol, 50);
		var posX = cen.x;
		var posY = cen.y;
		var rad = ts / 2 + tile.circleOffset / 2;
		ellipse(posX, posY, rad, rad);
		tile.circleOffset += tile.circleVel;
		if (tile.circleOffset > ts / 2 || tile.circleOffset < -ts / 2) {
			tile.circleVel = -1 * tile.circleVel;
		}
	}
}

function windowResized() {
	setupSize();
	resizeCanvas(windowWidth, windowHeight);
	createMyTileGrid();
}

function setupSize() {
	var _computeSizeSetup = computeSizeSetup(),
	    size = _computeSizeSetup.size,
	    numberOf = _computeSizeSetup.numberOf;

	tileSize = size;
	noOfTiles = numberOf;

	gridConfig = new TileGridConfig(noOfTiles + 1, // gridSize - # of tiles per side 
	tileSize, // length of the side of one tile
	true // center grid in canvas?  
	);
}

function computeSizeSetup() {
	var minSide = Math.min(window.innerHeight, window.innerWidth);
	var size = minSide > 600 ? 50 : 30;
	var numberOf = Math.floor(minSide * 0.75 / size);
	if (numberOf % 2 !== 0) {
		numberOf--;
	}
	return { size: size, numberOf: numberOf };
}