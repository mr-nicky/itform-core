/**
 * Created by infirex on 14.04.16.
 */
var _ = require('lodash/core');

function BaseComponent(model, elNode, camelAttr) {
  var self = this;
  self.model = model;
  self.elNode = elNode;
  self.camelAttr = camelAttr;
  self.flag = {};

  self.form = null;
  self.syncDetail = null;

  var operations = _.defaults({},
    require('./componentsOperations'),
    require('./dictionaryOperations'),
    require('./dataOperations'),
    require('./elementOperations'),
    require('./structureOperations'),
    require('./formatOperations')
  );

  _.forEach(operations, function(fn, methodName) {
    self[methodName] = fn.bind(null, self);
  });

  self.setName(camelAttr.name);
}

module.exports = BaseComponent;
