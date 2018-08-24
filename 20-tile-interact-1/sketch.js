'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// palette
// $color1: rgba(57, 62, 65, 1);
// $color2: rgba(211, 208, 203, 1);
// $color2: rgba(227, 99, 151, 1);
// $color3: rgba(231, 229, 223, 1);
// $color4: rgba(188, 141, 167, 1);
// $color5: rgba(189, 180, 191, 1);

var backgroundCol = [31, 37, 40];
var basicStrokeCol = [231, 229, 223];
var resultStrokeCol = [189, 180, 191];
var resultFrameCol = resultStrokeCol;
var tileGrid = void 0;
var gridSize = 12;

var minThickness = 2;
var maxThickness = 2;

var editor = void 0; // assigned in setup
var editorSize = void 0;
var offsetTop = 70;
var offsetLateral = 70;
var editorGridSize = 2;
var editorGrid = void 0;
var editorPieceThickness = 10;
var editorPiecesCommands = [];

var resultGridScaleFactor = 0.8;
var editorScaleFactor = 0.5;

var resultOverlayAlphaInit = .5;
var resultOverlayAlphaDecay = .02;
var resultOverlayAlpha = void 0;

var editorPattern = function editorPattern(x, y, size) {
	return [];
};

// ------------- p5 js

function setup() {
	angleMode(DEGREES);
	colorMode(RGB, 255, 255, 255, 1);
	smooth();

	createCanvas(windowWidth, windowHeight);
	initComponents();
}

function initComponents() {
	createEditor();
	createEditorGrid();
	createTileGrid();
	calcCSS();
}

function draw() {
	background(backgroundCol);

	drawEditorPattern();

	drawResultGrid();

	if (resultOverlayAlpha === 0) {
		noLoop();
	}
}

function drawEditorPattern() {
	var editorRect = editor.elt.getBoundingClientRect();
	var offset = editorPieceThickness / 2;
	var editorX = editorRect.x;
	var editorY = editorRect.y + offset;
	translate(editorX, editorY);
	stroke(resultStrokeCol);
	strokeWeight(3);
	editorGrid.applyEach(drawTileFromPattern(editorPattern));
	translate(-editorX, -editorY);
}

function drawResultGrid() {
	stroke(resultStrokeCol);
	strokeWeight(maxThickness);
	tileGrid.applyEach(drawTileFromPattern(editorPattern));
	tileGrid.drawFrameSelf(resultFrameCol, maxThickness);

	// alpha overlay
	if (resultOverlayAlpha > 0) {
		fill.apply(undefined, resultFrameCol.concat([resultOverlayAlpha]));
		rect(tileGrid.x, tileGrid.y, tileGrid.length, tileGrid.length);
		resultOverlayAlpha -= resultOverlayAlphaDecay;
	}
}

function createEditor() {
	editorSize = Math.min(window.innerWidth, window.innerHeight) * editorScaleFactor;
	editor = select('.editor-wrapper');

	for (var i = 0; i < editorGridSize + 1; i++) {
		for (var j = 0; j < editorGridSize + 1; j++) {

			var doHorizontal = i < editorGridSize;
			var doVertical = j < editorGridSize;
			var doDiag = i < editorGridSize && j < editorGridSize;

			if (doHorizontal) {
				addHorizontalPiece(i, j);
			}
			if (doVertical) {
				addVerticalPiece(i, j);
			}

			if (doDiag) {
				addDiagonals(i, j);
			}
		}
	}

	addLinesAcrossTopDown();
	addLinesAcrossLeftRight();
}

function addPieceToEditor(posX, posY, width, height, cssText, editorLayerClass) {
	var el1 = createElement('div');
	el1.addClass('editor-piece');
	el1.position(posX, posY);
	el1.size(width, height);
	if (cssText) {
		el1.style(cssText);
	}
	el1.addClass(editorLayerClass);
	el1.parent(editor);
	el1['dvn-selected'] = false;

	el1.mouseClicked(function () {
		if (!el1['dvn-selected']) {
			el1.addClass('selected');
		} else {
			el1.removeClass('selected');
		}
		el1['dvn-selected'] = !el1['dvn-selected'];
		updateEditorPattern();
		loop();
	});
	return el1;
}

function createEditorGrid() {
	var ts = editorSize;
	var config = new TileGridConfig(1, ts, false);
	editorGrid = TileGrid.createInstance(config);
}

function createTileGrid() {
	var max = min(width * resultGridScaleFactor, height * resultGridScaleFactor);
	var ts = min((width * resultGridScaleFactor - editorSize) / gridSize, max / gridSize);
	var config = new TileGridConfig(gridSize, ts, false);
	tileGrid = TileGrid.createInstance(config);
	resultOverlayAlpha = resultOverlayAlphaInit;
}

function drawTileFromPattern(pattern) {
	return function (tile) {
		noFill();
		if (tile.color) {
			stroke(tile.color);
		}
		pattern(tile).forEach(function (comm) {
			comm.command.apply(comm, _toConsumableArray(comm.args));
		});
	};
}

function updateEditorPattern() {
	var patternPieces = editorPiecesCommands.filter(function (epc) {
		return epc.editorPiece['dvn-selected'];
	});
	editorPattern = function editorPattern(tile) {
		return patternPieces.map(function (patternPiece) {
			return patternPiece.commandVal(tile);
		});
	};
}

function updateEditorLayers() {
	var selectedLayer = document.querySelector('input[name="editor-layer"]:checked').value;
	var piecesToMakeVisible = document.querySelectorAll('.editor-layer-' + selectedLayer);

	var allEditorPieces = document.querySelectorAll('.editor-piece');

	allEditorPieces.forEach(function (piece) {
		return piece.style.visibility = 'hidden';
	});
	piecesToMakeVisible.forEach(function (piece) {
		return piece.style.visibility = 'visible';
	});
}

// ========================== //

function editorGridSizeChanged(ev) {
	var newValue = +ev.target.value;
	if (newValue - round(newValue) !== 0) {
		return;
	}

	editorGridSize = newValue;
	reset();
	updateEditorLayers();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	reset();
}

function reset() {
	resetEditorAndCommands();
	initComponents();
	loop();
}

function resetEditorAndCommands() {
	var editorNode = editor.elt;
	editorNode.querySelectorAll('.editor-piece').forEach(function (piece) {
		piece.remove();
	});
	editorPiecesCommands = [];
	editorPattern = function editorPattern(x, y, size) {
		return [];
	};
}

function calcCSS() {
	var docStyle = document.documentElement.style;
	docStyle.setProperty('--col-controls', 'rgba(' + basicStrokeCol.join(',') + ')');
	docStyle.setProperty('--col-editor', 'rgba(' + basicStrokeCol.join(',') + ')');
	calcPositions();
}

function calcPositions() {
	// adjust css for editor

	offsetTop = height * 0.05;
	offsetLateral = width * 0.05;
	var docStyle = document.documentElement.style;
	docStyle.setProperty('--editor-size', editorSize);
	docStyle.setProperty('--editor-offset-top', offsetTop);
	docStyle.setProperty('--editor-offset-left', offsetLateral);

	// resultGrid pos
	var newX = width - tileGrid.length - offsetLateral;
	var newY = offsetTop;
	tileGrid.changePos(newX, newY);
}