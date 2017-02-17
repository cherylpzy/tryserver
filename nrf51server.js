var id=["98:4F:EE:03:2B:B0", "4C:21:D0:2E:EA:7D"];
var mysql = require('mysql');
var request = require('request');
var UARTrate = require('socket.io')(3002);
var rate = require('socket.io')(8080);
var io = require('socket.io')(30000);
var getType = require('get-object-type');

//Get 'Distance' from Azure Database
io.on('connection', function (socket) {
	console.log('A client is connected!');
	setInterval(periodicActivity,5000); //call the indicated function after 1 second (1000 milliseconds)
	
	function periodicActivity()
	{
		request({
		    url: "http://icareperkeso.azurewebsites.net/display.php",
		    method: "POST",
		    json: true,   // <--Very important!!!
		    body: {device: id}
		}, function (error, response, body){
		    //console.log(response.body);
			socket.emit('reply', response.body);
		});
	}
});

//Get 'Heart Rate' from Client
UARTrate.on('connection', function(socket) {
	console.log('Client Connected!');

	socket.on('Message', function(data) {
		console.log('Server receive: '+data);
		//console.log('Type: ' +getType(data));
		rate.emit('H7', data);
		insert_biosignal(data)
	});
	
	socket.on('Disconnect', function() {
		console.log("Client Disconnected.");
	
	});
});

//Local database
var perkeso = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'patientdata'
});

perkeso.connect(function(err){
  if(err){
    console.log('Database connection error.');
  }
  else{
    console.log('Database connection successful.');
  }
});

function insert_biosignal(hr)
{
	
	var record= { Name: 'Jara', Heart_Rate: hr, Distance: '1.15' };

	perkeso.query('INSERT INTO users SET ?', record, function(err,res){
		if(err) throw err;
		console.log('Total data logs:', res.insertId);
	});

	//perkeso.end(function(err) {
	// Function to close database connection
	//});
}