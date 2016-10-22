$(function () {

	var _gauge_defaults = {
		circleColor: "#886EB1",
		textColor: "#30C3E6",
		waveTextColor: "#ccc",
		waveColor: "#886EB1",
		circleThickness: 0.02,
		circleFillGap: 0.02,
		textVertPosition: 0.5,
		waveAnimateTime: 1000,
		minValue: 0,
		maxValue: 100,
	}

	var gaugeConfig = $.extend({}, liquidFillGaugeDefaultSettings(), _gauge_defaults)

	var fundPlain = loadLiquidFillGauge('plain-fund', 1, gaugeConfig)
	var fundIndex = loadLiquidFillGauge('index-fund', 1, gaugeConfig)

	var calc = $('.calculator')

	calc.on('calculator.update', function (ignore, funds) {
		var prec = Math.round(funds.plain.fees / funds.plain.gross * 100)
		fundPlain.update(prec, funds.plain.pension)

		var prec = Math.round(funds.index.fees / funds.index.gross * 100)
		fundIndex.update(prec, funds.index.pension)
	})

	new PensionCalculator(calc)

})