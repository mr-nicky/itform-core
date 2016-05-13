/**
 * Created by new_user on 01.04.16.
 */
var _ = require('lodash');
var $ = require('jquery');

var RecursiveTraverse = require('./../tree/RecursiveTraverse');
var getCamelizedAttributes = require('./html-helpers').getCamelizedAttributes;

module.exports = function($element, description, allowDive) {
  var found = {};
  var traverse = new RecursiveTraverse();
  traverse.add($element.children());

  while (traverse.hasNext()) {
    var $examined = $(traverse.next());
    var described = false;
    var cAttrs = getCamelizedAttributes($examined.get(0));

    _.forEach(cAttrs, function(cAttr) {
      if (description.hasOwnProperty(cAttr.name)) {
        if (found[cAttr.name]) throw new Error('found multiple child attributes ' + cAttr.name);
        found[cAttr.name] = {
          value: cAttr.value,
          camelAttribute: cAttr,
          $el: $examined
        };
        described = true;
      }
    });

    if (allowDive || !described) {
      traverse.add($examined.children());
    }
  }

  return found;
};