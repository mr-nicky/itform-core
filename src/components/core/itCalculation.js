function listenForChange(c) {
  function changed() {
    return function() {
      c.set('internal.calcChanged', true);
    };
  }

  c.listen('calc.car_model', changed());
  c.listen('calc.car_mark', changed());
  c.listen('calc.car_cost', changed());
  c.listen('calc.driver_set', changed());
  c.listen('calc.drivers_count', changed());
  c.listen('calc.is_multidrive', changed());
  c.listen('calc.is_under_warranty', changed());
  c.listen('calc.drivers_minimal_age', changed());
  c.listen('calc.drivers_minimal_experience', changed());
  c.listen('calc.contributory_scheme', changed());
  c.listen('calc.is_credit', changed());
  c.listen('calc.credit_bank', changed());
  c.listen('calc.car_manufacturing_year', changed());
  for (var i = 0; i <= 5; i++) {
    c.listen('calc.driver_set.' + i + '.age', changed());
    c.listen('calc.driver_set.' + i + '.expirience', changed());
    c.listen('calc.driver_set.' + i + '.gender', changed());
  }
}

exports.itCalculation = function(c) {
  var req;
  c.set('internal.calcChanged', true);
  listenForChange(c);
  c.resolve(function(done) {
    var changed = c.get('internal.calcChanged');
    if (!changed) {
      return;
    }
    c.set('calc.exploitation_area', 30291);  // Saint Petersburg as default area.
    req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState === 4) {
        if (req.status >= 200 && req.status < 300) {
          c.set('calculation', JSON.parse(req.responseText));
          c.set('internal.calcChanged', false);
        }
        done();
      }
    };
    req.open('POST', 'http://homepolis.ru/it-form/proxy.php');
    req.setRequestHeader('X-Itform-Forward', '/rest/full/calculation/?token');
    req.send(JSON.stringify(c.get('calc')));
  });

  c.cleanUpStep(function() {
    console.debug('calculation cleanedUp');
    req.abort();
  });
};
