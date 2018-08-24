'use strict';

var radius = 600;
var n = 2;
var d = 5;
var k = n / d;

var step = 0.04;

var pathPoints = void 0;
var pathAngles = void 0;
var pathDrawn = void 0;

var index = 0;
var rotation = 0.001;

var bgCol = [200, 203, 210];
var strokeCol = [15, 5, 10];
var strokeCol2 = [200, 35, 10];
var controlsOffset = 100;

var sliderN = void 0;
var sliderD = void 0;
var valLabelN = void 0;
var valLabelD = void 0;
var valLabelTheta = void 0;

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(RGB, 255, 255, 255, 1);
	smooth();

	initDOM();

	initDrawing();
}

function draw() {

	if (index === 0) {
		beginShape();
	}

	translate(width / 2, height / 2);

	// draw circleframe and all points shown so far,
	//  unless final shape is complete
	if (index < pathPoints.length) {
		background(bgCol);

		noFill();
		ellipse(0, 0, radius, radius);

		noStroke();
		fill.apply(undefined, strokeCol.concat([0.6]));
		pathDrawn.forEach(function (vector) {
			ellipse(vector.x, vector.y, 3, 3);
		});
	} else {
		background.apply(undefined, bgCol.concat([0.18]));
	}

	// grab new point from path
	var v = pathPoints[index];
	var theta = pathAngles[index];
	index++;

	if (!v) {
		// no more points => done
		rotate(rotation);
		var variable = Math.pow(rotation, 1.6);
		rotation += min(0.005, variable);
		strokeWeight(1);
		stroke(strokeCol2);
		noFill();
		endShape(CLOSE);
	} else {
		// draw next point
		ellipse(v.x, v.y, 3, 3);
		vertex(v.x, v.y); // add vertex for drawing the final shape
		pathDrawn.push(v); // remember this point as being shown already

		// draw visual aid line
		var x = cos(theta) * radius / 2;
		var y = sin(theta) * radius / 2;
		stroke.apply(undefined, strokeCol.concat([0.2]));
		strokeWeight(1);
		line(-x, -y, x, y);
		valLabelTheta.html(ceil(degrees(theta)) + ' deg');
	}
}

function buildPath() {
	pathPoints = [];
	pathAngles = [];
	for (var i = 0; i < TWO_PI * d; i += step) {
		var r = radius / 2 * cos(k * i);
		var x = r * cos(i);
		var y = r * sin(i);
		stroke(6);
		pathPoints.push(createVector(x, y));
		pathAngles.push(i);
	}
}

function initDOM() {

	var textColor = 'rgb(' + strokeCol.join(',') + ')';

	sliderN = createSlider(1, 10, 4, 1);
	sliderN.position(controlsOffset, 100);
	sliderN.size(150);
	sliderN.style('outline', 'none');
	sliderD = createSlider(1, 10, 2, 1);
	sliderD.position(controlsOffset, 200);
	sliderD.size(150);
	sliderD.style('outline', 'none');
	sliderN.changed(initDrawing);
	sliderD.changed(initDrawing);
	sliderN.input(function (ev) {
		return valLabelN.html(ev.target.value);
	});
	sliderD.input(function (ev) {
		return valLabelD.html(ev.target.value);
	});

	var labelN = createSpan('n: ');
	valLabelN = createSpan();
	var labelD = createSpan('d: ');
	valLabelD = createSpan();

	labelN.position(controlsOffset + 20, 140);
	valLabelN.position(controlsOffset + 50, 140);
	labelN.style('font-size', '20px');
	valLabelN.style('font-size', '20px');
	labelN.style('color', textColor);
	valLabelN.style('color', textColor);
	labelD.position(controlsOffset + 20, 240);
	valLabelD.position(controlsOffset + 50, 240);
	labelD.style('font-size', '20px');
	valLabelD.style('font-size', '20px');
	labelD.style('color', textColor);
	valLabelD.style('color', textColor);

	var thetaLabel = createSpan('Theta : ');
	thetaLabel.position(controlsOffset, 300);
	thetaLabel.style('color', textColor);
	thetaLabel.style('font-size', '20px');
	valLabelTheta = createSpan();
	valLabelTheta.position(controlsOffset + 70, 300);
	valLabelTheta.style('color', textColor);
	valLabelTheta.style('font-size', '20px');
}

function initDrawing() {
	valLabelN.html(sliderN.value());
	valLabelD.html(sliderD.value());
	n = sliderN.value();
	d = sliderD.value();
	k = n / d;
	index = 0;
	buildPath();
	background(bgCol);
	resetMatrix();
	translate(width / 2, height / 2);
	stroke(strokeCol.concat(0.6));
	noFill();
	pathDrawn = [];
}

function windowResized() {
	createCanvas(windowWidth, windowHeight);
	initDrawing();
}