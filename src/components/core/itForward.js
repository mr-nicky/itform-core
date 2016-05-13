exports.itForward = function(c, $el) {
  c.appendToStep();
  var listener;
  var validation = c.getValidatorEngine();
  c.resolve(function() {
    validation.success(function() {
      c.elNode.$el.removeClass('invalid');
    });
    validation.failure(function() {
      c.elNode.$el.addClass('invalid');
    });
    $el.on('click', listener = function() {
      var valid = validation.runCheck(true);
      if (valid) {
        c.form.moveForward();
      }
    });
  });

  c.cleanUpStep(function() {
    $el.off('click');
  });
};
