var utils = require('./utils'),
scales = require('./scales'),
textVis = require('./text'),
circleVis = require('./circles'),
utils = require('./utils'),
d3 = require('d3');

var maxRadius = 40,
width=700,
height=400;

var render = module.exports.render = function () {

  //Create the layout
  var svg = d3.select('#bubbleMap').append('svg')
    .attr('width', width)
    .attr('height', height);

  var url_regex = /\#\/tag\/(.+)/,
  selected_tag = {};
  selected_tag.text = url_regex.exec(window.location.hash) ? url_regex.exec(window.location.hash)[1]: null;
  selected_tag.dx = 0;
  selected_tag.dy = 0;

  //TODO: Derive datapath from hash;
  var datapath = selected_tag.text ? '/maps/tags/'+selected_tag.text+'.json' : '/maps/all.json';

  var target = svg.append('circle')
      .attr('r', 5)
      .attr('id','target')
      .attr('cx',width/2)
      .attr('cy',height/10)
      .style('fill','red')
      .style('z-index','-100');

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
          d3.select('#selected_tag_text').attr("transform", function() {
            return "translate(" + [d.dx, d.dy ] + ")"
          })
        })
      drag.on("dragstart", function(d) {
          d3.select('#selected_tag_circle').transition()
          .duration(750)
          .attr("opacity",0)
          .each("end", function() {
            //After fading out the currently selected tag, reload the page at the root url.
            window.location.hash="";
            d3.select('#bubbleMap svg').remove();
            render();
          })
          d3.select('#selected_tag_text').transition()
          .duration(750)
          .attr("opacity", 0);
        })

      var selected_tag_circle = svg.selectAll("circle .selected").data([selected_tag]).enter().append('circle')
      .attr('r', maxRadius)
      .attr('id',"selected_tag_circle")
      .attr('cx',width/2)
      .attr('cy',height/10)
      .attr('opacity',1)
      .classed('selected', true)
      .style('fill','lightblue')
      .call(drag);

      var selected_tag_text = svg.append('text')
      .attr('width', maxRadius * 2)
      .attr('dx', width/2)
      .attr("dy",height/10+5)
      .attr('opacity',1)
      .attr('id',"selected_tag_text")
      .attr('text-anchor', 'middle')
      .text(utils.prettify(selected_tag.text));


    }

  //Get JSON data
  d3.json(datapath, function(err, json) {
    if (err) {
      console.error(err);
      return;
    }

    // console.log(selected_tag);

    console.log(datapath);

    var countScale = scales.getCountScale(json, height),
    dateScale = scales.getDateScale(json, width),
    radiusScale = scales.getRadiusScale(json, maxRadius);

    var tags = json.map(function(tag) {
      tag.x = width/2;
      tag.y = height/2 + tag.count*10;
      return tag;
    }),
    //Add circles and text
    circles = circleVis.enter(svg, json, radiusScale),
    text = textVis.enter(svg, json),
    //Generate collision detection function
    collide = utils.collide(tags, radiusScale, maxRadius);

    var force = d3.layout.force()
        .nodes(tags)
        .size([width, height])
        .friction(0.9)
        .charge(0)
        .gravity(0)
        .start();
    circles.call(force.drag);


    force.on('tick',function() {
      var new_selected_tag = circleVis.getSelected(circles, width, height);
      //Draw each circle to a point on the x axis equal to its gravity.
      circleVis.onTick(circles, new_selected_tag, width, height, dateScale, collide);

      //Set the X and Y coordinates of each text element equal to the circle that shares its ID.
      textVis.onTick(text, new_selected_tag, width, height, svg);

      if (new_selected_tag) {
        force.stop();
      }
      //Expand tag once it is selected
      svg.select("#"+new_selected_tag).transition()
      .duration(500)
        .attr("r",maxRadius)
        //Navigate to a new page when the transition is complete
        .each("end", function() {
            window.location.hash = "#/tag/"+new_selected_tag;
            d3.select('#bubbleMap svg').remove();
            render();
        })

        //TODO: Handle unselection
      //Check to see if the selected circle has been removed. If so fade everything out and reload the main page.
    })

  });
};

