require('jquery-ui');
require('jquery-mask-plugin');

var $ = require('jquery');

exports.itOrderName = function(c, $el) {
  var nameRegex = /^[a-zA-Zа-яА-ЯёЁ'][a-zA-Z-а-яА-ЯёЁ' ]+[a-zA-Zа-яА-ЯёЁ']?$/;

  var val = c.getValidatorEngine();
  var notify = val.addValidator({
    validate: function() {
      return nameRegex.test($el.val());
    },
    success: function() {
      $el.removeClass('it-input-invalid');

    },
    failure: function() {
      $el.addClass('it-input-invalid');
    }
  });

  c.sync('keypress', function(val) {
    notify();
    c.set('order.name', val);
  });
};

exports.itOrderPhone = function(c, $el) {
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return $el.val().length === 16;
    },
    success: function() {
      $el.removeClass('it-input-invalid');
    },
    failure: function() {
      $el.addClass('it-input-invalid');
    }
  });

  notify();
  $el.mask('+7(999)999-99-99', {
    placeholder: '+7 (___) ___-__-__',
    onComplete: function() {
      c.set('order.phone', $el.val());
      notify();
    },
    onKeyPress: function() {
      c.set('order.phone', $el.val());
      notify();
    }
  });
};

exports.itOrderAddress = function(c, $el) {
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return $el.val().length > 4;
    },
    success: function() {
      $el.removeClass('it-input-invalid');
    },
    failure: function() {
      $el.addClass('it-input-invalid');
    }
  });
  notify();
  $el.keypress(function() {
    notify();
    c.set('order.address', $el.val());
  });
};

function extractMailData(c, type) {
  var data = {
    'car_mark': c.get('show.car_mark'),
    'car_model': c.get('show.car_model'),
    'car_manufacturing_year': c.get('calculation.car_manufacturing_year'),
    'car_cost': c.get('calculation.car_cost'),
    'contributory_scheme': c.get('show.contributory_scheme'),
    'calculationId':c.get('calculation.id'),
    'resultId':c.get('show.extraParameters.resultId'),
    'name': c.get('order.name'),
    'phone': c.get('order.phone'),
    'address': c.get('order.address'),
    'type': type,
    'delivery': c.get('order.delivery')
  };

  data.credit_bank = c.get('show.credit_bank') ? c.get('show.credit_bank') : 'Нет';
  var calc = c.get('calc');

  if (calc.is_multidrive) {
    data.drivers = 'Мультидрайв: ' + calc.drivers_minimal_age + ' мин. возраст, ' + calc.drivers_minimal_experience + ' мин. стаж';
  } else {
    data.drivers = '';
    for (var i = 0; i < calc.driver_set.length; i++) {
      data.drivers += ' ' + calc.driver_set[i].age + '/' + calc.driver_set[i].expirience + ' ' +
        (calc.driver_set[i].gender === 'M' ? 'м' : 'ж') + ', '; // api typo don't touch
    }
  }

  return data;
}

function sendMailData(c, type) {
  var data = extractMailData(c, type);

  $.ajax({
    url: c.getForm().HTTP_MAIL_URL,
    dataType: 'json',
    data: JSON.stringify(data),
    method: 'POST'
  });
}

exports.itOrderForm = function(c, $el, control) {
  control.traverseChildren(c.elNode, c.elNode.$el);
  var validation = c.getValidatorEngine();

  $el.on('submit', function(e) {
    e.preventDefault();
    var isValid = validation.runCheck(true);
    if (isValid) {
      sendMailData(c, 'report');
      $el.find('input,button').prop('disabled', true);
      $el.append('<h3>Благодарим за обращение, в ближайшее время с вами свяжется персональный менеджер</h3>');
    } else {
      console.debug('form invalid');
    }
  });
};

exports.itOrderDelivery = function(c, $el) {
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return Boolean(c.get('order.delivery')) && c.get('order.delivery').length > 0;
    },
    success: function() {
      $el.removeClass('it-input-invalid');
    },
    failure: function() {
      $el.addClass('it-input-invalid');
    }
  });
  notify();
  c.sync('change', function(checked) {
    notify();
    if (checked) {
      c.set('order.delivery', $el.val());
    }
  });
};

exports.itOrderConfirm = function(c, $el) {
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return $el.prop('checked');
    },
    success: function() {
      $el.removeClass('it-input-invalid');
    },
    failure: function() {
      $el.addClass('it-input-invalid');
    }
  });
  notify();
  c.sync('change', function(checked) {
    notify();
  });
};

exports.itOrderSubmit = function(c, $el) {

  var validation = c.getValidatorEngine();
  validation.success(function() {
    $el.prop('disabled', false);
  });

  validation.failure(function() {
    $el.prop('disabled', true);
  });

  $el.click(function(e) {
    var isvalid = validation.runCheck(true);
    if (!isvalid) {
      e.preventDefault();
    }
  });
};