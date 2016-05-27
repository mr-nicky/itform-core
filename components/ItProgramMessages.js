var $ = require('jquery');

function extractMessages(messages) {
  return function(c, $el) {
    $el.empty();
    messages.forEach(function(message) {
      var $new = $('<div></div>').text(message);
      $el.append($new);
    });
  };
}

exports.itProgramMessages = function(c, $el) {
  c.listen('program', function(program) {
    c.childComponents({
      itErrors: extractMessages(program.messages.errors),
      itWarnings: extractMessages(program.messages.warnings),
      itMessages: extractMessages(program.messages.messages),
      itPrintMsg: extractMessages(program.messages.print_msg)
    });
  });
};
