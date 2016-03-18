
var React = window.React = require('react'),
    ReactDom = require("react-dom"),
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
        <BubbleMap path='/maps/all.json'/>
        <Cities />
        <Results />
      </div>
    );
  }
});

ReactDom.render(<MayorsBuzz/>, mountNode)



