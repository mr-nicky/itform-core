exports.itCarOnWarranty = function(c) {
  c.appendToStep();

  c.sync('change', function(value) {
    c.set('calc.is_under_warranty', value);
  });
};

exports.itAntitheft = function(c) {
  c.appendToStep();
  var dict = c.loadDictionary('/rest/default/antitheft/models/');
  dict.subscribe(function(data) {
    data.forEach(function(data) {
      data.title = data.at_mark.title + ' - ' + data.title;
    });
    data.sort(function(a, b) {
      return a.title < b.title ? -1 : 1;
    });
    data.unshift({id: '', title: 'Нет'});
    c.fillSelectWithItems(data);
    c.sync('change', function(value) {
      var id = Number(data[value] && data[value].id);
      if (id === 0) {
        c.set('calc.antitheft', null);
        return;
      }
      c.set('calc.antitheft', id);
      c.set('show.antitheft', data[value].title);
    });
  });
};