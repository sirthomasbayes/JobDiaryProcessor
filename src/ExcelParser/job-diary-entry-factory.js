'use strict';

var jobDiaryEntryFilter = require('../ExcelParser/job-diary-entry-filter.js'),
fields = [
	'Specialist',
	'StudentId',
	'StudentName',
	'Consultant',
	'DateReceived',
	'DateReplied',
	'NumberOfArticles',
	'NumberOfWords',
	'BaseCredits',
	'Bonus1',
	'Bonus2',
	'WorkPeriod',
	'StudentEvaluation',
	'HoursEditing',
	'TotalHours',
	'ArticleKeywords'
];

module.exports = {
	getJobDiaryEntry: function (row, fieldToColumnMap) {
		var entry = {}, originalDateReplied;

		fields.forEach(function (field) {
			var fieldColumnKey = fieldToColumnMap[field];

			row.columns.forEach(function (column) {
				if (column.key === fieldColumnKey) {
					entry[field] = column.value;
				}
			});
		});

		originalDateReplied = entry.DateReplied;

		entry.DateReceived = jobDiaryEntryFilter.getDateFromString(entry.DateReceived);
		entry.DateReplied = jobDiaryEntryFilter.getDateFromString(entry.DateReplied);

		entry.NumberOfArticles = jobDiaryEntryFilter.getIntFromString(entry.NumberOfArticles);
		entry.NumberOfWords = jobDiaryEntryFilter.getIntFromString(entry.NumberOfWords);

		entry.BaseCredits = jobDiaryEntryFilter.getIntFromString(entry.BaseCredits);
		entry.Bonus1 = jobDiaryEntryFilter.getIntFromString(entry.Bonus1);
		entry.Bonus2 = jobDiaryEntryFilter.getIntFromString(entry.Bonus2);

		entry.WorkPeriod = jobDiaryEntryFilter.getWorkPeriodFromString(entry.WorkPeriod);
		entry.StudentEvaluation = jobDiaryEntryFilter.getStudentEvaluationFromString(entry.StudentEvaluation);

		entry.HoursEditing = jobDiaryEntryFilter.getDecimalFromString(entry.HoursEditing);
		entry.TotalHours = jobDiaryEntryFilter.getDecimalFromString(entry.TotalHours);

		if (entry.DateReplied === undefined || 

			/*entry.StudentId === undefined ||
			entry.StudentId === '' ||

			entry.StudentName === undefined ||
			entry.StudentName === '' ||*/

			entry.ArticleKeywords === undefined ||
			entry.ArticleKeywords === '') {

			if (entry.ArticleKeywords !== undefined &&
				entry.ArticleKeywords !== '') {

				console.log('\tunable to parse row "' + row.key + '."');
				console.log('\tDateReplied: (original = ' + originalDateReplied + '), (parsed = ' + entry.DateReplied + ')');
				console.log('\tArticleKeywords: ' + entry.ArticleKeywords);
				console.log('\n');
			}

			return undefined;
		}

		return entry;
	}
};