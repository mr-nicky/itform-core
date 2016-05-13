var ComponentsRegistry = require('./src/components/ComponentsRegistry');
var ComponentsFactory = require('./src/components/ComponentsFactory');

exports.initModel = require('./src/tree/initModel');

exports.defaultFactory = function(registry) {
  return new ComponentsFactory(registry);
};

exports.features = {
  coreForm: require('./src/features/CoreForm'),
  xhrProxy: require('./src/features/XhrProxy'),
  sequentialSteps: require('./src/features/SequentialSteps'),
  stepCleanups: require('./src/features/StepDependencies'),
  stepDependencies: require('./src/features/StepCleanups')
};

exports.baseRegistry = function() {
  var registry = new ComponentsRegistry();
  registry.register(require('./src/components/core/ItStep'));
  registry.register(require('./src/components/core/itCalculation'));
  registry.register(require('./src/components/core/itForward'));
  registry.register(require('./src/components/core/itProgram'));
  registry.register(require('./src/components/core/itStepNav'));
  return registry;
};