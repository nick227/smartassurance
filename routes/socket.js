var request = require('request'),
	_ = require('underscore');
var ES_host = 'http://10.88.138.64:9200';

module.exports = function (socket) {

/***********************************************************************/
socket.alarms = {};
socket.alarms.runningCount = 0;
socket.ticket = {};
socket.ticket.runningCount = 0;

function countCheck(index, type){

        var payload = '{"size": 10000 }';
        var es_path = ES_host+'/'+index+'/'+type+'/_count';
        var ops = {
            url:es_path,
            payload:'',
            json:true
        };
		var callback = function(error, response, body){

			currentCount = body.count;
			if(currentCount != socket[index].runningCount){
			    socket[index].runningCount = currentCount;
				emitData(index, type);
			}

		}//end count callback
    	request.get(ops, callback);

}
function emitData(index, type){

        var payload = '{"query": {"match_all": {}}}';
        var es_path = ES_host+'/'+index+'/'+type+'/_search';
        var ops = {
            url:es_path,
            payload:payload,
            json:true
        };
		var callback = function(error, response, body){
			var results = _.map(body.hits.hits, function(hit){
				var res = {};
				res.id = hit._id;
				if(index=='alarms'){
				res.fields = hit._source;
				}
				if(index == 'ticket'){
				res.web_incident_id = hit._source.web_incident_id; 
				res.slmlookuptblkeyword = hit._source.slmlookuptblkeyword;
				res.reported_date = hit._source.reported_date;
				res.company = hit._source.Company;
				res.priority = hit._source.priority;
				res.city = hit._source.city;
				res.description = hit._source.description;
				}

				return res;
			});
			
		    socket.emit('send:'+index, results);		
		};
    	request.get(ops, callback);


};


setInterval(function () {
	countCheck('alarms', 'raw_alarms');
	countCheck('ticket', 'incident');
  }, 1000);
};
