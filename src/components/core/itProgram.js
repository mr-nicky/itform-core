function getSum(program) {
  return Math.floor(Number(program.program.sum));
}

function ProgramsRequest(calculation) {
  var self = this;
  self.calculation = calculation;
  self.insurances = calculation.available_insurance_departments;
  self.requests = [];

  function createUrl(result_id) {
    return 'http://enter.b2bpolis.ru/rest/v3/default/calculation/' + self.calculation.id + '/result/' + result_id + '/?installment=1&insurance_company=1&messages=1&options=1&sysinfo=1&variables=1&extra_parameters=1';
  }

  function createRequest(insurance) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState === 4) {
        if (req.status >= 200 && req.status < 300) {
          var response = JSON.parse(req.responseText);
          self.zeroPipe(response[0]);
          for (var i = 0; i < response.length; i++) {
            self.pipe(response[i]);
          }
          for (var i = 0; i < response.length; i++) {
            if (response[i].is_default) {
              self.defaultPipe(response[i]);
            }
          }
        } else {
         // console.error(req.status, req.statusText);
        }
      }
    };

    req.open('POST', createUrl(insurance.id));
    req.setRequestHeader('X-Calculation-Token', calculation.token);
    req.send();

    self.requests.push(req);
  }

  self.requestAll = function() {
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

  self.zeroPipe = function(program) {

  };

  self.pipe = function(program) {

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
      req = new ProgramsRequest(calculation);
      reqs.push(req);
      storage = new ProgramStorage();
      req.defaultPipe = storage.receive;

      req.requestAll();
      c.set('internal.programStorage', storage);
    }, true);
  });

  c.cleanUpStep(function() {
    console.debug('program cleanedUp');
    reqs.forEach(function(req) {
      req.massAbort();
    });
    reqs = [];
    if (listener) {
      c.removeListener(listener);
    }
  });
};
