'use strict';

var React = require('react');

var Cities = (props) => (
  <div className="row">
    {props.cities.map(function(city) {
      var selected = city.code==props.selected?'selected':'';
      return <button title={city.name} className={selected + ' btn btn-default col-md-1'}>{city.code}</button>
    })}
  </div>
  );

Cities.propTypes = { cities: React.PropTypes.array, selected: React.PropTypes.string };
Cities.defaultProps = { 
  cities: [
      {code:'NYC', name:'New York City'},
      {code:'LAX', name:'Los Angeles'},
      {code:'HOU', name:'Houston'},
      {code:'CHI', name:'Chicago'},
      {code:'PHL', name:'Philadelphia'},
      {code:'SAN', name:'San Antonio'},
      {code:'PHX', name:'Pheonix'},
      {code:'DFW', name:'Dallas'},
      {code:'SJC', name:'San Jose'}
  ],
  selected:''
};

module.exports = Cities;
