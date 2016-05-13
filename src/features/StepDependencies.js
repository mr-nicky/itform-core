var _ = require('lodash/core');
var Set = require('es6-set');

function ResolveSteps(form) {
  var self = form._stepDependencies = {};

  self.resolveDependencies = function() {
    var currentStep = form.getCurrentStep();
    self.asyncTrack = new Set();
    console.debug('resolving step dependencies');
    _.forEach(currentStep.dependencies, function(depCb) {
      function localDone() {
        self.asyncTrack.delete(localDone);
        if (self.size === 0) {
          setTimeout(self.stepResolved.bind(self, currentStep));
        }
      }

      if (depCb.length === 2) {
        depCb(form, localDone);
        self.asyncTrack.add(localDone);
      } else {
        depCb(form);
      }
    });
  };

  form.beforeStep(function() {
    self.resolveDependencies();
  });

  self.stepResolved = function(step) {
    console.debug('async dependencies for ', step.name, ' was resolved');
  }
}

module.exports = ResolveSteps;
