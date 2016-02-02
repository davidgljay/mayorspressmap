'use strict';

var React = require('react'),
d3 = require('d3');

var BubbleMap = React.createClass({
  getInitialState: function() {
    return {path:'/maps/all.json'};
  },
  componentDidMount: function(props) {
  	var width=480,
	height=340;

	//TODO: Add scales

	//Create the layout
	var svg = d3.select('#bubbleMap').append('svg')
		.attr('width', width)
		.attr('height',height);

	//Add "tag" objects for each datapoint.
	svg.selectAll("circle").data([{stuff:'things'}]).enter().append("circle")
		.text(function(d){return d.stuff})
		.attr('cx',100)
		.attr('cy',200)
    .attr('r',10);
  },
  componentWillUnmount: function() {
  },
  render: function() {
    return (
      <div id="bubbleMap"/>
    );
  }
});

BubbleMap.propTypes = {path: React.PropTypes.string};

module.exports = BubbleMap;

