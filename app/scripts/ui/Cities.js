'use strict';

var React = require('react');

var Cities = React.createClass({
  getInitialState: function() {
    var selected_city = /#\/city\/(.+)/.exec(window.location.hash);
    if (selected_city) {
      return {city:selected_city[1]};
    } else {
      return {};
    }
  },
  render: function() {
    var self=this;
      return (
        <div className="row">
          {this.props.cities.map(function(city) {
            var selected = city.code==self.state.city?'btn-primary':'btn-default';
            return <button id={city.code} onClick={self.handleClick.bind(this,city)} title={city.name} className={selected + ' btn col-md-1'}>{city.code}</button>
          })}
        </div>
    );
  },
  handleClick: function(city) {
    //TODO: Send event to trigger rerendering.
    var cityRegex = /#\/city\/[A-Z]+/;
    if (cityRegex.exec(window.location.hash)) {
      window.location.hash = window.location.hash.replace(cityRegex, "#/city/"+city.code)
    } else {
      window.location.hash="#/city/"+city.code;
    }
    this.setState({city:city.code});
  }
});

Cities.propTypes = { cities: React.PropTypes.array, selected: React.PropTypes.string };
Cities.defaultProps = { 
  cities: [
      {code:'NYC', name:'New York City'},
      {code:'LAX', name:'Los Angeles'},
      {code:'HOU', name:'Houston'},
      {code:'PHL', name:'Philadelphia'},
      {code:'PHX', name:'Pheonix'},
      {code:'SAT', name:'San Antonio'},
      {code:'SAN', name:'San Diego'},
      {code:'CHI', name:'Chicago'},
      {code:'DFW', name:'Dallas'},
      {code:'SJC', name:'San Jose'}
  ],
  selected:''
};



module.exports = Cities;
