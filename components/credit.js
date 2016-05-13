exports.itCredit = function(c) {
  c.appendToStep();
  var dict = c.loadDictionary('/rest/full/bank/');
  dict.subscribe(function(data) {
    c.fillSelectWithItems(data);
    c.sync('change', function(value) {
      var id = Number(data[value] && data[value].id);
      if (isFinite(id)) {
        c.set('calc.is_credit', true);
        c.set('calc.credit_bank', id);
        c.set('show.credit_bank', data[value].title);
      } else {
        c.set('calc.is_credit', false);
        c.set('calc.credit_bank', null);
        c.set('show.credit_bank', false);
      }
    });
  });
};

exports.itInstallments = function(c) {
  c.appendToStep();
  var dict = c.loadDictionary('/rest/full/contributory_scheme/');
  dict.subscribe(function(data) {
    c.fillSelectWithItems(data);
    c.sync('change', function(value) {
      var id = Number(data[value] && data[value].id);
      c.set('calc.contributory_scheme', id);
      c.set('show.contributory_scheme', data[value].title);
    });
  });
};