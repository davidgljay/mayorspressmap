var Result = require('./Result');

var Results = (props) => (
  <div id="Results">
  	<ul className="list-group">
  		{props.data.map(function(item) {
  			return <Result key={item.title} title={item.title}/>
  		})}
  	</ul>
  </div>
  );

Results.propTypes = { data: React.PropTypes.array};
Results.defaultProps = { 
   data:[
   	{title:'Result'},
   	{title:'Another result'}
   ]
};

module.exports=Results;
