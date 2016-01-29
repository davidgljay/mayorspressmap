
var React = window.React = require('react'),
    ReactDOM = require("react-dom"),
    Cities = require("./ui/Cities"),
    Filters = require("./ui/Filters"),
    Results = require("./ui/Results"),
    mountNode = document.getElementById("app");

var TodoList = React.createClass({
  render: function() {
    var createItem = function(itemText) {
      return <li>{itemText}</li>;
    };
    return <ul>{this.props.items.map(createItem)}</ul>;
  }
});
var TodoApp = React.createClass({
  getInitialState: function() {
    return {items: [], text: ''};
  },
  onChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var nextItems = this.state.items.concat([this.state.text]);
    var nextText = '';
    this.setState({items: nextItems, text: nextText});
  },
  render: function() {
    /*TODO:<BubbleMap data=''/>*/

    return (
      <div id="main">
        <Cities selected='NYC'/>
        <Filters filter='all'/>
        <Results />
      </div>
    );
  }
});


ReactDOM.render(<TodoApp />, mountNode);

