exports.itCarOnWarranty = function(c) {
  c.appendToStep();

  c.sync('change', function(value) {
    c.set('calc.is_under_warranty', value);
  });
};