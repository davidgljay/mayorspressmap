'use strict';

var React = require('react'),
d3 = require('d3');

var maxRadius = 22,
padding = 10;

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
        .attr('r',function(d){return radiusScale(d.count)});

      var force = d3.layout.force()
          .nodes(tags)
          .size([width, height])
          .friction(0.9)
          .charge(0)
          .gravity(0)
          .start();

      circles.call(force.drag);

      force.on('tick',function() {
          circles.each(function(d) {
              var alpha = .05;
              d.y += (height/2 - d.y) * alpha;
              d.x += (dateScale(new Date(d.med_date).getTime())- d.x) * alpha;
            })
            .each(collide(.5))
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      })

      // Resolve collisions between nodes.
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

function getRadiusScale(json) {
  return d3.scale.pow().exponent(.5)
    .domain([0,getMaxCount(json)])
    .range([5,maxRadius])
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

