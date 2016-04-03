var Result = require('./Result');

var Results = (props) => (
  <div>
    <div id="result_metadata">
      Stuff and things
    </div>
    <div id="results">
    		{props.data.map(function(item) {
    			return <Result key={item.title} title={item.title}/>
    		})}
    </div>
  </div>
  );

Results.propTypes = { data: React.PropTypes.array};
Results.defaultProps = { 

   data:[
   	{
      title:'Result',
      date: new Date(),
      city: 'New York'
  },
   	{
      title:'Another result',
      date: new Date(),
      city: 'Los Angeles'
    }
   ]
};

module.exports=Results;
