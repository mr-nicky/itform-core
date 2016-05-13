function ValidatorEngine() {
  var self = this;
  self.validators = [];
  self.successors = [];
  self.failures = [];
  self.scheduled = false;
}

ValidatorEngine.prototype.success = function(fn) {
  this.successors.push(fn);
};

ValidatorEngine.prototype.failure = function(fn) {
  this.failures.push(fn);
};

ValidatorEngine.prototype.addValidator = function(validator) {
  var self = this;
  self.validators.push(validator);
  function notify() {
    var valid = validator.validate();
    if (valid) {
      validator.success();
    } else {
      validator.failure();
    }
    self.notify(false);
  }

  return notify;
};

ValidatorEngine.prototype.runCheck = function(notifyPersonal) {
  var self = this;
  console.debug('running validation');
  var overallValid = true;
  self.validators.forEach(function(validator) {
    var valid = validator.validate();
    if (valid) {
      notifyPersonal && validator.success();
    } else {
      notifyPersonal && validator.failure();
    }
    overallValid = overallValid && valid;
  });
  if (overallValid) {
    self.successors.forEach(function(successor) {
      successor();
    });
  } else {
    self.failures.forEach(function(failer) {
      failer();
    });
  }
  self.scheduled = false;
  return overallValid;
};

ValidatorEngine.prototype.notify = function(notifyPersonal) {
  if (!this.scheduled) {
    this.scheduled = true;
    setTimeout(this.runCheck.bind(this, notifyPersonal));
  }
};

module.exports = ValidatorEngine;
