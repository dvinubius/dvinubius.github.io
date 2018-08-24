'use strict';

var myBGCol = [154, 210, 88];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes('antialias', true);
  background.apply(undefined, myBGCol);
}

function draw() {
  background.apply(undefined, myBGCol);
  doDrawCandy();

  translate(-width / 2, -height / 2, -300);
  stroke(60, 130, 130);
  strokeWeight(5);
  line(mouseX, mouseY, width / 2, height / 2);
  strokeWeight(1);
}

function doDrawCandy() {
  var x = mouseX - width / 2;
  var y = mouseY - height / 2;
  translate(x, y, 30);
  push();
  rotateZ(frameCount * 0.02);
  rotateX(frameCount * 0.02);
  rotateY(frameCount * 0.02);
  fill(110, 120, 70, 30);
  stroke(100, 20, 50);
  box(50);
  pop();
  translate(x, y, -30);
}