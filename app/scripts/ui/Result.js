var Result = (props) => (
	<li className="list-group-item">{props.title}</li>
  );

Result.propTypes = { title: React.PropTypes.map};
Result.defaultProps = { 
   title:'Result'
};

module.exports=Result;
