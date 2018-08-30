noise.seed(Math.random());

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

var parseDate = d3.timeParse("%Y%m%d");

var x = d3.scaleLinear()
		.range([0, width]);

var y = d3.scaleLinear()
		.range([height, 0]);
		
var xAxis = d3.axisBottom()
	.tickFormat(d3.timeFormat('%b %Y'));

var yAxis = d3.axisLeft();


var area = d3.area()
	.x(d => x(d.date))
	.y0(d => y(d.high))
	.y1(d => y(d.low))
	// .curve(d3.curveCardinal);
		
var svg = d3.select("#chart-area").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


let areaPath = svg.append("path")
	.attr("class", "area");

let xAxisGroup = svg.append("g")
      .attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")");

let yAxisGroup = svg.append("g")
			.attr("class", "y axis")
yAxisGroup
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Temperature (ºF)");

let initialData;
let noiseOff = 1;
const noiseDiff = 0.12;
const updateRate = 750;

d3.tsv('data.tsv').then(data => {
	
	// prep data
	data.forEach(d => {
		d.date = parseDate(d.date);
    d.low = +d.low;
		d.high = +d.high;
	});
	
	initialData = data;


	update(noisifyData(initialData));


	setInterval(() => {
		noiseOff += noiseDiff*2;
		const data = noisifyData(initialData);
		update(data);
	}, updateRate);
});





function update(data) {
	const t = d3.transition().duration(updateRate/2).ease(d3.easeCubic);
	
	x.domain(d3.extent(data, d => d.date));
	// y.domain([d3.min(data, d => d.low), d3.max(data, d => d.high)]);
	y.domain([30,100]);

	yAxis.scale(y);
	xAxis.scale(x);

	yAxisGroup
		.transition(t)
		.call(yAxis);

	xAxisGroup.call(xAxis);

	
	var area = d3.area()
	.x(d => x(d.date))
	.y0(d => y(d.high))
	.y1(d => y(d.low))
	.curve(d3.curveCardinal);

	areaPath
		.datum(data)
		.transition(t)
		.attr("d", area);

}


function noisifyData(data) {
	const retData = data.slice();
	
	retData.columns = data.columns;

	retData.forEach((d, index) => {
		const newEntry = retData[index] = clone(d);


		const noiseArg1 = noiseOff + index*noiseDiff;		
		const noiseVal1 = noise.perlin2(noiseArg1, noiseArg1); // will be between -1 and 1
		const absolute = Math.abs(noiseVal1);


		newEntry.low = newEntry.low*(1 - 0.25*absolute);
		newEntry.high = newEntry.high*(1 + 0.25*absolute);
	});
	return retData;
}


function clone(dataObj) {
	const newObj = {};
	d3.keys(dataObj).forEach(key => newObj[key] = dataObj[key]);
	return newObj;
}