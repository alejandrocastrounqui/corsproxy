var http = require("http");
var url = require("url");

var external_host = 'wallet1.xapo.com';

function configure_cors(response) {
  cors_headers = {
    "Access-Control-Allow-Origin" : "*",
    "Access-Control-Allow-Methods" : "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers" : "x-requested-with, Authorization, Content-Type, accept"
  };
  response.writeHead(200, cors_headers);
}

function option_handler(response){
  console.log("preflaf response");
  configure_cors(response);
  response.end();
}

function handle(client_response) {
  configure_cors(client_response);
  return function(external_response) {
    console.log('external_response');
    external_response.on('data', function(external_response_content) {
      client_response.write(external_response_content);
    });
    external_response.on('end', function(external_response_content) {
      client_response.end();
    });
  };
}

function logerror(error) {
  console.log("Got error: " + error.message);
}

http.createServer(function(request, response) {
  if (request.method == 'OPTIONS') {
    option_handler(response);
  }
  else {
    //console.log("manejando" + request.url);
    options = {
      //method: 'GET',
      host: external_host,
      path: request.url,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    };
    
    query = http.get(options, handle(response));
    query.on('error', logerror);
  }

}).listen(9002);
