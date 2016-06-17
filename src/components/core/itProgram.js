var _ = require('lodash');

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var getRandomDomain = function() {
  var domains = [
    'http://enter.b2bpolis.ru',
    'http://r1.enter.b2bpolis.ru',
    'http://r2.enter.b2bpolis.ru',
    'http://r3.enter.b2bpolis.ru'];

  return function() {
    return domains[getRandomIntInclusive(0, domains.length - 1)];
  };
}();

function getSum(program) {
  return Math.floor(Number(program.program.sum));
}

function ProgramsRequest(calculation, c) {
  var self = this;
  self.calculation = calculation;
  self.insurances = calculation.available_insurance_departments;
  self.requests = [];

  function createUrl(result_id) {
    return getRandomDomain() + '/rest/v3/default/calculation/' + self.calculation.id + '/result/' + result_id + '/?installment=1&insurance_company=1&messages=1&options=1&sysinfo=1&variables=1&extra_parameters=1&available_programs=1';
  }

  function increaseSuccess() {
    c.set('external.progress', {
      loaded: c.get('external.progress.loaded') + 1,
      max: self.requests.length
    });
  }

  function createRequest(insurance) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState === 4) {

        if (req.status >= 200 && req.status < 300) {
          var response = JSON.parse(req.responseText);
          if (c.getForm().PROGRAM_STRATEGY === 'useInapparent') {
            extendRequest(response, insurance);
            return;
          }
          increaseSuccess();
          for (var i = 0; i < response.length; i++) {
            if (response[i].is_default) {
              self.defaultPipe(response[i]);
            }
          }
        } else {
          increaseSuccess();
        }
      }
    };

    req.open('POST', createUrl(insurance.id));
    req.setRequestHeader('X-Calculation-Token', calculation.token);
    req.setRequestHeader('Accept', '*/*');
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    req.send();

    self.requests.push(req);
  }

  function extendRequest(response, insurance) {
    var available_programs = response[0].available_programs;
    _.forEach(available_programs, function(program) {
      var ids = [program.id];
      var url = createUrl(insurance.id);
      var req = new XMLHttpRequest();
      req.onreadystatechange = function() {
        if (req.readyState === 4) {
          increaseSuccess();
          if (req.status >= 200 && req.status < 300) {
            var response = JSON.parse(req.responseText);
            for (var i = 0; i < response.length; i++) {
              self.defaultPipe(response[i]);
            }
          }
        }
      };
      req.open('POST', createUrl(insurance.id));
      req.setRequestHeader('X-Calculation-Token', calculation.token);
      req.setRequestHeader('Accept', '*/*');
      req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      req.send(JSON.stringify({
        programs: ids
      }));
      self.requests.push(req);
    });
    increaseSuccess();
  }

  self.requestAll = function() {
    c.set('external.progress', {
      loaded: 0,
      max: self.insurances.length
    });
    for (var index = 0; index < self.insurances.length; index++) {
      createRequest(self.insurances[index]);
    }
  };

  self.massAbort = function() {
    console.info('mass abort');
    self.requests.forEach(function(req) {
      req.abort();
      req.onreadystatechange = null;
    });
  };

  self.defaultPipe = function(program) {

  };
}

function ProgramStorage() {
  var self = this;
  self.storage = [];
  self.scheduled = false;
  self.observers = [];

  function findIndex(program) {
    var i = 0;
    for (i = 0; i < self.storage.length; i++) {
      if (getSum(self.storage[i]) > getSum(program)) {
        return i;
      }
    }
    return self.storage.length;
  }

  self.receive = function(program) {
    if (!getSum(program)) {
      // console.log('program failed', program);
      return;
    }
    // console.log('program succeed', program);
    var newIndex = findIndex(program);
    self.storage.splice(newIndex, 0, program);
    if (!self.scheduled) setTimeout(self.notifyAll);
    self.scheduled = true;
  };

  self.notifyAll = function() {
    self.observers.forEach(self.notifyOne);
    self.scheduled = false;
  };

  self.notifyOne = function(observer) {
    var end = Math.min(observer.end, self.storage.length);
    var data = self.storage.slice(observer.start, end);
    if (data.length) observer.fn(data);
  };

  self.subscribe = function(start, end, fn) {
    var observer = {
      start: start,
      end: end,
      fn: fn
    };
    self.observers.push(observer);
    if (self.storage[start]) setTimeout(self.notifyOne.bind(null, observer));
  };
}

exports.itProgram = function(c) {
  var reqs = [];
  var req;
  var storage;
  var listener;

  c.resolve(function() {
    c.listen('calculation', listener = function(calculation) {
      req = new ProgramsRequest(calculation, c);
      reqs.push(req);
      storage = new ProgramStorage();
      req.defaultPipe = storage.receive;
      req.requestAll();
      c.set('internal.programStorage', storage);
    }, true);
  });

  function commitSuicide() {
    if (reqs.length > 1) {
      console.warn('more than 2 request');
    }
    reqs.forEach(function(req) {
      req.massAbort();
    });
    reqs = [];
  }

  c.listen('internal.calcChanged', function(changed) {
    if (changed) {
      console.info('killing all result requests due to calculation change');
      commitSuicide();
    }
  });

  c.cleanUpStep(function() {
    if (listener) {
      c.removeListener(listener);
    }
  });
};

exports.itProgramProgress = function(c, $el) {

  var $children = $el.children();
  var minWidth = 25;

  var $calculationIdElement = document.querySelector('.it-calculation');
  var $programMessagesElement = document.querySelector('.it-program-messages');

  $calculationIdElement.style.display = 'none';
  $programMessagesElement.style.display = 'none';

  c.listen('external.progress', function(progress) {
    var length = progress.loaded / progress.max * 100;

    if (length < minWidth) {
      length = minWidth;
    }

    $children.css('width', length + '%');
    $children.text(
      length + '%'
    );

    if (length >= 100) {
      $calculationIdElement.style.display = 'table';
      $programMessagesElement.style.display = 'block';
      $el.hide();
    } else {
      $el.show();
    }
  });
};
