/**
 * Created by infirex on 14.04.16.
 */

exports.resolve = function(c, fn) {
  var wrapper;
  if (fn.length === 1) {
    wrapper = function resolveWrapper(form, done) {
      c.form = form;
      fn(done);
    };
  } else {
    wrapper = function resolveWrapper(form) {
      c.form = form;
      fn();
    };
  }
  var step = c.findStep();
  step.dependencies.push(wrapper);
  return c;
};

exports.cleanUpStep = function(c, fn) {
  var step = c.findStep();
  step.cleanUps.push(fn);
  return c;
};

exports.assign = function(c) {
  // assigned property could be instantiated once only
  Object.defineProperty(c.elNode, 'assigned', {
    value: c,
    writable: false,
    enumerable: true,
    configurable: false
  });
  return c;
};

exports.appendToStep = function(c) {
  var step = c.findStep();
  step.components.push(c);
  return c;
};

exports.appendToModel = function(c) {
  c.model.components.push(c);
  return c;
};

exports.findStep = function(c) {
  var elNode = c.elNode;
  do {
    if ((elNode.assigned && elNode.assigned.flag) && (elNode.assigned.flag.step || elNode.assigned.flag.model)) {
      return elNode.assigned;
    }
    elNode = elNode.elParent;
  } while (elNode);
  throw new Error('step is not in the chain');
};

exports.getValidatorEngine = function(c) {
  var step = c.findStep(c);
  return step.validation;
};

exports.afterStep = function(c, cb) {
  c.model.form.afterStep(cb);
};

exports.beforeStep = function(c, cb) {
  c.model.form.beforeStep(cb);
};

exports.getForm = function(c) {
  return c.model.form;
};
