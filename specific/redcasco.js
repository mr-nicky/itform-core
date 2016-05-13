/**
 * Created by infirex on 05.04.16.
 */
var toArray = require('to-array');
var clearElement = require('./../../utility/html-helpers').clearElement;
var defaultComponent = require('../loader').defaultComponent;
var setProperty = require('../../utility/helpers').setProperty;
var listenProperty = require('../../utility/helpers').listenProperty;
var loadDictionary = require('../../loadDictionary');
var fillWithOptions = require('./../../utility/html-helpers').fillWithOptions;
var fillSelectWithItems = require('./../../utility/html-helpers').fillSelectWithItems;

function OnEventSelectFiller(tree, candidate, key, helpKey) {
  var self = this;

  self.start = function() {
    var url = self.urlFn();
    clearElement(candidate.element);
    self.dict = loadDictionary(url);
    self.dict.subscribe(self.dictLoaded);
  };

  self.dictLoaded = function(data) {
    if (typeof self.sortFn === 'function') {
      data.sort(self.sortFn);
    }
    fillSelectWithItems(candidate.element, data);

    self.data = data;
    if (typeof self.afterDictLoaded === 'function') {
      self.afterDictLoaded();
    }
    self.sync();// init default
  };

  self.sync = function() {
    if (!self.data) {
      console.error('trying to access data before it was loaded');
      return;
    }
    var item = self.data[candidate.element.value];
    if (!item) {
      console.error(key, candidate.element.value, 'does not exist');
      return;
    }
    setProperty(tree.data, key, item.id);
    setProperty(tree.data, helpKey, item);
    if (typeof self.afterSync === 'function') {
      self.afterSync(item);
    }
  };

  candidate.element.addEventListener('change', self.sync);
}

exports.itCarMark = function(tree, control, candidate) {
  defaultComponent.apply(null, toArray(arguments));

  if (!tree.data.calc) {
    tree.data.calc = {};
  }

  var filler = new OnEventSelectFiller(tree, candidate, 'calc.car_mark', 'help.car_mark');
  filler.urlFn = function() {
    return '/rest/full/car_mark/';
  };
  filler.sortFn = function(a, b) {
    return b.rank - a.rank;
  };

  var step = findStep(candidate);
  step.dependencies.push(function(form, done) {
    filler.afterDictLoaded = function() {
      done();
    };
    filler.start();
  });

  clearElement(candidate.element);
};

exports.itCarModel = function(tree, control, candidate) {
  defaultComponent.apply(null, toArray(arguments));

  var filler = new OnEventSelectFiller(tree, candidate, 'calc.car_model', 'help.car_model');
  filler.urlFn = function() {
    return '/rest/full/car_mark/' + tree.data.calc.car_mark + '/car_model/';
  };
  filler.afterSync = function(car_model) {
    setProperty(tree.data, 'help.start_manufacturing_year', car_model.start_manufacturing_year);
    setProperty(tree.data, 'help.stop_manufacturing_year', car_model.stop_manufacturing_year);
  };

  listenProperty(tree.data, 'calc.car_mark', function(car_mark) {
    if (!car_mark) return;
    filler.start();
  });

  clearElement(candidate.element);
};

exports.itCarModification = function(tree, control, candidate) {
  defaultComponent.apply(null, toArray(arguments));

  var filler = new OnEventSelectFiller(tree, candidate, 'calc.car_modification', 'help.car_modification');
  filler.urlFn = function() {
    return '/rest/full/car_mark/' + tree.data.calc.car_mark + '/car_model/' + tree.data.calc.car_mode + '/car_modification/';
  };

  listenProperty(tree.data, 'calc.car_model', function(car_model) {
    if (!car_model) return;
    filler.start();
  });

  clearElement(candidate.element);
};

exports.itCarManufacturingYear = function(tree, control, candidate) {
  defaultComponent.apply(null, toArray(arguments));

  listenProperty(tree.data, 'help.stop_manufacturing_year', function(stop_manufacturing_year) {
    if (!stop_manufacturing_year) {
      return;
    }
    clearElement(candidate.element);
    var endYear = Math.min(tree.data.help.stop_manufacturing_year || Number.MAX_VALUE, new Date().getFullYear());
    var startYear = tree.data.help.start_manufacturing_year || 1970;
    fillWithOptions(candidate.element, startYear, endYear);
    sync();
  });
  candidate.element.addEventListener('change', sync);

  function sync() {
    var year = Number(candidate.element.value);
    setProperty(tree.data, 'calc.car_manufacturing_year', year);
  }
};
