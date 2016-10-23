const express = require('express');
const router = express.Router();
const api = require('../lib/dataApi');
const _ = require('lodash');

router.get('/getStats', function (req, res, next) {
	const fee = parseFloat(req.query.fee) || undefined;
	if (req.query.isin) {
		return api.getStats(req.query.isin, fee)
			.then(result => res.send(result))
			.catch(next);
	}

	throw new Error('Required parameter missing: "isin".');
});

router.get('/getComparison', function (req, res, next) {
	const fee = parseFloat(req.query.fee) || undefined;
	let indexRatio = parseFloat(req.query.indexRatio);
	if (!_.isFinite(indexRatio)) indexRatio = 0.5;

	if (req.query.isin) {
		return api.getComparison(req.query.isin, indexRatio, fee)
			.then(result => res.send(result))
			.catch(next);
	}

	throw new Error('Required parameter missing: "isin".');
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
