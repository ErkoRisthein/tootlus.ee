$(function () {

	$('[data-toggle="popover"]').popover()

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
		maxValue: 100,
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

			var ee = d3.locale ({
			  "decimal": ",",
			  "thousands": " ",
			  "grouping": [3],
			  "currency": ["", "€"],
			  "dateTime": "%a %b %e %X %Y",
			  "date": "%m/%d/%Y",
			  "time": "%H:%M:%S",
			  "periods": ["AM", "PM"],
			  "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			  "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			  "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			  "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
			})

			chart.xAxis.axisLabel('Aasta').tickFormat(d3.format(''))

			chart.yAxis.axisLabel('').tickFormat(ee.numberFormat("$,f"))

			nv.utils.windowResize(chart.update)

			nv.addGraph(chart)
		}

		var data = [{
			values: graph.plain,
			key: graph.plain.name,
			color: '#ff7f0e'
		}, {
			values: graph.index,
			key: 'Maailmaturu keskmine',
			color: '#2ca02c'
		}]

		d3.select('#chart svg').datum(data).transition().duration(500).call(chart)
	})

	calc.on('calculator.comparison', function (ignore, data) {
		// Tootlus
		data1[0].name = Math.round(data.plain.profitPerCf1000[0]) + '€'
		data2[0].name = Math.round(data.index.profitPerCf1000[0]) + '€'

		// Teenustasu
		data1[1].name = Math.round(data.plain.feePerCf1000[0]) + '€'
		data2[1].name = Math.round(data.index.feePerCf1000[0]) + '€'

		// Tootlus määr
		data1[2].name = (data.plain.r[0] * 100).toFixed(2) + '%'
		data2[2].name = (data.index.r[0] * 100).toFixed(2) + '%'

		d3.select('#graphDiv').html('')
		d3.select('#graphDiv2').html('')

		var rVals = rCalculation(data1);
		drawGraph('#graphDiv', 600, 500, data1, rVals);

		var rVals = rCalculation(data2);
		drawGraph('#graphDiv2', 600, 500, data2, rVals);
	})

	new PensionCalculator(calc)

	function format(n) {
		return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	}

	// calculate r of each item so that area scales to value
	function rCalculation (data) {
		var i, rVals = [];

		for (i = 0; i < data.length; i += 1) {
			rVals.push(Math.sqrt(data[i].value / Math.PI)*2);
		}

		return rVals;
	}

	function drawGraph (el, width, height, nodes, rVals) {
		//create chart
		var chart = d3.select(el).append('svg')
			.attr('width', width)
			.attr('height', height);

		//create force layout
		var force = d3.layout.force()
			.nodes(nodes)
			.size([width, height])
			.linkDistance(10)
			.charge(function (d, i) {
				return rVals[i] * (-15);
			})
			.on("tick", tick)
			.start();

		var node = chart.selectAll(".node")
			.data(force.nodes())
			.attr("class", "node")
			.enter().append("g")
			.call(force.drag);

		node.append("circle")
			.attr("r", function (d, i) {
				return rVals[i];
			})
			.style("fill", function (d) {
				return d.fill;
			});

		node.append("text")
			.text(function (d) {
				return d.name
			})
			.attr({
			  "alignment-baseline": "middle",
			  "text-anchor": "middle"
			})
			.style("fill", "white")
			.style("font-size","34px");


		function tick() {
			node.attr("transform", function (d) {
				return "translate(" + d.x + "," + d.y + ")";
			});
		}
	}

	var data1 = [
		{ value: 4000, name: "600€",title:"tootlus", fill: "#68c59f"},
		{ value: 4000, name: "50€", title:"teenustasu", fill: "#9064b2"},
		{ value: 6000, name: "4%", title:"tootlus määr", fill: "#2fc3e6"},
	];

	var data2 = [
		{value: 13000, name: "500€",title:"tootlus ", fill: "#68c59f"},
		{value: 2000, name: "25€",title:"teenustasu", fill: "#9064b2"},
		{value: 8000, name: "2%", title:"tootlus määr",fill: "#2fc3e6"},
	];

})