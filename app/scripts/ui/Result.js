var dateFormat = require('dateformat');

var Result = (props) => (
	<div className="row result">
		<div className="col-md-2 header">
			<p><b>{dateFormat(props.date,"mmmm dS, yyyy")}</b></p>
			<p>{props.city}</p>
		</div>
		<div className="col-md-8 body">
			<h3>{props.title}</h3>
			<span className="label label-pill label-default person">Person 1</span>
		</div>
	</div>
  );

Result.propTypes = { title: React.PropTypes.string};
Result.defaultProps = { 
   title:'Result',
   date:new Date(),
   city:'New York City'
};

module.exports=Result;
