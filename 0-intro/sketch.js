'use strict';

var xoff = 0.00;
var counterX = void 0;
var counterXMax = void 0;
var counterXDir = 1;
var counterXStep = 1;

function setup() {
	createCanvas(windowWidth, windowHeight);
	// background(245,245,245);
	background(0, 0, 0);
	colorMode(RGB, 255, 255, 255, 1);
	counterX = width / 2;
	counterXMax = width;
}

function draw() {
	if (counterX > counterXMax) {
		counterXDir = -1;
	}
	if (counterX < 0) {
		counterXDir = 1;
	}
	counterX += counterXDir * counterXStep;

	var n1 = noiseVal(); // between 0 and 1
	var n2 = noiseVal();
	var green1 = map(n1, 0, 1, 0, 255);
	var green2 = map(n2, 0, 1, 0, 255);
	var alpha1 = map(n1, 0, 1, 0.2, 0.6);
	var alpha2 = map(n2, 0, 1, 0.2, 0.6);
	var posX1 = counterX;
	var posX2 = width - counterX;
	var posY = random(0, height);
	noStroke();
	fill(0, green1, 0, alpha1);
	ellipse(posX1, posY, 30, 30);
	fill(0, green2, 0, alpha2);
	ellipse(posX2, posY, 30, 30);
}

function noiseVal() {
	xoff += 0.01;
	return noise(xoff);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	background(0, 0, 0);
	counterX = width / 2;
	counterXMax = width;
	xoff = 0;
}