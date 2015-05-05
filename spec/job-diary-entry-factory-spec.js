'use strict';

var factory = require('../src/ExcelParser/job-diary-entry-factory.js'),
	fieldToColumnMap = {
		'Specialist': 'A',
		'StudentId': 'B',
		'StudentName': 'C',
		'Consultant': 'D',
		'DateReceived': 'E',
		'DateReplied': 'F',
		'NumberOfArticles': 'G',
		'NumberOfWords': 'H',
		'BaseCredits': 'I',
		'Bonus1': 'J',
		'Bonus2': 'K',
		'WorkPeriod': 'L',
		'StudentEvaluation': 'M',
		'HoursEditing': 'N',
		'TotalHours': 'O',
		'ArticleKeywords': 'P'
	},

	row = {};

describe('getJobDiaryEntry()', function () {
	beforeEach(function () {
		row = {
			columns:
			[
				{ key: 'A', value: 'Joe Bob' },
				{ key: 'B', value: 'TC1234' },
				{ key: 'C', value: 'Jim Bo' },
				{ key: 'D', value: 'Ray Man' },
				{ key: 'E', value: '03/15/2014' },
				{ key: 'F', value: '03/19/2014' },
				{ key: 'G', value: '1' },
				{ key: 'H', value: '100' },
				{ key: 'I', value: '100' },
				{ key: 'J', value: '200' },
				{ key: 'K', value: '200' },
				{ key: 'L', value: 'H' },
				{ key: 'M', value: 'Y' },
				{ key: 'N', value: '1.25' },
				{ key: 'O', value: '2.35' },
				{ key: 'P', value: 'Some Essay v1' }
			]
		};
	});

	it('should return jobDiaryEntry object with fields populated', function () {
		var entry = factory.getJobDiaryEntry(row, fieldToColumnMap);
	
		expect(entry).toBeDefined();
		expect(entry.Specialist).toBe('Joe Bob');
		expect(entry.StudentId).toBe('TC1234');
		expect(entry.StudentName).toBe('Jim Bo');
		expect(entry.Consultant).toBe('Ray Man');

		expect(entry.DateReceived.getMonth() + 1).toBe(3);
		expect(entry.DateReceived.getDate()).toBe(15);
		expect(entry.DateReceived.getFullYear()).toBe(2014);

		expect(entry.DateReplied.getMonth() + 1).toBe(3);
		expect(entry.DateReplied.getDate()).toBe(19);
		expect(entry.DateReplied.getFullYear()).toBe(2014);

		expect(entry.NumberOfArticles).toBe(1);
		expect(entry.NumberOfWords).toBe(100);

		expect(entry.BaseCredits).toBe(100);
		expect(entry.Bonus1).toBe(200);
		expect(entry.Bonus2).toBe(200);

		expect(entry.WorkPeriod).toBe('H');
		expect(entry.StudentEvaluation).toBe('Y');

		expect(entry.HoursEditing).toBe(1.25);
		expect(entry.TotalHours).toBe(2.35);

		expect(entry.ArticleKeywords).toBe('Some Essay v1');
	});
	
	it('should return undefined when DateReplied entry is invalid date', function () {
		row.columns[5].value = 'bad-date';

		var entry = factory.getJobDiaryEntry(row, fieldToColumnMap);
		expect(entry).toBeUndefined();
	});

	it('should return undefined when ArticleKeywords is empty', function () {
		row.columns[15].value = '';

		var entry = factory.getJobDiaryEntry(row, fieldToColumnMap);
		expect(entry).toBeUndefined();
	});

	it('should return undefined when StudentName is empty', function () {
		row.columns[2].value = '';

		var entry = factory.getJobDiaryEntry(row, fieldToColumnMap);
		expect(entry).toBeUndefined();
	});

	it('should return undefined when StudentId is empty', function () {
		row.columns[1].value = '';

		var entry = factory.getJobDiaryEntry(row, fieldToColumnMap);
		expect(entry).toBeUndefined();
	});
});