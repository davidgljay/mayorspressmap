var utils = require('./utils'),
scales = require('./scales');

module.exports.enter = function enter(svg,json) {
	return svg.selectAll("text .tag").data(json).enter().append("text")
        .attr('id', function(d){return utils.idify(d.tag)})
        .text(function(d){return utils.prettify(d.tag)})
        .attr("dy",".32em")
        .classed('tag', true)
        .attr('text-anchor', 'middle');
}

module.exports.onTick = function onTick(selection, selected, width, height, svg) {
	return selection.attr("y", function(d) { return svg.select("circle#"+utils.idify(d.tag)).attr('cy')})
	    .classed("fade", function(d) {
	      if (!selected) return false;
	      else if (selected == d.tag) return false;
	      else return true;
	    })
	    //Set the X coordinate to the center of the circle minus the radius.
        .attr("x", function(d) { return svg.select("circle#" + utils.idify(d.tag)).attr('cx')})
}