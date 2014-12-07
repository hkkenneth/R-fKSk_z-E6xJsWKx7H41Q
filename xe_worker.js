var fivebeans = require('fivebeans'),
	fetcher = require('./xe_fetcher.js'),
	model = require('./xe_model.js'),
	client = new fivebeans.client('challenge.aftership.net', 11300),
	counter = 0;

var TUBE_NAME = 'hkkenneth',
	DELAY_SUCCESS = 60,
	DELAY_FAILURE = 3,
	TIME_TO_TRY = 10;

var exitIfError = function(err) {
	if (err) {
		console.log(err);
		process.exit(1);
	}
};

var modelCallback = function(jobid, result) {
    var delay = (result === false) ? DELAY_FAILURE : DELAY_SUCCESS;
	console.log('releasing ' + jobid + ' with delay ' + delay);
	client.release(jobid, 1, delay, function(err) {
		exitIfError(err);
		console.log('released ' + jobid);
		reserveWrapper();
	});
};


var fetcherCallback = function(from, to, jobid, result) {
	if (result === false) {
		modelCallback(jobid, result);
	} else {
		var modelCallbackWrapper = function(result) {
			modelCallback(jobid, result);
		};
		console.log('saving to model');
		model.save(from, to, result, modelCallbackWrapper);
	}
};

var reserveWrapper = function() {
	counter++;
	console.log('waiting');
	client.reserve_with_timeout(180, function(err, jobid, payload) {
		exitIfError(err);
		console.log('reserved ' + jobid);
		if (counter > TIME_TO_TRY) {
			console.log('tried ' + TIME_TO_TRY + ' times, bye.');
			client.destroy(jobid, function(err) {
				exitIfError(err);
				console.log('Job ' + jobid + ' deleted');
				process.exit(0);
			});
		} else {
			var payload_obj = JSON.parse(payload.toString('utf-8'));
        	var fetcherCallbackWrapper = function (result) {
				fetcherCallback(payload_obj.from, payload_obj.to, jobid, result);
			};
			fetcher.fetch(payload_obj.from, payload_obj.to, fetcherCallbackWrapper);
		}
	});
};

client
	.on('connect', function() {
		client.watch(TUBE_NAME, function(err, num_watched) {
			exitIfError(err);
			reserveWrapper();
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

