var _ = require('lodash');

var findChildren = require('../../utility/findChildren');
var ElNode = require('../../tree/ElNode');
var BaseComponent = require('./BaseComponent');
var ValidatorEngine = require('../ValidatorEngine');

exports.childComponents = function(c, $el, descriptor) {
  if (arguments.length === 2) {
    descriptor = $el;
    $el = c.elNode.$el;
  }
  var children = findChildren($el, descriptor);
  var childComponents = {};
  _.forEach(children, function(child, key) {
    if (!child) {
      console.warn('children %s does not exist', key);
      return;
    }
    var elNode = new ElNode(c.elNode, child.$el);
    var component = new BaseComponent(c.model, elNode, child.camelAttribute);
    var factory = descriptor[key];
    if (typeof factory === 'function') {
      factory(component, child.$el);
    }
    childComponents[key] = component;
  });
  return childComponents;
};

exports.setName = function(c, name) {
  c.name = name;
  return c;
};

exports.turnToStep = function(c) {
  c.flag.step = true;
  c.components = [];
  c.dependencies = [];
  c.cleanUps = [];
  c.validation = new ValidatorEngine();
  c.model.steps.push(c);
  return c;
};

exports.getXhrFactory = function(c) {
  return c.model.form.xhrFactory
};

