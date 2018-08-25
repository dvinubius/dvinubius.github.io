/*
*    main.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/

var margin = { left:100, right:100, top:50, bottom:100 },
    height = 600 - margin.top - margin.bottom, 
    width = Math.min(970, window.innerWidth*0.8) - margin.left - margin.right;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + 
        ", " + margin.top + ")");

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Axis generators
var xAxisCall = d3.axisBottom().ticks(6);
var yAxisCall = d3.axisLeft().ticks(6);

// Axis groups
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis = g.append("g")
    .attr("class", "y axis")
    
// Y-Axis label
const yLabel = yAxis.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -230)
    .style("text-anchor", "middle")
    .attr("fill", "#5D6971");

var formatSi = d3.format(".2s");
function formatAbbreviation(x) {
    var s = formatSi(x);
    switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
    }
    return s;
}


let allData;


// Line path generator
const line = d3.line()
    .x(d => x(d.date));

// Add line to chart
const linePath = g.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "deeppink")
    .attr("stroke-width", "3px");

const kpiSelect = $('#var-select');
kpiSelect.on('change', () => {
    update();
});

const coinSelect = $('#coin-select');
coinSelect.on('change', () => {
    update();
});

const sliderScale = d3.scaleTime()
    .range([0,100]);
const slider = $('#date-slider')
slider.slider({
    max: 100,
    min: 0,
    range: true,
    step: 1,
    values: [0,100],
    slide: function(_, ui) {
        update();
    } 
});
function updateSliderLabels(dateRange) {
    $('#dateLabel1').html(d3.timeFormat("%d/%m/%Y")(dateRange[0]));
    $('#dateLabel2').html(d3.timeFormat("%d/%m/%Y")(dateRange[1]));
}

const overlay = initOverlay();
const focus = g.select('.focus');



d3.json("data/coins.json").then( data => {

    // Data cleaning
    Object.keys(data).forEach(function(coin) {
        const coinValues = data[coin];
        coinValues.forEach(entry => {
            entry["24h_vol"] = +entry["24h_vol"];
            entry["date"] = d3.timeParse("%d/%m/%Y")(entry["date"]);
            entry["market_cap"] = +entry["market_cap"];
            entry["price_usd"] = +entry["price_usd"];
        });
    });

    allData = data;
    kpiSelect.val("price_usd");
    coinSelect.val("bitcoin");
    update();
});


function update() {

    const t = d3.transition().duration(300).delay(100);

    // READ VALUES FROM UI - WHAT TO DISPLAY
    const kpi = kpiSelect.val();
    const coin = coinSelect.val();
    const sliderRange = slider.slider("option", "values");

    // PREP DATA
    const coinData = allData[coin];
    // interpret slider values to filter the data
    sliderScale.domain(d3.extent(coinData, d => d.date));
    const dateRange = [
        sliderScale.invert(sliderRange[0]),
        sliderScale.invert(sliderRange[1])
    ];
    updateSliderLabels(dateRange);
    const data = coinData.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1]); 

    // SCALES and AXES updated

    x.domain(dateRange);
    y.domain([d3.min(data, d => d[kpi]) / 1.005, 
        d3.max(data, d => d[kpi]) * 1.005]);

    let yLabelText;
    switch (kpi) {
        case ('price_usd'):
            yLabelText = "Price (USD)";
            break;
        case ('market_cap'):
            yLabelText = "Market Cap (USD)";
            break;
        case ('24h_vol'):
            yLabelText = "24 Hour Trading Volume (USD)";
            break;        
    }

    yAxisCall.tickFormat(formatSi);


    xAxis.transition(t)
        .call(xAxisCall.scale(x))     
        .selectAll('text')
            .attr('font-size', '1.3em');
    yAxis.transition(t)
        .call(yAxisCall.scale(y))
        .selectAll('text')
            .attr('font-size', '1.3em');

    yLabel.transition(t).text(yLabelText)
        .attr('font-size', '2.3em');

    // Line update
    line.y(d => y(d[kpi]));
    linePath.transition(t)
        .attr("d", line(data));


    /******************************** Tooltip Code ********************************/

    overlay.on("mousemove", function() {
        // For tooltip
        const bisectDate = d3.bisector( d => d.date).left;

        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        focus.attr("transform", `translate(${x(d.date)},${y(d[kpi])})`);
        focus.select("text").text(d3.format(",")(d[kpi]));
        focus.select(".x-hover-line").attr("y2", height - y(d[kpi]));
        focus.select(".y-hover-line").attr("x2", -x(d.date));
    });


    /******************************** Tooltip Code ********************************/
}

function initOverlay() {
    const focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    // focus.append("line")
    //     .attr("class", "x-hover-line hover-line")
    //     .attr("y1", 0)
    //     .attr("y2", height);

    // focus.append("line")
    //     .attr("class", "y-hover-line hover-line")
    //     .attr("x1", 0)
    //     .attr("x2", width);

    focus.append("circle")
        .attr("r", 7.5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    return g.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", () => focus.style("display", null))
        .on("mouseout", () => focus.style("display", "none"))
}

