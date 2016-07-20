/**
 * Created by infirex on 06.04.16.
 */
var _ = require('lodash');

function LinearSteps(form) {
  var self = form._sequentialSteps = {};
  self.currentStepIndex = -1;
  self.afterStepCbs = [];
  self.beforeStepCbs = [];

  form.afterStep = function(cb) {
    self.afterStepCbs.push(cb);
  };

  form.beforeStep = function(cb) {
    self.beforeStepCbs.push(cb);
  };

  form.getCurrentStep = function() {
    return form.model.steps[self.currentStepIndex];
  };

  form.moveForward = function() {
    self.moveToStep(self.currentStepIndex, self.currentStepIndex + 1);
  };

  form.moveBackward = function() {
    self.moveToStep(self.currentStepIndex, self.currentStepIndex - 1);
  };

  form.moveToName = function(name) {
    var nextStepIndex = _.findIndex(form.model.steps, ['name', name]);
    if (nextStepIndex < 0) {
      throw new Error('step ' + name + ' was not found');
    }

    self.moveToStep(self.currentStepIndex, nextStepIndex);
  };

  self.callAfterStepCbs = function(step) {
    console.debug('calling beforeSteps', step.name);
    _.forEach(self.afterStepCbs, function(cb) {
      cb(step);
    });
  };

  self.callBeforeStepCbs = function(step) {
    console.debug('calling beforeSteps', step.name);
    _.forEach(self.beforeStepCbs, function(cb) {
      cb(step);
    });
  };

  self.moveToStep = function(fromIndex, nextIndex) {
    var fromStep = form.model.steps[fromIndex];
    var nextStep = form.model.steps[nextIndex];
    if (!nextStep) {
      throw new Error('There is no step with index', nextIndex);
    }
    if (fromStep) {
      self.callAfterStepCbs(fromStep);
      // todo move animation logic somewhere else
      fromStep.elNode.$el.hide();
    } else {
      console.info('after step skipped');
    }

    nextStep.elNode.$el.show();
    self.currentStepIndex = nextIndex;

    self.callBeforeStepCbs(nextStep);
    console.info('step', nextStep.name);
  };

  //hide all steps by default
  form.afterInit(function() {
    _.forEach(form.model.steps, function(step) {
      step.elNode.$el.hide();
    });
  });
}

module.exports = LinearSteps;
