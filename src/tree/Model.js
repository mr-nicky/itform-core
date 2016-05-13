/**
 * Created by infirex on 13.04.16.
 */
function Model(form) {
  var self = this;
  
  self.form = form;
  self.data = {};
  self.components = [];
  self.steps = [];

  self.flag = {
    model: true
  };
}

module.exports = Model;
