
var React = window.React = require('react'),
    ReactDOM = require("react-dom"),
    Cities = require("./ui/Cities"),
    Filters = require("./ui/Filters"),
    Results = require("./ui/Results"),
    BubbleMap = require("./ui/BubbleMap"),
    mountNode = document.getElementById("app");

var MayorsBuzz = React.createClass({
  render: function() {
    /*TODO:<BubbleMap data=''/>*/

    return (
      <div id="main">
        <Cities selected='NYC'/>
        <BubbleMap path='/maps/all.json'/>
        <Results />
      </div>
    );
  }
});


ReactDOM.render(<MayorsBuzz />, mountNode);

