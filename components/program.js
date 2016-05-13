var findChildren = require('../src/utility/findChildren');

var $ = require('jquery');

function getSum(program) {
  return Math.floor(Number(program.program.sum));
}

function placeLoadedData(c, $element, program) {
  var insurance = program.insurance_company;
  var sum = getSum(program);
  var comment = $element.lastChild;
  if (comment && comment.nodeName === '#comment') {
    comment.data = program.id;
  } else {
    comment = document.createComment(program.id);
    $element.append(comment, $element);
  }
  c.childComponents($element, {
    itLogo: function(logo, $el) {
      $el.attr('src', c.getHost() + insurance.logo);
    },
    itPrice: function(price, $el) {
      $el.text(price.formatNumber(sum));
    },
    itDiscount: function(price, $el) {
      $el.text(price.formatNumber(Math.floor(sum * 0.05)));
    },
    itTitle: function(title, $el) {
      $el.text(insurance.title);
    },
    itAccept: function(accept, $el) {
      $el.off();
      $el.on('click', function() {
        c.set('program', program);
        c.model.form.moveForward();
      });
    },
    itOption: function(option, $el) {
      $el.empty();
      var $template = $('<div><hr><div it-title></div></div>');

      var active = program.program.option_set.reduce(function(arr, opt) {
        if (opt.is_active) {
          return arr.concat(opt);
        }
        return arr;
      }, []);

      active.forEach(function(opt) {
        var $child = $template.clone();
        option.childComponents($child, {
          itTitle: function(title, $el) {
            $el.text(opt.title);
          },

          itNote: function(note, $el) {
            $el.text(opt.note);
          }
        });
        option.elNode.$el.append($child);
      });
    }
  });
}

exports.itAnswerPlace = function(c) {
  c.appendToStep();

  var i;
  var length = c.elNode.$el.children().length;
  var places = [];
  var components = {};
  for (i = 0; i < length; i++) {
    components['itAnswer' + i] = null;
  }
  var answerComponents = c.childComponents(components);

  for (i = 0; i < length; i++) {
    places[i] = answerComponents['itAnswer' + i];
  }

  places.forEach(function(cmp) {
    cmp.elNode.$el.css('visibility', 'hidden');
  });

  c.listen('internal.programStorage', function(storage) {
    var $img = $('<img>').insertBefore(c.elNode.$el);
    $img.attr('src', 'images/loading.gif');

    $img.css({
      display: 'block',
      margin: '0 auto'
    });

    places.forEach(function(cmp) {
      cmp.elNode.$el.css('visibility', 'hidden');
    });

    storage.subscribe(0, length, function(programs) {
      if ($img) {
        $img.remove();
        $img = null;
      }
      places.forEach(function(cmp) {
        cmp.elNode.$el.css('visibility', 'hidden');
      });
      programs.forEach(function(program, index) {
        places[index].elNode.$el.css('visibility', '');
        placeLoadedData(c, places[index].elNode.$el, program);
      });
    });
    c.set('internal.programTemplateStartAt', length);
  });
};

exports.itAnswerTemplate = function(c, $el) {
  c.makeTemplate();
  c.appendToStep();

  c.listen('internal.programTemplateStartAt', function(start) {
    var storage = c.get('internal.programStorage');
    $el.empty();
    storage.subscribe(start, -1, function(programs) {
      $el.empty();
      programs.forEach(function(program) {
        var template = c.cloneTemplate();
        placeLoadedData(c, template, program);
        c.elNode.$el.append(template);
      });
    });
  });
};
