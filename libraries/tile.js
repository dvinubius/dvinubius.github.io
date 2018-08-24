;(function Tile(context) {
  const Tile = function(size, xPos, yPos, xInGrid, yInGrid) {
    this.size = size;
    this.x = xPos; // posX in canvas
    this.y = yPos; // posY in canvas
    this.xInGrid = xInGrid,
    this.yInGrid = yInGrid
  }

  // only primitive values - simple to clone;
  Tile.prototype.clone = function() {
    const clone = new Tile();
    for (let key in this) {
      clone[key] = this[key];
    }
    return clone;
  }
  Tile.prototype.isEvenCol = function() {
    return this.xInGrid % 2 === 0;
  }
  Tile.prototype.isEvenRow = function() {
    return this.yInGrid % 2 === 0;
  }

  // expose in window
  context.Tile = Tile;
})(window);
