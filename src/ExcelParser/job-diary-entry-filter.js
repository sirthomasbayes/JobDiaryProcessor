'use strict';

var dateParsingStrategies = [
	function (value) {
		if (value === undefined || value.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g) === null) { return; } 

		var digits = value.split('/'),
			month = parseInt(digits[0], 10),
			day = parseInt(digits[1], 10),
			year = parseInt(digits[2], 10);

		return new Date(year < 2000 ? 2000 + year : year, month - 1, day);
	},

	function (value) {
		if (value === undefined || value.match(/\d{1,2}\.\d{1,2}\.\d{2,4}/g) === null) { return; } 

		var digits = value.split('.'),
			month = parseInt(digits[0], 10),
			day = parseInt(digits[1], 10),
			year = parseInt(digits[2], 10);

		return new Date(year < 2000 ? 2000 + year : year, month - 1, day);
	},

	function (value) {
		if (value === undefined || value.match(/\d{6}/g) === null) { return; }

		var month = parseInt(value.substring(0, 2), 10),
			day = parseInt(value.substring(2, 4), 10),
			year = parseInt(value.substring(4), 10);

		return new Date(year + 2000, month - 1, day);
	},

	function (value) {
		if (value === undefined || value.match(/\d{1,2}\/\d{1,2}/g) === null) { return; }

		var digits = value.split('/'),
			month = parseInt(digits[0], 10),
			day = parseInt(digits[1], 10),
			year = month >= 9 ? 2014 : 2015;

		return new Date(year, month - 1, day);
	},

	function (value) {
		return undefined;
	}
];

module.exports = {
	getDateFromString: function (value) {
		return dateParsingStrategies.map(function (strategy) {
			return strategy(value);
		})
		.reduce(function (previousValue, currentValue) {
			if (currentValue !== undefined && previousValue === undefined) return currentValue;

			return previousValue; 
		});
	},

	getIntFromString: function (value) {
		if (value === undefined || value.match(/\d+/g) === null) { return 0; }

		return parseInt(value, 10);
	},

	getDecimalFromString: function (value) {
		if (value === undefined || value.match(/\d*(\.)?\d+/g) === null) { return 0; }

		return parseFloat(parseFloat(value).toFixed(2));
	},

	getWorkPeriodFromString: function (value) {
		if (value === undefined || value.match(/w|h/gi) === null) { return ''; }

		return value;
	},

	getStudentEvaluationFromString: function (value) {
		if (value === undefined || value.match(/y|n/gi) === null) { return ''; }

		return value;
	}
};