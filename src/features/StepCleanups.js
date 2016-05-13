var _ = require('lodash/core');

function StepCleanups(form) {
  var self = form._cleanUp = {};

  self.performCleanUp = function(step) {
    _.forEach(step.cleanUps, function(cleanUp) {
      cleanUp();
    });
    console.debug('step', step.name, 'was cleaned up');
  };

  form.afterStep(self.performCleanUp);
}

module.exports = StepCleanups;
