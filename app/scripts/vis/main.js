var utils = require('./utils'),
scales = require('./scales'),
textVis = require('./text'),
iconVis = require('./icons'),
circleVis = require('./circles'),
utils = require('./utils'),
d3 = require('d3');

var maxRadius = 40,
width=950,
height=700,
selection_point = {
  x: 9*width/10,
  y: 9*height/10
}

var render = module.exports.render = function () {

  //Create the layout
  var svg = d3.select('#bubbleMap').append('svg')
    .attr('width', width)
    .attr('height', height);

  var tag_regex = /\/tag\/(.+)/,
  selected_tag = {};
  selected_tag.text = tag_regex.exec(window.location.hash) ? tag_regex.exec(window.location.hash)[1]: null;
  selected_tag.dx = 0;
  selected_tag.dy = 0;

  var city_regex = /\/city\/([a-z]+)/,
  selected_city = city_regex.exec(window.location.hash);

  var datapath;

  if (selected_city) {
    datapath = '/maps/cities/'+selected_city[1]+'.json';
  } else if (selected_tag.text) {
    datapath = '/maps/tags/'+selected_tag.text+'.json';
  } else {
    datapath = '/maps/all.json';
  }


  var target_circle = svg.append('circle')
      .attr('r',20)
      .attr('cx', selection_point.x)
      .attr('cy', selection_point.y)
      .classed('selection_target',true);
  var target_icon = svg.append('image')
      .attr('xlink:href',"images/search.svg")
      .attr('width', 20)
      .attr('height',20)
      .classed('selection_target',true)
      .attr('x',selection_point.x-10)
      .attr('y',selection_point.y-10);

  svg.append('image')
    .attr('id','downarrow')
    .attr('xlink:href','images/arrow.png')
    .attr('width',90)
    .attr('height',100)
    .attr('x', width/5-45)
    .attr('y', 7.25*height/10)
  svg.append('image')
    .attr('id','uparrow')
    .attr('xlink:href','images/arrow.png')
    .attr('width',90)
    .attr('height',100)
    .attr('x', width/5-45)
    .attr('y', 1.25*height/10)
    .attr('transform','rotate(180,'+ (width/5)+','+ (1.25*height/10+50) +')')
  svg.append('text')
      .attr('dx', width/5)
      .attr('dy', height/10)
      .classed('vis_text',true)
      .text('Trending Up')
      .attr('text-anchor','middle')
  svg.append('text')
      .attr('dx', width/5)
      .attr('dy', 9*height/10)
      .classed('vis_text',true)
      .text('Trending Down')
      .attr('text-anchor','middle');

  // svg.append('text')
  //     .attr('dx', 9*width/10)
  //     .attr('dy', 8*height/20)
  //     .classed('vis_text',true)
  //     .text('Drag Here');



    //See if we are pulling data about a particular tag.
    //TODO: Move logic to separate file
    if (selected_tag.text) {
      var drag = d3.behavior.drag();
        //Make the selected circle draggable;
      drag.on("drag", function(d) {
          d.dx += d3.event.dx;
          d.dy += d3.event.dy;
          d3.select('#selected_tag_circle').attr("transform", function(){
            return "translate(" + [ d.dx,d.dy ] + ")"
          })
          d3.select('#selected_tag_image').attr("transform", function() {
            return "translate(" + [d.dx, d.dy ] + ")"
          })
        })
      drag.on("dragstart", function(d) {
          d3.select('#selected_tag_circle').transition()
          .duration(750)
          .attr("opacity",0)
          .each("end", function() {
            //After fading out the currently selected tag, reload the page at the root url.
            rerender("");
          })
        })

      var selected_tag_circle = svg.selectAll("circle .selected").data([selected_tag]).enter().append('circle')
      .attr('r', maxRadius)
      .attr('id',"selected_tag_circle")
      .attr('cx',selection_point.x)
      .attr('cy',selection_point.y)
      .attr('opacity',1)
      .classed('selected', true)
      .call(drag);

      var selected_tag_icon = svg.append("image")
        .attr('width', maxRadius)
        .attr('height', maxRadius)
        .attr('xlink:href','images/icons/' + utils.idify(selected_tag.text) + '.png')
        .attr('x', selection_point.x-maxRadius/2)
        .attr('y', selection_point.y-maxRadius/2)
        .attr('id', 'selected_tag_image');


    }

  //Get JSON data
  d3.json(datapath, function(err, json) {
    if (err) {
      console.error(err);
      return;
    }

    var tagdata = utils.arrayify(json.tags, 'tag');

    //Add x and Y to tagdata
    for (var i=0; i<tagdata.length; i++) {
      tagdata[i].x = width/2 + i;
      tagdata[i].y = height/2;
    }

    //Generate scales
    var countScale = scales.getCountScale(json.max, height),
    dateScale = scales.getDateScale(tagdata, height),
    radiusScale = scales.getRadiusScale(json.max, maxRadius),

    //Add circles and text
    circles = circleVis.enter(svg, tagdata, radiusScale),
    // text = textVis.enter(svg, tagdata),
    icons = iconVis.enter(svg, tagdata, radiusScale),

    //Generate collision detection function
    collide = utils.collide(tagdata, radiusScale, maxRadius);

    var force = d3.layout.force()
        .nodes(tagdata)
        .size([width, height])
        .friction(0.9)
        .charge(0)
        .gravity(0)
        .start();
    circles.call(force.drag);
    icons.call(force.drag);


    force.on('tick',function() {
      var new_selected_tag = circleVis.getSelected(circles, selection_point, width, height);
      //Draw each circle to a point on the x axis equal to its gravity.
      circleVis.onTick(circles, new_selected_tag, selection_point, width, height, dateScale, collide);

      //Set the X and Y coordinates of each text element equal to the circle that shares its ID.
      // textVis.onTick(text, new_selected_tag, width, height, svg);
      iconVis.onTick(icons, new_selected_tag, width, height, svg, radiusScale)

      if (new_selected_tag) {
        force.stop();
      }
      //Expand tag once it is selected
      svg.select("circle#"+new_selected_tag).transition()
      .duration(500)
        .attr("r",maxRadius)
        .style("fill",'#DD1C1A')
        //Navigate to a new page when the transition is complete
        .each("end", function() {
            rerender("/tag/" + new_selected_tag);
        })
      svg.select("image#"+new_selected_tag).transition()
      .duration(500)
        .attr("width", maxRadius)
        .attr("height",maxRadius)
        .attr("x", function(d) {return d.x-maxRadius/2})
        .attr("y", function(d) {return d.y-maxRadius/2})

    })

  });
};

var rerender = module.exports.rerender = function(newhash, updateHash = true) {
  if (updateHash) {
   if (/\/tag\/.+./.exec(window.location.hash)) {
      window.location.hash = window.location.hash.replace(/\/tag\/.+./, newhash)
    } else {
      window.location.hash = window.location.hash + newhash;
    }    
  }
  d3.select('#bubbleMap svg').remove();
  render();
}
