var emailRegex = /.+@.+/;
var $ = require('jquery');

exports.itNotificationEmail = function(c, $el) {

  c.resolve(function() {
    c.set('external.notificationEmail', c);
  });

  c.cleanUpStep(function() {
    c.set('external.notificationEmail', null);
  });

  function update(e) {
    if (emailRegex.test($el.val())) {
      c.isValid = true;
      $el.removeClass('it-input-invalid');
    } else {
      $el.addClass('it-input-invalid');
      c.isValid = false;
    }
    c.set('order.email', $el.val());
  }

  $el.on('change', update);
  $el.on('keypress', update);
};

exports.itNotificationSend = function(c, $el) {
  $el.click(function() {
    var ne = c.get('external.notificationEmail');

    if (!ne.isValid) {
      return;
    }

    var data = c.extractOrderEmail('notification');

    $.ajax({
      url: c.getForm().HTTP_MAIL_URL,
      dataType: 'json',
      data: JSON.stringify(data),
      method: 'POST'
    });

    $el.prop('disabled', true);
    ne.elNode.$el.prop('disabled', true);
    ne.elNode.$el.val('Сообщение отправлено');
  });
};