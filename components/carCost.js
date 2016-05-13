var $ = require('jquery');
require('jquery-ui');
var median = require('median');

function findMinMax(model) {
  var r = {
    current: 0,
    min: 0,
    max: 0,
    show: true
  };
  if (model.prices.length === 1) {
    r.current = model.prices[0];
    r.show = false;
  } else if (model.prices.length === 2) {
    r.min = model.prices[0];
    r.max = model.prices[1];
    r.current = (r.min + r.max) / 2;
  } else if (model.prices.length > 2) {
    r.min = model.prices[0];
    r.max = model.prices[model.prices.length - 1];
    r.current = median(model.prices);
  } else {
    r.show = false;
  }
  r.min -= r.min % 1000;
  r.max -= r.max % 1000;
  r.current -= r.current % 1000;
  return r;
}


exports.itCarCost = function(c, $el) {
  c.appendToStep();

  var sliderPresent = false;

  var $input = $el.find('input');
  var $slider = $el.find('.slider');
  var $sliderWrapper = $el.find('.slider_wrapper');
  var $range = $el.find('.range');
  var $min = $el.find('.min');
  var $max = $el.find('.max');

  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return Number($input.val().replace(/\s+/g, '')) > 0;
    },
    success: function() {
      $input.removeClass('it-input-invalid');
    },
    failure: function() {
      $input.addClass('it-input-invalid');
    }
  });

  $input.on('change', function() {
    if ($slider) {
      $slider.slider('value', $input.val());
    }
    c.set('calc.car_cost', $input.val());
    notify();
  });

  c.listen('calc.car_model', function() {
    var dict = c.loadDictionary('/rest/default/car_mark/' + c.get('calc.car_mark') + '/car_model/' +
      c.get('calc.car_model') + '/?fields=prices&year=' + c.get('calc.car_manufacturing_year'));

    dict.subscribe(function(data) {
      var mm = findMinMax(data);
      c.set('calc.car_cost', mm.current);
      $input.val(mm.current);
      sliderPresent = mm.show;
      if (sliderPresent) {
        $sliderWrapper.show();

        $min.text(c.formatNumber(mm.min));
        $max.text(c.formatNumber(mm.max));
        $input.val(c.formatNumber(mm.current));

        $slider.slider({
          value: mm.current,
          min: mm.min,
          max: mm.max,
          step: 1000,
          slide: function(event, ui) {
            $input.val(c.formatNumber(ui.value));
            c.set('calc.car_cost', ui.value.toString());
          }
        });
        $slider.removeAttr('tabindex');
      } else {
        $sliderWrapper.hide();
      }
    });
  });

  c.cleanUpStep(function() {
    if (sliderPresent) {
      $slider.slider('destroy');
    }
  });
};