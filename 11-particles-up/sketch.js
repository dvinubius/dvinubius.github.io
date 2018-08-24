"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Simple Particle System
// Edited Video: https://www.youtube.com/watch?v=UcdigVaIYAk

var particles = [];

var particleColor = [255, 205, 125],
    torchColor = [25, 5, 1],
    bgColor = [0, 0, 0],
    createAtOnce = 8,
    frameOffset = 0,
    xRandMargin = 360,
    particleRadius = 8,
    initialAlpha = 0.9,
    alphaDecayDiff = 0.003;

// -- NOISE
var offsetFactor = 5;
var xoff = 3.0,
    currentOffset = 0; // noise-give offset

// ------- p5.js

function setup() {
  var side = min(windowWidth, windowHeight) * 0.8;
  createCanvas(side, side);
  colorMode(RGB, 255, 255, 255, 1);
}

function draw() {
  background(bgColor);

  for (var i = 0; i < 1 + round(random(createAtOnce)); i++) {
    createAndAddParticle();
  }

  drawParticles();

  cleanupParticles();
}

function windowResized() {
  var side = min(windowWidth, windowHeight);
  resizeCanvas(side, side);
}

// -------- PARTICLES

function createAndAddParticle() {
  var p = new Particle();
  p.x = width / 2 + random(-xRandMargin, xRandMargin);
  p.y = frameOffset;
  p.vx = random(-2, 2);
  p.vy = random(1, 3);
  p.alpha = initialAlpha;
  particles.push(p);
}

function drawParticles() {
  currentOffset = (-0.5 + noiseVal()) * offsetFactor;

  particles.forEach(function (p) {
    p.update();
    p.show();
  });
}

function cleanupParticles() {
  particles = particles.filter(function (p) {
    return !p.finished();
  });
}

function noiseVal() {
  xoff += 0.01;
  return noise(xoff);
}

var Particle = function () {
  function Particle(x, y, vx, vy, alpha) {
    _classCallCheck(this, Particle);

    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.vx = vx ? vx : 0;
    this.vy = vy ? vy : 0;
    this.alpha = alpha ? alpha : 1;
  }

  _createClass(Particle, [{
    key: "finished",
    value: function finished() {
      return this.alpha < 0;
    }
  }, {
    key: "update",
    value: function update() {
      this.x += this.vx + currentOffset * (abs(height - this.vy) / height);
      // this.x += this.vx;
      this.y += this.vy;
      this.alpha -= alphaDecayDiff;
    }
  }, {
    key: "show",
    value: function show() {
      noStroke();
      fill.apply(undefined, particleColor.concat([this.alpha]));
      ellipse(this.x, this.y, 2 * particleRadius);
    }
  }]);

  return Particle;
}();