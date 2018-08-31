noise.seed(Math.random());


const margin = {top: 60, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

const parseDate = d3.timeParse("%Y%m%d");

const x = d3.scaleTime()
  .range([0, width]); 

const y = d3.scaleLinear()
  .range([height, 0]);

const xAxis = d3.axisBottom();
const yAxis = d3.axisLeft().ticks(8);



const svg = d3.select("#chart-area").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const xAxisGroup = svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")");

const yAxisGroup = svg.append("g")
  .attr("class", "y axis")
  .attr('transform', 'translate(-1, 0)');

yAxisGroup
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Temperature (ºF)")
      .attr('fill', 'black');

legendEls = ['Location 1', 'Location 1 warmer', 'Location 2 warmer'];
const legendScale = d3.scaleOrdinal()
  .domain(legendEls)
  .range(['#720E07', '#A8C256', 'rgb(252,141,89)'])
  
const legend = svg.append('g')
  .attr('transform', `translate(${120},${-50})`);

legend.append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', 160)
  .attr('height', 90)
  .attr('transform', `translate(-20, -10)`)
  .attr('stroke','lightgrey')
  .attr('fill', 'transparent')
  .style('overflow', 'visible');

legendEls.forEach((c,i) => {
  const row = legend.append('g')
    .attr('transform', `translate(0,${i*25})`);

    row.append('rect')
      .attr('width', 15)
      .attr('height', c === 'Location 1' ? 3 : 15)
      .attr('y', c === 'Location 1' ? 6 : 0)
      .attr('fill', legendScale(c))
      .attr('stroke', c === 'Location 1' ? 'transparent' : 'grey');
  
    row.append('text')
      .attr('text-anchor', 'begin')
      .attr('x', 25)
      .attr('y', 12)
      .attr('fill', 'black')
      .attr('font-size', 12)
      .text(c);
});

const line = d3.area()
  .x( d => x(d.date))
  .curve(d3.curveCardinal);

const linePath = svg
  .append("path")
  .attr("class", "line");


const area = d3.area()
  .x( d => x(d.date))
  .curve(d3.curveCardinal);

  // define a path for where Location 1 values are lower
const clipAbove = svg.append("clipPath")
  .attr("id", "clip-above")
  .append("path");

// define a path for where Location 1 values are higher
const clipBelow = svg.append("clipPath")
  .attr("id", "clip-below")
  .append("path");

// define a path that keeps the part where Location 1 is lower
const areaAbove = svg.append("path")
  .attr("class", "area above")
  .attr("clip-path", "url(#clip-above)");

// define a path that keeps the part where Location 1 is higher
const areaBelow = svg.append("path")
  .attr("class", "area below")
  .attr("clip-path", "url(#clip-below)");


let initialData;
let noiseOff = 1;
const noiseDiff = 0.15;
const updateRate = 5000;

d3.tsv("data.tsv").then( data => {

  data.forEach( d => {
    d.date = parseDate(d.date);
    d["Location 1"] = +d["Location 1"];
    d["Location 2"] = +d["Location 2"];
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

  const t = d3.transition().duration(1000).ease(d3.easeCubic);

  x.domain(d3.extent(data, d => d.date));

  y.domain([
    d3.min(data, d => Math.min(d["Location 1"], d["Location 2"])),
    d3.max(data, d => Math.max(d["Location 1"], d["Location 2"]))
  ]);

  svg.datum(data);

  line.y( d => y(d["Location 1"]));

  area.y1( d => y(d["Location 1"]));
    
  


  area.y0(0); // part above Location 1 line: make clip path from area
  clipAbove
    .datum(data)
    .transition(t)
    .attr("d", area);

  area.y0(height); // part below Location 1 line: make clip path from area
  clipBelow
    .datum(data)  
    .transition(t)
    .attr("d", area);
  
  // area between the two citie's values,
  // Location 2 being the y0 and Location 1 the y1;
  area.y0(d => y(d["Location 2"]));

  // make path from area btw the two cities (is clipped above)
  areaAbove
    .datum(data)
    .transition(t)
    .attr("d", area);

  // make path from area btw the two cities (is clipped below)
  areaBelow
    .datum(data)
    .transition(t)
    .attr("d", area);

  linePath
    .datum(data)
    .transition(t)
    .attr("d", line);


  xAxis.scale(x);
  yAxis.scale(y);

  xAxisGroup.call(xAxis); 
  yAxisGroup.transition(t)
    .call(yAxis);
  
}

function noisifyData(data) {
	const retData = data.slice();
	
	retData.columns = data.columns;


  const flip = Math.random() > 0.5;
  retData.forEach((d, index) => {
		const newEntry = retData[index] = clone(d);


		const noiseArg = noiseOff + index*noiseDiff;		
		const noiseVal = noise.perlin2(noiseArg, noiseArg); // will be between -1 and 1
		const absolute = Math.abs(noiseVal);

    const factor = 0.25;
    if (flip) {
      const inter = newEntry["Location 1"];
      newEntry["Location 1"] = newEntry["Location 2"];
      newEntry["Location 2"] = inter;
    };

		newEntry["Location 1"] *= 1 + factor*absolute;
		newEntry["Location 2"] *= 1 - factor*absolute;
	});
	return retData;
}


function clone(dataObj) {
	const newObj = {};
	d3.keys(dataObj).forEach(key => newObj[key] = dataObj[key]);
	return newObj;
}
