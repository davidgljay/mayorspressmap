
var React = window.React = require('react'),
    ReactDom = require("react-dom"),
    Cities = require("./ui/Cities"),
    Filters = require("./ui/Filters"),
    Results = require("./ui/Results"),
    BubbleMap = require("./ui/BubbleMap"),
        mountNode = document.getElementById("app"),
    ReactRouter = require('react-router'),
    Router = ReactRouter.Router,
    hashHistory = ReactRouter.hashHistory,
    Route = ReactRouter.Route;

var MayorsBuzz = React.createClass({
  render: function() {
    /*TODO:<BubbleMap data=''/>*/
    console.log(this.props.params)

    return (
      <div id="main">
        <Cities selected='NYC'/>
        <BubbleMap path='/maps/all.json'/>
        <Results />
      </div>
    );
  }
});

ReactDom.render((
  <Router history={hashHistory}>
    <Route path="/" component={MayorsBuzz}/>
    <Route path="/tag/:tagName" component={MayorsBuzz}/>
    <Route path="/city/:cityName" component={MayorsBuzz}/>
    <Route path="/city/:cityName/:tagName" component={MayorsBuzz}/>
  </Router>
), mountNode)



