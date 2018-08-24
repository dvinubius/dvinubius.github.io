function viz2() {


  let margin = {
    top: 40,
    right: 40,
    bottom: 100,
    left: 40
  };
  
  let vizWidth = Math.min(window.innerWidth*0.7, 1000) - margin.left - margin.right;
  let vizHeight = Math.min(600, window.innerHeight*0.7)- margin.top - margin.bottom;

  let updateRate = 1500;
  let updateInterval;
  let running = false;
  let currentData;



  const playButton = document.querySelector('#chart-area2 .controller');
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
    const pickIndex = Math.floor(Math.random()*(currentData.length - 1));
      const some = currentData.splice(pickIndex,1)[0];
      let insertIndex = Math.floor(Math.random()*(currentData.length - 1));
      if (insertIndex === pickIndex) {
        insertIndex = pickIndex === currentData.length - 1 ? 0 : insertIndex + 1;
      }
      currentData.splice(insertIndex, 0, some);
    update(currentData);
  }

  let svg = d3.select('#chart-area2')
    .append('svg')
    .attr('width', vizWidth + margin.left + margin.right)
    .attr('height', vizHeight + margin.top + margin.bottom)
    .style('outline', '1px solid grey')
    .style('background-color', 'rgba(50,0,20,0.5)');

  let g = svg.append('g')
    .attr('transform', 'translate('+ margin.left+ ','+margin.top +')')

  const xAxisGroup = g.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,'+vizHeight+')')

  let y = d3.scaleOrdinal()
    .domain([0,1])
    .range([vizHeight/2,vizHeight/2]);
  let x = d3.scaleBand()
    .range([0, vizWidth])
    .paddingInner(0.2)
    .paddingOuter(0.2);  

  let rad = d3.scaleLinear()
    .range([12,40]);

  const stickHeight = (d,index) => {
    basicHeight = vizHeight - y(index);
    const highStick = index % 2 === 0;
    const lengthDiff = highStick ? rad(d.id) : -rad(d.id);
    return basicHeight + lengthDiff*2;
  };

  const circlePosY = (d,index) => vizHeight - stickHeight(d,index);

  d3.csv('colors.csv').then(colorData => {

    currentData = colorData;
    currentData.forEach((d, index) => d.id = index);

    update(currentData);
  });

  function update(colorData) {    
    const colName = colorData.columns[0];

    let t = d3.transition().duration(updateRate*0.66).ease(d3.easeBack);

    x.domain(colorData.map(d => d[colName]))
    let xAxisCall = d3.axisBottom(x)
      .tickSize(0);
    xAxisGroup.call(xAxisCall)
        .selectAll('text')
        .style('visibility', 'hidden');

    rad.domain([0, colorData.length-1]);

    let lines = g.selectAll('rect').data(colorData, d => d.id);

    lines.enter()
      .append('rect')
        .attr('x', d => x(d[colName]) + x.bandwidth()/2)
        .attr('y', circlePosY)
        .attr('width', 1)
        .attr('height', stickHeight)
        .attr('fill', d => d[colName])
          .merge(lines)
            .transition(t)
              .attr('x', d => x(d[colName]) + x.bandwidth()/2)
              .attr('y', circlePosY)
              .attr('width', 1)
              .attr('height', stickHeight);


    let circles = g.selectAll('circle').data(colorData, d => d.id)
    
    circles.enter()
      .append('circle')
        .attr('cx', d => x(d[colName]) + x.bandwidth()/2)
        .attr('cy', circlePosY)
        .attr('r', d => rad(d.id))
        .attr('fill', d => d[colName])
        .attr('stroke', 'rgba(0,0,0,0.1)')
          .merge(circles)
            .transition(t)
              .attr('cx', d => x(d[colName]) + x.bandwidth()/2)
              .attr('cy', circlePosY)
              .attr('r', d => rad(d.id));
  }
}

