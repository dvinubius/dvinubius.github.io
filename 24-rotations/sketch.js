"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// $color1: rgba(250, 25, 13, 1);
// $color1: rgba(255, 255, 255, 1);
// $color2: rgba(0, 167, 225, 1);
// $color3: rgba(0, 23, 31, 1);
// $color4: rgba(0, 52, 89, 1);
// $color5: rgba(0, 126, 167, 1);

// const bgCol = [220, 255, 253];
var bgCol = [0, 23, 31];
var strokeCol = [250, 25, 13];
var fillCol = [0, 167, 225];

var bigR = 200;
var rotation = 0;
var rotationInc = 0.01;
var iterations = 80;
var decoObjectGroups = [];
var radVariationFactor = 1.61;
var initialOp = 0.2;

var tracking = false;

var Point = function Point(x, y) {
	_classCallCheck(this, Point);

	this.x = x;
	this.y = y;
};

var sourcePoints = [new Point(-300, -400),
// new Point(350,350),
new Point(-120, 400), new Point(350, -100)];

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(RGB, 255, 255, 255, 1);
	rectMode(CENTER);
	smooth();

	buildDeco();
	updateAllDecoPos(-80, -120);
	background(bgCol);
}

function draw() {

	background.apply(undefined, bgCol);

	translate(width / 2, height / 2);

	if (tracking) {
		var currX = mouseX - width / 2;
		var currY = mouseY - height / 2;
		updateAllDecoPos(currX, currY);
	}

	stroke.apply(undefined, strokeCol.concat([0.1]));
	// noFill();
	fill.apply(undefined, fillCol.concat([0.1]));

	decoObjectGroups.forEach(function (g, g_index) {
		return g.forEach(function (obj, index) {
			push();
			translate(sourcePoints[g_index].x, sourcePoints[g_index].y);
			translate(obj.x, obj.y);
			rotate(rotation * 1.61 * (0.3 + index / g.length * 2));
			fill.apply(undefined, fillCol.concat([obj.opacity]));
			stroke.apply(undefined, strokeCol.concat([obj.opacity]));
			rect(0, 0, obj.width * radVariationFactor, obj.height * radVariationFactor);
			pop();
		});
	});

	rotation -= rotationInc;
}

function buildDeco() {
	sourcePoints.forEach(function (p) {
		var decoObjects = [];
		var step = TWO_PI / iterations;
		for (var i = 0; i < iterations; i++) {
			var vx = cos(i * step);
			var vy = sin(i * step);
			var dist = bigR * (i / iterations);
			var rad = bigR / 1.61 * i / iterations;
			var obj = new DecoObject(vx * dist, vy * dist, rad, rad, initialOp * 0.05 + map(i / (iterations - 1), 0, 1, initialOp * 0.95, 0));
			decoObjects.push(obj);
		}
		decoObjectGroups.push(decoObjects);
	});
}

function updateAllDecoPos(currX, currY) {
	decoObjectGroups.forEach(function (g, g_index) {
		return g.forEach(function (obj, index) {
			var origin = sourcePoints[g_index];
			var groupX = currX - origin.x;
			var groupY = currY - origin.y;
			obj.updateDecoPos(groupX, groupY, index, g.length);
		});
	});
}

var DecoObject = function () {
	function DecoObject(x, y, w, h, op) {
		_classCallCheck(this, DecoObject);

		this.initialX = x;
		this.initialY = y;
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.opacity = op;
	}

	_createClass(DecoObject, [{
		key: "updateDecoPos",
		value: function updateDecoPos(currX, currY, index, total) {
			var diffX = currX - this.initialX;
			var diffY = currY - this.initialY;
			var amount = index / (total - 1);
			this.x = this.initialX + amount * diffX;
			this.y = this.initialY + amount * diffY;
		}
	}]);

	return DecoObject;
}();

function mouseMoved() {
	tracking = true;
}

function windowResized() {
	createCanvas(windowWidth, windowHeight);
	decoObjectGroups = [];
	buildDeco();
	updateAllDecoPos(-80, -120);
}