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
		contrib: 6,
		income_increase: 3,
		pension_percentage: 0.45,
	}

	var funds = {
		lhv: {
			plain: {
				yield: 3.12,
				fees: 1.5,
			},
			index: {
				yield: 7.72,
				fees: 0.5
			}
		},
		tuleva: {
			plain: {
				yield: 5.12,
				fees: 0.5,
			},
			index: {
				yield: 8.72,
				fees: 0.25
			}
		}
	}

	// defaults_
	var age, income, fund
	var fund_value = null

	function calculate () {
		var result = {}

		for (var type in fund) {
			result[type] = {}
		}

		var years_contributed = age - opts.age_started

		var past_income = income / Math.pow((1 + opts.income_increase / 100), years_contributed)

		var annual_contrib = past_income * (opts.contrib / 100) * 12

		for (var type in fund) {
			var af_net = annuity_factor(fund[type].yield, opts.income_increase, years_contributed)
			var af_gross = annuity_factor(fund[type].yield + fund[type].fees, opts.income_increase, years_contributed)

			result[type].net = annual_contrib * af_net
			result[type].gross = annual_contrib * af_gross
		}

		if (fund_value) {
			var diff = result.plain.net / fund_value

			for (var type in fund) {
				result[type].net /= diff
				result[type].gross /= diff
			}
		}

		graph(result)

		var annual_contrib = income * (opts.contrib / 100) * 12

		var years_left = opts.retire - age

		for (var type in fund) {
			result[type].net = future_value(fund[type].yield, result[type].net, years_left)
			result[type].gross = future_value(fund[type].yield + fund[type].fees, result[type].gross, years_left)

			var af_net = annuity_factor(fund[type].yield, opts.income_increase, years_left)
			var af_gross = annuity_factor(fund[type].yield + fund[type].fees, opts.income_increase, years_left)

			result[type].net += annual_contrib * af_net
			result[type].gross += annual_contrib * af_gross

			result[type].pension = Math.round(result[type].net * opts.pension_percentage / 100)

			result[type].net = Math.round(result[type].net)
			result[type].gross = Math.round(result[type].gross)


			result[type].fees = result[type].gross - result[type].net
		}

		scope.trigger('calculator.update', result)
	}

	function graph (pot) {
		var result = {}

		var year = (new Date()).getFullYear()
		var years_left = opts.retire - age

		var annual_contrib = income * (opts.contrib / 100) * 12

		for (var type in fund) {
			result[type] = []

			for (var n = 0; n <= years_left; n++) {

				var net = future_value(fund[type].yield, pot[type].net, n)
				var af = annuity_factor(fund[type].yield, opts.income_increase, n)

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
		return (Math.pow(1 + r / 100, n) - Math.pow(1 + g / 100, n)) / (r - g) * 100
	}

	function future_value (rate, flow, periods) {
		return flow * Math.pow(1 + rate / 100, periods)
	}

	function init () {
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

			calculate()
		}).trigger('submit')
	}

	init()
})
