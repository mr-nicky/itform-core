/**
 * Created by infirex on 05.04.16.
 */
var camelcase = require('camelcase');

// exports.fillWithOptions = function(element, start, end) {
//   for (var i = start; i <= end; i++) {
//     var opt = document.createElement('option');
//     opt.innerHTML = i;
//     opt.setAttribute('value', String(i));
//     element.appendChild(opt);
//   }
// };
//
// exports.fillSelectWithItems = function(element, items) {
//   items.forEach(function(item, index) {
//     var opt = document.createElement('option');
//     opt.setAttribute('value', String(index));
//     opt.innerHTML = item.title;
//     element.appendChild(opt);
//   });
// };

// exports.createTemplate = function(element) {
//   var template = document.createDocumentFragment();
//   while (element.hasChildNodes()) {
//     template.appendChild(element.firstChild);
//   }
//   return template;
// };

exports.getCamelizedAttributes = function(element) {
  if (!element.attributes) {
    return []; // for body element
  }
  var attributes = [];
  for (var i = 0; i < element.attributes.length; i++) {
    var attr = {
      name: camelcase(element.attributes[i].name),
      value: element.attributes[i].value
    };
    attributes.push(attr);
  }
  return attributes;
};