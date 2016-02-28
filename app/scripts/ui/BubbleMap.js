'use strict';

var React = require('react'),
d3 = require('d3');

var maxRadius = 40,
padding = 7,
width=700,
height=400;

//How to do this? In principle I want smooth animations, I want the new guys to "pop" out of where the selected one was, and I want the selected one to still be draggable.

//So what's the nature of the animation? 

//I  can stop the force, this will prevent craziness unless someone starts dragging something again.
//Then I can apply a transition (CSS or d3?) to everything that's not a tag.
//Then I can change the path, which (maybe) gets react to reload.
//Then I can make everything emerge from the dot. Just need to reapply my original function.
//Removing something from the dot should set "selected" to false, reversing the process (what if I want to switch??)
//TODO: figure out how to display cities (on another axis?)
//TODO: Experiment w/ vertical axis.

var BubbleMap = React.createClass({
  getInitialState: function() {
    return null;
  },
  componentDidMount: function() {

  	//Create the layout
  	var svg = d3.select('#bubbleMap').append('svg')
  		.attr('width', width)
  		.attr('height', height);

    var datapath = this.props.path;

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

      var countScale = getCountScale(json, height),
      dateScale = getDateScale(json, width),
      radiusScale = getRadiusScale(json, maxRadius);

      var tags = json.map(function(tag) {
        tag.x = width/2;
        tag.y = height/2 + tag.count*10;
        return tag;
      })

      var target = svg.append('circle')
        .attr('r', 5)
        .attr('id','target')
        .attr('cx',width/2)
        .attr('cy',height/10)
        .style('fill','red')
        .style('z-index','-100')

      var circles = svg.selectAll("circle .tag").data(json).enter().append("circle")
        .attr('r',function(d){return radiusScale(d.count)})
        .attr('id', function(d){return idify(d.tag)})
        .attr('class','tag')
        .style('fill','lightblue')

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
        var selected;
        //Draw each circle to a point on the x axis equal to its gravity.
          circles.each(function(d) {
              var alpha = .05,
              selectBox = {
                x1: width/2-height/10,
                y1:0,
                x2:width/2+height/10,
                y2:height/5
              };

              d.tag=idify(d.tag);

              //Select a tag if it's close to the selection point. 
              if (Math.abs(d.x-width/2)<.05 && Math.abs(d.y-height/10)<.05) {
                selected = d.tag;
              }

              //Move tags towards their appropriate spot in the visualization or towards the selection box.
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
            .attr("cy", function(d) { return d.y; })
            //Fade out if not selected.
            .classed("fade", function(d) {
              if (!selected) return false;
              else if (selected == d.tag) return false;
              else return true;
            })

        //Set the X and Y coordinates of each text element equal to the circle that shares its ID.
          text
            //Set the X coordinate to the center of the circle minus the radius.
            .attr("x", function(d) { return svg.select("circle#"+idify(d.tag)).attr('cx')})
            .attr("y", function(d) { return svg.select("circle#"+idify(d.tag)).attr('cy')})
            .attr("width", function(d) { return radiusScale(d.count)*2})
            .classed("fade", function(d) {
              if (!selected) return false;
              else if (selected == d.tag) return false;
              else return true;
            })

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
                  r = radiusScale(d.count) + radiusScale(quad.point.count) + padding;
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

