$(function () {

	var _gauge_defaults = {
		circleColor: "#886EB1",
		textColor: "#30C3E6",
		waveTextColor: "#ccc",
		waveColor: "#886EB1",
		circleThickness: 5,
		circleFillGap: 5,
		textVertPosition: 0.5,
		waveAnimateTime: 1000,
		minValue: 0,
		maxValue: 100,
	}

	var gaugeConfig = $.extend({}, liquidFillGaugeDefaultSettings(), _gauge_defaults)

	var fundPlain = loadLiquidFillGauge('plain-fund', 1, gaugeConfig)
	var fundIndex = loadLiquidFillGauge('index-fund', 1, gaugeConfig)

	var chart = null
	var calc = $('.calculator')

	calc.on('calculator.update', function (ignore, funds) {
		var prec = Math.round(funds.plain.fees / funds.plain.gross * 100)
		fundPlain.update(prec, funds.plain.pension)

		var prec = Math.round(funds.index.fees / funds.index.gross * 100)
		fundIndex.update(prec, funds.index.pension)

		$('.fund-plain-fees').text( funds.plain.fees + '€')
		$('.fund-index-fees').text( funds.index.fees + '€')
		$('.selected-fund-name').text(funds.plain.name)
	})

	calc.on('calculator.graph', function (ignore, graph) {
		if (!chart) {
			chart = nv.models.lineChart()

			chart.xAxis.axisLabel('').tickFormat(d3.format(''))

			chart.yAxis.axisLabel('Pensionifondi suurus (€)').tickFormat(d3.format('.02f'))

			nv.utils.windowResize(chart.update)

			nv.addGraph(chart)
		}

		var data = [{
			values: graph.plain,
			key: graph.plain.name,
			color: '#ff7f0e'
		}, {
			values: graph.index,
			key: 'Maailma turu keskmine',
			color: '#2ca02c'
		}]

		d3.select('#chart svg').datum(data).transition().duration(500).call(chart)
	})

	new PensionCalculator(calc)

	var data = function() {
		var sin = [], cos = []

		for (var i = 0; i < 100; i++) {
			sin.push({x: i, y: Math.sin(i/10)})
			cos.push({x: i, y: .5 * Math.cos(i/10)})
		}

		return [{
			values: [{ x: 2016, y: 6800 }, { x: 2017, y: 7000 }],
			key: 'LHV',
			color: '#ff7f0e'
		}, {
			values: [{ x: 2016, y: 6900 }, { x: 2017, y: 7200 }],
			key: 'Index',
			color: '#2ca02c'
		}]
	}


})