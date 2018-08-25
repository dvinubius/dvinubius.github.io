function viz1() {

  noise.seed(Math.random());

  let margin = {
    top: 40,
    right: 40,
    bottom: 100,
    left: 40
  };
  
  let vizWidth = Math.min(window.innerWidth*0.7, 1000)  - margin.left - margin.right;
  let vizHeight = Math.min(600, window.innerHeight*0.7)- margin.top - margin.bottom;


  let updateRate = 300;
  let updateInterval;
  let running = false;
  let currentData;

  const playButton = document.querySelector('#chart-area1 .controller');
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

  let svg = d3.select('#chart-area1')
    .append('svg')
    .attr('width', vizWidth + margin.left + margin.right)
    .attr('height', vizHeight + margin.top + margin.bottom)
    .style('outline', '1px solid grey')
    .style('background-color', 'white');


  let x = d3.scaleBand()
    .range([0, vizWidth])
    .paddingInner(0.2)
    .paddingOuter(0.2);

  let g = svg.append('g')
    .attr('transform', 'translate('+ margin.left+ ','+margin.top +')');
  
  let xAxisGroup = g.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,'+vizHeight+')');
    

  let noiseOff = 1;
  const noiseDiff = 0.08;


  d3.csv('colors2.csv').then(colorData => {

    currentData = colorData;

    const colName = colorData.columns[0];
    x.domain(colorData.map(d => d[colName]));
    let xAxisCall = d3.axisBottom(x)
      .tickSize(0);
    xAxisGroup.call(xAxisCall)
    .selectAll('text')
      .attr('y', '-5')
      .attr('x', '-10')
      .attr('text-anchor', 'end')
      .attr('font-size', 16)
      .attr('transform', 'rotate(-80)')
      .attr('fill', 'grey')

    tick();
  });

  function noisifyData(data) {
    data.forEach((d, index) => {
      noiseArg = noiseOff + index*noiseDiff;
      return d.noise = noise.perlin2(noiseArg, noiseArg); // will be between -1 and 1
    });
  }


  function update(colorData) {
    if (colorData.length === 0) {
      return;
    }

    const colName = colorData.columns[0];
        
    let t = d3.transition().duration(updateRate).ease(d3.easeLinear);

    let rects = g.selectAll('rect').data(colorData, d => d[colName]);

    rects.enter()
      .append('rect')
        .attr('y', vizHeight)
        .attr('x', d => x(d[colName]))
        .attr('width', x.bandwidth())
        .attr('height', 0)
          .merge(rects)
            .transition(t)
              .attr('x', d => x(d[colName]))
              .attr('y', d => vizHeight*(0.5 - d.noise*0.5))
              .attr('width', x.bandwidth())
              .attr('height', d => vizHeight*(0.5 + d.noise*0.5))
              .attr('fill', d => d[colName]);
  }
}


