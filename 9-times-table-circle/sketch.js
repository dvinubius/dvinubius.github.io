'use strict';

var HALT = 'HALT';
var ONCE = 'ONCE';
var RUN = 'RUN';

var translateOriginX = void 0;
var radius = void 0,
    radialStep = void 0;
var density = 100;
var maxDensity = 600;
var timesFactor = 2;
var timesFactorInc = 0.005;
var strokeW = 2;
var strokeColor = [105, 255, 175, .65];
var contourColor1 = [140, 80, 190];
var contourColor2 = [85, 50, 110, .8];
var contourColor3 = [255, 155, 155, .85];
var bgColor = [25, 20, 15];
var bgColorCircle = [0, 0, 0];
// let textColor = [10,10,10]; // LIGHT
var textColor = [210, 210, 230]; // DARK
var fontSize = 20;
var myTextFont = 'Courier';

var traceDrawThreshold = 12;
// let traceColors = [
// 	[215,0,30],
// 	[225,60,30],
// 	[179, 0, 59],
// 	[102,0,0],
// 	[164,0,34]
// ]; // LIGHT
var traceColors = [[255, 200, 130], [225, 160, 230], [199, 120, 255]]; // DARK

// let traceColorsAlpha = 0.3; // LIGHT
var traceColorsAlpha = 0.7; // DARK

var runningState = ONCE;
var direction = 1;
var timesDisplay = void 0;
var densityDisplay = void 0;
var speedDisplay = void 0;
var showNumbersCheckBox = void 0;

var hiddenElementsOnHalt = void 0;
var hiddenElementsOnRun = void 0;

var legendExpanded = void 0;
var hamburgerElement = void 0;
var closerElement = void 0;
var legendCover = void 0;

var keyDownTimeout = void 0;
var keyDownTimeoutDuration = 500;
var canTakeMany = []; // remembers keys held down

window.focus();

// --- CANVAS INIT on load & resizing --- //
function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(RGB, 255, 255, 255, 1);
	radius = min(width, height) / 2 * 0.8;
	if (width - 2 * radius < 450) {
		radius = width / 2 - 200;
	}
	translateOriginX = width / 2 + (width / 2 - radius) * 0.3;
	radialStep = TWO_PI / density;
	timesDisplay = select('#timesDisplay');
	densityDisplay = select('#densityDisplay');
	speedDisplay = select('#speedDisplay');
	showNumbersCheckBox = select('#show-numbers-cb');
	hiddenElementsOnHalt = selectAll('.hidden-on-halt');
	hiddenElementsOnRun = selectAll('.hidden-on-run');
	hamburgerElement = select('.hamburger');
	closerElement = select('.closer');
	legendCover = select('.both-legends');
	legendExpanded = true;
	toggleLegend();
	densityDisplay.html(density);
	timesDisplay.html(timesFactor.toFixed(2));
	speedDisplay.html((timesFactorInc * 1000).toFixed(2));
}

function windowResized() {
	runningState = ONCE;
	setup();
}

// ---- DRAWING LOGIC ---- //

function draw() {
	translate(translateOriginX, height / 2);

	if (runningState === HALT) {
		updateDensityFromKeysDown();
		updateTimesFactorFromKeysDown();
		return;
	}

	// ACTUAL DRAWING 

	background(bgColor);

	drawBGCircle();

	drawLines();

	drawContourCircle();

	drawNumbers();

	// RUNNING STATE MANAGEMENT

	if (runningState === ONCE) {
		haltAnimation();
	} else {
		timesFactor += timesFactorInc * direction;
		timesDisplay.html(timesFactor.toFixed(2));

		updateSpeedFromKeysDown();
	}
}

function drawBGCircle() {
	fill(bgColorCircle);
	noStroke();
	ellipse(0, 0, 2 * radius, 2 * radius);
}

function drawLines() {
	stroke(strokeColor);
	strokeWeight(strokeW);

	for (var a = radialStep; a < TWO_PI; a += radialStep) {
		var x = cos(a) * radius;
		var y = sin(a) * radius;
		var x2 = cos(a * timesFactor) * radius;
		var y2 = sin(a * timesFactor) * radius;

		line(x, y, x2, y2);

		if (abs(density) <= traceDrawThreshold) {
			drawTracing(x, y, x2, y2);
		}
	}
}

function drawTracing(x, y, x2, y2) {
	var steps = 20;
	var trColor = randomTraceColor();
	var trColorAlpha = trColor.concat([traceColorsAlpha]);
	stroke(bgColorCircle);
	strokeWeight(4);
	for (var i = 1; i <= steps; i++) {
		var xInter = (i * x + (steps - i) * x2) / steps;
		var yInter = (i * y + (steps - i) * y2) / steps;
		var _radius = 4 + (steps - i) * 0.5;
		fill(bgColorCircle);
		ellipse(xInter, yInter, _radius, _radius);
		fill(trColorAlpha);
		noStroke();
		ellipse(xInter, yInter, _radius, _radius);
	}

	stroke(strokeColor);
	strokeWeight(strokeW);
}

function drawNumbers() {
	if (showNumbersCheckBox.elt.checked) {
		if (density < 34) {
			doDrawNumbers();
		} else if (density < 65) {
			doDrawNumbers(true); // small
		}
	}
}

function doDrawNumbers(small) {
	textFont(myTextFont);
	textStyle(BOLD);
	for (var a = 1; a <= density; a += 1) {
		var margin = small ? 25 : 45;
		var radialVal = TWO_PI / density * a;
		var xText = cos(radialVal) * (radius + margin) - fontSize / 2;
		var yText = sin(radialVal) * (radius + margin) + fontSize / 4;

		stroke(textColor);
		strokeWeight(1);
		fill(textColor);
		textSize(small ? fontSize * 0.7 : fontSize);
		text(a, xText, yText);
	}
}

function drawContourCircle() {
	noFill();
	stroke(contourColor1);
	strokeWeight(5);
	ellipse(0, 0, 2 * radius, 2 * radius);
	stroke(contourColor2);
	strokeWeight(5);
	ellipse(0, 0, 2 * radius + 5, 2 * radius + 5);
	stroke(contourColor3);
	strokeWeight(2);
	ellipse(0, 0, 2 * radius - 3, 2 * radius - 3);
}

// -- End DRAWING LOGIC -- //


// ---- EVENT HANDLING - while Animation RUNNING ---- //

function updateSpeedFromKeysDown() {
	if (keyIsDown(RIGHT_ARROW)) {
		addSpeed(-1);
	}
	if (keyIsDown(LEFT_ARROW)) {
		addSpeed(1);
	}
}
function addSpeed(delta) {
	timesFactorInc -= delta * 0.0001;
	var displayValue = (timesFactorInc * 1000).toFixed(2);
	speedDisplay.html(displayValue);
}

function keyPressed() {
	// key Space
	if (keyCode === 32) {
		toggleAnimation();
	}
	if (keyCode === DOWN_ARROW) {
		direction = -1;
	}
	if (keyCode === UP_ARROW) {
		direction = 1;
	}
	// key N
	if (keyCode === 78) {
		showNumbersCheckBox.elt.checked = !showNumbersCheckBox.elt.checked;
		toggleCheckbox();
	}
}

// -- End Event Handling while Animation RUNNING -- //

// ---- EVENT HANDLING while Animation HALTED ---- //

function updateDensityFromKeysDown() {
	// key W
	if (keyIsDown(87)) {
		if (canTakeMany[87]) {
			adjustStepDensity(1);
		} else if (!keyDownTimeout) {
			adjustStepDensity(1);
			prepKeyDownTimeout(87);
		}
	}

	// key S
	if (keyIsDown(83)) {
		if (canTakeMany[83]) {
			adjustStepDensity(-1);
		} else if (!keyDownTimeout) {
			adjustStepDensity(-1);
			prepKeyDownTimeout(83);
		}
	}
};

function adjustStepDensity(signum) {
	density += signum;
	if (density < 1) {
		density = 1;
	}
	if (density > maxDensity) {
		density = maxDensity;
	}

	radialStep = TWO_PI / density;
	densityDisplay.html(density);

	if (runningState === HALT) {
		runningState = ONCE;
	}
}

function updateTimesFactorFromKeysDown() {
	// key A
	if (keyIsDown(65)) {
		if (canTakeMany[65]) {
			adjustStepTimesFactor(-1);
		} else if (!keyDownTimeout) {
			adjustStepTimesFactor(-1);
			prepKeyDownTimeout(65);
		}
	}

	// key D
	if (keyIsDown(68)) {
		if (canTakeMany[68]) {
			adjustStepTimesFactor(1);
		} else if (!keyDownTimeout) {
			adjustStepTimesFactor(1);
			prepKeyDownTimeout(68);
		}
	}
};

function adjustStepTimesFactor(signum) {
	var isInteger = function isInteger(val) {
		return Math.floor(val) === val;
	};
	if (!isInteger(timesFactor)) {
		timesFactor = signum ? Math.ceil(timesFactor) : Math.floor(timesFactor);
	} else {
		timesFactor += signum;
	}

	timesDisplay.html(timesFactor.toFixed(2));

	if (runningState === HALT) {
		runningState = ONCE;
	}
}

// --- end Event Handling while Anim. HALTED --- //

// --- CHECKBOX --- //
function toggleCheckbox(event) {
	animateOnce();
}

// --- MENU TOGGLER --- //
function toggleLegend() {
	if (legendExpanded) {
		hamburgerElement.elt.classList.remove('hidden');
		closerElement.elt.classList.add('hidden');
		legendCover.elt.classList.add('hidden');
	} else {
		hamburgerElement.elt.classList.add('hidden');
		closerElement.elt.classList.remove('hidden');
		legendCover.elt.classList.remove('hidden');
	}
	legendExpanded = !legendExpanded;
}

// KEY HELD PRESSED - STATE MANAGEMENT

function prepKeyDownTimeout(code) {
	keyDownTimeout = setTimeout(function () {
		canTakeMany[code] = true;
		clearTimeout(keyDownTimeout);
		keyDownTimeout = null;
	}, keyDownTimeoutDuration);
}

function keyReleased() {
	clearTimeout(keyDownTimeout);
	keyDownTimeout = null;
	canTakeMany = [];
	return false;
}

// ------------------------------------

// ---- ANIMATION STATE MANAGEMENT ---- //

function toggleAnimation() {
	if (runningState === RUN) {
		haltAnimation();
	} else {
		resumeAnimation();
	}
}

function haltAnimation() {
	runningState = HALT;
	hiddenElementsOnHalt.forEach(function (element) {
		element.elt.classList.add('hidden');
	});
	hiddenElementsOnRun.forEach(function (element) {
		element.elt.classList.remove('hidden');
	});
}

function resumeAnimation() {
	runningState = RUN;
	hiddenElementsOnRun.forEach(function (element) {
		element.elt.classList.add('hidden');
	});
	hiddenElementsOnHalt.forEach(function (element) {
		element.elt.classList.remove('hidden');
	});
}

function animateOnce() {
	runningState = ONCE;
	hiddenElementsOnHalt.forEach(function (element) {
		element.elt.classList.add('hidden');
	});
	hiddenElementsOnRun.forEach(function (element) {
		element.elt.classList.remove('hidden');
	});
}

// -- End Animation State Management -- //

// -------- Helpers -------- //

function randomTraceColor() {
	var val = random(0, traceColors.length);
	return traceColors[floor(val)];
}