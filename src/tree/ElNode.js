/**
 * Created by infirex on 13.04.16.
 */
var getCamelizedAttributes = require('../utility/html-helpers').getCamelizedAttributes;

function ElNode(elParent, $element) {
  var self = this;
  self.elParent = elParent;
  self.$el = $element;
  self.assigned = null;
  self.camelAttributes = getCamelizedAttributes($element.get(0));
}

module.exports = ElNode;
