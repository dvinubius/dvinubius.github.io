;(function Fader(context) {
  const Fader = function(col, initialFactor, maxAlphaVal) {
    this.col = col;
    this.initialFactor = initialFactor ? initialFactor : 0;
    this._ffMax = 500;
    this.maxAlphaVal = maxAlphaVal ? maxAlphaVal : 100;

    this.reset();
  }
  Fader.prototype.reset = function() {
    this.fadeFactor = this.initialFactor;
  }
  Fader.prototype.setMaxAlpha = function(val) {
    this.maxAlphaVal = val;
  }
  Fader.prototype.color = function() {
    if (this.fadeFactor < this._ffMax) {
      this.fadeFactor++;
    }
    return this.col.concat([this.fadeFactor / this._ffMax * this.maxAlphaVal]);
  }

  // expose in window
  context.Fader = Fader;
})(window);