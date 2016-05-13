/**
 * Created by infirex on 14.04.16.
 */
var _ = require('lodash');
var $ = require('jquery');

exports.sync = function(c, event, fn) {
  var firstTime = true;

  function syncWrapper() {
    if (c.elNode.$el.attr('type') === 'checkbox' || c.elNode.$el.attr('type') === 'radio') {
      fn(c.elNode.$el.prop('checked'), firstTime);
    } else {
      fn(c.elNode.$el.val(), firstTime);
    }
  }

  c.syncDetail = {
    event: event,
    wrapper: syncWrapper,
    fn: fn
  };

  c.elNode.$el.on(event, syncWrapper);
  // syncing default value
  syncWrapper();
  firstTime = false;
  return c;
};

exports.makeTemplate = function(c) {
  c.$template = c.elNode.$el.children().clone();
  return c;
};

exports.cloneTemplate = function(c) {
  return c.$template.clone();
};

exports.getTemplate = function(c) {
  return c.$template;
};

exports.fillSelectWithItems = function(c, items) {
  _.forEach(items, function(item, index) {
    var $opt = $('<option></option>');
    $opt.attr('value', String(index));
    $opt.text(item.title);
    c.elNode.$el.append($opt);
  });
};