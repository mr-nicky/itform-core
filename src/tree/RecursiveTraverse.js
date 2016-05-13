/**
 * Created by infirex on 13.04.16.
 */

function RecursiveTraverse() {
  var self = this;
  self.container = [];
}

RecursiveTraverse.prototype.next = function() {
  return this.container.shift();
};

RecursiveTraverse.prototype.add = function(elements) {
  Array.prototype.unshift.apply(this.container, elements);
};

RecursiveTraverse.prototype.hasNext = function() {
  return this.container.length > 0;
};

module.exports = RecursiveTraverse;