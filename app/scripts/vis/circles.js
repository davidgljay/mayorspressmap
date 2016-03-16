var utils = require('./utils'),
scales = require('./scales');

module.exports.enter = function enter(svg, json, radiusScale) {
	return svg.selectAll("circle .tag").data(json).enter().append("circle")
    .attr('r',function(d){return radiusScale(d.dates.length)})
    .attr('id', function(d){return utils.idify(d.tag)})
    .attr('class','tag')
    .style('fill','lightblue')
}

module.exports.getSelected = function getSelected(selection, width, height) {
	var selected_tag;
	selection.each(function(d) {
      //Select a tag if it's close to the selection point. 
      if (Math.abs(d.x-width/2)<.15 && Math.abs(d.y-height/10)<.15) {
        selected_tag=d.tag;
      }
	})
	return selected_tag;
}

module.exports.onTick = function onTick(selection, selected, width, height, dateScale, collide) {
	return selection.each(function(d) {
    var alpha = .05,
    selectBox = {
      x1: width/2-height/10,
      y1:0,
      x2:width/2+height/10,
      y2:height/5
    };

    d.tag=utils.idify(d.tag);

    //Move tags towards their appropriate spot in the visualization or towards the selection box.
    if (selectBox.x1<d.x && selectBox.x2>d.x && selectBox.y1 < d.y && selectBox.y2 > d.y) {
      d.y += (height/10 - d.y) * alpha;
      d.x += (width/2 - d.x) * alpha;
    } else {
      d.y += (height/2 - d.y) * alpha;
      d.x += (dateScale(utils.med_date(d.dates))- d.x) * alpha;
    }
  })
  .each(collide(.5))
  .attr("cx", function(d) { return d.x; })
  .attr("cy", function(d) { return d.y; })
  //Fade out if not selected.
  .classed("fade", function(d) {
    if (!selected) return false;
    else if (selected == d.tag) return false;
    else return true;
  })
}