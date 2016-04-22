var utils = require('./utils'),
scales = require('./scales'),
d3 = require('d3'),
d3tip = require('d3-tip');
d3tip(d3);

module.exports.enter = function enter(svg, tagdata) {

	return svg.selectAll("text .tag").data(tagdata).enter().append("text")
    .text(function(d){return utils.prettify(d.tag)})
    .attr("dy",".32em")
    .attr("font-size",function(d){return d.height})
    .classed('tag', true)
    .attr('text-anchor', 'middle')
    .attr('id', function(d){return utils.idify(d.tag)})
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
};