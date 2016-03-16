var utils = require('./utils'),
scales = require('./scales');

module.exports.enter = function enter(svg,json, radiusScale) {
	return svg.selectAll("icon .tag").data(json).enter().append("image")
        .attr('id', function(d){return utils.idify(d.tag)})
        .attr('xlink:href',function(d){return 'images/icons/' + utils.idify(d.tag) + '.png'})
        .attr('width', function(d) {return radiusScale(d.dates.length)})
        .attr('height', function(d) {return radiusScale(d.dates.length)})
        // .attr("dy",".32em")
        .classed('tag', true);
}

module.exports.onTick = function onTick(selection, selected, width, height, svg, radiusScale) {
	return selection
	    .classed("fade", function(d) {
	      if (!selected) return false;
	      else if (selected == d.tag) return false;
	      else return true;
	    })
	    //Set the X and Y coordinate to the center of the circle minus the radius so that images are centered.
        .attr("x", function(d) { 
        	return svg.select("circle#" + utils.idify(d.tag)).attr('cx')-radiusScale(d.dates.length)/2
        })
        .attr("y", function(d) { 
        	return svg.select("circle#"+utils.idify(d.tag)).attr('cy')-radiusScale(d.dates.length)/2
        })
}