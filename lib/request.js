var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

if (!request.getAsync) {
	Promise.promisifyAll(request);
}

module.exports = request.getAsync;
