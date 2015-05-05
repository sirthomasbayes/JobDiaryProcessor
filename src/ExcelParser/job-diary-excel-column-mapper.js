'use strict';

var headerFormats = require('../../config/header-formats.js'),

columnHeaderToRegexMap = {
	'Specialist': headerFormats.tableColumnFormats.specialistFormats,
	'StudentId': headerFormats.tableColumnFormats.studentIdFormats,
	'StudentName': headerFormats.tableColumnFormats.studentNameFormats,
	'Consultant': headerFormats.tableColumnFormats.consultantFormats,
	'DateReceived': headerFormats.tableColumnFormats.dateReceivedFormats,
	'DateReplied': headerFormats.tableColumnFormats.dateRepliedFormats,
	'NumberOfArticles': headerFormats.tableColumnFormats.numberOfArticlesFormats,
	'NumberOfWords': headerFormats.tableColumnFormats.numberOfWordsFormats,
	'BaseCredits': headerFormats.tableColumnFormats.baseCreditFormats,
	'Bonus1': headerFormats.tableColumnFormats.bonus1Formats,
	'Bonus2': headerFormats.tableColumnFormats.bonus2Formats,
	'WorkPeriod': headerFormats.tableColumnFormats.workPeriodFormats,
	'StudentEvaluation': headerFormats.tableColumnFormats.studentEvaluationFormats,
	'HoursEditing': headerFormats.tableColumnFormats.hoursEditingFormats,
	'TotalHours': headerFormats.tableColumnFormats.totalHoursFormats,
	'ArticleKeywords': headerFormats.tableColumnFormats.keywordsOfArticleFormats
},

getUnmappedFieldException = function (fieldToColumnMap) {
		var expectedMapKeys = Object.keys(columnHeaderToRegexMap),

		missingKeys = expectedMapKeys.map(function (key) {
			return fieldToColumnMap[key] === undefined ?
				key : undefined;
		})
		.reduce(function (previousValue, currentValue) {
			return currentValue !== undefined ?
				currentValue + ', ' + previousValue:
				previousValue;
		}, '');

		return new Error('Unable to map fields: [' + missingKeys + ']');
};

module.exports = {
	getFieldToColumnMap: function (row) {
		var map = {};

		row.columns.map(function (column) { 
			if (typeof column.value !== 'string') {
				throw new Error('Column value must be a string in the column header.');
			}

			var headers = Object.keys(columnHeaderToRegexMap);

			for (var i = 0; i < headers.length; i++) {
				var isMatch = columnHeaderToRegexMap[headers[i]]
					.map(function (regex) {
						return column.value.match(regex) !== null;
					})
					.reduce(function (previousValue, currentValue) {
						return previousValue || currentValue;
					});

				if (isMatch) {
					return {
						columnKey: column.key,
						columnField: headers[i]
					};
				}
			}

			return {
				columnKey: column.key,
				columnField: undefined
			}
		})
		.forEach(function (elem) {

			if (elem.columnField === undefined) {
				return;
			}

			if (map[elem.columnField] !== undefined) {
				throw new Error('Field "' + elem.columnField + '" is defined in multiple columns.');
			}

			map[elem.columnField] = elem.columnKey;
		});

		if (Object.keys(map).length !== Object.keys(columnHeaderToRegexMap).length) {
			throw getUnmappedFieldException(map);
		}

		return map;	
	}
};