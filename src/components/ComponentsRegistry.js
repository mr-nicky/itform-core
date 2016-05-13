/**
 * Created by infirex on 13.04.16.
 */
function ComponentsRegistry() {
}

ComponentsRegistry.prototype.register = function(components) {
  var registry = this;
  Object.keys(components).forEach(function(name) {
    if (registry[name]) {
      throw new Error('component ' + name + ' already exists');
    }
    registry[name] = components[name];
  });
};

module.exports = ComponentsRegistry;
