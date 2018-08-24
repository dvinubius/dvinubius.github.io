;(function Grid(context) {
  const Grid = function(gridSize, xPos, yPos) {
    this.gridSize = gridSize;
    this.x = xPos;
    this.y = yPos;
    this.gridValues = [];
  }

  Grid.createFromArray = function(size, values) {
    const grid = new Grid(size);
    grid.setValuesFromArray(values);
    return grid;
  }

  Grid.createFromMatrix = function(matrix) {
    const grid = new Grid(matrix.length);
    grid.setValuesFromMatrix(matrix);
    return grid;
  }

  Grid.prototype.setValuesFromArray = function(values) {
    if (values) {
      values.forEach(v => this.gridValues.push(v));
    }
  }
  Grid.prototype.setValuesFromMatrix = function(matrix) {
    if (matrix) {
      let linearized = [];
      matrix.forEach(row => linearized = linearized.concat(row));
      this.setValuesFromArray(linearized);
    }
  }
  Grid.prototype.get = function(x,y) {
    if (0 <= x && x < this.gridSize && 0 <= y && y < this.gridSize) {
      return val = this.gridValues[y * this.gridSize + x];
    } else {
      return null;
    }
  }
  Grid.prototype.set = function(x,y,val) {
    if (0 <= x && x < this.gridSize &&
        0 <= y && y < this.gridSize) {
      this.gridValues[y * this.gridSize + x] = val;
      return true;
    } else {
      return false;
    }
  }
  Grid.prototype.applyEach = function( action /* (valInGrid, x, y) => {} */ ) {
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        action(this.get(x,y), x, y);
      }
    }
  }
  Grid.prototype.setEach = function( action /* (x,y) => valInGrid */ ) {
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const newVal = action(x, y);
        this.set(x,y, newVal);
      }
    }
  }

  Grid.prototype.mousePosForGrid = function() {
  	return {
  		x: mouseX - this.x,
  		y: mouseY - this.y
  	}
  }

  // expose in window
  context.Grid = Grid;
})(window);
