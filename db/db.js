const mongoose = require('mongoose');
const pass = process.env.mongo_pass
var db = mongoose.connection;
const options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } } };
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('connected to mongo');	
});

module.exports = mongoose.connect(`mongodb://mo1306_slack:${pass}@mongo9.mydevil.net/mo1306_slack`, options);