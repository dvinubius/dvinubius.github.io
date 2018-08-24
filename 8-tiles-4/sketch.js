"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// $color1: rgba(136, 162, 170, 1);
// $color2: rgba(173, 162, 150, 1);
// $color3: rgba(226, 133, 110, 1);
// $color4: rgba(244, 44, 4, 1);
// $color5: rgba(15, 26, 32, 1);


var backgroundCol = [15, 26, 32];
var basicStrokeCol = [226, 133, 110];
var circleStrokeCol = [244, 44, 4];
var fillCol = [136, 162, 170];

var minStrokeWeightEdge = 0.33;
var minStrokeWeightCircle = 0.33;
var scaleStrokeWeight = 4;
var minCircleRad = 5;
var minCircleRadInside = 0.5;
var scaleCircleRad = 2.5;
var scaleCircleRadInside = 12;
var perspectiveScaleFactor = 5;

var tileSize = void 0;
var noOfTiles = void 0;

var canvasSize = void 0;
var diagonal = void 0;
var tileGrid = void 0;

var gridConfig = void 0;

var distXToOrigin = 0.01;
var distYToOrigin = 0.01;

function setup() {
	setupSize();
	createCanvas(canvasSize, canvasSize);
	createMyTileGrid();
	colorMode(RGB, 255, 255, 255, 1);
}

function draw() {
	background.apply(undefined, backgroundCol);
	tileGrid.applyEach(drawTileLayer1);
	tileGrid.applyEach(drawTileLayer2);
}

function createMyTileGrid() {
	tileGrid = TileGrid.createInstance(gridConfig);
	tileGrid.applyEach(function (tile) {
		return tile.strokeCol = basicStrokeCol;
	});
}

function drawTileLayer1(tile) {
	var ts = tile.size;
	var tl = { x: tile.x, y: tile.y },
	    tr = { x: tile.x + ts, y: tile.y },
	    bl = { x: tile.x, y: tile.y + ts },
	    br = { x: tile.x + ts, y: tile.y + ts };


	var scale1 = map(distYToOrigin, 0, height, 1, scaleStrokeWeight);
	var scaleP = scalePerspectiveForTile(tile);

	strokeWeight(minStrokeWeightEdge * scale1 * scaleP);
	stroke.apply(undefined, _toConsumableArray(tile.strokeCol));
	line(tl.x, tl.y, tr.x, tr.y);
	line(tl.x, tl.y, bl.x, bl.y);
}

function drawTileLayer2(tile) {

	var scale1 = map(distXToOrigin, 0, width, 1, scaleCircleRad);
	var scaleP = scalePerspectiveForTile(tile);

	strokeWeight(minStrokeWeightCircle * scale1 * scaleP);
	stroke.apply(undefined, circleStrokeCol);
	fill.apply(undefined, fillCol);
	ellipse(tile.x, tile.y, minCircleRad * scale1 * scaleP);
}

function scalePerspectiveForTile(tile) {
	var distTileToOrigin = dist(tile.x, tile.y, tileGrid.x, tileGrid.y);
	return map(distTileToOrigin, 0, diagonal, 1, perspectiveScaleFactor);
}

function mouseMoved() {
	if (insideCanvas()) {
		distXToOrigin = mouseX - tileGrid.x;
		distYToOrigin = mouseY - tileGrid.y;
	} else {
		return;
	}
}

function insideCanvas() {
	return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function windowResized() {
	setupSize();
	resizeCanvas(canvasSize, canvasSize);
	createMyTileGrid();
}

function setupSize() {
	var _computeSizeSetup = computeSizeSetup(),
	    size = _computeSizeSetup.size,
	    numberOf = _computeSizeSetup.numberOf;

	tileSize = size;
	noOfTiles = numberOf;
	canvasSize = tileSize * noOfTiles;
	diagonal = canvasSize * Math.sqrt(2);
	gridConfig = new TileGridConfig(noOfTiles + 1, // gridSize - # of tiles per side 
	tileSize // length of the side of one tile
	);
}

function computeSizeSetup() {
	var minSide = Math.min(window.innerHeight, window.innerWidth);
	var size = minSide > 600 ? 80 : 60;
	var numberOf = Math.floor(minSide * 0.75 / size);
	if (numberOf % 2 == 0) {
		numberOf--;
	}
	return { size: size, numberOf: numberOf };
}