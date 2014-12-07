module.exports = function() {
	var request = require('request'),
		cheerio = require('cheerio');

	var XE_URL = 'http://www.xe.com/currencyconverter/convert/?Amount=1';

	return {
		fetch: function fetch(from, to, callback) {
			request(XE_URL + '&From=' + from + '&To=' + to, function(error, response, body) {
				if (!error && (response.statusCode === 200)) {
					var $ = cheerio.load(body),
						rate_string = $('tr.uccRes').find('.rightCol').text(),
						regex_match = rate_string.match(/[0-9]+.[0-9]{2}/);

					if (regex_match && regex_match.length) {
						callback(regex_match[0]);
						return;
					}
				}
				callback(false);
			});
		}
	};
}();
