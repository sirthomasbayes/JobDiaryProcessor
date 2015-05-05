'use strict';

var jobDiaryExcelProcessor = require('../ExcelParser/job-diary-excel-file-processor.js'),
	writingSpecialists = require('../../config/writing-specialists.js'),
	fs = require('fs'),

	writingSpecialistResults = [],
	inputOutputPandas = { InputOutputPandas: [] };

writingSpecialists.forEach(function (specialist) {
	try {
		console.log('processing job diary for "' + specialist.Name + '."');

		var entries = jobDiaryExcelProcessor.getJobDiaryEntries(specialist),
			creditSummaries = jobDiaryExcelProcessor.getCreditSummaries(specialist, new Date(2015, 3, 30), entries),
			efficiencySummaries = jobDiaryExcelProcessor.getEfficiencySummaries(specialist, new Date(2015, 3, 30), entries),
			result = {
				Specialist: specialist,
				Entries: entries,
				CreditSummaries: creditSummaries,
				EfficiencySummaries: efficiencySummaries,
			};

		writingSpecialistResults.push(result);

		console.log('writing job diary for "' + specialist.Name + '" to disk.');
		jobDiaryExcelProcessor.writeJobDiaryEntriesToWorksheet(result, new Date(2015, 3, 30));


		inputOutputPandas.InputOutputPandas.push({ 
				Input: specialist.OutputFilename.replace('/', '\\').replace('.\\output/', 'C:\\node\\Thinktown\\JobDiaryProcessor\\output\\'), 
				Output: specialist.JobDiaryFilename.replace('/', '\\').replace('.\\input/', 'C:\\node\\Thinktown\\JobDiaryProcessor\\input\\'), 
				SpecialistName: specialist.Name
			});
		console.log('\n');
	}
	catch (ex) {
		console.log('failure encountered when processing job diary for "' + specialist.Name + '." Error: ' + ex.toString() + '\n');
	}
});

fs.writeFile('./dot-net/input/input-output-pandas.json', JSON.stringify(inputOutputPandas), function (err) {
	if (err) { console.log('NO MY PANDAS!! D:'); console.log(err); return; }

	console.log('YAY PANDAS!! :D');
});