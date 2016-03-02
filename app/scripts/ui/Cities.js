'use strict';

var React = require('react'),
pubsub = require('pubsub-js')

var Cities = React.createClass({
  getInitialState: function() {
    var selected_city = /\/city\/([a-z]+)/.exec(window.location.hash);
    if (selected_city) {
      return {city:selected_city[1].toUpperCase()};
    } else {
      return {city:'ALL'};
    }
  },
  render: function() {
    var self=this;
      return (
        <div className="row">
          {this.props.cities.map(function(city) {
            var selected = city.code==self.state.city?'btn-primary':'btn-default';
            return <button id={city.code} key={city.code} onClick={self.handleClick.bind(this,city)} title={city.name} className={selected + ' btn col-md-1'}>{city.code}</button>
          })}
        </div>
    );
  },
  handleClick: function(city) {
    var cityRegex = /#\/city\/[a-z^\/]+/;
    console.log(city);
    if (city.code=="ALL") {
      window.location.hash = window.location.hash.replace(/\/city\/[a-z]+/,'');
    } else if (cityRegex.exec(window.location.hash)) {
      window.location.hash = window.location.hash.replace(cityRegex, "#/city/"+city.code.toLowerCase())
    } else if (/\/tag\//.exec(window.location.hash)){
      window.location.hash=window.location.hash.replace('#',"#/city/"+city.code.toLowerCase());
    } else {
      window.location.hash="#/city/"+city.code.toLowerCase();
    }
    pubsub.publish('rerender','');
    this.setState({city:city.code});
  }
});

Cities.propTypes = { cities: React.PropTypes.array, selected: React.PropTypes.string };
Cities.defaultProps = { 
  cities: [
      {code:'ALL', name:'Top 10 Cities'},
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
