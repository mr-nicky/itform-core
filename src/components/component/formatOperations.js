var format = require('format-number');
var localFormat = format({integerSeparator: ' '});

exports.formatNumber = function(c, number) {
  return localFormat(number);
};