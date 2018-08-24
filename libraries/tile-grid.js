(function TileGridConfig(context) {
  const TileGridConfig = function(gridSize, tileSize, center) {
    this.gridSize = gridSize;
    this.tileSize = tileSize;
    this.center = center;
  }
  context.TileGridConfig = TileGridConfig;
})(window);


;(function TileGrid(context) {
  const TileGrid = function(gridSize, xPos, yPos, tileSize) {
    // inherit from grid
    Grid.call(this, gridSize, xPos, yPos);
    this.tileSize = tileSize;
    this.length = this.gridSize * this.tileSize;

    // inherit from Grid
    Object.setPrototypeOf(TileGrid.prototype, Grid.prototype);

    // init tiles
    this.setEach((x, y) => {
  		const tile =  new Tile(
  			this.tileSize,
  			x*this.tileSize + this.x,
  			y*this.tileSize + this.y,
        x,
        y
  		);
  		return tile;
  	});
  };

  TileGrid.createInstance = function(config /*TileGridConfig*/) {
    let ts;
    const gridSize = config.gridSize;
    ts = config.tileSize ?
          config.tileSize : // use given value
          ts = round(min(width / gridSize, height / gridSize) * 0.9); // maximize grid
    
    let gridX = 0;
    let gridY = 0;
    // center grid
    if (config.center) {
      const sideLength = gridSize * ts;
      gridX = (width - sideLength)/2;
      gridY = (height - sideLength)/2;
    }    
    return new TileGrid(gridSize, gridX, gridY, ts);
  }

  TileGrid.prototype.positionUnderMouse = function() {
    const mPos = this.mousePosForGrid();
  	const xTile = floor(mPos.x / this.tileSize);
  	const yTile = floor(mPos.y / this.tileSize);
    return {x: xTile, y: yTile};
  }
  TileGrid.prototype.tileUnderMouse = function() {
    const posInGrid = this.gridPosUnderMouse();
  	const tile = this.get(posInGrid.x, posInGrid.y);
    return tile;
  };
  TileGrid.prototype.isMouseInside = function(margin) {
    const marg = (margin === undefined) ? 0 : margin*this.tileSize;
  	return mouseX >= this.x - marg &&
           mouseX < this.x + this.gridSize*this.tileSize + marg &&
  				 mouseY >= this.y -marg &&
           mouseY < this.y + this.gridSize*this.tileSize + marg;
  }

  TileGrid.prototype.neighbourhood = function(x,y,steps, circular) {
    const res = [];
    for (let i = x - steps; i <= x + steps; i++) {
      for (let j = y - steps; j <= y + steps; j++) {
        const countAsNeighbour = this.containsPos(i,j) &&
                                (circular ?
                                  this.isOnRadius(i,j,x,y,steps):
                                  true);
        if (countAsNeighbour) {
          const neighbourTile = this.get(i,j);
          res.push(neighbourTile);
        }
      }
    }
    return res;
  }
  TileGrid.prototype.neighbourhoodMouse = function(stepsAway, circular) {
    const steps = !stepsAway ? 1 : stepsAway;
    const circ = (circular === undefined) ? true : circular;
    const pos = this.positionUnderMouse();
    return this.neighbourhood(pos.x, pos.y, steps, circ);
  }

  TileGrid.prototype.containsPos = function(x,y) {
    return x >= 0 && x < this.gridSize &&
            y >= 0 && y < this.gridSize;
  }
  TileGrid.prototype.isOnRadius = function(i,j,x,y,steps) {
    const c1x = (i + 1/2)*this.tileSize;
    const c1y = (j + 1/2)*this.tileSize;
    const c2x = (x + 1/2)*this.tileSize;
    const c2y = (y + 1/2)*this.tileSize;
    const d = dist(c1x, c1y, c2x, c2y);
    return d <= steps*this.tileSize;
  }
  TileGrid.prototype.isOnEdge = function(tile) {
    return tile.xInGrid === 0 || tile.xInGrid === this.gridSize - 1 ||
          tile.yInGrid === 0 || tile.yInGrid === this.gridSize - 1;
  }

  TileGrid.prototype.drawFrameSelf = function(col, weight) {
    if (this.gridValues.length === 0) {return;}
    stroke(col);
    strokeWeight(weight); 
    noFill();
    rect(this.x, 
        this.y, 
        this.length, 
        this.length);        
  }

  TileGrid.prototype.changePos = function(x,y) {
    const diffX = x - this.x;
    const diffY = y - this.y;
    this.x = x;
    this.y = y;
    this.gridValues.forEach(tile => {
      tile.x = tile.x + diffX;
      tile.y = tile.y + diffY;
    });
  }

  // expose in window
  context.TileGrid = TileGrid;  
})(window);