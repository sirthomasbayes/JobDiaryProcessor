'use strict';

var processor = require('../src/ExcelParser/job-diary-processor.js'),
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
	rows = [];

describe('getJobDiaryEntries()', function () {
	beforeEach(function () {
		rows = [
			{ 
				columns:
				[
					{ key: 'A', value: 'Joe Bob' },
					{ key: 'B', value: 'TC1234' },
					{ key: 'C', value: 'Jim Bo' },
					{ key: 'D', value: 'Ray Man' },
					{ key: 'E', value: '03/15/2014' },
					{ key: 'F', value: '03/19/2014' }, 
					{ key: 'G', value: '1' },
					{ key: 'H', value: '100' }, // NumberOfWords
					{ key: 'I', value: '100' }, // BaseCredits
					{ key: 'J', value: '200' }, // Bonus1
					{ key: 'K', value: '100' }, // Bonus2
					{ key: 'L', value: 'H' },
					{ key: 'M', value: 'Y' },
					{ key: 'N', value: '1.25' },
					{ key: 'O', value: '2.35' },
					{ key: 'P', value: 'Some Essay v1' }
				] 
		}];
	});

	describe('when correcting individual job diary entries (prior to considering versioning and student type)', function () {
		it('should set BaseCredits to NumberOfWords', function () {
			rows[0].columns[8].value = '0';

			var entries = processor.getJobDiaryEntries(rows, fieldToColumnMap);
			expect(entries[0].BaseCredits).toBe(entries[0].NumberOfWords);
		});

		it('should set Bonus1 to BaseCredits when WorkPeriod matches "/w/gi"', function () {
			rows[0].columns[9].value = '0';
			rows[0].columns[11].value = 'w';

			var entries = processor.getJobDiaryEntries(rows, fieldToColumnMap);
			expect(entries[0].Bonus1).toBe(entries[0].BaseCredits);
		});

		it('should set Bonus1 to BaseCredits * 2 when WorkPeriod matches "/h/gi"', function () {
			rows[0].columns[9].value = '0';
			rows[0].columns[11].value = 'h';

			var entries = processor.getJobDiaryEntries(rows, fieldToColumnMap);
			expect(entries[0].Bonus1).toBe(entries[0].BaseCredits * 2);
		});

		it('should set Bonus1 to 0 otherwise', function () {
			rows[0].columns[9].value = '0';
			rows[0].columns[11].value = '';

			var entries = processor.getJobDiaryEntries(rows, fieldToColumnMap);
			expect(entries[0].Bonus1).toBe(0);
		});

		it('should set Bonus2 to BaseCredits when StudentEvaluation matches "/y/gi"', function () {
			rows[0].columns[10].value = '0';
			rows[0].columns[12].value = 'y';

			var entries = processor.getJobDiaryEntries(rows, fieldToColumnMap);
			expect(entries[0].Bonus2).toBe(entries[0].BaseCredits);
		});

		it('should set Bonus2 to 0 otherwise', function () {
			rows[0].columns[10].value = '0';
			rows[0].columns[12].value = '';

			var entries = processor.getJobDiaryEntries(rows, fieldToColumnMap);
			expect(entries[0].Bonus2).toBe(0);
		});
	});

	describe('when correcting TD-type job diary entries', function () {
		it('should set BaseCredits, Bonus1, and Bonus2 fields to 0 when version is greater than 9', function () {
			rows[0].columns[15].value = 'Some Essay v11';
			rows[0].columns[1].value = 'TD1234';

			var entries = processor.getJobDiaryEntries(rows, fieldToColumnMap);
			expect(entries[0].BaseCredits).toBe(0);
			expect(entries[0].Bonus1).toBe(0);
			expect(entries[0].Bonus2).toBe(0);
		});

		it('should remain unchanged otherwise', function () {
			rows[0].columns[15].value = 'Some Essay v7';
			rows[0].columns[1].value = 'TD1234';

			var entries = processor.getJobDiaryEntries(rows, fieldToColumnMap);
			expect(entries[0].BaseCredits).toBe(100);
			expect(entries[0].Bonus1).toBe(200);
			expect(entries[0].Bonus2).toBe(100);
		});
	});

	describe('when correcting TC/TH-type job diary entries', function () {
		beforeEach(function () {
			rows.push({
				columns: 
				[
					{ key: 'A', value: 'Joe Bob' },
					{ key: 'B', value: 'TC1234' },
					{ key: 'C', value: 'Jim Bo' },
					{ key: 'D', value: 'Ray Man' },
					{ key: 'E', value: '03/15/2014' },
					{ key: 'F', value: '03/19/2014' }, 
					{ key: 'G', value: '1' },
					{ key: 'H', value: '100' }, // NumberOfWords
					{ key: 'I', value: '100' }, // BaseCredits
					{ key: 'J', value: '200' }, // Bonus1
					{ key: 'K', value: '100' }, // Bonus2
					{ key: 'L', value: 'H' },
					{ key: 'M', value: 'Y' },
					{ key: 'N', value: '1.25' },
					{ key: 'O', value: '2.35' },
					{ key: 'P', value: 'Some Essay v2' }
				]
			});

			rows.push({
				columns: 
				[
					{ key: 'A', value: 'Joe Bob' },
					{ key: 'B', value: 'TC1234' },
					{ key: 'C', value: 'Jim Bo' },
					{ key: 'D', value: 'Ray Man' },
					{ key: 'E', value: '03/15/2014' },
					{ key: 'F', value: '03/19/2014' }, 
					{ key: 'G', value: '1' },
					{ key: 'H', value: '100' }, // NumberOfWords
					{ key: 'I', value: '100' }, // BaseCredits
					{ key: 'J', value: '200' }, // Bonus1
					{ key: 'K', value: '100' }, // Bonus2
					{ key: 'L', value: 'H' },
					{ key: 'M', value: 'Y' },
					{ key: 'N', value: '1.25' },
					{ key: 'O', value: '2.35' },
					{ key: 'P', value: 'Some Essay v3' }
				]
			});
		});

		it('should set BaseCredits, Bonus1, and Bonus2 fields to 0 when entry\'s BaseCredits + Bonus1 + Bonus2 is not the max among all entries with the same StudentName + ArticleKeywords (without versioning)', function () {
			rows[0].columns[15].value = 'Some Essay v1';
			rows[0].columns[1].value = 'TC1234';

			var entries = processor.getJobDiaryEntries(rows, fieldToColumnMap);
			expect(entries[1].BaseCredits).toBe(0);
			expect(entries[1].Bonus1).toBe(0);
			expect(entries[1].Bonus2).toBe(0);
		
			expect(entries[2].BaseCredits).toBe(0);
			expect(entries[2].Bonus1).toBe(0);
			expect(entries[2].Bonus2).toBe(0);
		});

		it('should remain unchanged otherwise', function () {
			var entries = processor.getJobDiaryEntries(rows, fieldToColumnMap);
			expect(entries[0].BaseCredits).toBe(100);
			expect(entries[0].Bonus1).toBe(200);
			expect(entries[0].Bonus2).toBe(100);
		});
	});

	it('should exclude invalid columns', function () {
		rows[0].columns[5].value = ''; // make invalid DateReplied entry 

		expect(processor.getJobDiaryEntries(rows, fieldToColumnMap).length).toBe(0);
	});
});