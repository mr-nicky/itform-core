function findDeepObject(pathChunks, obj) {
  pathChunks = pathChunks.concat();
  while (pathChunks.length) {
    var chunk = pathChunks.shift();
    if (!obj[chunk]) {
      obj[chunk] = {};
    }
    obj = obj[chunk];
  }
  return obj;
}

function findDeepObjectLightly(pathChunks, obj) {
  pathChunks = pathChunks.concat();
  while (pathChunks.length) {
    var chunk = pathChunks.shift();
    if (!obj.hasOwnProperty(chunk)) {
      return;
    }
    obj = obj[chunk];
  }
  return obj;
}

function findDeepObservers(pathChunks, obj) {
  pathChunks = pathChunks.concat();
  while (pathChunks.length) {
    var chunk = propertyObserversKeyFrom(pathChunks.shift());
    if (!obj[chunk]) {
      Object.defineProperty(obj, chunk, {
        value: {},
        writable: true,
        enumerable: false,
        configurable: true
      });
    }
    obj = obj[chunk];
  }
  return obj;
}

function findDeepObserversLightly(pathChunks, obj) {
  pathChunks = pathChunks.concat();
  while (pathChunks.length) {
    var chunk = propertyObserversKeyFrom(pathChunks.shift());
    if (!obj[chunk]) {
      return;
    }
    obj = obj[chunk];
  }
  return obj;
}

function notifyNestedListeners(root, observersRoot) {
  Object.keys(root).forEach(function(key) {
    var observersKey = observersKeyFrom(key);
    var propertyObserversKey = propertyObserversKeyFrom(key);

    if (observersRoot[observersKey]) {
      observersRoot[observersKey].forEach(function(observer) {
        observer(root[key]);
      });
    }

    if (observersRoot[propertyObserversKey] && typeof root[key] === 'object' && root[key] !== null) {
      notifyNestedListeners(root[key], observersRoot[propertyObserversKey]);
    }
  });
}

function observersKeyFrom(key) {
  return key + 'Observers';
}

function propertyObserversKeyFrom(key) {
  return key + 'PropertyObservers';
}

exports.setProperty = function(root, path, prop) {
  console.debug('setting', path, 'to', prop);
  var pathChunks = path.split('.');

  var key = pathChunks.pop();
  var observersKey = observersKeyFrom(key);
  var propertyObserversKey = propertyObserversKeyFrom(key);

  var propertyObservers = findDeepObserversLightly(pathChunks, root);
  var obj = findDeepObject(pathChunks, root);

  // var oldValue = obj[key];
  obj[key] = prop;

  if (propertyObservers) {
    if (propertyObservers[observersKey] && propertyObservers[observersKey].length) {
      console.debug('running observers at', path);
      propertyObservers[observersKey].forEach(function(observer) {
        observer(obj[key]);
      });
    }
    if (propertyObservers[propertyObserversKey]) {
      notifyNestedListeners(obj[key], propertyObservers[propertyObserversKey]);
    }
  }
};

exports.getProperty = function(root, path) {
  var pathChunks = path.split('.');

  var key = pathChunks.pop();
  var obj = findDeepObjectLightly(pathChunks, root);

  if (obj) {
    return obj[key];
  }
};

exports.listenProperty = function(root, path, observer, dontCallIfExists) {
  console.debug('listening', path);
  var pathChunks = path.split('.');

  var key = pathChunks.pop();
  var observerKey = observersKeyFrom(key);

  var propertyObservers = findDeepObservers(pathChunks, root);
  var obj = findDeepObjectLightly(pathChunks, root);

  if (!propertyObservers[observerKey]) {
    Object.defineProperty(propertyObservers, observerKey, {
      value: [],
      writable: true,
      enumerable: false,
      configurable: true
    });
  }
  propertyObservers[observerKey].push(observer);
  Object.defineProperty(observer, 'listenFor', {
    value: path,
    enumerable: false,
    writable: false,
    configurable: false
  });
  if (obj && obj.hasOwnProperty(key)) {
    var value = obj[key];
    if (!dontCallIfExists) {
      console.debug('deferring observer', path, 'with value', value);
      setTimeout(function() {
        console.debug('running deferred observer', path, 'with value', value);
        observer(value);
      });
    }
  }
};

exports.removeListener = function(root, observer) {
  var path = observer.listenFor;
  console.debug('removing', path, 'observer');

  var pathChunks = path.split('.');
  var key = pathChunks.pop();

  var observerKey = observersKeyFrom(key);
  var propertyObservers = findDeepObservers(pathChunks, root);

  propertyObservers[observerKey] = propertyObservers[observerKey].filter(function(_observer, index) {
    if (_observer !== observer) {
      return true;
    }
    console.debug('removing observer with index', index);
    return false;
  });
};
