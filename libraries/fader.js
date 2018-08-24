;(function Fader(context) {
  const Fader = function(col, maxFadeFactor, decayRate, maxAlphaVal) {
    this.col = col;
    this.maxOpaque = 1 - maxFadeFactor;
    this.maxAlphaVal = maxAlphaVal ? maxAlphaVal : 100;
    this.decayRate = decayRate ? decayRate : 1;
    this.reset();
  }
  Fader.prototype.reset = function() {
    this.fadeFactor = 0;
  }
  Fader.prototype.setMaxAlpha = function(val) {
    this.maxAlphaVal = val;
  }
  Fader.prototype.color = function() {
    if (this.fadeFactor < this.maxOpaque) {
      this.fadeFactor += 0.0001 * this.decayRate;
    }
    const colWithAlpha = this.col.concat([this.fadeFactor * this.maxAlphaVal]);
    return colWithAlpha;
  }

  // expose in window
  context.Fader = Fader;
})(window);
