var Filters = (props) => (
  <div id="filters">
	<h3>{props.filter}
		<button type="button" className="close" aria-label="Close">
			<span aria-hidden="true">&times;</span>
		</button>
	</h3>
  </div>
  );

Filters.propTypes = { filter: React.PropTypes.string};
Filters.defaultProps = { 
   filter:'water'
};

module.exports=Filters;
