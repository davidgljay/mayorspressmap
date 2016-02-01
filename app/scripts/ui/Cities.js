'use strict';

var React = require('react');

var Cities = (props) => (
  <div className="row">
    {props.cities.map(function(city) {
      var selected = city.code==props.selected?'btn-primary':'btn-default';
      return <button key={city.code} title={city.name} className={selected + ' btn col-md-1'}>{city.code}</button>
    })}
  </div>
  );

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
