const qs = require('qs');
const request = require('./request');
const _ = require('lodash');

const HOST = 'http://localhost:9002';
const ENDPOINT = {
	STATS: 'getStats',
};

module.exports = {
	getStats: (isin) => {
		const fullUrl = HOST + '/' + ENDPOINT.STATS + '?' + qs.stringify({ isin });

		return request(fullUrl)
			.then(parseBody)
			.then(function (body) {
				if (_.isObject(body)) {
					return body;
				}
				throwError(body);
			});
	},
};

function parseBody(resp) {
	var body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
	if (body.error) {
		var error = new Error(body.message);
		error.description = body.error;
		// console.log(body);
		throw error;
	}
	if (_.isArray(body.success) && body.success.length === 1) body.success = unArray(body.success);
	if (_.isArray(body.message) && body.message.length === 1) body.message = unArray(body.message);

	if (body.success === false) {
		throw new Error(unArray(body.message));
	}
	return body;
}

function throwError(body) {
	throw new Error('Server error: ' + JSON.stringify(body));
}

function unArray(value) {
	if (_.isArray(value) && value.length === 1) {
		return value[0];
	}
	return value;
}
