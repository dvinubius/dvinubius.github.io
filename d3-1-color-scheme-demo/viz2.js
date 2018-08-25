function viz2() {


  let margin = {
    top: 40,
    right: 40,
    bottom: 100,
    left: 40
  };
  
  let vizWidth = Math.min(window.innerWidth*0.7, 1000) - margin.left - margin.right;
  let vizHeight = Math.min(600, window.innerHeight*0.7)- margin.top - margin.bottom;

  let updateRate = 600;
  let updateInterval;
  let running = false;
  let currentData;
  let initialData;

  let pushing = true;
  let skipTick = false;

  let positionChanges = [];
  const counterLabel = document.querySelector('#counter-label-2');

  let stickFactors;
  function initStickFactors() {
    stickFactors = [];
    initialData.forEach(d => stickFactors[d.id] = 2 + Math.random()*3);
  }
  
  
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

    inputField.disabled = true;
    running = true;
    tick();
  }
  function stop() {
    playButton.innerHTML = 'Go';
    clearInterval(updateInterval);
    running = false;
    inputField.disabled = false;
  }
  function tick() {

    if (skipTick) {
      skipTick = false;
      return;
    }

    if (pushing) {
      const pickIndex = Math.floor(Math.random()*(currentData.length - 1));
      const some = currentData.splice(pickIndex,1)[0];
      let insertIndex = Math.floor(Math.random()*(currentData.length - 1));
      if (insertIndex === pickIndex) {
        insertIndex = pickIndex === currentData.length - 1 ? 0 : insertIndex + 1;
      }
      currentData.splice(insertIndex, 0, some);
      
      positionChanges.push([pickIndex, insertIndex]);
      if (positionChanges.length === +inputField.value) {
        pushing = false;
        skipTick = true;
      }
      update(currentData);
    } else {
      const lastChange = positionChanges[positionChanges.length - 1];
      const indexFrom = lastChange[0];
      const indexTo = lastChange[1];

      const datumToMove = currentData.splice(indexTo,1)[0];
      currentData.splice(indexFrom, 0, datumToMove);

      positionChanges.pop();
      if (positionChanges.length === 0) {
        pushing = true;
        skipTick = true;
      }
      update(currentData);
    }
  }



  const inputField = document.querySelector('#input-max-2');
  inputField.value = 5;
  inputField.addEventListener('change', () => {    
    currentData = initialData.slice();
    currentData.columns = initialData.columns.slice();
    pushing = true;
    skipTick = false;
    positionChanges = [];
    initStickFactors();
    counterLabel.innerHTML = 0;
    update(currentData);
  });


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

  let x = d3.scaleBand()
    .range([0, vizWidth])
    .paddingInner(0.2)
    .paddingOuter(0.2);  

  let rad = d3.scaleLinear()
    .range([12,40]);

  const stickHeight = (d,index) => {
    basicHeight = vizHeight/2;
    const highStick = index % 2 === 0;
    const lengthDiff = highStick ? rad(d.id) : -rad(d.id);
    return basicHeight + lengthDiff*stickFactors[d.id];
  };

  const circlePosY = (d,index) => vizHeight - stickHeight(d,index);


  // Line path generator
  const line = d3.line()
    .curve(d3.curveCardinal.tension(.2));

  // Add line to chart
  const linePath = g.append("path")
  .attr("class", "line")
  .attr("fill", "none")
  .attr("stroke", "violet")
  .attr("stroke-width", "2px")
  .attr("opacity", 0.8);


  d3.csv('colors1.csv').then(colorData => {

    initialData = colorData.slice();
    initialData.columns = colorData.columns.slice();
    currentData = colorData;
    currentData.forEach((d, index) => d.id = index);
    initStickFactors();

    update(currentData);
  });

  function update(colorData) {    
    const colName = colorData.columns[0];
      
    let t = d3.transition().duration(updateRate*0.66).ease(d3.easeBack);

    counterLabel.innerHTML = positionChanges.length;

    x.domain(colorData.map(d => d[colName]))
    let xAxisCall = d3.axisBottom(x)
      .tickSize(0);
    xAxisGroup.call(xAxisCall)
        .selectAll('text')
        .style('visibility', 'hidden');

    rad.domain([0, colorData.length-1]);


    const currentIndexForDatumThatWasInitiallyAtIndex = index => {
      const datum = initialData[index];
      const targetIndex = currentData.indexOf(datum);
      return targetIndex;
    }

    line.y((d,index) => {
      const targetIndex = currentIndexForDatumThatWasInitiallyAtIndex(index);
      const targetDatum = currentData[targetIndex];
      return circlePosY(targetDatum, targetIndex);
    });
    line.x((d,index) => {
      const targetIndex = currentIndexForDatumThatWasInitiallyAtIndex(index);
      const targetDatum = currentData[targetIndex];
      return x(targetDatum[colName]) + x.bandwidth()/2;
    });
    linePath.transition(t)
        .attr("d", line(colorData));


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

