var utils = require('./utils'),
scales = require('./scales'),
textVis = require('./text'),
circleVis = require('./circles'),
utils = require('./utils'),
d3 = require('d3');

var maxRadius = 40,
width=700,
height=400;

module.exports.render = function render() {

  //Create the layout
  var svg = d3.select('#bubbleMap').append('svg')
    .attr('width', width)
    .attr('height', height);

  //TODO: Derive datapath from hash;
  var datapath = '/maps/all.json';

  //Get JSON data
  d3.json(datapath, function(err, json) {
    if (err) {
      console.error(err);
      return;
    }

    //See if we are pulling data about a particular tag.
    var selected_tag = /(maps\/tag\/)(.+)(\.json)/.exec(datapath);
    if (selected_tag) {
      var selected_tag_circle = svg.append('circle')
      .attr('r', maxRadius)
      .attr('id',selected_tag[2])
      .attr('cx',width/2)
      .attr('cy',height/10)
      .classed('selected')
      .style('fill','lightblue');
    }
    console.log(selected_tag);

    console.log(datapath);

    var countScale = scales.getCountScale(json, height),
    dateScale = scales.getDateScale(json, width),
    radiusScale = scales.getRadiusScale(json, maxRadius);

    var tags = json.map(function(tag) {
      tag.x = width/2;
      tag.y = height/2 + tag.count*10;
      return tag;
    }),
    target = svg.append('circle')
      .attr('r', 5)
      .attr('id','target')
      .attr('cx',width/2)
      .attr('cy',height/10)
      .style('fill','red')
      .style('z-index','-100'),
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
      var selected_tag = circleVis.getSelected(circles, width, height);
      //Draw each circle to a point on the x axis equal to its gravity.
      circleVis.onTick(circles, selected, width, height, dateScale, collide);

      //Set the X and Y coordinates of each text element equal to the circle that shares its ID.
      textVis.onTick(text, selected, width, height, svg);

      //Expand tag once it is selected
      svg.select("#"+selected).transition()
        .attr("r",maxRadius)
        //Navigate to a new page when the transition is complete
        .each("end", function() {
            window.location.hash = "#/tag/"+selected;
        })

        //TODO: Handle unselection
      //Check to see if the selected circle has been removed. If so fade everything out and reload the main page.
    })

  });
};

