exports.itBackward = function(c, $el) {
  c.appendToStep();
  c.resolve(function() {
    $el.on('click', function() {
      c.form.moveBackward();
    });
  });

  c.cleanUpStep(function() {
    $el.off('click');
  });
};
