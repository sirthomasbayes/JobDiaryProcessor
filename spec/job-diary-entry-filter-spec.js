'use strict';

var filter = require('../src/ExcelParser/job-diary-entry-filter.js'),
	getType = function (value) { return toString.call(value); }

describe('getDateFromString()', function () {
	it('should return a Date object when string matches "/\d{1,2}\/\d{1,2}\/\d{2,4}/"', function () {
		var dateString = '9/15/2013',
			date = filter.getDateFromString(dateString);

		expect(getType(date)).toBe('[object Date]');
		expect(date.getMonth() + 1).toBe(9);
		expect(date.getDate()).toBe(15);
		expect(date.getFullYear()).toBe(2013);

		dateString = '03/12/14';
		date = filter.getDateFromString(dateString);

		expect(getType(date)).toBe('[object Date]');
		expect(date.getMonth() + 1).toBe(3);
		expect(date.getDate()).toBe(12);
		expect(date.getFullYear()).toBe(2014);
	});

	it('should return a Date object when string matches "/\d{6}/g"', function () {
		var dateString = '091214',
			date = filter.getDateFromString(dateString);

		expect(getType(date)).toBe('[object Date]');
		expect(date.getMonth() + 1).toBe(9);
		expect(date.getDate()).toBe(12);
		expect(date.getFullYear()).toBe(2014);
	});

	it('should return undefined otherwise', function () {
		var dateString = 'abc',
			date = filter.getDateFromString(dateString);

		expect(date).toBe(undefined);
	});
});

describe('getIntFromString()', function () {
	it('should return integer form of string if string matches /\d+/', function () {
		var intString = '123',
			intValue = filter.getIntFromString(intString);

		expect(intValue).toBe(123);
	});

	it('should return 0 otherwise', function () {
		var intString = 'abc',
			intValue = filter.getIntFromString(intString);

		expect(intValue).toBe(0);
	});
});

describe('getDecimalFromString()', function () {
	it('should return decimal form of string if string matches "/\d*\.?\d+/"', function () {
		var decimalString = '1.23',
			decimalValue = filter.getDecimalFromString(decimalString);

		expect(decimalValue).toBe(1.23);

		decimalString = '.21',
		decimalValue = filter.getDecimalFromString(decimalString);

		expect(decimalValue).toBe(0.21); 
	});

	it('should return 0 otherwise', function () {
		var decimalString ='abc',
			decimalValue = filter.getDecimalFromString(decimalString);

		expect(decimalValue).toBe(0);
	});
});

describe('getWorkPeriodFromString()', function () {
	it('should return string\'s value if string matches "/w|h/gi"', function () {
		expect(filter.getWorkPeriodFromString('w')).toBe('w');
		expect(filter.getWorkPeriodFromString('h')).toBe('h');
	});

	it('should return empty string otherwise', function() {
		expect(filter.getWorkPeriodFromString('123')).toBe('');
	});
});

describe('getStudentEvaluationFromString()', function () {
	it('should return string\'s value if string matches "/y|n/gi"', function () {
		expect(filter.getStudentEvaluationFromString('y')).toBe('y');
		expect(filter.getStudentEvaluationFromString('n')).toBe('n');
	});

	it('should return empty string otherwise', function () {
		expect(filter.getStudentEvaluationFromString('123')).toBe('');
	});
});