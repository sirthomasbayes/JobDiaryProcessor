module.exports = {
	tableHeaderFormats: {
		workloadSummaryFormats: [
			/specialist(\'s)?\s*workload\s*summary/i
		],

		creditSummaryFormats: [
			/specialist(\')?(s)?\s*credit/i
		],

		efficiencySummaryFormats: [
			/specialist(\')?(s)?\s*editing\s*efficiency/i
		],

		totalsSummaryFormats: [
			/total(s)?/gi
		]
	},

	tableColumnFormats: {
		specialistFormats: [
			/specialist/i
		],

		studentIdFormats: [
			/student(\'s)?\s*id/i,
		],

		studentNameFormats: [
			/student(\'s)?\s*name/i
		],

		consultantFormats: [
			/consultant/i
		],

		dateReceivedFormats: [
			/date\s*received/i
		],

		dateRepliedFormats: [
			/date\s*replied/i
		],

		numberOfArticlesFormats: [
			/no\.\s*of\s*article(s)?/i,
			/number\s*of\s*article(s)?/i
		],

		numberOfWordsFormats: [
			/no\.\s*of\s*word(s)?/i,
			/number\s*of\s*word(s)?/i
		],

		baseCreditFormats: [
			/base/i
		],

		bonus1Formats: [
			/bonus\s*1/i
		],

		bonus2Formats: [
			/bonus\s*2/i
		],

		workPeriodFormats: [
			/weekend\s*\/\s*holiday/i
		],

		studentEvaluationFormats: [
			/student(\'s)?\s*evaluation/i
		],

		hoursEditingFormats: [
			/hours\s*\(?editing\(?/i,
			/editing\s*hours/i,
			/hours\s*1/i
		],

		totalHoursFormats: [			
			/hours\s*\(?including\s*non\-?editing\s*work\(?/i,
			/hour(s)?\s*2/i
		],

		keywordsOfArticleFormats: [
			/key\s*words\s*of\s*article/i,
			/key\s*words\s*/i
		]
	},
};