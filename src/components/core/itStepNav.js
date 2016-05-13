var _ = require('lodash');
var $ = require('jquery');
var Set = require('es6-set');

var ACTIVE_CLASS = 'it-step--active';

exports.itStepNav = function(c, $el) {
  var form;
  var currentName;
  var $forSteps = $el.find('[it-for-step]');
  var nameSet = new Set();

  function syncWeight() {
    var height = $forSteps.parent().height();
    $forSteps.each(function() {
      var $el = $(this);
      $el.height(height);
    });
  }

  var ieHeightFix = /Trident\/|MSIE /.test(window.navigator.userAgent);

  if (ieHeightFix) {
    $(syncWeight);
    $(window).resize(_.debounce(syncWeight, 400));
  }

  _.forEach($forSteps, function(el) {
    var $el = $(el);
    var $button = $el.find('button');
    var $a = $el.find('a');
    var name = $el.attr('it-for-step');

    nameSet.add(name);
    $button.prop('disabled', true);

    function moveTo(e) {
      e.preventDefault();

      if (name !== currentName) {
        c.getForm().moveToName(name);
      }
    }

    $button.click(moveTo);
    $a.click(function(e) {
      e.preventDefault();
      //implement it
    });
  });

  function resetSteps() {
    for (var i = 0; i < $forSteps.length; i++) {
      var $forStep = $($forSteps[i]);
      $forStep.removeClass(ACTIVE_CLASS);
    }
  }

  c.beforeStep(function(step) {
    currentName = step.name;
    if (!nameSet.has(step.name)) {
      return;
    }
    resetSteps();
    //ignoring
    var $active = $el.find('[it-for-step=\'' + step.name + '\']');
    $active.addClass(ACTIVE_CLASS);
    var $button = $active.find('button');
    $button.prop('disabled', false);
  });

  resetSteps();
};
