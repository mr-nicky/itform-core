/**
 * Created by infirex on 14.04.16.
 */

var setProperty = require('../../utility/helpers').setProperty;
var getProperty = require('../../utility/helpers').getProperty;
var listenProperty = require('../../utility/helpers').listenProperty;
var removeListener = require('../../utility/helpers').removeListener;

exports.set = function(c, property, value) {
  setProperty(c.model.data, property, value);
  return c;
};

exports.get = function(c, property) {
  return getProperty(c.model.data, property);
};

exports.listen = function(c, property, listener, dontCallIfExists) {
  listenProperty(c.model.data, property, listener, dontCallIfExists);
  return c;
};

exports.removeListener = function(c, listener) {
  removeListener(c.model.data, listener);
  return c;
};

exports.getHost = function(c) {
  return c.getForm().HTTP_HOST;
};