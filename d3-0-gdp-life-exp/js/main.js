/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

margin = {
	top: 110,
	right: 30,
	bottom: 100,
	left: 110
}
const bubbleScaleFactor = 2;
const unselectedOpacity = 0.2;

let vizWidth = Math.min(1100, window.innerWidth*0.8) - margin.left - margin.right;
let vizHeight = Math.min(800, window.innerHeight*0.8) - margin.top - margin.bottom;


let svg = d3.select('#chart-area')
	.append('svg')
		.attr('width', vizWidth + margin.left + margin.right)
		.attr('height', vizHeight + margin.top + margin.bottom)
		// .style('outline', '1px solid grey')
		// .style('background-color', 'whitesmoke');


// GENERAL GROUP FOR the whole VIZ
const g = svg.append('g')
	.attr('transform', 'translate('+ margin.left+ ','+margin.top +')');


// INIT TOOLTIP and attach to visualization
const tip = d3.tip().attr('class', 'd3-tip')
	.html(d => {
	  let htmlText =	`
			<table class='tip-table'>
				<tr>
					<td>Country:</td>
					<td>${d.country}</td>
				</tr>
				<tr>
					<td>GDP/Cap:</td>
					<td>${d.income}</td>
				</tr>
				<tr>
					<td>Life Exp:</td>
					<td>${d.life_exp}</td>
				</tr>
			</table>
		`;
		return htmlText;
	});
g.call(tip);


// SCALES & AXES & LEGEND

const xScale = d3.scaleLog()
	.base(10)
	.domain([142,150000])
	.range([0,vizWidth]);
const xAxisCall = d3.axisBottom(xScale)
	.tickValues([400,4000,40000])
	.tickFormat(d3.format("$"));

const yScale = d3.scaleLinear()
	.domain([0,90])
	.range([vizHeight,0]);
const yAxisCall = d3.axisLeft(yScale)
	.ticks(10);

const timeScale = d3.scaleLinear()
	.domain([1800, 2014])
	.range([0,vizWidth])
const timeAxisCall = d3.axisTop(timeScale)
	.tickValues([1800, 2014]);

const radScale = d3.scaleSqrt()
	.domain([2000,1400000000])
	.range([5,39]);

const continents = ['africa', 'americas', 'europe', 'asia', 'australia'];
const continentScale = d3.scaleOrdinal()
	.domain(continents)
	.range(d3.schemeCategory10)

const legend = g.append('g')
	.attr('transform', `translate(${vizWidth - 10},${vizHeight-120})`);

continents.forEach((c,i) => {
	const row = legend.append('g')
		.attr('transform', `translate(0,${i*20})`);

	row.append('rect')
		.attr('width', 10)
		.attr('height', 10)
		.attr('fill', continentScale(c));

	row.append('text')
		.attr('text-anchor', 'end')
		.attr('x', -10)
		.attr('y', 10)
		.attr('fill', 'black')
		.attr('font-size', 16)
		.style('text-transform', 'capitalize')
		.text(c);
}); 

// SVG WRAPPERS for AXES and PLOT

const xAxisGroup = g.append('g')
	.attr('class', 'x axis')
	.attr('transform', 'translate(0,'+vizHeight+')')
	.call(xAxisCall)
		.selectAll('text')
			.attr('text-anchor', 'center')
			.attr('font-size', 14)
			.attr('y', 10);

const yAxisGroup = g.append('g')
	.attr('class', 'y axis')
	.call(yAxisCall)
		.selectAll('text')
			.attr('text-anchor', 'end')
			.attr('font-size', 14)
			.attr('x', -10);

let xLabel = g.append('text')
  .attr('x', vizWidth/2)
  .attr('y', vizHeight + margin.bottom/2 + 8)
  .attr('text-anchor', 'middle')
  .attr('font-size', 24)
  .text('GDP per Capita ($)');

let yLabel = g.append('text')
  .attr('x', -vizHeight/2)
  .attr('y', -(margin.left/2 - 5))
  .attr('transform', 'rotate(-90)')
  .attr('text-anchor', 'middle')
  .attr('font-size', 24)
	.text('Life Expectancy (Years)');
	
let yearLabel = g.append('text')
	.text('')
	// .attr('x', vizWidth - 90)
	// .attr('y', vizHeight - 20)
	.attr('x', -10)
	.attr('y', -30)
	.attr('text-anchor', 'start')
	// .attr('fill', 'rgba(80,100,80,0.8)')
	.attr('fill', d3.schemeCategory10[9])
	.style('font-size', 32);

const timeAxisGroup = g.append('g')
	.attr('class', 'x axis top')
	.attr('transform', 'translate(0,'+ -75 +')')
	.call(timeAxisCall)
		.selectAll('text')
			.attr('text-anchor', 'center')
			.attr('font-size', 16)
			.attr('y', -20);

let timeLine = g.append('rect')
	.attr('transform', 'translate(0,-76)')
	.attr('height', 5)
	.attr('width', 0)
	.attr('fill', d3.schemeCategory10[9]);

let timeLineLabel = g.append('text')
	.attr('x', -15)
	// .attr('x', 100)
	.attr('y', -30)
	.attr('text-anchor', 'end')
	.attr('fill', 'rgba(80,100,80,.4)')
	// .attr('fill', d3.schemeCategory10[9])
	.attr('font-size', 24)
	.text('Year');


// Make slider overlap with timeline axis
const axisDomainInDom = document.querySelector('.x.axis.top .domain');
const axisDomainRect = axisDomainInDom.getBoundingClientRect();
let slider = document.querySelector('.timeline-slider');
console.log(axisDomainRect);
console.log(slider.style);
slider.style.top = axisDomainRect.top+'px';
slider.style.left = axisDomainRect.left+'px';
slider.style.width = axisDomainRect.width-1+'px';
$('.timeline-slider').on('input', () => {
	pauseViz();
	timeLine.attr('width', timeScale(slider.value));
	yearLabel.text(slider.value);
	yearIndex = slider.value - 1800 - 1;
	step(true);
});
$('.timeline-slider').on('change', () => {
	
})

// Visualization loop control
let formattedData;
let updateInterval;
let updateRate = 300;
let yearIndex = -1;
let running = false;


function step(noTransition) {
	yearIndex++;
	if (yearIndex < formattedData.length) {
		update(formattedData[yearIndex], noTransition);
	} else {
		yearIndex = -1;
	}
}

function pauseViz() {
	clearInterval(updateInterval);
	running = false;
	$('#play-button').text('Play');
}

function continueViz() {
	updateInterval = setInterval(step,updateRate);
	running = true;
	$('#play-button').text('Pause');
	step();
}

$('#play-button').on('click', () => {
	if (running) {
		pauseViz();
	} else {
		continueViz();
	}
});

$('#reset-button').on('click', () => {
	yearIndex = -1;
	yearLabel.text(formattedData[0].year);
	timeLine.attr('width', 0);
	slider.value = 1800;
})

$('#faster-button').on('click', () => {
	const lastRate = updateRate;
	updateRate -= updateRate > 50 ? 50 : 0;
	if (running) {
		clearInterval(updateInterval);
		updateInterval = setInterval(step, updateRate);
	} 
})

$('#slower-button').on('click', () => {
	updateRate += 50;
	if (running) {
		clearInterval(updateInterval);
		updateInterval = setInterval(step, updateRate);
	} 
})

$('#continent-select').on('change', () => {
	update(formattedData[yearIndex]);
})

d3.json("data/data.json").then(function(data){

	const findNullValue = country => {
		const keys = Object.keys(country);
		return keys.find(key => country[key] === null);
	};
	data.forEach(d => {
		d.year = +d.year;
		d.countries = d.countries.filter(c => !findNullValue(c));
		d.countries.forEach(c => {
			if (c.country === 'Australia') {
				c.continent = 'australia'
			}
		});
	});

	formattedData = data;
	step();
});

function update(data, noTransition) { // input: one particular year's dataset

	let t = d3.transition();

	const transitionDuration = noTransition ? 50 : updateRate;

	const selectedContinent = $('#continent-select').val();

	// if (selectedContinent !== 'all') {
	// 	data.countries = data.countries.filter(d => d.continent === selectedContinent)
	// }
	const circleOpacity = selectedContinent === 'all' ? (() => 1)
																										: (d => d.continent === selectedContinent ? 1 : unselectedOpacity);

	let circles = g.selectAll('circle')
		.data(data.countries, d => d.country);
	
	circles.exit()
		.transition(t.duration(transitionDuration))
			.attr('fill', 'transparent')
			.attr('r', 0)
			.remove();

	circles.enter()
		.append('circle')
		.attr('stroke', 'rgb(70,70,70)')
		.attr('stroke-weight', 1)
		.attr('fill', 'transparent')
		.attr('cx', d => xScale(d.income))
		.attr('cy', d => yScale(d.life_exp))
		.on('mouseover', tip.show)
		.on('mouseleave', tip.hide)
		.merge(circles)
		.transition(t).duration(transitionDuration)
			.attr('cx', d => xScale(d.income))
			.attr('cy', d => yScale(d.life_exp))
			.attr('fill', d => continentScale(d.continent))
			.attr('opacity', d => circleOpacity(d))
			.attr('r', d => radScale(d.population)*bubbleScaleFactor);
	
	yearLabel.transition(t.duration(transitionDuration))
		.text(data.year);

	slider.value = data.year;
	timeLine.attr('width', timeScale(slider.value));
}