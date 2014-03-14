var request = require('request'),
	_ = require('underscore');
var ES_host = 'http://10.88.138.64:9200';

function getTable(index, type, res){


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
 res.send(results);
		};
    	request.get(ops, callback);


}

var routes = [
{
path:'/api/alarms/list',
httpMethod: 'POST',
middleware: [function(req, res) {

   getTable('alarms', 'raw_alarms', res);

}]
},
{
path:'/api/incidents/list',
httpMethod: 'POST',
middleware: [function(req, res) {

   getTable('ticket', 'incident', res);

}]
},
{
path:'/api/incident/alarms',
httpMethod: 'POST',
middleware: [function(req, res) {
var incidentID = req.body.incidentID;

   var payload = '{"query": {"bool": {"must": [{"match": {"Incident Num": "'+incidentID+'"}}]}}}';
   console.log(payload);
   var es_path = ES_host+'/ticket/alarms/_search';
   var ops = {
 url:es_path,
 payload:payload,
 json:true
   };
		var callback = function(error, response, body){
			var results = _.pluck(body.hits.hits, '_source');
 res.send(results);
		};
    	request.get(ops, callback);

}]
},
{
path:'/api/ticket/alarm_codes',
httpMethod:'GET',
middleware:[function(req,res){
    var payload = '{"query":{"match_all":{}}}';
    var es_path = ES_host+'/ticket/alarm_codes/_search';
    var ops= {
    url: es_path,
    payload : payload,
    json    : true
    };
    var callback = function(error,response,body){
    var results = _.pluck(body.hits.hits,'_source');
    res.send(results);
    };
request.get(ops, callback);
}]
},
{
path:'/api/checkName/:name',
httpMethod:'GET',
middleware:[function(req,res){
var name = unescape(req.params.name);

    var payload = '{"query": {"match_phrase": {"alarmcode_name": "'+name+'"}}}';
    var es_path = ES_host+'/ticket/alarm_codes/_search?search_type=count';
    var ops= {
    url: es_path,
    payload : payload,
    json    : true
    };
    console.log(ops);
    var callback = function(error,response,body){
console.log(body.hits.total);
    if (body.hits.total) {
      res.json({'status': 200, 'data':'match'});
  	} else {
      res.json({'status': 200, 'data':'ok'});
    }


    };
    
request.get(ops, callback);

}]
},
{
path:'/api/alarm/submit',
httpMethod:'POST',
middleware:[function(req,res){
var pattern = [{"raw":req.body.pattern_matcher}];
var rootCause = (!req.body.root_cause || req.body.root_cause.length < 1) ? 'na' : req.body.root_cause;
	var alarm_code_record = {
	    "protocol":req.body.protocol,
		"alarmcode_name":req.body.alarmcode_name,
		"classification":req.body.classification,
		"root_cause":rootCause,
		"remediation":req.body.remediation,
		"pattern_matcher":pattern
		}

    var es_path = ES_host+'/ticket/alarm_codes';
	var requestOptions = {
		url:es_path,
		body:alarm_code_record,
		json:true
	};
console.log(requestOptions);
	request.post(requestOptions, callback);
		res.send('ok');

	function callback(error, response, body){
		res.send('ok');
	}

}]
},
{
path:'/api/alarm/attributes',
httpMethod:'POST',
middleware:[function(req,res){
   console.log("Incident id" + req.body);
    var payload = '{}';
    var es_path = ES_host+'/alarms/raw_alarms/'+req.body.id;
    var ops= {
    url: es_path,
    payload : payload,
    json    : true
    };
    var callback = function(error,response,body){
    var results = body;
    res.send(results);
    };
request.get(ops, callback);
}]
}
];

module.exports = function(app) {

    _.each(routes, function(route) {
   var args = _.flatten([route.path, route.middleware]);

   switch(route.httpMethod.toUpperCase()) {
 case 'GET':
app.get.apply(app, args);
break;
 case 'POST':
app.post.apply(app, args);
break;
 case 'PUT':
app.put.apply(app, args);
break;
 case 'DELETE':
app.delete.apply(app, args);
break;
 default:
throw new Error('Invalid HTTP method specified for route ' + route.path);
   }
    });
};