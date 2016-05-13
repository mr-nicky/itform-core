/**
 * Created by new_user on 01.04.16.
 */
var $ = require('jquery');
var _ = require('lodash');

var RecursiveTraverse = require('./RecursiveTraverse');
var Model = require('./Model');
var ElNode = require('./ElNode');

// factoring candidates for elements
function createElNodes(elNodeParent, $elements) {
  return _.map($elements, function(element) {
    return new ElNode(elNodeParent, $(element));
  });
}

function initModel($elements, form) {
  var control = {
    model: new Model(form),
    traverse: new RecursiveTraverse(),
    factory: form.factory,

    traverseChildren: function(elNodeParent, $el) {
      var children = $el.children();
      var childCandidates = createElNodes(elNodeParent, children);

      control.traverse.add(childCandidates);
    }
  };

  var initialElNodes = createElNodes(undefined, $elements);
  control.traverse.add(initialElNodes);

  while (control.traverse.hasNext()) {
    var elNode = control.traverse.next();

    var isComponent = control.factory.create(control, elNode);

    if (!isComponent) {
      control.traverseChildren(elNode.elParent, elNode.$el);
    }
  }

  return control.model;
}

module.exports = initModel;
