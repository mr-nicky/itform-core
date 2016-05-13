var jquery = require('jquery');
require('jquery-ui');

function valid($el) {
  $el.removeClass('input-danger');
  return true;
}

function invalid($el) {
  $el.addClass('input-danger');
  return false;
}

exports.itOrderPhone = function(c) {
  var phone = jquery(c.elNode.element);
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return phone.val().length === 16;
    },
    success: function() {
      valid(phone);
    },
    failure: function() {
      invalid(phone);
    }
  });
  notify();
  phone.mask('+7(999)999-99-99', {
    placeholder: '+7 (___) ___-__-__',
    onComplete: function() {
      c.set('order.phone', phone.val());
      notify();
    },
    onKeyPress: function() {
      c.set('order.phone', phone.val());
      notify();
    }
  });
};

exports.itOrderName = function(c) {
  var name = jquery(c.elNode.element);
  var nameRegex = /^[a-zA-Zа-яА-ЯёЁ'][a-zA-Z-а-яА-ЯёЁ' ]+[a-zA-Zа-яА-ЯёЁ']?$/;

  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return nameRegex.test(name.val());
    },
    success: function() {
      name.removeClass('input-danger');
    },
    failure: function() {
      name.addClass('input-danger');
    }
  });

  c.sync('keypress', function(val) {
    notify();
    c.set('order.name', val);
  });
};

function gatherEmailFields(c) {
  var data = {};
  var order = c.get('order');
  var calc = c.get('calculation');
  if (order) {
    data.name = order.name;
    data.phone = order.phone;
    data.delivery = order.delivery;
    if (data.delivery === 'address') {
      data.address = order.address;
    } else if (data.delivery === 'office') {
      data.office = order.office;
    } else {
      data.address = order.address;
      console.error('delivery %s was not defined, address is used', data.delivery);
    }
  }
  if (calc.is_multidrive) {
    data.is_multidrive = true;
    data.drivers_minimal_experience = calc.drivers_minimal_experience;
    data.drivers_minimal_age = calc.drivers_minimal_age;
  } else {
    data.drivers = '';
    for (var i = 0; i < calc.driver_set.length; i++) {
      data.drivers += ' ' + calc.driver_set[i].age + '/' + calc.driver_set[i].expirience + ' ' +
        (calc.driver_set[i].gender === 'M' ? 'м' : 'ж') + ', '; // api typo don't touch
    }
  }
  data.contributory_scheme = c.get('show.contributory_scheme');
  data.credit_bank = c.get('show.credit_bank') ? c.get('show.credit_bank') : 'нет';
  data.car_manufacturing_year = calc.car_manufacturing_year;
  data.car_cost = c.get('calc.car_cost');
  data.car_mark = c.get('show.car_mark');
  data.car_model = c.get('show.car_model');
  data.calculationId = c.get('calculation.id');
  data.resultId = c.get('internal.resultId') ? c.get('internal.resultId') : c.get('program.id');
  return data;
}

exports.itOrderForm = function(c, control) {
  control.traverseChildren(c.elNode, c.elNode.element);
  var validation = c.getValidatorEngine();

  jquery(c.elNode.element).submit(function(e) {
    e.preventDefault();
    var isvalid = validation.runCheck(true);
    if (isvalid) {
      jquery(c.elNode.element).find('input,button').prop('disabled', true);
      jquery(c.elNode.element).append('<h3>Благодарим за обращение, в ближайшее время с вами свяжется персональный менеджер</h3>');
      var data = gatherEmailFields(c);
      jquery.ajax({
        url: 'http://homepolis.ru/it-form/mail.php',
        dataType: 'json',
        data: JSON.stringify(data),
        method: 'POST'
      });
    } else {
      console.debug('form invalid');
    }
  });
};

exports.itOrderSubmit = function(c) {
  var $el = jquery(c.elNode.element);
  var validation = c.getValidatorEngine();
  validation.success(function() {
    $el.removeClass('btn-danger');
    $el.prop('disabled', false);
  });
  validation.failure(function() {
    $el.addClass('btn-danger');
    $el.prop('disabled', true);
  });

  $el.click(function(e) {
    e.preventDefault();
    var isvalid = validation.runCheck(true);
    if (isvalid) {
      $el.parents('form').trigger('submit');
    }
  });
};

exports.itDeliverToOffice = function(c) {
  c.sync('change', function(checked) {
    jquery('#to_address').find('input[type=text]').prop('disabled', checked);
    jquery('#to_office').find('input[type=text]').prop('disabled', !checked);
    c.set('order.delivery', 'office');
    var validation = c.getValidatorEngine();
    validation.runCheck(true);
  });
};

exports.itOrderOfficeTime = function(c) {
  var $el = jquery(c.elNode.element);
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return $el.val().length === 5 || $el.prop('disabled');
    },
    success: function() {
      valid($el);
    },
    failure: function() {
      invalid($el);
    }
  });
  notify();
  $el.mask('99:99', {
    placeholder: '__:__',
    onKeyPress: function() {
      notify();
      c.set('order.office.time', $el.val());
    },
    onComplete: function() {
      notify();
      c.set('order.office.time', $el.val());
    }
  });
};

exports.itOrderOfficeDate = function(c) {
  var $el = jquery(c.elNode.element);
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return $el.val().length === 10 || $el.prop('disabled');
    },
    success: function() {
      valid($el);
    },
    failure: function() {
      invalid($el);
    }
  });
  notify();
  $el.datepicker({
    onSelect: function() {
      notify();
      c.set('order.office.date', $el.val());
    }
  });
};

exports.itOrderAddressAddress = function(c) {
  var $el = jquery(c.elNode.element);
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return $el.val().length > 2 || $el.prop('disabled');
    },
    success: function() {
      valid($el);
    },
    failure: function() {
      invalid($el);
    }
  });
  notify();
  $el.keypress(function() {
    notify();
    c.set('order.address.address', $el.val());
  });
};

exports.itOrderAddressTime = function(c) {
  var $el = jquery(c.elNode.element);
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return $el.val().length === 5 || $el.prop('disabled');
    },
    success: function() {
      valid($el);
    },
    failure: function() {
      invalid($el);
    }
  });
  notify();
  $el.mask('99:99', {
    placeholder: '__:__',
    onKeyPress: function() {
      notify();
      c.set('order.address.time', $el.val());
    },
    onComplete: function() {
      notify();
      c.set('order.address.time', $el.val());
    }
  });
};

exports.itOrderAddressDate = function(c) {
  var $el = jquery(c.elNode.element);
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return $el.val().length === 10 || $el.prop('disabled');
    },
    success: function() {
      valid($el);
    },
    failure: function() {
      invalid($el);
    }
  });
  notify();
  $el.datepicker({
    onSelect: function() {
      notify();
      c.set('order.address.date', $el.val());
    }
  });
};

exports.itDeliverToAddress = function(c) {
  c.set('order.delivery', 'address');
  c.sync('change', function(checked) {
    jquery('#to_office').find('input[type=text]').prop('disabled', checked);
    jquery('#to_address').find('input[type=text]').prop('disabled', !checked);
    c.set('order.delivery', 'address');
    var validation = c.getValidatorEngine();
    validation.runCheck(true);
  });
};

// send calculation email

exports.itEmail = function(c) {
  var email = jquery(c.elNode.element);
  var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;

  c.sync('keypress', function(val, first) {
    if (first || regex.test(val)) {
      valid(email);
    } else {
      invalid(email);
    }
    c.set('order.email', val);
  });
};

exports.itOrderSend = function(c) {
  c.event('click', function() {
    var email = jquery('#send_to');
    var data = gatherEmailFields(c);
    data.type = 'calculation';
    jquery.ajax({
      url: 'http://homepolis.ru/it-form/mail.php',
      dataType: 'json',
      data: JSON.stringify(data),
      method: 'POST',
      success: function() {
        email.prop('disabled', true);
      }
    });
  });
};
