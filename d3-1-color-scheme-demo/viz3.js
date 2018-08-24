function viz3() {

  let margin = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40
  };
  
  let vizWidth = Math.min(window.innerWidth*0.7, 1000)  - margin.left - margin.right;
  let vizHeight = Math.min(600, window.innerHeight*0.7)- margin.top - margin.bottom;


  updateRate = 17;
  let updateInterval;
  let running = false;
  let currentData;

  const playButton = document.querySelector('#chart-area3 .controller');
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
    const first = {...currentData.splice(0,1)[0]};
    first.id = currentData[currentData.length-1].id + 1;      
    currentData.push(first);
    update(currentData);
  }

  let svg = d3.select('#chart-area3')
    .append('svg')
    .attr('width', vizWidth + margin.left + margin.right)
    .attr('height', vizHeight + margin.top + margin.bottom)
    .style('outline', '1px solid grey')
    .style('background-color', 'white');


  let x = d3.scaleBand()
    .range([0, vizWidth])
    .paddingInner(0)
    .paddingOuter(0.2);

  let g = svg.append('g')
    .attr('transform', 'translate('+ margin.left+ ','+margin.top +')');


  d3.csv('colors3.csv').then(colorData => {

    const extended = colorData.slice();
    colorData.forEach(d => extended.push({...d}));
    extended.columns = colorData.columns;
    currentData = extended;    
    currentData.forEach((d,index) => d.id = index);

    update(currentData);
  });



  function update(colorData) {
    if (colorData.length === 0) {
      return;
    }

    const colName = colorData.columns[0];
        
    let t = d3.transition().duration(updateRate).ease(d3.easeLinear);
    
    x.domain(colorData.map(d => d.id));

    let rects = g.selectAll('rect').data(colorData, d => d.id);

    rects.exit()
      .attr('opacity', 1)
        .attr('opacity', 0)
        .attr('width', 0)
        // .transition(t)
          .remove();

    rects.enter()
      .append('rect')
        .attr('y', 0)
        .attr('x', d => vizWidth)
        .attr('width', 0)
        .attr('height', vizHeight)
          .merge(rects)
            // .transition(t)
              .attr('x', d => x(d.id))
              .attr('y', 0)
              .attr('width', x.bandwidth())
              .attr('height', vizHeight)
              .attr('fill', d => d[colName]);
  }
}


