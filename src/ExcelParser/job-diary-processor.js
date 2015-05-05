'use strict';

var entryFactory = require('../ExcelParser/job-diary-entry-factory.js'),
	creditLevels = require('../../config/thinktown-credit-levels.js'),

	getArticleVersion = function (articleName) {
		var versionNumber = articleName.match(/v\d+/i);

		if (versionNumber === null) {  
			return null;
			//throw new Error('Unable to parse version number.');
		}

		return parseInt(versionNumber[0].substring(1), 10);
	},

	getStudentType = function (studentId) {
		if (studentId === undefined) { return null; }

		/*if (studentId.match(/\s+/gi) !== null) {
			return null;
			//throw new Error('StudentId field cannot be empty.');
		}*/

		if (studentId.match(/TC\d+/gi) !== null) { return 'TC'; }
		if (studentId.match(/TH\d+/gi) !== null) { return 'TH'; }
		if (studentId.match(/TD\d+/gi) !== null) { return 'TD'; }
		if (studentId.match(/TEMP|TMP/gi) !== null) { return 'TEMP'; }

		return null;
	},

	correctJobDiaryEntries = function (entries) {
		var essayMap = {};

		entries.forEach(function (entry) {

			var articleNameBase = entry.ArticleKeywords.trim().replace(/v\d+/i, '*'),
				articleKey = entry.StudentName + ': ' + articleNameBase,
				versionNumber = getArticleVersion(entry.ArticleKeywords),
				studentType = getStudentType(entry.StudentId);

			if (versionNumber === null) {
				return;
			}

			if (articleNameBase.length >= 6 &&
				articleNameBase.substring(0, 6).match(/\d+/ig) !== null) {

				articleNameBase = articleNameBase.substring(6);
				articleKey = entry.StudentName + ': ' + articleNameBase;
			}

			if (studentType === null) { 
				entry.BaseCredits = 0;
				entry.Bonus1 = 0;
				entry.Bonus2 = 0;
				entry.HoursEditing = 0;
				return; 
			}

			entry.BaseCredits = entry.NumberOfWords;

			if (entry.WorkPeriod.match(/w/gi) !== null) {
				entry.Bonus1 = entry.BaseCredits;
			}
			else if (entry.WorkPeriod.match(/h/gi) !== null) {
				entry.Bonus1 = entry.BaseCredits * 2;
			}
			else {
				entry.Bonus1 = 0;
			}

			if (entry.StudentEvaluation.match(/y/gi) !== null) {
				entry.Bonus2 = entry.BaseCredits;
			}
			else {
				entry.Bonus2 = 0;
			}

			if (essayMap[articleKey] === undefined) {
				essayMap[articleKey] = {
					StudentType: studentType,
					MaxEntry: studentType === 'TC' || studentType === 'TH' ?
						entry : undefined,
					MaxVersion: studentType === 'TC' || studentType === 'TH' ? versionNumber : undefined
				};
			}

			if (essayMap[articleKey].StudentType === 'TD' && 
				versionNumber > 9) {

				entry.BaseCredits = 0;
				entry.Bonus1 = 0;
				entry.Bonus2 = 0;
			}
			else if (essayMap[articleKey].StudentType === 'TC' ||
					 essayMap[articleKey].StudentType === 'TH') {

				var currentMaxEntry = essayMap[articleKey].MaxEntry;
				if (currentMaxEntry.BaseCredits + currentMaxEntry.Bonus1 + currentMaxEntry.Bonus2 <
					entry.BaseCredits + entry.Bonus1 + entry.Bonus2) {

					currentMaxEntry.BaseCredits = 0;
					currentMaxEntry.Bonus1 = 0;
					currentMaxEntry.Bonus2 = 0;

					essayMap[articleKey].MaxEntry = entry;
					essayMap[articleKey].MaxVersion = versionNumber;
				}
				else if (currentMaxEntry !== entry) {
					entry.BaseCredits = 0;
					entry.Bonus1 = 0;
					entry.Bonus2 = 0;
				}
			}
		});

		return entries;
	};

module.exports = {
	getJobDiaryEntries: function (rows, fieldToColumnMap) {
		var entries = rows.map(function (row) {
			var row = entryFactory.getJobDiaryEntry(row, fieldToColumnMap);

			return row;
		})
		.reduce(function (previousValue, currentValue) {
			if (currentValue !== undefined) {
				previousValue.push(currentValue);
			}

			return previousValue;
		}, []);

		return correctJobDiaryEntries(entries);
	},

	getCreditSummaryForPeriod: function (entries, startDate, endDate) {
		var creditSummary = {
			CalculationDate: endDate,
			TotalCreditCurrentPeriod: 0
		},
		rawTotalCredits = 0;

		entries.forEach(function (entry) {
			if (entry.DateReplied >= startDate &&
				entry.DateReplied <= endDate) {

				rawTotalCredits += entry.BaseCredits + entry.Bonus1 + entry.Bonus2;
			}
		});

		creditSummary.RawTotalCredits = rawTotalCredits;
		creditSummary.TotalCreditCurrentPeriod = Math.round(rawTotalCredits / 3000);
		return creditSummary;
	},

	getEfficiencySummaryForPeriod: function (entries, startDate, endDate) {
		var efficiencySummary = {
			CalculationDate: endDate,
			NumberOfArticlesCurrentPeriod: 0,
			TotalWordCountCurrentPeriod: 0,
			TotalEditingHoursCurrentPeriod: 0,
			TotalWorkingHoursCurrentPeriod: 0,
			WordsPerHourCurrentPeriod: 0
		};

		entries.forEach(function (entry) {
			if (entry.DateReplied >= startDate &&
				entry.DateReplied <= endDate) {

				efficiencySummary.NumberOfArticlesCurrentPeriod += entry.NumberOfArticles;
				efficiencySummary.TotalWordCountCurrentPeriod += entry.NumberOfWords;
				efficiencySummary.TotalEditingHoursCurrentPeriod += entry.HoursEditing;
				efficiencySummary.TotalWorkingHoursCurrentPeriod += entry.TotalHours;
			}
		});

		efficiencySummary.TotalEditingHoursCurrentPeriod = parseFloat(efficiencySummary.TotalEditingHoursCurrentPeriod.toFixed(2));
		efficiencySummary.TotalWorkingHoursCurrentPeriod = parseFloat(efficiencySummary.TotalWorkingHoursCurrentPeriod.toFixed(2));
		efficiencySummary.WordsPerHourCurrentPeriod = efficiencySummary.TotalEditingHoursCurrentPeriod !== 0 ?
			parseFloat((efficiencySummary.TotalWordCountCurrentPeriod / efficiencySummary.TotalEditingHoursCurrentPeriod).toFixed(2)) :
			0;

		return efficiencySummary;
	}
};