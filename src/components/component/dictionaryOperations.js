var dictionaryRegister = {};

function Dictionary(url, xhrFactory) {
  var self = this;

  self.xhrFactory = xhrFactory;
  self.url = url;
  self.listeners = [];
  self.data = null;

  self.subscribe = function(listener) {
    self.listeners.push(listener);
    if (self.data) {
      setTimeout(function() {
        listener(self.data);
      });
    }
  };

  self.notifyAll = function() {
    self.listeners.forEach(function(listener) {
      listener(self.data);
    });
  };
}

Dictionary.prototype.request = function() {
  var self = this;
  self.xmlHttp = self.xhrFactory.create();
  self.xmlHttp.addEventListener('readystatechange', onReadyStateChange);
  self.xmlHttp.open('GET', self.url);
  self.xmlHttp.send();

  function onReadyStateChange() {
    if (self.xmlHttp.readyState === 4) {
      if (self.xmlHttp.status === 200) {
        self.data = JSON.parse(self.xmlHttp.response);
        self.notifyAll();
      } else {
        throw new Error(self.url + ' library was not loaded, ' + self.xmlHttp.status);
      }
    }
  }
};

function loadDictionary(c, url) {
  if (dictionaryRegister[url]) {
    return dictionaryRegister[url];
  }
  var dict = dictionaryRegister[url] = new Dictionary(url, c.getXhrFactory());
  dict.request();
  return dict;
}

loadDictionary.addToRegistry = function(url, data) {
  var dict = dictionaryRegister[url] = new Dictionary(url);
  dict.data = data;
};

exports.loadDictionary = loadDictionary;
