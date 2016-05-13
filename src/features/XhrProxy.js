var _ = require('lodash/core');

function XhrProxy(form, proxyUrl) {
  var self = form._proxy = {};

  form.xhrFactory = {
    create: function() {
      var xhr = new XMLHttpRequest();
      var openFn = xhr.open;
      xhr.open = function(method, url) {
        openFn.call(xhr, method, proxyUrl);
        xhr.setRequestHeader('X-Itform-Forward', url);
        xhr.setRequestHeader('Accept', 'text/plain'); // firefox fix, it returned xml! due to accept header;
      };
      return xhr;
    }
  };
}

module.exports = XhrProxy;
