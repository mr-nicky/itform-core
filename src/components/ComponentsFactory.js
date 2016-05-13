/**
 * Created by infirex on 13.04.16.
 */
var _ = require('lodash/core');
var BaseComponent = require('./component/BaseComponent');

function ComponentsFactory(registry) {
  var builder = this;
  builder.registry = registry;
}

ComponentsFactory.prototype.create = function(control, elNode) {
  var factory = this;
  var isComponent = false;

  _.forEach(elNode.camelAttributes, function(camelAttr) {
    var initializer = factory.registry[camelAttr.name];
    if (initializer) {
      var c = new BaseComponent(control.model, elNode, camelAttr);
      initializer(c, elNode.$el, control);
      isComponent = true;
    }
  });

  return isComponent;
};

module.exports = ComponentsFactory;
