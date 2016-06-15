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

  //should be in some kind of extension
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
    
    $a.addClass('c-link-disabled');

    $a.on('click.Itf', function(event) {
      event.stopImmediatePropagation();

      return false;
    });
    
    function moveTo(e) {
      e.preventDefault();

      if (name !== currentName) {
        c.getForm().moveToName(name);
      }
    }
    $button.click(moveTo);
    $a.on('click', moveTo);

  });

  function resetSteps() {
    for (var i = 0; i < $forSteps.length; i++) {
      var $forStep = $($forSteps[i]);
      $forStep.removeClass(ACTIVE_CLASS);
    }
  }

  c.listen('internal.calcChanged', function(changed) {
    if(!changed) return;
    
    var changeNow = false;
    for (var i = 0; i < $forSteps.length; i++) {
      var $forStep = $($forSteps[i]);
      if (changeNow || $forStep.attr('it-for-step') === 'program_selection') {
        changeNow = true;
      } else {
        continue;
      }
      $forStep.find('button').prop('disabled', true);
    }
  });

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
    var $a = $active.find('a');
    
    $button.prop('disabled', false);

    $a.off('click.Itf');
    $a.removeClass('c-link-disabled');

  });

  resetSteps();
};
