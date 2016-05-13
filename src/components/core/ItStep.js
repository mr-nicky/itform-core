exports.itStep = function(c, $el, control) {
  if (!control.parsingStepIndex) control.parsingStepIndex = 0;
  var name;
  if (c.camelAttr.value) {
    name = c.camelAttr.value;
  } else {
    name = String(control.parsingStepIndex);
  }
  c.turnToStep().setName(name).assign();

  control.traverseChildren(c.elNode, c.elNode.$el);
  control.parsingStepIndex++;
};
