var http = require("http");
var url = require("url");

var configuration = {
  host: 'wallet1.xapo.com'
};

function configure_cors(response) {
  cors_headers = {
    "Access-Control-Allow-Origin" : "*",
    "Access-Control-Allow-Methods" : "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers" : "x-requested-with, Authorization, Content-Type, accept"
  };
  response.writeHead(200, cors_headers);
}

function handle_options(response){
  configure_cors(response);
  response.end();
}

function stream(input, output){
  input.on('data', function(chunk) {
    output.write(chunk);
  });
  input.on('end', function() {
    output.end();
  });
}

function handle_external(client) {
  configure_cors(client.response);
  return function(external_response) {
    return stream(external_response, client.response);
  };
}

function logerror(error) {
  console.log("Got error: " + error.message);
}

function client_listener(client) {
  if (client.request.method == 'OPTIONS') {
    handle_options(client.response);
  }
  else {
    options = {
      method: client.request.method,
      host:   configuration.host,
      path:   client.request.url,
      //port:   '80',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    };
    
    query = http.request(options, handle_external(client));
    query.on('error', logerror);
    query.end();
  }
}

function wrapp_client(handler){
  return function(request, response){
    var client = {
      request: request,
      response: response
    };
    handler(client);
  };
}

http.createServer(wrapp_client(client_listener)).listen(9002);



