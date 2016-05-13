var $ = require('jquery');
var _ = require('lodash');

exports.itPreloadInsuranceLogos = function(c, $el) {
  $(function() {
    var dict = c.loadDictionary('/rest/full/main_insurance_company/all/');
    dict.subscribe(function(data) {
      _.forEach(data, function(entry) {
        if (entry.logo) {
          var $img = $('<img>');
          $img.attr('src', (c.getHost() + 'media/' + entry.logo));
          $el.append($img);
        }
      });
    });
  });
};