var fivebeans = require('fivebeans'),
	client = new fivebeans.client('challenge.aftership.net', 11300),
	payload = JSON.stringify( {
		from : 'HKD',
		to : 'USD'
	});

var TUBE_NAME = 'hkkenneth';

client
	.on('connect', function() {
		client.use(TUBE_NAME, function(err, tubename) {
			if (err) {
				console.log(err);
				process.exit(1);
			} else {
				client.put(1, 0, 180, payload, function(err, jobid) {
					if (err) {
						console.log(err);
						process.exit(1);
					} else {
						console.log('Job ID is ' + jobid);
						console.log('Stopping');
						process.exit(0);
					}
				});
			}
		});
	})
	.on('error', function(err)
	{
		console.log(err);
		process.exit(1);
	})
	.on('close', function()
	{
		console.log('Client closed');
		process.exit(1);
	})
	.connect();
	
