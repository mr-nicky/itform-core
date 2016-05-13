exports.itShow = function(c, $el) {
  c.appendToStep();

  c.listen(c.camelAttr.value, function(prop) {
    $el.text(prop);
  });
};

exports.itShowFormat = function(c, $el) {
  c.appendToStep();

  c.listen(c.camelAttr.value, function(prop) {
    $el.text(c.formatNumber(Number(prop)));
  });
};

exports.itShowSum = function(c, $el) {
  c.appendToStep();

  c.listen(c.camelAttr.value, function(sum) {
    $el.text(c.formatNumber(Math.floor(Number(sum))));
  });
};

exports.itShowCredit = function(c, $el) {
  c.resolve(function() {
    c.listen('show.credit_bank', function(bank) {
      if (bank) {
        $el.text('Кредит ' + bank + ', рассрочка ' + c.get('show.contributory_scheme'));
      } else {
        $el.text('Без кредита');
      }
    });
  });
};

exports.itShowWarranty = function(c, $el) {
  c.resolve(function() {
    c.listen('calc.is_under_warranty', function(warranty) {
      if (warranty) {
        $el.text('ТС с гарантией');
      } else {
        $el.text('ТС без гарантии');
      }
    });
  });
};
