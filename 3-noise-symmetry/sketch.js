"use strict";

var bg = [30, 30, 50];
var trajectoryPoints = [];
var circle = {
	x: 0,
	y: 0,
	initialX: 0,
	rad: 20,
	col: [165, 210, 168]
};
var trajCol = [230, 40, 230, 0.9];
var xoff = 0.00;
var posY = void 0;

var circleInitX = void 0;

function setup() {
	createCanvas(windowWidth, windowHeight);
	background.apply(undefined, bg);

	strokeWeight(2);
	initCircle();
	colorMode(RGB, 255, 255, 255, 1);
}

function draw() {
	background.apply(undefined, bg);

	updateCircle();

	drawTrajectories();
	drawCircles();
}

function initCircle() {
	posY = 0;
	circleInitX = width / 4;
}
function updateCircle() {
	var noise = noiseVal(); /* between 0 and 1 */
	var n = noise * 400;
	if (posY < height) {
		posY++;
	} else {
		posY = 0;
		trajectoryPoints.splice(0);
	}
	circle.y = posY;
	circle.x = circleInitX + n;
	trajectoryPoints.push({ x: circle.x, y: circle.y });
}
function drawCircles() {
	stroke(circle.col);
	ellipse(circle.x, circle.y, circle.rad);
	ellipse(width - circle.x, circle.y, circle.rad);
}

function drawTrajectories() {
	stroke.apply(undefined, trajCol);
	trajectoryPoints.forEach(function (p) {
		point(p.x, p.y);
		point(width - p.x, p.y);
	});
}

function noiseVal() {
	xoff += 0.01;
	return noise(xoff);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}