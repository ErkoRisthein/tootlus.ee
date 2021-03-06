const express = require('express');
const router = express.Router();
const api = require('../lib/dataApi');
const _ = require('lodash');

const funds = require('../public/funds');

const getFundDetails = _.memoize(isin => {
	return _.find(funds, { isin: isin });
});

router.get('/getStats', function (req, res, next) {
	if (!req.query.isin) {
		throw new Error('Required parameter missing: "isin".');
	}

	const fund = getFundDetails(req.query.isin);

	if (!fund) {
		throw new Error('Unknown fund: ' + fund + '.');
	}

	const fee = parseFloat(req.query.fee) || (fund.fee / 100);

	return api.getStats(req.query.isin, fee)
		.then(result => res.send(result))
		.catch(next);
});

router.get('/getComparison', function (req, res, next) {
	if (!req.query.isin) {
		throw new Error('Required parameter missing: "isin".');
	}

	const fee = parseFloat(req.query.fee) || 0.003;
	let indexRatio = parseFloat(req.query.indexRatio);
	if (!_.isFinite(indexRatio)) indexRatio = 0.5;

	return api.getComparison(req.query.isin, indexRatio, fee)
		.then(result => res.send(result))
		.catch(next);
});

router.use('/', (err, req, res, next) => {
	console.error(err);
	console.error(err.stack);

	// recklessly show all errors
	res.status(err.status || 500);
	res.send({
		success: false,
		message: err.message,
	});
});

module.exports = router;
