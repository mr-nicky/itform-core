exports.extractOrderEmail = function(c, type) {
  var data = {
    'car_mark': c.get('show.car_mark'),
    'car_model': c.get('show.car_model'),
    'car_manufacturing_year': c.get('calculation.car_manufacturing_year'),
    'car_cost': c.get('calculation.car_cost'),
    'contributory_scheme': c.get('show.contributory_scheme'),
    'calculationId': c.get('calculation.id'),
    'resultId': c.get('show.extraParameters.resultId'),
    'name': c.get('order.name'),
    'phone': c.get('order.phone'),
    'address': c.get('order.address'),
    'type': type,
    'delivery': c.get('order.delivery'),
    'email': c.get('order.email'),
    'programSum': c.get('show.extraParameters.sum')
  };

  data.credit_bank = c.get('show.credit_bank') ? c.get('show.credit_bank') : 'Нет';
  var calc = c.get('calc');

  if (calc.is_multidrive) {
    data.drivers = 'Мультидрайв: ' + calc.drivers_minimal_age + ' мин. возраст, ' + calc.drivers_minimal_experience + ' мин. стаж';
  } else {
    data.drivers = '';
    for (var i = 0; i < calc.driver_set.length; i++) {
      data.drivers += ' ' + calc.driver_set[i].age + '/' + calc.driver_set[i].expirience + ' ' +
        (calc.driver_set[i].gender === 'M' ? 'м' : 'ж') + ', '; // api typo don't touch
    }
  }

  return data;
};