$(function () {

	var _gauge_defaults = {
		circleColor: "#886EB1",
		textColor: "#30C3E6",
		waveTextColor: "#a2f1ff",
		waveColor: "#886EB1",
		circleThickness: 5,
		circleFillGap: 5,
		textVertPosition: 0.5,
		waveAnimateTime: 1000,
		minValue: 0,
		maxValue: 1000,
	}

	var gaugeConfig = $.extend({}, liquidFillGaugeDefaultSettings(), _gauge_defaults)

	var fundPlain = loadLiquidFillGauge('plain-fund', 1, gaugeConfig)
	var fundIndex = loadLiquidFillGauge('index-fund', 1, gaugeConfig)

	var chart = null
	var calc = $('.calculator')

	calc.on('calculator.update', function (ignore, funds) {
		var prec = Math.round(funds.plain.net / funds.plain.gross * 100)
		fundPlain.update(prec, funds.plain.pension)

		var prec = Math.round(funds.index.net / funds.index.gross * 100)
		fundIndex.update(prec, funds.index.pension)

		$('.fund-plain-fees').text( format(funds.plain.fees, ' ') + '€')
		$('.fund-index-fees').text( format(funds.index.fees, ' ') + '€')
		$('.selected-fund-name').text(funds.plain.name)
	})

	calc.on('calculator.graph', function (ignore, graph) {
		if (!chart) {
			chart = nv.models.lineChart()

			chart.xAxis.axisLabel('').tickFormat(d3.format(''))

			chart.yAxis.axisLabel('').tickFormat(d3.format('f.€'))

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

	calc.on('calculator.comparison', function (ignore, data) {
		// Tootlus
		data1[0].name = Math.round(data.plain.profitPerCf1000[0]) + '€'
		//data1[0].value = getSize(data.plain.profitPerCf1000[0])
		data2[0].name = Math.round(data.index.profitPerCf1000[0]) + '€'

		// Teenustasu
		data1[1].name = Math.round(data.plain.feePerCf1000[0]) + '€'
		data2[1].name = Math.round(data.index.feePerCf1000[0]) + '€'

		// Tootlus määr
		data1[2].name = (data.plain.r[0] * 100).toFixed(2) + '%'
		data2[2].name = (data.index.r[0] * 100).toFixed(2) + '%'

		/*
		data1 = [
			{value: 13000, name: "600€",title:"tootlus", fill: "#68c59f"},
			{value: 4000, name: "50€", title:"teenustasu", fill: "#9064b2"},
			{value: 8000, name: "4%", title:"tootlus määr", fill: "#2fc3e6"},
		],
        data2 = [
            {value: 4000, name: "500€",title:"tootlus ", fill: "#68c59f"},
            {value: 2000, name: "25€",title:"teenustasu", fill: "#9064b2"},
            {value: 6000, name: "2%", title:"tootlus määr",fill: "#2fc3e6"},
        ],
        */

        d3.select('#graphDiv').html('')

		rCalculation1();
		drawGraph1();
		rCalculation2();
		drawGraph2();
	})

	new PensionCalculator(calc)

	function format(n) {
    	return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	}
})