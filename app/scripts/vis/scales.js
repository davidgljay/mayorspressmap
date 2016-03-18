
var d3 = require('d3'),
utils = require('./utils');

module.exports.getRadiusScale = function getRadiusScale(maxVal, maxRadius) {
  return d3.scale.pow().exponent(.5)
    .domain([0,maxVal])
    .range([10,maxRadius])
};

var getMaxCount = module.exports.getMaxCount = function (json) {
  var maxCount = 0;
  for (var i = json.length - 1; i >= 0; i--) {
    if (json[i].count > maxCount) maxCount = json[i].count;
  };
  return maxCount;
};

module.exports.getCountScale = function getCountScale(maxVal, height) {
  return d3.scale.linear()
    .domain([0, maxVal])
    .range([height-20, 20]);
};

module.exports.getDateScale = function getDateScale(json, height) {
  var maxDate = 0, minDate = new Date().getTime();
  for (var i = json.length - 1; i >= 0; i--) {
    // var date = new Date(json[i].med_date).getTime();
    var date = utils.med_date(json[i].dates)
    if (date > maxDate) {
      maxDate = date;
    }
    if (date < minDate) {
      minDate = date;
    }
  };
  return d3.scale.linear()
    .domain([minDate, maxDate])
    .range([height-50,50]);
};