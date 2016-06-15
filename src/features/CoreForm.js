var _ = require('lodash/core');

function StepCleanups(form) {
  
  var self = form._core = {};
  
  self.afterInitCbs = [];

  
  form.afterInit = function(cb) {
    self.afterInitCbs.push(cb);
  };

  form.callAfterInit = function() {
    _.forEach(self.afterInitCbs, function(cb) {
      cb();
    });
  };

  form.xhrFactory = {
    create: function() {
      return new XMLHttpRequest()
    }
  };
}

module.exports = StepCleanups;
