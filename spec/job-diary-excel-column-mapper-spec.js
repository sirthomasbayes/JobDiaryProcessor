var mapper = require('../src/ExcelParser/job-diary-excel-column-mapper.js'),
	mockRow = {
		columns: 
		[
			{ key: '1', value: 'Specialist' },
			{ key: '2', value: 'Student\'s ID' },
			{ key: '3', value: 'Student\'s Name' },
			{ key:'4', value: 'Consultant' },
			{ key:'5', value: 'Date Received'},
			{ key: '6', value: 'Date replied' },
			{ key: '7', value: 'No. of Articles' },
			{ key: '8', value: 'No. of Words' },
			{ key: '9', value: 'Base' },
			{ key: '10', value: 'Bonus 1' },
			{ key: '11', value: 'Bonus 2' },
			{ key: '12', value: 'Weekend/Holiday' },
			{ key: '13', value: 'Student\'s Evaluation' },
			{ key: '14', value: 'Hours (Editing)'},
			{ key: '15', value: 'Hours(Including non-editing work)' },
			{ key: '16', value: 'Key words of Article'}
		]
	};

describe('getFieldToColumnMap() when mapped successfully:', function () {
	var map = {};

	beforeEach(function () {
		mockRow = {
			columns: 
			[
				{ key: '1', value: 'Specialist' },
				{ key: '2', value: 'Student\'s ID' },
				{ key: '3', value: 'Student\'s Name' },
				{ key:'4', value: 'Consultant' },
				{ key:'5', value: 'Date Received'},
				{ key: '6', value: 'Date replied' },
				{ key: '7', value: 'No. of Articles' },
				{ key: '8', value: 'No. of Words' },
				{ key: '9', value: 'Base' },
				{ key: '10', value: 'Bonus 1' },
				{ key: '11', value: 'Bonus 2' },
				{ key: '12', value: 'Weekend/Holiday' },
				{ key: '13', value: 'Student\'s Evaluation' },
				{ key: '14', value: 'Hours (Editing)'},
				{ key: '15', value: 'Hours(Including non-editing work)' },
				{ key: '16', value: 'Key words of Article'}
			]
		};
	});

	describe('Specialist field', function () {
		it('should match "Specialist"', function () {
			mockRow.columns[0].value = 'Specialist';
			map = mapper.getFieldToColumnMap(mockRow);
		
			expect(map['Specialist']).toBe('1');
		});
	});

	describe('StudentId field', function () {
		it('should match "Student\'s ID"', function () {
			mockRow.columns[1].value = 'Student\'s ID';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['StudentId']).toBe('2');
		});
	});

	describe('StudentName field', function () {
		it('should match "Student \'s Name"', function () {
			mockRow.columns[2].value = 'Student\'s Name';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['StudentName']).toBe('3');
		});
	});

	describe('Consultant field', function () {
		it('should match "Consultant"', function () {
			mockRow.columns[3].value = 'Consultant';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['Consultant']).toBe('4');
		});
	});

	describe('DateReceived field', function () {
		it('should match "Date Received"', function () {
			mockRow.columns[4].value = 'Date Received';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['DateReceived']).toBe('5');
		});

		it('should match "Date received"', function () {
			mockRow.columns[4].value = 'Date received';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['DateReceived']).toBe('5');
		});
	});

	describe('DateReplied field', function () {
		it('should match "Date replied"', function () {
			mockRow.columns[5].value = 'Date replied';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['DateReplied']).toBe('6');
		});
	});

	describe('NumberOfArticles field', function () {
		it('should match "No. of Articles"', function () {
			mockRow.columns[6].value = 'No. of Articles';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['NumberOfArticles']).toBe('7');
		});
	});

	describe('NumberOfWords field', function () {
		it('should match "No. of Words"', function () {
			mockRow.columns[7].value = 'No. of Words';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['NumberOfWords']).toBe('8');
		});
	});

	describe('BaseCredits field', function () {
		it('should match "Base"', function () {
			mockRow.columns[8].value = 'Base';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['BaseCredits']).toBe('9');
		});
	});

	describe('Bonus1 field', function () {
		it('should match "Bonus 1"', function () {
			mockRow.columns[9].value = 'Bonus 1';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['Bonus1']).toBe('10');
		});
	});

	describe('Bonus2 field', function () {
		it('should match "Bonus 2"', function () {
			mockRow.columns[10].value = 'Bonus 2';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['Bonus2']).toBe('11');
		});
	});

	describe('WorkPeriod field', function () {
		it('should match "Weekend/Holiday"', function () {
			mockRow.columns[11].value = 'Weekend/Holiday';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['WorkPeriod']).toBe('12');
		});
	});

	describe('StudentEvaluation field', function () {
		it('should match "Student\'s Evaluation"', function () {
			mockRow.columns[12].value = 'Student\'s Evaluation';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['StudentEvaluation']).toBe('13');
		});
	});

	describe('HoursEditing field', function () {
		it('should match "Hours (Editing)"', function () {
			mockRow.columns[13].value = 'Hours (Editing)';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['HoursEditing']).toBe('14');
		});

		it('should match "Editing Hours"', function () {
			mockRow.columns[13].value = 'Editing Hours';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['HoursEditing']).toBe('14');
		});
	});

	describe('TotalHours field', function () {
		it('should match "Hours(Including non-editing work)"', function () {
			mockRow.columns[14].value = 'Hours(Including non-editing work)';
			map = mapper.getFieldToColumnMap(mockRow);

			expect(map['TotalHours']).toBe('15');
		});
	});
}); 

describe('getFieldToColumnMap() when mapping fails:', function () {
	var getError = function(callback) {
		try {
			callback();
		}
		catch (ex) {
			return ex;
		}
		return undefined;
	},

	getType = function (value) { return toString.call(value); };

	beforeEach(function () {
		mockRow = {
			columns: 
			[
				{ key: '1', value: 'Specialist' },
				{ key: '2', value: 'Student\'s ID' },
				{ key: '3', value: 'Student\'s Name' },
				{ key:'4', value: 'Consultant' },
				{ key:'5', value: 'Date Received'},
				{ key: '6', value: 'Date replied' },
				{ key: '7', value: 'No. of Articles' },
				{ key: '8', value: 'No. of Words' },
				{ key: '9', value: 'Base' },
				{ key: '10', value: 'Bonus 1' },
				{ key: '11', value: 'Bonus 2' },
				{ key: '12', value: 'Weekend/Holiday' },
				{ key: '13', value: 'Student\'s Evaluation' },
				{ key: '14', value: 'Hours (Editing)'},
				{ key: '15', value: 'Hours(Including non-editing work)' },
				{ key: '16', value: 'Key words of Article'}
			]
		};
	});

	it('should throw an exception when any field cannot be mapped', function () {
		for (var i = 0; i < mockRow.columns.length; i++) {
			mockRow.columns[i].value = 'some-invalid-field-name';
			var error = getError(function () {
				mapper.getFieldToColumnMap(mockRow);
			});

			expect(getType(error)).toBe('[object Error]');
		}
	});

	it('should throw an exception when any field is mapped multiple times', function () {
		mockRow.columns[0].value = 'Specialist';
		mockRow.columns[1].value = 'Specialist';

		var error = getError(function () {
			mapper.getFieldToColumnMap(mockRow);
		});

		expect(getType(error)).toBe('[object Error]');
	});

	it('should throw an exception when any field is not a string', function () {
		var test = function (invalidValue) {
			mockRow.columns[0] = invalidValue;

			var error = getError(function () {
				mapper.getFieldToColumnMap(mockRow);
			});

			expect(getType(error)).toBe('[object Error]');
		};

		test({ not: 'valid', boo: 1 });
		test(function () {});
		test(123);
		test(undefined);
	});
});