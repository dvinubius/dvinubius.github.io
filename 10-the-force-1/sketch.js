"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// ------- FADE IN ALL

var fadeInAllStartOpacity = 1,
    fadeInAllStep = 0.02,
    fadeInAllColor = [255, 250, 250];
var fadeInAllOpacity = fadeInAllStartOpacity;

// -------- FORCE SIMULATION

var simulation = void 0;

var simUpdateAlphaTarget = 0.6,
    forceStrengthManyBody = .8,
    forceStrengthLink = 0.5,
    distanceLink = 30,
    velocityDecay = 0.5,
    velocityDecayDiff = 0.03,
    addGraphDist = 30,
    overlayPrepDist = 70,
    myFactor = 30,
    // control value of attraction force of bubbles into graph
distanceExp = 2.4,
    // exponent of attractionForce variation (2 = quadratic - as in coulomb force - , 3 = cubic etc.)

nodes = [],
    // actual nodes of the graph
links = [];

var heated = 0;
var heatCounterDOM = void 0;
var maxHeat = 5;

var currentStrengthManyBody = void 0,
    currentStrengthLink = void 0,
    currentDistanceLink = void 0,
    currentVelocityDecay = void 0,
    currentUpdateAlphaTarget = void 0,
    nextShaken = void 0;

// ------- BUBBLES APPROACHING GRAPH

var creationInterval = void 0,
    nodeCounter = 0; // have id's for all nodes
var creationIntervalDuration = 1500,
    bubbles = [],
    // created bubbles			
bubblesToAdd = [],
    // candidates to be added to the graph
bubbleRainSetSize = 30,
    maxNumberNodesAutoGen = 10,
    // create bubbles as long as graph has < max nodes
bubbleRadiusMin = 20,
    bubbleRadiusMore = 30,
    initialOpacity = 0.01,
    fadeInStep = 0.0035;

// ------ TRACING FX - when a bubble joins the graph

var tracingPairs = [];
var traceGroups = [],
    initialTraceOpacity = .5,
    fadeOutTracingStep = 0.02,
    traceColor = [200, 200, 200];
var addTracesIterations = 2;
var addTracesIterCounter = addTracesIterations;

// ----- STYLE

var bgColor = [50, 80, 110];
var bubbleColorFill = [255, 205, 150],

// bubbleColorFill = [255,225,180],
bubbleColorStroke = [155, 175, 185],
    nodeColorFill = bubbleColorFill,
    nodeColorStroke = [255, 155, 155],
    linkColor = [250, 250, 250, .8];

// ------ p5.js SETUP

function setup() {
	var side = min(windowWidth, windowHeight);
	createCanvas(side, side);
	initGraph();
	initSimulation();
	initBubbles();
	colorMode(RGB, 255, 255, 255, 1);
	heatCounterDOM = select('#heat-counter');
	console.log(heatCounterDOM.elt);
	heatCounterDOM.elt.textContent = heated;
}

// ------- p5.js LOOP

function draw() {
	background(bgColor);

	// prep DRAWING
	updateBubbles(); // update positions of free bubbles and mark candidates for graph integration
	updateTraces(); // traces are faded out

	// DRAWING
	drawTraces();
	bubbles.forEach(drawBubble);
	links.forEach(drawLink);
	nodes.forEach(drawNode);

	// update graph - add bubbles that are close enough
	addCandidates();

	// FADING IN?
	if (fadeInAllOpacity > 0) {
		background.apply(undefined, fadeInAllColor.concat([fadeInAllOpacity]));
		fadeInAllOpacity = max(0, fadeInAllOpacity - fadeInAllStep);
	}
}

function windowResized() {
	var side = min(windowWidth, windowHeight);
	resizeCanvas(side, side);
	simulation.force("center", d3.forceCenter(width / 2, height / 2));
}

// ----- BUBBLES and Adding to Graph -------- //

function drawBubble(b) {
	if (b.colorFill) {
		fill.apply(undefined, _toConsumableArray(b.colorFill).concat([b.opacity]));
	} else {
		noFill();
	}
	if (b.colorStroke) {
		if (b.opacity) {
			stroke.apply(undefined, _toConsumableArray(b.colorStroke).concat([b.opacity]));
		} else {
			stroke(b.colorStroke);
		}
	} else {
		noStroke();
	}

	ellipse(b.x, b.y, b.radius, b.radius);
}

function initBubbles() {
	creationInterval = setInterval(function () {
		createBubble();
		if (nodes.length > maxNumberNodesAutoGen) {
			clearInterval(creationInterval);
		}
	}, creationIntervalDuration);
}

function createBubble() {
	var _findProperPosForBubb = findProperPosForBubble(),
	    x = _findProperPosForBubb.x,
	    y = _findProperPosForBubb.y;

	var maxRadius = bubbleRadiusMin + round(random(bubbleRadiusMore));
	var initialRadius = 1;
	var dx = x > width / 2 ? map(random(), 0, 1, -2, 0) : map(random(), 0, 1, 0, 2);
	var dy = y > height / 2 ? map(random(), 0, 1, -2, 0) : map(random(), 0, 1, 0, 2);
	var opacity = initialOpacity;
	var bubble = new Bubble(x, y, initialRadius, dx, dy, opacity, maxRadius, bubbleColorFill);
	bubbles.push(bubble);
}

function createManyBubbles() {
	for (var i = 0; i < bubbleRainSetSize; i++) {
		createBubble();
	}
}

function updateBubbles() {
	bubbles.forEach(function (b, index) {
		b.move();
		b.opacity = min(1, b.opacity + fadeInStep);
		b.radius = min(b.maxRadius, b.radius + .2);

		if (isWayOutOfCanvas(b)) {
			bubbles.splice(index, 1); // forEach is safe for deletion
			return;
		}

		tryAddToGraph(b); // if adding is possible, remove from bubbles:[] and push to bubblesToAdd:[]
	});
}

function tryAddToGraph(bubble) {
	var closestNode = simulation.find(bubble.x, bubble.y);
	var d = dist(bubble.x, bubble.y, closestNode.x, closestNode.y);
	if (d <= addGraphDist) {
		makeGraphCandidate(bubble, closestNode);
	} else {
		pullTowardsNode(bubble, closestNode, d);
	}
}

function makeGraphCandidate(bubble, closestNode) {
	bubblesToAdd.push({
		bubble: bubble,
		mateInGraph: closestNode
	});

	bubbles.splice(bubbles.indexOf(bubble), 1);
}

function pullTowardsNode(bubble, closestNode, distance) {
	var isBubbleToLeft = bubble.x < closestNode.x;
	var isBubbleAbove = bubble.y < closestNode.y;
	var forceVal = attractionForce(closestNode, bubble, distance);
	bubble.dx += isBubbleToLeft ? forceVal : -forceVal;
	bubble.dy += isBubbleAbove ? forceVal : -forceVal;
}

function addCandidates() {
	var addedAny = false;
	bubblesToAdd.forEach(function (_ref) {
		var bub = _ref.bubble,
		    mate = _ref.mateInGraph;

		addedAny = true;
		bub.id = nodeCounter++;
		bub.colorStroke = nodeColorStroke;
		nodes.push(bub);
		links.push({
			source: bub,
			target: mate
		});
	});

	if (addedAny) {
		updateSimulation(true);

		bubblesToAdd.splice(0);

		createTracingPairs();
	}
}

// ------- GRAPH & SIMULATION ---------- //

function drawNode(d) {
	//bg - cover tip of link
	noStroke();
	fill(bgColor);
	ellipse(d.x, d.y, d.radius, d.radius);

	strokeWeight(1);
	drawBubble(d);
}

function drawLink(d) {
	stroke(linkColor);
	strokeWeight(2);
	line(d.source.x, d.source.y, d.target.x, d.target.y);
}

function initGraph() {
	var rootNode = new Bubble(width / 2, height / 2, bubbleRadiusMin * 3, // initial radius
	0, //dx
	0, //dy
	1, //opacity
	0, // maxRadius
	nodeColorFill);
	rootNode.id = nodeCounter++;
	rootNode.colorStroke = nodeColorStroke;
	nodes.push(rootNode);
}

function initSimValues() {
	currentDistanceLink = distanceLink;
	currentStrengthLink = forceStrengthLink;
	currentStrengthManyBody = forceStrengthManyBody;
	currentVelocityDecay = velocityDecay;
	currentUpdateAlphaTarget = simUpdateAlphaTarget;
	nextShaken = 0;
}

function applySimValues() {
	if (!simulation) {
		return;
	}

	simulation.velocityDecay(currentVelocityDecay).force("link", d3.forceLink().distance(currentDistanceLink).strength(currentStrengthLink)).force("charge", d3.forceManyBody().strength(currentStrengthManyBody)).force("collision", d3.forceCollide().radius(function (node) {
		return node.radius + 10;
	})).force("center", d3.forceCenter(width / 2, height / 2));
}

function initSimulation() {
	initSimValues();

	simulation = d3.forceSimulation();
	applySimValues();

	simulation.nodes(nodes).on("tick", function () {
		return onTick();
	});

	simulation.force("link").links(links);
}

function updateSimulation(withTraces) {
	simulation.nodes(nodes).on("tick", function () {
		return onTick();
	});
	simulation.force("link").links(links);
	simulation.alphaTarget(currentUpdateAlphaTarget).restart();
	if (withTraces) {
		nodes.forEach(function (node) {
			return node.opacity = 0.8;
		});
		addTracesIterCounter = 0;
	}
}

function onTick() {
	updateOpacities(); // for nodes actually in the graph
	createTraces(); // follow graph movements with traces
}
function updateOpacities() {
	nodes.forEach(function (node) {
		return node.opacity = min(1, node.opacity + fadeInStep * 4);
	});
}

function agitate() {
	if (heated < maxHeat) {
		heated++;
		heatCounterDOM.elt.textContent = heated;

		currentVelocityDecay -= velocityDecayDiff;
		currentStrengthManyBody += 5;
		simulation.velocityDecay(currentVelocityDecay).force("charge", d3.forceManyBody().strength(currentStrengthManyBody));
		// simulation.alphaTarget(0.9).restart();
	}
}

function cool() {
	if (heated > -maxHeat) {
		heated--;
		heatCounterDOM.elt.textContent = heated;

		currentVelocityDecay += velocityDecayDiff;
		currentStrengthManyBody -= 5;
		simulation.velocityDecay(currentVelocityDecay).force("charge", d3.forceManyBody().strength(currentStrengthManyBody));
		// simulation.alphaTarget(0.4).restart();
	}
}

function shakeUp() {
	if (!nodes) {
		return;
	}
	nodes.forEach(function (node) {
		node.x += (node.x - width * 0.5) / (width * 0.5) * 200;
		node.y += (node.y - height * 0.5) / (height * 0.5) * 200;
	});
	currentUpdateAlphaTarget = 0.8;
	updateSimulation(false); // not with traces
}

// -------- TRACING FX ------------ //

function createTracingPairs() {
	var candidates = nodes.map(function (node) {
		var newNode = node.clone();
		var pair = {
			traced: newNode,
			original: node
		};
		return pair;
	});
	tracingPairs = candidates;
}

function createTraces() {
	// create actual traces from tracingCandidates. 
	// there should be tracingCandidates available if the iterationCounter is below the max
	// when it's 0, the tracingCandidates were created in addCandidates
	// when it's >=1, the tracingCandidates were created here, in createTraces
	if (addTracesIterCounter < addTracesIterations) {
		var newGroup = [];
		tracingPairs.forEach(function (pair) {
			newGroup.push(pair);
		});

		newGroup.forEach(function (pair) {
			pair.traced.opacity = initialTraceOpacity;
			pair.traced.colorFill = traceColor;
		});

		traceGroups.push(newGroup);

		// prepare another set of tracingCandidates
		createTracingPairs();
		addTracesIterCounter++;
	}
}

function updateTraces() {
	traceGroups.forEach(function (group, index) {
		// all nodes in group, fade out one step
		group.forEach(function (pair) {
			var b = pair.traced;
			b.opacity = max(0, b.opacity - fadeOutTracingStep);
		});
		// faded out completely? (first node is sufficient checking)
		if (group[0].traced.opacity === 0) {
			// eliminate group
			traceGroups.splice(index, 1);
		}
	});
}

function drawTraces() {
	traceGroups.forEach(function (group) {
		return group.forEach(function (pair) {
			var b_from = pair.traced;
			var b_to = pair.original;
			strokeWeight(b_from.radius * 0.9);
			stroke.apply(undefined, nodeColorStroke.concat([b_from.opacity]));
			line(b_from.x, b_from.y, b_to.x, b_to.y);
		});
	});
}

// ------- AUX -------- //

function findProperPosForBubble() {
	var x = void 0,
	    y = void 0;
	var foundProperPos = false;
	while (!foundProperPos) {
		x = random(width);
		y = random(height);
		if (dist(x, y, width / 2, height / 2) > min(width, height) * 0.4) {
			foundProperPos = true;
		}
	}
	return { x: x, y: y };
}

function isWayOutOfCanvas(bubble) {
	var margin = bubble.radius + width / 4;
	return bubble.x > width + margin || bubble.x < -margin || bubble.y < -margin || bubble.y > height + margin;
}

function attractionForce(b_from, b_on, distance) {
	return b_on.radius * b_from.radius / distance ** distanceExp * myFactor;
}

// -------- STRUCTURE CONTROL ----------- //

function resetGrande() {
	nodeCounter = 0;
	heated = 0;
	clearInterval(creationInterval);
	creationInterval = null;

	bubbles.splice(0);
	bubblesToAdd.splice(0);
	traceGroups.splice(0);
	nodes.splice(0);
	links.splice(0);

	tracingPairs = [];
	addTracesIterCounter = addTracesIterations;

	initGraph();
	simulation.stop();
	initSimulation();
	initBubbles();

	fadeInAllOpacity = fadeInAllStartOpacity;
}