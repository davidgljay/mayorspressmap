'use strict';

var React = require('react'),
bubbleMap = require('../vis/main'),
pubsub = require('pubsub-js');

//Ok, so the single selection seems to work. I need to figure out how to retrigger it.

//Probably I want to run a function on componentdidmount and pass it the current window.location.hash.
//I want to rerun that function when a selection is made.
//This seems like an opportune moment to start braking this up.


var BubbleMap = React.createClass({
  getInitialState: function() {
    return null;
  },
  componentDidMount: function() {
    bubbleMap.render();
    pubsub.subscribe('rerender', function() {
      console.log("Rerendering")
      bubbleMap.rerender('', false);
    });
  },
  componentWillUnmount: function() {
    pubsub.unsubscribe('rerender');
  },
  render: function() {
    return (
      <div id="bubbleMap"/>
    );
  }
});

BubbleMap.propTypes = {path: React.PropTypes.string};

module.exports = BubbleMap;

