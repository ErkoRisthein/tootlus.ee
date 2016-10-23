var PensionCalculator = (function (scope) {
	if (!scope) {
		return console && console.error('PensionCalculator needs scope')
	}

	if (!(scope instanceof jQuery)) {
		scope = $(scope)
	}

	var opts = {
		age_started: 23,
		retire: 65,
		contrib: 0.06,
		income_increase: 0.03,
		pension_percentage: 0.0045,
		index_fund_fee: 0.003
	}

	var funds

	var age, income
	var fund, fund_stats, index_stats

	var fund_value = null

	$.getJSON('/funds.json', function (data) {
		$.each(data, function (index, f) {
			data[index].fee = f.fee / 100
		})

		funds = data

		init()
	})

	function calculate () {
		var result = {
			plain: {},
			index: {},
		}

		var years_contributed = age - opts.age_started

		var past_income = income / Math.pow((1 + opts.income_increase), years_contributed)

		var annual_contrib = past_income * opts.contrib * 12

		// Plain normal fund
		var af_net = annuity_factor(fund_stats.r[0], opts.income_increase, years_contributed)
		var af_gross = annuity_factor(fund_stats.r[0] + fund.fee, opts.income_increase, years_contributed)

		result.plain.net = annual_contrib * af_net
		result.plain.gross = annual_contrib * af_gross

		// Index fund
		var af_net = annuity_factor(index_stats.r[0], opts.income_increase, years_contributed)
		var af_gross = annuity_factor(index_stats.r[0] + opts.index_fund_fee, opts.income_increase, years_contributed)

		result.index.net = annual_contrib * af_net
		result.index.gross = annual_contrib * af_gross

		if (fund_value) {
			var diff = result.plain.net / fund_value

			result.plain.net /= diff
			result.plain.gross /= diff
			result.index.net /= diff
			result.index.gross /= diff
		}

		graph(result)

		var annual_contrib = income * opts.contrib * 12

		var years_left = opts.retire - age

		// Normal plain fund
		result.plain.net = future_value(fund_stats.r[0], result.plain.net, years_left)
		result.plain.gross = future_value(fund_stats.r[0] + fund.fee, result.plain.gross, years_left)

		var af_net = annuity_factor(fund_stats.r[0], opts.income_increase, years_left)
		var af_gross = annuity_factor(fund_stats.r[0] + fund.fee, opts.income_increase, years_left)

		result.plain.net += annual_contrib * af_net
		result.plain.gross += annual_contrib * af_gross

		// Index fund
		result.index.net = future_value(index_stats.r[0], result.index.net, years_left)
		result.index.gross = future_value(index_stats.r[0] + opts.index_fund_fee, result.index.gross, years_left)

		var af_net = annuity_factor(index_stats.r[0], opts.income_increase, years_left)
		var af_gross = annuity_factor(index_stats.r[0] + opts.index_fund_fee, opts.income_increase, years_left)

		result.index.net += annual_contrib * af_net
		result.index.gross += annual_contrib * af_gross

		for (var type in result) {
			result[type].pension = Math.round(result[type].net * opts.pension_percentage)

			result[type].net = Math.round(result[type].net)
			result[type].gross = Math.round(result[type].gross)

			result[type].fees = result[type].gross - result[type].net
		}

		result.plain.name = fund.name

		scope.trigger('calculator.update', result)
	}

	function graph (pot) {
		var result = {}

		var year = (new Date()).getFullYear()
		var years_left = opts.retire - age

		var annual_contrib = income * opts.contrib * 12

		for (var type in pot) {
			result[type] = []

			for (var n = 0; n <= years_left; n++) {
				var fund_yield = (type == 'index') ? index_stats.r[0] : fund_stats.r[0]

				var net = future_value(fund_yield, pot[type].net, n)
				var af = annuity_factor(fund_yield, opts.income_increase, n)

				result[type].push({
					x: year + n,
					y: net + annual_contrib * af
				})
			}
		}

		scope.trigger('calculator.graph', result)
	}

	// r - interest rate %
	// g - annual income increase %
	// n - years left
	function annuity_factor (r, g, n) {
		return (Math.pow(1 + r, n) - Math.pow(1 + g, n)) / (r - g)
	}

	function future_value (rate, flow, periods) {
		return flow * Math.pow(1 + rate, periods)
	}

	function init () {
		var fundSelect = $('[name="fund"]').empty()
		$.each(funds, function (index, fund) {
			fundSelect.append($('<option value="' + index + '">' + fund.name + '</option>'))
		})

		scope.on('submit', function (ev) {
			ev.preventDefault()

			var el = $('[name="age"]')
			var value = parseInt(el.val(), 10)
			if (!isNaN(value) && value >= 23 && value <= 65) {
				age = value
			} else return false


			var el = $('[name="income"]')
			var value = parseInt(el.val(), 10)
			if (!isNaN(value) && value >= 360 && value <= 1e5) {
				income = value
			} else return false


			fund = funds[$('[name="fund"]').val()]

			var el = $('[name="fund-value"]')
			var value = parseInt(el.val(), 10)
			if (!isNaN(value) && value > 0) {
				fund_value = value
			} else {
				fund_value = null
			}

			$.get('/data/getStats', { isin: fund.isin }, function (json, error	) {
				fund_stats = json

				var indexRatio = null
				switch (fund.type) {
					case 'Tasakaalustatud': indexRatio = .25
					break
					case 'Progressiivne': indexRatio = .50
					break
					case 'Konservatiivne': indexRatio = .0
					break
					case 'Agressiivne': indexRatio = .75
					break
				}

				$.get('/data/getComparison', { isin: fund.isin, indexRatio: indexRatio }, function (json) {
					index_stats = json

					calculate()

				})
			})

		}).trigger('submit')
	}
})
