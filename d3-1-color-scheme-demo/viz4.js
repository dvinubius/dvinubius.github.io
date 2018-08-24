function viz4() {

  let margin = {
    top: 40,
    right: 40,
    bottom: 100,
    left: 40
  };
  
  let vizWidth = Math.min(window.innerWidth*0.7, 1000) - margin.left - margin.right;
  let vizHeight = Math.min(600, window.innerHeight*0.7)- margin.top - margin.bottom;

  let updateRate = 100;
  let updateInterval;
  let running = false;
  let currentData;

  const playButton = document.querySelector('#chart-area4 .controller');
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
    noisifyData(currentData);
    update(currentData);
  }

  let svg = d3.select('#chart-area4')
    .append('svg')
    .attr('width', vizWidth + margin.left + margin.right)
    .attr('height', vizHeight + margin.top + margin.bottom)
    .style('outline', '1px solid grey')
    .style('background-color', 'rgba(40,0,10,0.4)');

  let g = svg.append('g')
    .attr('transform', 'translate('+ margin.left+ ','+margin.top +')')

  const xAxisGroup = g.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,'+vizHeight+')')

  let y = d3.scaleOrdinal()
    .domain([0,1])
    .range([vizHeight/3,vizHeight/2]);
  let x = d3.scaleBand()
    .range([0, vizWidth])
    .paddingInner(0.2)
    .paddingOuter(0.2);  

  const baseRad = 20;
  const baseWidthStick = 2;
  noise.seed(Math.random());
  let noiseOff = 1;
  const noiseDiff = 0.08; 
  const radiusCalc = d => baseRad*(1 + 0.9*d.noise);



  d3.csv('colors.csv').then(colorData => {

    currentData = colorData;

    colorData.forEach((d, index) => {
      d.id = index;
      d.noise = 0;
    });

    noisifyData(currentData);
    update(currentData);
  });

  function noisifyData(data) {
    data.forEach((d, index) => {
      noiseArg = noiseOff + index*noiseDiff;
      return d.noise = noise.perlin2(noiseArg, noiseArg); // will be between -1 and 1
    });
  }

  function update(colorData) {    
    const colName = colorData.columns[0];

    let t = d3.transition().duration(updateRate).ease(d3.easeLinear);

    x.domain(colorData.map(d => d[colName]))
    let xAxisCall = d3.axisBottom(x)
      .tickSize(0);
    xAxisGroup.call(xAxisCall)
        .selectAll('text')
        .style('visibility', 'hidden');

    let lines = g.selectAll('rect').data(colorData, d => d.id);

    lines.enter()
      .append('rect')
        .attr('x', d => x(d[colName]) + x.bandwidth()/2)
        .attr('y', (d,index) => y(index) + radiusCalc(d))
        .attr('width', d => baseWidthStick*(1+0.7*d.noise))
        .style('transform', d => `translateX(-${baseWidthStick*(1+0.5*d.noise)*0.5}px)`)
        .attr('height', (d,index) => vizHeight - y(index) - radiusCalc(d))
        .attr('fill', d => d[colName])
        .style('opacity', 0.6)
          .merge(lines)
            .transition(t)
              .attr('x', d => x(d[colName]) + x.bandwidth()/2)
              .attr('y', (d,index) => y(index) + radiusCalc(d))
              .attr('width', d => baseWidthStick*(1+0.7*d.noise))
              .style('transform', d => `translateX(-${baseWidthStick*(1+0.5*d.noise)*0.5}px)`)
              .attr('height', (d,index) => vizHeight - y(index) - radiusCalc(d));


    let circles = g.selectAll('circle').data(colorData, d => d.id);
    
    circles.enter()
      .append('circle')
        .attr('cx', d => x(d[colName]) + x.bandwidth()/2)
        .attr('cy', (d,index) => y(index))
        .attr('r', radiusCalc)
        .attr('fill', d => d[colName])
        .attr('stroke', 'rgba(0,0,0,0.1)')
          .merge(circles)
            .transition(t)
              .attr('cx', d => x(d[colName]) + x.bandwidth()/2)
              .attr('cy', (d,index) => y(index))
              .attr('r', radiusCalc);
  }
}

