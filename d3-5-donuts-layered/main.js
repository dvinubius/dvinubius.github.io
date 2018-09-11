
const margin = 50,
			width = 960,
			height = 500,
			radius = Math.min(width, height) / 2 - margin / 2;

const totalPieOpacity = 1;
const padAngle = 0.01;
const donutPadAngle = 0.02;
const donutOuterRadius = radius/2;
const donutInnerRadius = 60;
const totalPieInnerRadius = radius - 70;
const tDuration = 800;

const donutTextColor = 'rgba(20,25,25,1)';
const donutFillColor = 'rgba(250,250,250,1)'
const totalPieContourColor = 'rgba(50, 225, 145, .8)';
const totalPieTextColor = 'rgba(250,250,250,1)';

var color = d3.scaleOrdinal()
	.range(d3.schemeDark2);

var donutArc = d3.arc()
		.innerRadius(donutInnerRadius)
		.outerRadius(donutOuterRadius);
var totalPieArc = d3.arc()
	.innerRadius(totalPieInnerRadius)
	.outerRadius(radius);

var svg = d3.select("#chart-area").append("svg")
		.attr("width", width)
		.attr("height", height)
	.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// totalPie + contour
var totalPieLayer = svg.append('g')
.attr('class', 'total-pie');

// TOTAL CONTOUR
totalPieLayer.append('circle')
.attr('cx', 0)
.attr('cy', 0)
.attr('r', radius+3)
.attr('fill', 'transparent')
.attr('stroke', totalPieContourColor)
.attr('stroke-width', 6);
totalPieLayer.append('circle')
.attr('cx', 0)
.attr('cy', 0)
.attr('r', totalPieInnerRadius-1)
.attr('fill', 'transparent')
.attr('stroke', totalPieContourColor)
.attr('stroke-width', 3);

// ANNOTATION
svg.append("line")
.attr("class", "dashed-line")
.attr("x1", radius)
.attr("y1", 0)
.attr("x2", radius + 80)
.attr("y2", 0)
.attr("stroke", totalPieContourColor);
svg.append("text")
.text('All regions')
.attr("x", radius + 85)
.attr("y", 6)
.attr("font-size", 18);
svg.append("text")
.text('aggregated')
.attr("x", radius + 85)
.attr("y", 26)
.attr("font-size", 18);


// FILL & CONTOUR for donut
var donutLayer = svg.append('g')
	.attr('class', 'donut');
	
donutLayer.append('circle')
.attr('cx', 0)
.attr('cy', 0)
.attr('r', donutOuterRadius)
.attr('fill', donutFillColor)
.attr('stroke', 'transparent');


// actual DONUT CHART with label - updated with current data
var donutFGLayer = donutLayer.append('g')
	.attr('class', 'donut-fg')
	// .attr('opacity', 0);

var currentSelLabel = donutFGLayer.append('text')
	.attr('text-anchor', 'middle')
	.attr('font-size', 20)
	.attr('fill', donutTextColor)
	.attr('y', 5);



// GETTING THE DATA
d3.tsv("data.tsv").then( data => {

	// PREP DATA
	data.forEach(d => {
		d.count = +d.count;
		return d;
	});

	// NEST DATA
	var devicesByRegion = d3.nest()
			.key(d => d.region)
			.entries(data);
	var aggregatedDevices = d3.nest()
		.key(d => d.device)
		.entries(data)
		.map(d => ({
			device: d.key,
			total: d3.sum(d.values, entry => entry.count)
		}));

	// CREATE RADIO btn MENU + Legend

	var label = d3.select("form").selectAll("label")
			.data(devicesByRegion)
			.enter().append("label")
			.attr("class", "radio-option");  

	label.append("input") 
			.attr("type", "radio")
			.attr("name", "region")
			.attr("value", d => d.key)
			.on("change", change)
		.filter((d, i) => !i)
			.each(change)
			.property("checked", true);

	label.append("span")
			.text(d => d.key);

	// create Total Pie in Background
	var totalPieLayout = d3.pie()
		.value(d => d.total)
		.sort(null)
		.startAngle(-90 * Math.PI/180)
    .endAngle(-90 * Math.PI/180 + 2*Math.PI)
		.padAngle(padAngle);
	
	// TOTAL PIE - draw chart
	totalPiePath = totalPieLayer.selectAll('path')
		.data(totalPieLayout(aggregatedDevices))
			.enter()
			.append('path')
			.attr('fill', d => color(d.data.device))
			.attr('id', (d,i) => 'deviceArc'+i)
			.style('opacity', totalPieOpacity)
			.attr('d', totalPieArc)
			.each(createHiddenArcs);
	
	// add text labels within chart
	totalPieLayer.selectAll('text')
		.data(totalPieLayout(aggregatedDevices))
			.enter()
				.append('text')
				.attr('fill', totalPieTextColor)
				.attr("dy", function(d,i) {
					return (d.endAngle > 180 * Math.PI/180 ? -21 : 30);
				})
				.attr('font-size', 18)
			.append('textPath')
				.attr("startOffset","50%")
				.style("text-anchor","middle")
				.attr('xlink:href', (d,i) => '#donutArc'+i)
				.text(d => d.data.device);



	
	function arcTween(d) {
		var i = d3.interpolate(this._current, d);
		this._current = i(0);
		return t => { 
			return donutArc(i(t)); 
		};
	}
	
	// HOW DATA IS BOUND TO DOC
	function change(selectedRegion) {

		let t = d3.transition().duration(tDuration);
		let tBlitz = d3.transition().duration(tDuration/3);

		var donutPath = donutFGLayer.selectAll("path");

		var donutPieLayout = d3.pie()
			.value(d => d.count)
			.sort(null)
			.startAngle(-90 * Math.PI/180)
    	.endAngle(-90 * Math.PI/180 + 2*Math.PI)
			.padAngle(donutPadAngle);

		var pieData0 = donutPath.data(),
				pieData1 = donutPieLayout(selectedRegion.values);
		
		donutPath = donutPath.data(pieData1, key); 

		donutPath.enter()
			.append("path")
				.each( function(d, i) { 
					this._current = findNeighborArc(i, pieData0, pieData1, key) || d;
				})
				.attr("fill", d => color(key(d)))
				.merge(donutPath)
					.transition(t)
					.attrTween("d", arcTween);

	
		donutPath.exit()
			.transition(tBlitz)        
				.style('opacity', 0)
				.remove();

		currentSelLabel.text(selectedRegion.key);
	}
});



// ------------ AUX --------------

function key(d) {
	return d.data.device;
}


function findNeighborArc(i, pieData0, pieData1, key) {
	var d;
	return (d = findPreceding(i, pieData0, pieData1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
			: (d = findFollowing(i, pieData0, pieData1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
			: null;
}

// Find the element in pieData0 that joins the highest preceding element in pieData1.
function findPreceding(i, pieData0, pieData1, key) {
	var m = pieData0.length;
	while (--i >= 0) {
		var k = key(pieData1[i]);
		for (var j = 0; j < m; ++j) {
			if (key(pieData0[j]) === k) return pieData0[j];
		}
	}
}

// Find the element in pieData0 that joins the lowest following element in pieData1.
function findFollowing(i, pieData0, pieData1, key) {
	var n = pieData1.length, m = pieData0.length;
	while (++i < n) {
		var k = key(pieData1[i]);
		for (var j = 0; j < m; ++j) {
			if (key(pieData0[j]) === k) return pieData0[j];
		}
	}
}


function createHiddenArcs(d,i) {
	//A regular expression that captures all in between the start of a string
	//(denoted by ^) and the first capital letter L
	var firstArcSection = /(^.+?)L/;

	//The [1] gives back the expression between the () (thus not the L as well)
	//which is exactly the arc statement
	var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];
	//Replace all the comma's so that IE can handle it -_-
	//The g after the / is a modifier that "find all matches rather than
	//stopping after the first match"
	newArc = newArc.replace(/,/g , " ");
	
	//If the end angle lies beyond a quarter of a circle (90 degrees or pi/2)
	//flip the end and start position
	if (d.endAngle > 180 * Math.PI/180) {
		//Everything between the capital M and first capital A
		var startLoc = /M(.*?)A/;
		//Everything between the capital A and 0 0 1
		var middleLoc = /A(.*?)0 0 1/;
		//Everything between the 0 0 1 and the end of the string (denoted by $)
		var endLoc = /0 0 1 (.*?)$/;
		//Flip the direction of the arc by switching the start and end point
		//and using a 0 (instead of 1) sweep flag
		var newStart = endLoc.exec( newArc )[1];
		var newEnd = startLoc.exec( newArc )[1];
		var middleSec = middleLoc.exec( newArc )[1];

		//Build up the new arc notation, set the sweep-flag to 0
		newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
	}//if

	//Create a new invisible arc that the text can flow along
	svg.append("path")
			.attr("class", "hiddenDonutArcs")
			.attr("id", "donutArc"+i)
			.attr("d", newArc)
			.style("fill", "none");

}
