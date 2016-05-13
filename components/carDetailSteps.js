var $ = require('jquery');

var HIGHLIGHT_FIRST_NUM = 16;
var COLUMN_NUM = 5;
var ITEMS_NUM_ON_INIT = COLUMN_NUM * 10;

function redrawTable(nameFactory, $tbody, rows) {
  var i;
  for (i = 0; i < rows.length; i++) {
    var tr = document.createElement('tr');
    for (var o = 0; o < rows[i].length; o++) {
      var cell = rows[i][o];
      if (!cell) {
        break;
      }
      var td = document.createElement('td');
      var a = document.createElement('a');
      if (cell.marked) {
        a.setAttribute('class', 'marked');
      }
      a.addEventListener('click', cell.click);
      a.textContent = nameFactory(cell.entry);
      td.appendChild(a);
      tr.appendChild(td);
    }
    $tbody.append(tr);
  }
}

function sortByRank(entries) {
  entries.sort(function(a, b) {
    return b.rank - a.rank;
  });
  return entries;
}

function cutCells(cells, number) {
  cells.splice(number);
}

function toCells(entries, highlightNum, clickFactory) {
  var cells = [];

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var cell = {
      marked: i < highlightNum,
      click: clickFactory(entry),
      entry: entry
    };
    cells.push(cell);
  }

  return cells;
}

function filterByYear(entries, year) {
  var filtered = [];
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (year > entry.start_manufacturing_year && year < entry.stop_manufacturing_year) {
      filtered.push(entry);
    }
  }
  return filtered;
}

function sortCellsAlphabetically(cells) {
  cells.sort(function(a, b) {
    if (a.entry.title < b.entry.title) {
      return -1;
    } else if (a.entry.title > b.entry.title) {
      return +1;
    }
    return 0;
  });
  return cells;
}

function toRows(cells, columnNum) {
  var rowNum = Math.ceil(cells.length / columnNum);
  var rows = [];
  var row, col;
  for (row = 0; row < rowNum; row++) {
    rows[row] = [];
  }

  for (col = 0; col < columnNum; col++) {
    for (row = 0; row < rowNum; row++) {
      var index = col * rowNum + row;
      var item = cells[index];
      rows[row].push(item);
    }
  }
  return rows;
}

exports.itCarMark = function(c, $el) {
  c.appendToStep();

  c.set('calc', {});
  c.resolve(function(done) {
    var dict = c.loadDictionary('/rest/full/car_mark/');

    dict.subscribe(function(data) {
      var $tbody = $el.find('tbody');
      data = data.concat();
      sortByRank(data);
      var cells = toCells(data, HIGHLIGHT_FIRST_NUM, function(entry) {
        return function(e) {
          e.preventDefault();

          c.set('show.car_mark', entry.title);
          c.set('calc.car_mark', entry.id);
          c.model.form.moveForward();
        };
      });
      var storedCells = cells.concat();
      var $showAll = $el.find('tfoot a.it-show');
      $showAll.show();
      $showAll.click(function(e) {
        e.preventDefault();
        $tbody.empty();

        var cells = storedCells.concat();
        sortCellsAlphabetically(cells);
        var rows = toRows(cells, COLUMN_NUM);
        redrawTable(function(entry) {
          return entry.title;
        }, $tbody, rows);
        $showAll.hide();
      });

      cutCells(cells, ITEMS_NUM_ON_INIT);
      sortCellsAlphabetically(cells);

      var rows = toRows(cells, COLUMN_NUM);
      $tbody.empty();
      redrawTable(function(entry) {
        return entry.title;
      }, $tbody, rows);
      done();
    });
  });
};

exports.itCarManufacturingYear = function(c, $el) {
  c.appendToStep();

  var $tbody = $el.find('tbody');
  $tbody.empty();

  var startYear = 1991;
  var endYear = new Date().getFullYear();
  var data = [];

  for (var y = endYear; y >= startYear; y--) {
    data.push({
      year: y,
      title: String(y)
    });
  }

  var cells = toCells(data, 0, function(entry) {
    return function(e) {
      e.preventDefault();

      c.set('internal.yearFilter', entry.year);
      c.set('calc.car_manufacturing_year', entry.year);
      c.model.form.moveForward();
    };
  });

  var rows = toRows(cells, COLUMN_NUM);
  redrawTable(function(entry) {
    return entry.title;
  }, $tbody, rows);
};

exports.itCarModelGroup = function(c, $el) {
  c.appendToStep();

  c.resolve(function(done) {
    var $tbody = $el.find('tbody');
    var year = c.get('internal.yearFilter');
    var dict = c.loadDictionary('/rest/full/car_mark/' + c.get('calc.car_mark') + '/car_model_group/');

    dict.subscribe(function(data) {
      data = data.concat();
      var filtered = filterByYear(data, year);
      var cells = toCells(filtered, 0, function(entry) {
        return function(e) {
          e.preventDefault();

          c.set('show.car_model_group', entry.title);
          c.set('calc.car_model_group', entry.id);
          c.model.form.moveForward();
        };
      });
      cutCells(cells, ITEMS_NUM_ON_INIT);
      sortCellsAlphabetically(cells);
      var rows = toRows(cells, COLUMN_NUM);
      $tbody.empty();
      redrawTable(function(entry) {
        return entry.title;
      }, $tbody, rows);
      done();
    });
  });
};

exports.itCarModel = function(c, $el) {
  c.appendToStep();
  var $lastChosen = null;
  var validation = c.getValidatorEngine();
  var notify = validation.addValidator({
    validate: function() {
      return $lastChosen !== null;
    },
    failure: function() {
      $el.addClass('it-frame-invalid');
    },
    success: function() {
      $el.removeClass('it-frame-invalid');
    }
  });
  c.resolve(function(done) {
    var $tbody = $el.find('tbody');
    var dict = c.loadDictionary('/rest/full/car_mark/' + c.get('calc.car_mark') + '/car_model_group/' + c.get('calc.car_model_group') + '/car_model/');
    dict.subscribe(function(data) {
      data = data.concat();
      var year = c.get('internal.yearFilter');
      var filtered = filterByYear(data, year);
      var cells = toCells(filtered, 0, function(entry) {
        return function(e) {
          e.preventDefault();
          c.set('show.car_model', entry.title);
          c.set('calc.car_model', entry.id);
          if ($lastChosen) {
            $lastChosen.removeClass('chosen');
          }
          $lastChosen = $(e.target);
          $lastChosen.addClass('chosen');
          notify();
        };
      });
      sortCellsAlphabetically(cells);
      var rows = toRows(cells, COLUMN_NUM);
      $tbody.empty();
      redrawTable(function(entry) {
        return entry.title;
      }, $tbody, rows);
      c.set('show.car_model', cells[0].entry.title);
      c.set('calc.car_model', cells[0].entry.id);
      done();
    });
  });
};