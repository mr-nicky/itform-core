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
      return $el.val().length > 4 || $el.prop('disabled');
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

  $el.on('force:enable', function() {
    $el.prop('disabled', false);
    c.set('order.address', $el.val());
    notify();
  });

  $el.on('force:disable', function() {
    $el.prop('disabled', true);
    c.set('order.address', '');
    notify();
  });
};

exports.itOrderDate = function(c, $el) {
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return $el.val().length > 4 || $el.prop('disabled');
    },
    success: function() {
      $el.removeClass('it-input-invalid');
    },
    failure: function() {
      $el.addClass('it-input-invalid');
    }
  });
  notify();

  function updateDate() {
    notify();
    c.set('order.address', $el.val());
  }

  $el.datepicker({
    onSelect: updateDate
  });
  $el.change(updateDate);


  $el.on('force:enable', function() {
    $el.prop('disabled', false);
    updateDate();
  });

  $el.on('force:disable', function() {
    $el.prop('disabled', true);
  });
};

exports.itOrderTime = function(c, $el) {
  var re = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return re.test($el.val()) || $el.prop('disabled');
    },
    success: function() {
      $el.removeClass('it-input-invalid');
    },
    failure: function() {
      $el.addClass('it-input-invalid');
    }
  });
  notify();

  function updateDate() {
    notify();
    c.set('order.address', $el.val());
  }

  $el.mask('99:99');
  $el.keypress(updateDate);
  $el.on('force:enable', function() {
    $el.prop('disabled', false);
    updateDate();
  });

  $el.on('force:disable', function() {
    $el.prop('disabled', true);
    notify();
  });
};

function sendMailData(c, type) {
  var data = c.extractOrderEmail(type);

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
      if ($el.val() === 'address') {
        $('#to_office').find('input').trigger('force:disable');
        $('#to_address').find('input').trigger('force:enable');
      } else {
        $('#to_office').find('input').trigger('force:enable');
        $('#to_address').find('input').trigger('force:disable');
      }
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