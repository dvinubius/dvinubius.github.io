'use strict';

function addHorizontalPiece(i, j) {
	var editorGridStep = editorSize / editorGridSize;
	var thick = editorPieceThickness;
	var posX = i * editorGridStep;
	var posY = j * editorGridStep;
	var width = editorGridStep;
	var height = 0;
	var cssText = '\n\t\tborder-top: ' + thick / 2 + 'px solid currentColor;\n\t\tborder-bottom: ' + thick / 2 + 'px solid currentColor;\n\t';
	var editorLayerClass = 'editor-layer-basic';

	// for display in editor
	var newPiece = addPieceToEditor(posX, posY, width, height, cssText, editorLayerClass);
	// for use in pattern
	var newCommand = function newCommand(tile) {
		var x = tile.x;
		var y = tile.y;
		var step = tile.size / editorGridSize;
		return {
			command: line,
			args: [x + i * step, y + j * step, x + (i + 1) * step, y + j * step]
		};
	};

	editorPiecesCommands.push({
		editorPiece: newPiece,
		commandVal: function commandVal(tile) {
			return newCommand(tile);
		}
	});
};

function addVerticalPiece(i, j) {
	var editorGridStep = editorSize / editorGridSize;
	var thick = editorPieceThickness;
	var posX = i * editorGridStep;
	var posY = j * editorGridStep;
	var width = editorGridStep;
	var height = 0;
	var cssText = '\n\t\tborder-top: ' + thick / 2 + 'px solid currentColor;\n\t\tborder-bottom: ' + thick / 2 + 'px solid currentColor;\n\t\ttransform-origin: 0px 50%;\n\t\ttransform: rotateZ(90deg);\n\t';
	var editorLayerClass = 'editor-layer-basic';

	// for display in editor
	var newPiece = addPieceToEditor(posX, posY, width, height, cssText, editorLayerClass);
	// for use in pattern
	var newCommand = function newCommand(tile) {
		var x = tile.x;
		var y = tile.y;
		var step = tile.size / editorGridSize;
		return {
			command: line,
			args: [x + i * step, y + j * step, x + i * step, y + (j + 1) * step]
		};
	};
	editorPiecesCommands.push({
		editorPiece: newPiece,
		commandVal: function commandVal(tile) {
			return newCommand(tile);
		}
	});
}

function addDiagonals(i, j) {
	var editorGridStep = editorSize / editorGridSize;
	var thick = editorPieceThickness;
	var horizontalLength = editorGridStep;
	var diagonalLength = horizontalLength * sqrt(2);
	var height = 0;
	var posX1 = i * editorGridStep;
	var posY1 = j * editorGridStep;
	var posX2 = (i + 1) * editorGridStep;
	var posY2 = j * editorGridStep;
	// TL-BR
	var cssText1 = '\n\t\tborder-top: ' + thick / 2 + 'px solid currentColor;\n\t\tborder-bottom: ' + thick / 2 + 'px solid currentColor;\n\t\ttransform-origin: 0px 50%;\n\t\ttransform: rotateZ(45deg);\n\t';
	// TR-BL
	var cssText2 = '\n\t\tborder-top: ' + thick / 2 + 'px solid currentColor;\n\t\tborder-bottom: ' + thick / 2 + 'px solid currentColor;\n\t\ttransform-origin: 0% 50%;\n\t\ttransform: rotateZ(135deg);\n\t\t';
	var editorLayerClass = 'editor-layer-basic';

	// for display in editor
	var newPiece1 = addPieceToEditor(posX1, posY1, diagonalLength, height, cssText1, editorLayerClass);
	var newPiece2 = addPieceToEditor(posX2, posY2, diagonalLength, height, cssText2, editorLayerClass);

	// for use in pattern
	// tl-br
	var newCommand1 = function newCommand1(tile) {
		var x = tile.x;
		var y = tile.y;
		var step = tile.size / editorGridSize;
		return {
			command: line,
			args: [x + i * step, y + j * step, x + (i + 1) * step, y + (j + 1) * step]
		};
	};

	//tr-bl
	var newCommand2 = function newCommand2(tile) {
		var x = tile.x;
		var y = tile.y;
		var step = tile.size / editorGridSize;
		return {
			command: line,
			args: [x + (i + 1) * step, y + j * step, x + i * step, y + (j + 1) * step]
		};
	};

	editorPiecesCommands.push({
		editorPiece: newPiece1,
		commandVal: function commandVal(tile) {
			return newCommand1(tile);
		}
	});
	editorPiecesCommands.push({
		editorPiece: newPiece2,
		commandVal: function commandVal(tile) {
			return newCommand2(tile);
		}
	});
}

// ------------- LINES ACROSS TOP TO BOTTOM -------------- //


function addLinesAcrossTopDown() {

	var corners = [{
		x: 0,
		y: 0
	}, {
		x: editorSize,
		y: 0
	}, {
		x: editorSize,
		y: editorSize
	}, {
		x: 0,
		y: editorSize
	}];

	corners.forEach(linesAcrossTDForCorner);
}

function linesAcrossTDForCorner(_ref) {
	var posXCorner = _ref.x,
	    posYCorner = _ref.y;

	var _loop = function _loop(j) {

		var editorGridStep = editorSize / editorGridSize;
		var cathete1 = editorSize;
		var cathete2 = editorGridStep * j;
		var hypothenuse = sqrt(cathete1 ** 2 + cathete2 ** 2);
		var theta = asin(cathete2 / hypothenuse);
		var rotation = cssRotationForCornerTD(theta, posXCorner, posYCorner);

		var thick = editorPieceThickness;
		var width = hypothenuse;
		var height = 0;
		var cssText = '\n\t\t\tborder-top: ' + thick / 2 + 'px solid currentColor;\n\t\t\tborder-bottom: ' + thick / 2 + 'px solid currentColor;\n\t\t\ttransform-origin: 0px 50%;\n\t\t\ttransform: rotateZ(' + rotation + 'deg);\n\t\t';

		var editorLayerClass = 'editor-layer-across';

		var signDiffX = posXCorner === 0 ? 1 : -1;
		var signDiffY = posYCorner === 0 ? 1 : -1;

		// for display in editor
		var newPiece = addPieceToEditor(posXCorner, posYCorner, width, height, cssText, editorLayerClass);
		// for use in pattern
		var newCommand = function newCommand(tile) {
			var s = tile.size;
			var step = s / editorGridSize;
			var cornerDiffX = posXCorner > 0 ? s : 0;
			var cornerDiffY = posYCorner > 0 ? s : 0;
			var startX = tile.x + cornerDiffX;
			var startY = tile.y + cornerDiffY;
			return {
				command: line,
				args: [startX, startY, startX + signDiffX * j * step, startY + signDiffY * s]
			};
		};

		editorPiecesCommands.push({
			editorPiece: newPiece,
			commandVal: function commandVal(tile) {
				return newCommand(tile);
			}
		});
	};

	for (var j = 1; j < editorGridSize; j++) {
		_loop(j);
	}
}

function cssRotationForCornerTD(angle, posXCorner, posYCorner) {
	if (posXCorner === 0 && posYCorner === 0) {
		// TOP LEFT
		return 90 - angle;
	}
	if (posXCorner > 0 && posYCorner === 0) {
		// TOP RIGHT
		return 90 + angle;
	}
	if (posXCorner > 0 && posYCorner > 0) {
		// BOTTOM RIGHT
		return -(90 + angle);
	}
	if (posXCorner === 0 && posYCorner > 0) {
		// BOTTOM LEFT
		return -(90 - angle);
	}

	throw new Error('invalid values for a corner');
}

// ----------- LINES ACROSS LEFT TO RIGHT ------------- //

function addLinesAcrossLeftRight() {

	var corners = [{
		x: 0,
		y: 0
	}, {
		x: editorSize,
		y: 0
	}, {
		x: editorSize,
		y: editorSize
	}, {
		x: 0,
		y: editorSize
	}];

	corners.forEach(linesAcrossLRForCorner);
}

function linesAcrossLRForCorner(_ref2) {
	var posXCorner = _ref2.x,
	    posYCorner = _ref2.y;

	var _loop2 = function _loop2(j) {

		var editorGridStep = editorSize / editorGridSize;
		var cathete1 = editorSize;
		var cathete2 = editorGridStep * j;
		var hypothenuse = sqrt(cathete1 ** 2 + cathete2 ** 2);
		var theta = asin(cathete2 / hypothenuse);
		var rotation = cssRotationForCornerLR(theta, posXCorner, posYCorner);

		var thick = editorPieceThickness;
		var width = hypothenuse;
		var height = 0;
		var cssText = '\n\t\t\tborder-top: ' + thick / 2 + 'px solid currentColor;\n\t\t\tborder-bottom: ' + thick / 2 + 'px solid currentColor;\n\t\t\ttransform-origin: 0px 50%;\n\t\t\ttransform: rotateZ(' + rotation + 'deg);\n\t\t';

		var editorLayerClass = 'editor-layer-across';

		var signDiffX = posXCorner === 0 ? 1 : -1;
		var signDiffY = posYCorner === 0 ? 1 : -1;

		// for display in editor
		var newPiece = addPieceToEditor(posXCorner, posYCorner, width, height, cssText, editorLayerClass);
		// for use in pattern
		var newCommand = function newCommand(tile) {
			var s = tile.size;
			var step = s / editorGridSize;
			var cornerDiffX = posXCorner > 0 ? s : 0;
			var cornerDiffY = posYCorner > 0 ? s : 0;
			var startX = tile.x + cornerDiffX;
			var startY = tile.y + cornerDiffY;
			return {
				command: line,
				args: [startX, startY, startX + signDiffX * s, startY + signDiffY * j * step]
			};
		};

		editorPiecesCommands.push({
			editorPiece: newPiece,
			commandVal: function commandVal(tile) {
				return newCommand(tile);
			}
		});
	};

	for (var j = 1; j < editorGridSize; j++) {
		_loop2(j);
	}
}

function cssRotationForCornerLR(angle, posXCorner, posYCorner) {
	if (posXCorner === 0 && posYCorner === 0) {
		// TOP LEFT
		return angle;
	}
	if (posXCorner > 0 && posYCorner === 0) {
		// TOP RIGHT
		return 180 - angle;
	}
	if (posXCorner > 0 && posYCorner > 0) {
		// BOTTOM RIGHT
		return 180 + angle;
	}
	if (posXCorner === 0 && posYCorner > 0) {
		// BOTTOM LEFT
		return -angle;
	}

	throw new Error('invalid values for a corner');
}