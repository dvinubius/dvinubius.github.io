"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var bgCol = [84, 200, 158];
var mouseCol = [230, 100, 150, .9];
var fader = new Fader(bgCol, 0, /*maxFadeFactor - how transparent should it be in the end? */
4 /* decayRate*/);
var applyFade = true;
var skipFrames = 0;
var skipCounter = 0;

var addRadMax = 0;
var minRad = 20;

function setup() {
	createCanvas(windowWidth, windowHeight);
	background.apply(undefined, bgCol);
	colorMode(RGB, 255, 255, 255, 1);
	fader.setMaxAlpha(1);
}

function draw() {
	if (mouseIsPressed) {
		fader.reset();
		if (skipCounter === skipFrames) {
			skipCounter = 0;
			lineBetween();
			ellipseFromMovement();
		} else {
			lineBetween();
			skipCounter++;
		}
	} else {
		applyFade ? background.apply(undefined, _toConsumableArray(fader.color())) : background(bgCol);
	}
}

function lineBetween() {
	strokeWeight(2);
	stroke(10, 150, 110, 1);
	line(mouseX, mouseY, pmouseX, pmouseY);
}

function ellipseFromMovement() {
	var dx = mouseX - pmouseX;
	var dy = mouseY - pmouseY;
	var travelled = sqrt(dx * dx + dy * dy);
	var dRad = map(travelled, 0, 60, 0, addRadMax);
	var rad = minRad + dRad;
	strokeWeight(1);
	fill.apply(undefined, mouseCol);
	stroke(50, 60, 70, .5);
	ellipse(mouseX, mouseY, rad, rad);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}