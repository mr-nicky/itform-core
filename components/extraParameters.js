var findChildren = require('../src/utility/findChildren');
var $ = require('jquery');

var descriptor = {
  itLabel: null,
  itReplacewithInput: null
};

var templateDesc = {
  itForInput: null,
  itForCheckbox: null
};

var optionDesc = {
  itTitle: null,
  itNote: null
};

function makeOptions($el, $template, option_set) {
  $el.empty();

  $template = $('<div></div>').append($template);

  var actives = option_set.reduce(function(arr, option) {
    if (option.is_active) {
      return arr.concat(option);
    }
    return arr;
  }, []);

  actives.forEach(function(active) {
    var $content = $template.clone();
    var children = findChildren($content, optionDesc);
    children.itTitle.$el.text(active.title);
    children.itNote.$el.text(active.note);
    $el.append($content);
  });
}

function generateChildren(compositeTemplate, parameter, updateFn) {
  var $input;
  var $text;
  var $tmp;

  if (parameter.choices.length > 0) {
    $input = $('<select></select>');
    // input.value = parameter.value;
    parameter.choices.forEach(function(choice) {
      var $option = $('<option></option>');
      $option.text(choice.title);
      $option.attr('value', choice.id);
      if (choice.selected) {
        $option.attr('selected', 'selected');
      }
      $input.append($option);
    });
    $input.on('change', function(e) {
      updateFn(parameter.id, Number($(this).val()));
    });
  } else if (parameter.type === 'bool') {
    $input = $('<input type="checkbox">');
    $input.prop('checked', parameter.value);

    $input.on('change', function(e) {
      updateFn(parameter.id, $(this).prop('checked'));
    });
  } else {
    $input = $('<input type="text">');

    $input.val(parameter.value);

    $input.on('change', function(e) {
      updateFn(parameter.id, $(this).val());
    });
  }

  if (parameter.type === 'bool') {
    $tmp = compositeTemplate.$checkbox.clone();
    $text = $(document.createTextNode(parameter.title));
  } else {
    $tmp = compositeTemplate.$input.clone();
  }

  var children = findChildren($tmp, descriptor, true);

  if (parameter.type === 'bool') {
    children.itLabel.$el.append($text);
  } else {
    children.itLabel.$el.text(parameter.title);
  }

  var clazz = children.itReplacewithInput.$el.attr('class');
  $input.attr('class', clazz);

  children.itReplacewithInput.$el.replaceWith($input);

  return $tmp;
}

function updateExtrasCbsFactory(programId, insurance_company_version, extra_parameters, cb) {
  var send = {
    extra: {},
    insurance_company: insurance_company_version,
    programs: [programId]
  };

  // setting up defaults
  send.extra = extra_parameters.reduce(function(extra, param) {
    extra[param.id] = param.value;
    return extra;
  }, send.extra);

  function updateExtra(id, value) {
    console.debug('setting extra parameter %s to %s', id, value);
    send.extra[id] = value;
    cb(JSON.stringify(send));
  }

  return updateExtra;
}

function sendUpdateRequestFactory(c) {
  var xhr;

  return function(request) {
    if (xhr) {
      xhr.abort();
      xhr.onreadystatechange = null;
    }

    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 1) {
        c.set('show.extraParameters.pending', true);
      }
      if (xhr.readyState === 4) {
        c.set('show.extraParameters.pending', false);
        if (xhr.status >= 200 && xhr.status < 300) {
          var res = JSON.parse(xhr.response);
          c.set('show.extraParameters.sum', parseInt(res[0].program.sum, 10));
          c.set('show.extraParameters.resultId', res[0].id);
          //  c.set('program', res[0]);
        } else {
          c.set('show.extraParameters.unavailable', true);
          console.error('extra parameters update failed');
        }
      }
    };
    xhr.open('POST', c.getHost() + '/rest/v3/default/calculation/' + c.get('calculation.id') + '/result/' + c.get('program.insurance_company.version') +
      '/?available_installments=1&available_programs=1&extra_parameters=1&ins_dir_car_name=1&installment=1&insurance_company=1&insurer_data=1&messages=1&options=1&sysinfo=1&variables=1');
    xhr.setRequestHeader('X-Calculation-Token', c.get('calculation.token'));
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(request);
  };
}

exports.itProgramOptions = function(c, $el) {
  c.appendToStep();

  var templateChildren = findChildren($el, templateDesc);

  var compositeTemplate = {
    $input: templateChildren.itForInput.$el,
    $checkbox: templateChildren.itForCheckbox.$el
  };

  c.resolve(function() {
    $el.empty();
    var program = c.get('program');

    // initial extra parameters
    c.set('show.extraParameters.pending', false);
    c.set('show.extraParameters.sum', program.program.sum);
    c.set('show.extraParameters.resultId', program.id);

    var sendUpdateRequestCbs = sendUpdateRequestFactory(c);
    var updateHandler = updateExtrasCbsFactory(
      program.program.id, program.insurance_company.version, program.extra_parameters,
      sendUpdateRequestCbs);

    for (var i = 0; i < program.extra_parameters.length; i++) {
      var content = generateChildren(compositeTemplate, program.extra_parameters[i], updateHandler);
      $el.append(content);
    }
  });
};

exports.itOptionContainer = function(c, $el) {
  c.makeTemplate().appendToStep();

  c.listen('program.program.option_set', function(option_set) {
    $el.empty();
    makeOptions($el, c.getTemplate(), option_set);
  });
};
