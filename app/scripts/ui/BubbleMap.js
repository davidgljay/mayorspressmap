'use strict';

var React = require('react'),
d3 = require('d3');

var maxRadius = 40,
padding = 50;

var BubbleMap = React.createClass({
  getInitialState: function() {
    return null;
  },
  componentDidMount: function() {
    var width=700,
    height=400;

  	//TODO: Add scales

  	//Create the layout
  	var svg = d3.select('#bubbleMap').append('svg')
  		.attr('width', width)
  		.attr('height', height);

    //Get JSON data
    d3.json(this.props.path, function(err, json) {
      if (err) {
        console.error(err);
        return;
      }

      var countScale = getCountScale(json, height),
      dateScale = getDateScale(json, width),
      radiusScale = getRadiusScale(json, maxRadius);

      var tags = json.map(function(tag) {
        tag.x = width/2;
        tag.y = height/2 + tag.count*10;
        return tag;
      })

      //Add "tag" objects for each datapoint.
      var circles = svg.selectAll("circle").data(json).enter().append("circle")
        // .text(function(d){return prettify(d.tag)})
        // .style('font-size', function(d){return radiusScale(d.count)})
        .attr('r',function(d){return radiusScale(d.count)})
        .attr('id', function(d){return idify(d.tag)})
        .style('fill','lightblue');

      var target = svg.append("circle")
        .attr('r', 5)
        .attr('id','target')
        .attr('cx',width/2)
        .attr('cy',height/10)
        .style('fill','red')
        .style('z-index','-100')

      var text = svg.selectAll("text").data(json).enter().append("text")
        .attr('id', function(d){return idify(d.tag)})
        .text(function(d){return prettify(d.tag)})
        .attr("dy",".32em")
        .attr('text-anchor', 'middle')
        .each(wrap);


      var force = d3.layout.force()
          .nodes(tags)
          .size([width, height])
          .friction(0.9)
          .charge(0)
          .gravity(0)
          .start();

      circles.call(force.drag);

      force.on('tick',function() {
        //Draw each circle to a point on the x axis equal to its gravity.
          circles.each(function(d) {
              var alpha = .05,
              selectBox = {
                x1: width/2-height/10,
                y1:0,
                x2:width/2+height/10,
                y2:height/5
              };
              //TODO: Create attractor box, draw narby stuff to the center of it instead
              if (selectBox.x1<d.x && selectBox.x2>d.x && selectBox.y1 < d.y && selectBox.y2 > d.y) {
                d.y += (height/10 - d.y) * alpha;
                d.x += (width/2 - d.x) * alpha;
              } else {
                d.y += (height/2 - d.y) * alpha;
                d.x += (dateScale(new Date(d.med_date).getTime())- d.x) * alpha;
              }
            })
            .each(collide(.5))
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        //Set the X and Y coordinates of each text element equal to the circle that shares its ID.
          text
            //Set the X coordinate to the center of the circle minus the radius.
            .attr("x", function(d) { return svg.select("circle#"+idify(d.tag)).attr('cx')})
            .attr("y", function(d) { return svg.select("circle#"+idify(d.tag)).attr('cy')})
            .attr("width", function(d) { return radiusScale(d.count)*2})
      })

      // Resolve collisions between circles.
      //TODO: Create d3 utils that has this and other functions.
      var collide = function (alpha) {
        var quadtree = d3.geom.quadtree(tags);
        return function(d) {
          var r = radiusScale(d.count) + maxRadius + padding,
              nx1 = d.x - r,
              nx2 = d.x + r,
              ny1 = d.y - r,
              ny2 = d.y + r;
          quadtree.visit(function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== d)) {
              var x = d.x - quad.point.x,
                  y = d.y - quad.point.y,
                  l = Math.sqrt(x * x + y * y),
                  r = radiusScale(d.count) + radiusScale(quad.point.count);
              if (l < r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
              }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
          });
        };
      };
    })
  },
  componentWillUnmount: function() {
  },
  render: function() {
    return (
      <div id="bubbleMap"/>
    );
  }
});

function prettify(tag) {
  return tag.replace(/_/g, " ");
}

function idify(tag) {
  return tag.replace(/[^a-z0-9_]/ig,"");
}

function wrap(width) {
  return function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  }
}

function getRadiusScale(json) {
  return d3.scale.pow().exponent(.5)
    .domain([0,getMaxCount(json)])
    .range([10,maxRadius])
}

function getCountScale(json, height) {
  return d3.scale.linear()
    .domain([0, getMaxCount(json)])
    .range([height-20, 20]);
}

function getMaxCount(json) {
  var maxCount = 0;
  for (var i = json.length - 1; i >= 0; i--) {
    if (json[i].count > maxCount) maxCount = json[i].count;
  };
  return maxCount;
}

function getDateScale(json, width) {
  var maxDate = 0, minDate = new Date().getTime();
  for (var i = json.length - 1; i >= 0; i--) {
    var date = new Date(json[i].med_date).getTime();
    if (date > maxDate) {
      maxDate = date;
    }
    if (date < minDate) {
      minDate = date;
    }
  };
  return d3.scale.linear()
    .domain([minDate, maxDate])
    .range([20, width-20]);
};

BubbleMap.propTypes = {path: React.PropTypes.string};

module.exports = BubbleMap;

