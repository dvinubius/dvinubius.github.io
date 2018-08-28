function viz5() {
  noise.seed(Math.random());

  let margin = {
    top: 180,
    right: 40,
    bottom: 20,
    left: 40
  };
  
  let vizWidth = Math.min(window.innerWidth*0.7, 1000) - margin.left - margin.right;
  let vizHeight = Math.min(600, window.innerHeight*0.7) - margin.top - margin.bottom;

  
  let svg = d3.select('#chart-area5')
    .append('svg')
    .attr('width', vizWidth + margin.left + margin.right)
    .attr('height', vizHeight + margin.top + margin.bottom)
    .style('outline', '1px solid grey')
    .style('background-color', '#8a89a6');

  let bg = svg.append('rect')
    .attr('height', vizHeight + margin.top + margin.bottom - 40)
    .attr('fill', 'lightblue')
    .attr('stroke', 'whitesmoke')
    .attr('stroke-width', 1)
    .attr('class', 'frame');

  let g = svg.append('g')
    .attr('transform', 'translate('+ margin.left+ ','+margin.top +')')



  var x = d3.scaleBand()
      .rangeRound([0, vizWidth])
      .paddingInner(0.25)
      .paddingOuter(0);

  var y = d3.scaleLinear()
      .rangeRound([0, vizHeight]);

  var z = d3.scaleOrdinal()
    .range([
      // "#98abc5",
      // "#8a89a6",
      // "#7b6888",
      "#6b486b",
      "#a05d56",
      "#d0743c",
      "#ff8c00"
    ]);


  var circlesLayer = g.append("g").attr('class', 'circles-layer');

  var area = d3.area()
    .curve(d3.curveCardinal);

  let noiseOff = 10;
  const noiseDiff = 0.07;
 
  let updateRate = 500;
  let updateInterval;
  let running = false;
  let initialData;

  const playButton = document.querySelector('#chart-area5 .controller');
  playButton.addEventListener('click', () => {
    if (!running) {
      start();
    }
    else {
      stop();
    }
  });

  function start() {
    playButton.innerHTML = 'Stop';
    updateInterval = setInterval(() => {
      tick();
    }, updateRate);

    running = true;
    tick();
  }
  function stop() {
    playButton.innerHTML = 'Go';
    clearInterval(updateInterval);
    running = false;
  }
  function tick() {
    noiseOff += noiseDiff;
    const newData = noisifyData(initialData);
    update(newData);
  }


  d3.csv("colors5.csv").then( data => {
    initialData = data;

    noiseOff += noiseDiff;
    const startData = noisifyData(data);
    update(startData);
  })


  function update(data) {

    const columns = data.columns;

    data.forEach((d, i) => {
      let t = 0;
      for (let i = 1; i < columns.length; ++i) {
        t += d[columns[i]] = +d[columns[i]];
      }
      d.total = t;
      return d;
    });


    const t = d3.transition().duration(updateRate).ease(d3.easeLinear);
    const keys = data.columns.slice(1);	

    x.domain(data.map(d => d["Week"]));
    y.domain([0,d3.max(data, d => d.total)]);
    z.domain(keys);


    bg.style('transform', `translate(${x.bandwidth()/2 + margin.left + 1}px, ${20}px)`)
      .attr('width', vizWidth - x.bandwidth() - 2);

    area
      .x( d => x(d.data["Week"]) + x.bandwidth()/2)
      .y0(d => vizHeight- y(d[0]))
      .y1(d => vizHeight - y(d[1]));

    const stackedData = d3.stack().keys(keys)(data);

    let boundLayers = g.selectAll('.layer').data(stackedData, d => d.key);

    boundLayers
      .enter()
        .append("g")
        .attr("class", "layer")
        .append("path")
          .attr("class", "area")
          .style("fill", function(d) { return z(d.key); })
          .attr("d", area)
        .merge(boundLayers)
            .select("path")
            .transition(t)
            .attr("d", area);


    
    let circles = circlesLayer.selectAll('circle').data(data, d => d["Week"]);
    
    circles.enter()
      .append('circle')
      .attr('cx', d => x(d["Week"]) + x.bandwidth()/2)
      .attr('cy', d => vizHeight - y(d.total))
      .attr('r', (d, index) => (index !== 0 && index !== data.length-1) ? 16 : 0)
      .attr('fill', 'whitesmoke')
      .attr('stroke', '#7b6888')
        .merge(circles)
          .transition(t)
          .attr('cy', d => vizHeight - y(d.total));
  }


  function noisifyData(data) {
    const keys = data.columns.slice(1);
    const dataClone = clone(data);

    dataClone.forEach((week, indexWeek) => {
      
      keys.forEach((day, indexDay) => {
        const noiseArg = (indexDay*10 + noiseOff) + noiseDiff*indexWeek;
        const noiseVal = noise.perlin2(noiseArg, noiseArg); // will be between -1 and 1
        week[day] = week[day]*(1 + noiseVal);
      });
    });

    return dataClone;
  }

  function clone(dataObj) {
    const newData = new Array(dataObj.length).fill(null);
    newData.columns = dataObj.columns;
    newData.forEach((_, index) => {
      const newWeekEntry = newData[index] = {};
      const originalWeekEntry = dataObj[index];
      d3.keys(originalWeekEntry).forEach(
        key => newWeekEntry[key] = originalWeekEntry[key]
      );
    });
    return newData;
  }
}