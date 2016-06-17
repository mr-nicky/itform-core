/**
 * Created by new_user on 01.04.16.
 */

// var fillWithOptions = require('./../src/utility/html-helpers').fillWithOptions;

exports.itDriverSelect = function(c) {
  c.appendToStep();

  c.sync('change', function(drivers_count) {
    if (drivers_count === 'multi') {
      c.set('calc.is_multidrive', true);
      c.set('calc.drivers_count', 0);
      c.set('calc.driver_set', []);
    } else {
      drivers_count = Number(drivers_count);

      var driver_set = c.get('calc.driver_set');
      if (driver_set) {
        driver_set = driver_set.slice(0, drivers_count);
      } else {
        driver_set = [];
      }
      c.set('calc.driver_set', driver_set);
      c.set('calc.drivers_count', drivers_count);
      c.set('calc.is_multidrive', false);
    }
  });
};

exports.itDriverMulti = function(c, $el) {
  c.appendToStep();
  var validation = c.getValidatorEngine();
  var components;
  var is_multidrive = false;
  var notify = validation.addValidator({
    validate: function() {
      if (!is_multidrive) {
        return true;
      }
      if (!components) {
        return true;
      }
      var age = parseInt(components.itDriverMinimalAge.elNode.$el.val(), 10);
      var exp = parseInt(components.itDriverMinimalExperience.elNode.$el.val(), 10);
      return checkAgeAndExp(age, exp);
    },
    success: function() {
      if (!components) {
        return true;
      }
      components.itDriverMinimalAge.elNode.$el.removeClass('it-input-invalid');
      components.itDriverMinimalExperience.elNode.$el.removeClass('it-input-invalid')
      ;
    },
    failure: function() {
      if (!components) {
        return true;
      }
      components.itDriverMinimalAge.elNode.$el.addClass('it-input-invalid');
      components.itDriverMinimalExperience.elNode.$el.addClass('it-input-invalid')
    }
  });

  c.listen('calc.is_multidrive', function(_is_multidrive) {
    is_multidrive = _is_multidrive;
    if (is_multidrive) {
      $el.show();
    } else {
      $el.hide();
    }
  });

  components = c.childComponents({
    itDriverMinimalAge: function(age) {

      age.sync('change', function(value) {
        notify();
        age.set('calc.drivers_minimal_age', Number(value));
      });
    },
    itDriverMinimalExperience: function(exp) {

      exp.sync('change', function(value) {
        notify();
        exp.set('calc.drivers_minimal_experience', value);
      });
    }
  });
};

function checkAgeAndExp(age, experience) {
  var valid = {
    age: true,
    exp: true
  };

  if (age >= 18 && experience != 0 && !experience) {
    valid.exp = false;

    return valid;
  }

  if (isNaN(age)) {
    valid.age = false;
  }

  if (isNaN(experience)) {
    valid.exp = false;
  }

  if (age - experience < 18) {
    valid.exp = false;
  }

  if (age > 90 || age < 18) {
    valid.age = false;
  }

  if (experience > 72) {
    valid.exp = false;
  }

  return valid;
}

function setValidityEl(el, isValid) {
  el[isValid ? 'removeClass' : 'addClass']('it-input-invalid');
}

exports.itDriverCount = function(c, $el) {
  c.makeTemplate().appendToStep();
  var currentComponents = [];
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator(
    {
      validate: function() {
        if (currentComponents.length === 0) {
          return true; // invisible
        }
        var overAllValid = true;
        for (var i = 0; i < currentComponents.length; i++) {
          var valid = true;
          var cmp = currentComponents[i];
          var age = parseInt(cmp.itDriverAge.elNode.$el.val(), 10);
          var experience = parseInt(cmp.itDriverExperience.elNode.$el.val(), 10);

          valid = checkAgeAndExp(age, experience);

          setValidityEl(cmp.itDriverAge.elNode.$el, valid.age);
          setValidityEl(cmp.itDriverExperience.elNode.$el, valid.exp);

          overAllValid = valid.age && valid.exp && overAllValid;
        }
        return overAllValid;
      },
      success: function() {

      },
      failure: function() {
      }
    }
  );

  c.listen('calc.is_multidrive', function(is_multidrive) {
    if (is_multidrive) {
      $el.hide();
    } else {
      $el.show();
    }
  });

  c.listen('calc.drivers_count', function(drivers_count) {
    $el.empty();
    currentComponents = [];
    for (var index = 0; index < drivers_count; index++) {
      var defaultDriverValues = {
        age: 18,
        expirience: 0,
        gender: 'M',
        has_children: false,
        is_married: false
      };
      c.set('calc.driver_set.' + index, defaultDriverValues);

      var template = c.cloneTemplate();
      var components = c.childComponents(template, {
        itDriverAge: function(age) {

          age.sync('change', function(index, value) {
            notify();
            age.set('calc.driver_set.' + index + '.age', Number(value));
          }.bind(null, index));
        },

        itDriverExperience: function(exp) {

          exp.sync('change', function(index, value) {
            notify();
            exp.set('calc.driver_set.' + index + '.expirience', Number(value));
          }.bind(null, index));
        },

        itDriverGender: function(gender) {
          gender.sync('change', function(index, value) {
            gender.set('calc.driver_set.' + index + '.gender', value);
          }.bind(null, index));
        }
      });
      currentComponents.push(components);

      $el.append(template);
    }
  });
};

exports.itShowDrivers = function(c, $el) {
  c.appendToStep();
  c.makeTemplate();

  c.resolve(function(done) {
    c.listen('calc.driver_set', function(driver_set) {
      $el.empty();
      driver_set.forEach(function(driver) {
        var clone = c.cloneTemplate();
        c.childComponents(clone, {
          itAge: function(age, $el) {
            $el.text(driver.age);
          },
          itExperience: function(exp, $el) {
            $el.text(driver.expirience);
          },
          itGender: function(gender, $el) {
            var go = {
              M: 'муж',
              F: 'жен'
            };
            $el.text(go[driver.gender]);
          }
        });
        $el.append(clone);
      });
      done();
    });
  });
};
