module.exports = function() {
	var MongoClient = require('mongodb').MongoClient;

	var MONGO_URL = 'mongodb://exchange:12345678@ds053380.mongolab.com:53380/exchange';

	return {
		save: function save(from, to, rate, callback) {
			MongoClient.connect(MONGO_URL, function(err, db) {
				if (err) {
					console.log('mongo connection error');
					throw err;
				}
				var collection = db.collection('exchange_rate');
				var payload = {
					"from": from,
					"to": to,
					"created_at": new Date(Date.now()),
					"rate": rate
				};
				collection.insert(payload, function(err, docs) {
					if (err) {
						console.log('mongo connection error');
						throw err;
					}
					db.close();
					callback(docs.length > 0);
				});
			});
		}
	};
}();
