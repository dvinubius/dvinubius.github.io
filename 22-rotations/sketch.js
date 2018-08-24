"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// $color1: rgba(219, 43, 57, 1);
// $color2: rgba(41, 51, 92, 1);
// $color3: rgba(243, 167, 18, 1);
// $color4: rgba(240, 206, 160, 1);
// $color5: rgba(83, 77, 65, 1);

// const bgCol = [41, 51, 92];
var bgCol = [83, 77, 65];
var strokeCol = [41, 51, 92];
var fillCol = [219, 43, 57];

var creationCounter = 1;

var bigR = 500;
var rotation = 0;
var rotationInc = -0.01;
var rotationObj = 0;
var rotationIncObj = 0.1;
var lengthInc = 2;
var opacityDec = 0.0008;
var initialOpacity = 0.2;
var decoObjects = [];
var creationRareness = 7;

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(RGB, 255, 255, 255, 1);
	rectMode(CENTER);
	smooth();
}

function draw() {
	if (creationCounter % creationRareness === 1) {
		createDecoObj();
	}

	// --- Draw 
	translate(width / 2, height / 2);
	background(bgCol);

	rotate(rotation);

	var rotStep = TWO_PI / decoObjects.length;
	decoObjects.forEach(function (obj, index) {
		obj.decoDraw();
		obj.update();
	});

	// ---- Update state
	var lastIndex = decoObjects.length - 1;
	if (decoObjects[lastIndex].opacity <= 0) {
		decoObjects.splice(lastIndex, 1);
	}

	rotation -= rotationInc;
	creationCounter += 1;
}

function createDecoObj() {
	var rad = bigR / 50;
	var obj = new DecoObject(rad, rad, initialOpacity, rotationObj);
	decoObjects.push(obj);
	rotationObj += rotationIncObj;
}

var DecoObject = function () {
	function DecoObject(w, h, op, rot) {
		_classCallCheck(this, DecoObject);

		this.width = w;
		this.height = h;
		this.opacity = op;
		this.rotation = rot;
	}

	_createClass(DecoObject, [{
		key: "decoDraw",
		value: function decoDraw() {
			push();
			rotate(this.rotation);
			fill.apply(undefined, fillCol.concat([this.opacity]));
			stroke.apply(undefined, strokeCol.concat([min(this.opacity, 0.3)]));
			rect(0, 0, this.width, this.height);
			pop();
		}
	}, {
		key: "update",
		value: function update() {
			this.opacity -= opacityDec;
			this.width += lengthInc;
			this.height += lengthInc;
		}
	}]);

	return DecoObject;
}();

function windowResized() {
	createCanvas(windowWidth, windowHeight);
	decoObjects = [];
	buildDeco();
}