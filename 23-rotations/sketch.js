'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// $color1: rgba(187, 216, 179, 1);
// $color2: rgba(243, 182, 31, 1);
// $color3: rgba(162, 159, 21, 1);
// $color4: rgba(81, 13, 10, 1);
// $color5: rgba(25, 17, 2, 1);

var bgCol = [25, 17, 2];
var strokeCol = [81, 13, 10];
var fillCol = [243, 182, 31];
var fillCol2 = [162, 159, 21];

var bigR = 400;
var rotation = 0;
var rotationInc = -0.008;
var initialOpacity = 0.1;
var scaffoldObjects = [];

var staticIterations = 8;

var slider = void 0;

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(RGB, 255, 255, 255, 1);
	rectMode(CENTER);
	smooth();
	createScaffolds();

	slider = createSlider(0, TWO_PI, 0, 0.1);
	slider.position(width * 0.1, height * 0.1);
	slider.size(width * 0.07);
	slider.style('outline', 'none');

	background(bgCol);
}

function draw() {
	// --- Draw 
	translate(width / 2, height / 2);
	background.apply(undefined, bgCol.concat([0.001]));

	rotate(rotation);
	rotation -= rotationInc;

	scaffoldObjects.forEach(function (obj, index) {
		obj.rotation = (1 - index / scaffoldObjects.length) * slider.value();
		obj.decoDraw();
	});
}

function createScaffolds() {
	scaffoldObjects = [];
	for (var i = 0; i < staticIterations; i++) {
		var rad = 40 + i * 50;
		scaffoldObjects.push(new Scaffold(rad, initialOpacity, 0));
	}
}

function regPolygon(cx, cy, rad, sides) {
	beginShape();
	var step = TWO_PI / sides;
	for (var i = 0; i <= sides; i++) {
		var x = cos(i * step) * rad;
		var y = sin(i * step) * rad;
		vertex(x, y);
	}
	endShape();
}

function createCornersRegPoly(cx, cy, rad, sides) {
	var res = [];
	var step = TWO_PI / sides;
	for (var i = 0; i < sides; i++) {
		var x = cos(i * step) * rad;
		var y = sin(i * step) * rad;
		res.push(new Point(x, y));
	}
	return res;
}

var Scaffold = function () {
	function Scaffold(size, opacity, rot) {
		_classCallCheck(this, Scaffold);

		this.scaffold = createCornersRegPoly(0, 0, size, 3);
		this.size = size;
		this.opacity = opacity;
		this.rotation = rot;
	}

	_createClass(Scaffold, [{
		key: 'decoDraw',
		value: function decoDraw() {
			var _this = this;

			push();
			rotate(this.rotation);
			fill.apply(undefined, fillCol.concat([this.opacity]));
			stroke.apply(undefined, strokeCol.concat([0.1]));
			this.scaffold.forEach(function (corner) {
				push();
				translate(corner.x, corner.y);
				rotate(rotation * 1.61 * 3.14);
				regPolygon(0, 0, _this.size / 4, 3);
				regPolygon(0, 0, _this.size / 12, 5);
				pop();
			});
			pop();
		}
	}]);

	return Scaffold;
}();

var Point = function Point(x, y) {
	_classCallCheck(this, Point);

	this.x = x;
	this.y = y;
};

function windowResized() {
	createCanvas(windowWidth, windowHeight);
	createScaffolds();
	slider.position(width * 0.1, height * 0.1);
	slider.size(width * 0.07);
	background(bgCol);
}