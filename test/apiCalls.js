const api = require('../lib/dataApi.js');
const expect = require('must');

api.getStats('EE3600019766')
	.tap(console.log)
	.then((result) => {
		expect(result).to.have.property('r');
		expect(result.r).to.be.array();
		expect(result.r).to.have.length(1);
		expect(result.r[0]).to.be.between(0, 1);
	});
