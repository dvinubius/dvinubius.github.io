"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// $color1: rgba(255, 205, 178, 1);
// $color2: rgba(255, 180, 162, 1);
// $color3: rgba(229, 152, 155, 1);
// $color4: rgba(181, 131, 141, 1);
// $color5: rgba(109, 104, 117, 1);
// $color6: rgba(20, 5, 5,1);

// const bgCol = [109, 104, 117];
var bgCol = [20, 5, 5];
var strokeColors = [[181, 131, 141], [255, 180, 162], [229, 152, 155], [255, 205, 178], [229, 152, 155]];

var basicLength = 40;
var lengthVariation = 20;
var dottedLength = 8;
var weightRange = [1, 2];
var howMany = 125;
var initialOpacity = 0.9;

var crossers = void 0;

var mouseProximity = 20;
var touchedMemoryCapacity = 180;

function setup() {
	var side = min(windowWidth, windowHeight) * 0.7;
	createCanvas(side, side);
	background(bgCol);
	colorMode(RGB, 255, 255, 255, 1);
	createCrossers();
}

function draw() {
	background.apply(undefined, bgCol.concat([0.04]));
	noFill();
	stroke(251, 236, 233);
	strokeWeight(1);
	rect(0, 0, width - 1, height - 1);
	crossers.forEach(function (crosser) {
		crosser.draw();
		crosser.update();
	});
}

function windowResized() {
	var side = min(windowWidth, windowHeight) * 0.7;
	resizeCanvas(side, side);
	background(bgCol);
	createCrossers();
}

function reset() {
	background(bgCol);
	createCrossers();
}

function createCrossers() {
	crossers = [];
	for (var i = 0; i < howMany; i++) {
		crossers.push(new Crosser(random(width), random(height)));
	}
}

var Crosser = function () {
	function Crosser(x, y) {
		_classCallCheck(this, Crosser);

		this.scaled = 1;
		this.x = x;
		this.y = y;
		this.vx = random([-this.scaled, this.scaled]);
		this.vy = random([-1, 1]);
		this.remaining = basicLength + floor(random(-lengthVariation, lengthVariation + 1));
		this.strokeWeight = random(weightRange);
		this.opacity = initialOpacity + random(0, 1 - initialOpacity);
		this.color = random(strokeColors);
		this.touched = 0;
	}

	_createClass(Crosser, [{
		key: "draw",
		value: function draw() {
			if (this.inMouseProximity()) {
				this.touched = touchedMemoryCapacity;
			}

			if (this.touched > 0) {
				stroke(250, 20, 120);
				strokeWeight(this.strokeWeight * 1.5);
				this.touched--;
			} else {
				stroke.apply(undefined, _toConsumableArray(this.color).concat([this.opacity]));
				strokeWeight(this.strokeWeight);
			}

			if (this.remaining >= dottedLength) {
				line(this.x, this.y, this.x + this.vx, this.y + this.vy);
			} else if (this.remaining % 3 === 0) {
				noFill();
				point(this.x, this.y);
			}
		}
	}, {
		key: "update",
		value: function update() {
			this.x = this.x + this.vx;
			this.y = this.y + this.vy;
			this.remaining -= 1;

			if (this.remaining <= 0) {
				this.goAgain();
			}
		}
	}, {
		key: "goAgain",
		value: function goAgain() {
			var distBack = floor(random(5, 19));
			this.x -= this.vx * distBack;
			this.y -= this.vy * distBack;

			if (random(1) > 0.5) {
				this.vx = -this.vx;
			} else {
				this.vy = -this.vy;
			}

			this.remaining = basicLength + floor(random(-lengthVariation, lengthVariation + 1));
			this.strokeWeight = random(weightRange);
			this.opacity = initialOpacity + random(0, 1 - initialOpacity);
			this.color = random(strokeColors);

			if (this.x < 0) {
				this.vx = 1 * this.scaled;
			}
			if (this.x > width) {
				this.vx = -1 * this.scaled;
			}
			if (this.y < 0) {
				this.vy = 1;
			}
			if (this.y > height) {
				this.vy = -1;
			}

			this.update();
			this.update();
			this.update();
		}
	}, {
		key: "inMouseProximity",
		value: function inMouseProximity() {
			return dist(this.x, this.y, mouseX, mouseY) <= mouseProximity;
		}
	}]);

	return Crosser;
}();