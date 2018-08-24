'use strict';

var bg = {
	h: 0,
	s: 50,
	l: 50
};
var legendHue = 'color hue: ';
var legendLum = 'luminosity: ';
var legendSat = 'saturation (scroll) : ';

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(bg.h, bg.s, bg.l);
	textSize(14);
	colorMode(HSB, 360, 100, 100, 1);
}

function draw() {
	bg.h = map(mouseX, 0, width, 0, 360);
	bg.l = map(mouseY, 0, height, 100, 0);
	background(bg.h, bg.s, bg.l);
	fill(0, 0, 100 - bg.l);
	textSize(20);
	text(legendHue + Math.round(bg.h), width / 2 - 260, height / 2 - 40);
	text(legendLum + Math.round(bg.l), width / 2 - 260, height / 2);
	text(legendSat + Math.round(bg.s), width / 2 - 260, height / 2 + 40);
}

function mouseWheel(event) {
	bg.s -= event.delta / 30;
	if (bg.s > 100) bg.s = 100;
	if (bg.s < 0) bg.s = 0;
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}