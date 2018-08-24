"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// $color1: rgba(220, 255, 253, 1);
// $color2: rgba(82, 255, 238, 1);
// $color3: rgba(79, 180, 119, 1);
// $color4: rgba(63, 102, 52, 1);
// $color5: rgba(52, 85, 17, 1);
// color6: rgba(190,20,20,1);

// const bgCol = [220, 255, 253];
var bgCol = [52, 85, 17];
var strokeCol = [190, 20, 20];
var fillCol = [82, 255, 238];

var bigR = 250;
var rotation = 0;
var rotationInc = 0.01;
var iterations = 160;
var decoObjects = [];
var radVariationFactorMax = 1.61;
var radVariationFactorMin = 1 / 1.61;
var radVariationInc = 0.01;
var radVariationFactor = 1.61;
var radVariationDirection = 1;

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(RGB, 255, 255, 255, 1);
	rectMode(CENTER);
	smooth();

	buildDeco();
	background(bgCol);
}

function draw() {

	background(bgCol);

	translate(width / 2, height / 2);

	// --- Draw along big circle

	rotate(rotation);

	stroke.apply(undefined, strokeCol.concat([0.1]));
	// noFill();
	fill.apply(undefined, fillCol.concat([0.1]));

	decoObjects.forEach(function (obj, index) {
		push();
		translate(obj.x, obj.y);
		rotate(rotation * 1.61 * index / decoObjects.length * 2);
		rect(0, 0, obj.width * radVariationFactor, obj.height * radVariationFactor);
		pop();
	});

	// radVariationFactor += radVariationDirection*radVariationInc;
	// if (radVariationFactor >= radVariationFactorMax) {
	// 	radVariationDirection = -1;
	// } else if (radVariationFactor <= radVariationFactorMin) {
	// 	radVariationDirection = 1;
	// }
	rotation -= rotationInc;
}

function buildDeco() {
	var step = TWO_PI / (iterations / 2);
	for (var i = 0; i < iterations; i++) {
		var vx = cos(i * step);
		var vy = sin(i * step);
		var dist = bigR * i / iterations;
		var rad = bigR / 1.61 * i / iterations;
		var obj = new DecoObject(vx * dist, vy * dist, rad, rad, 1);
		decoObjects.push(obj);
	}
}

var DecoObject = function DecoObject(x, y, w, h, op) {
	_classCallCheck(this, DecoObject);

	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.opacity = op;
};

function windowResized() {
	createCanvas(windowWidth, windowHeight);
	decoObjects = [];
	buildDeco();
}