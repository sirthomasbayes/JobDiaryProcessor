'use strict';

var xlsx = require('xlsx'),
	jobDiaryHeaderFormats = require('../../config/header-formats.js'),
	thinktownCreditLevels = require('../../config/thinktown-credit-levels.js'),
	jobDiaryColumnMapper = require('../ExcelParser/job-diary-excel-column-mapper.js'),
	jobDiaryProcessor = require('../ExcelParser/job-diary-processor.js'),

	getJobDiaryWorksheet = function (filename) {
		var workbook = xlsx.readFile(filename),
			worksheets = workbook.SheetNames;

		return workbook.Sheets['Workload Summary'] ||
			workbook.Sheets['workload summary'] ||
			workbook.Sheets[workbook.SheetNames[6]];
	},

	getCellToEntryMap = function (worksheet) {
		var cellToEntryMap = {},
			breakPointMatches = jobDiaryHeaderFormats.tableHeaderFormats.totalsSummaryFormats
				.concat(jobDiaryHeaderFormats.tableHeaderFormats.creditSummaryFormats)
				.concat(jobDiaryHeaderFormats.tableHeaderFormats.efficiencySummaryFormats);

		for (var data in worksheet) {
			if (data[0] === '!') continue;

			var entry = worksheet[data].v.toString(), 
				isMatch = breakPointMatches.map(function (regex) {
					return entry.match(regex) !== null && data.substring(0, 1) === 'A';
				})
				.reduce(function (previousValue, currentValue) {
					return previousValue || currentValue;
				}, false);

			if (isMatch) {
				break;
			}

			cellToEntryMap[data] = entry;
		}

		return cellToEntryMap;
	},

	getEntryRows = function (cellToEntryMap) {
		var mapKeys = Object.keys(cellToEntryMap),
			currentRowKey = '',
			rowMap = {},
			rows = [];

		mapKeys.forEach(function (mapKey) {
			var rowKey = mapKey.match(/\d+/i)[0].toString();
			
			if (rowMap[rowKey] === undefined) {
				rowMap[rowKey] = {
					key: parseInt(rowKey, 10),
					columns: []
				};
			}

			rowMap[rowKey].columns.push({
				key: mapKey.match(/[A-Za-z]+/i)[0].toString(),
				value: cellToEntryMap[mapKey]
			});
		});

		var rowMapKeys = Object.keys(rowMap);
		rowMapKeys.forEach(function (rowMapKey) {
			rows.push(rowMap[rowMapKey]);
		});

		return rows.sort(function (value, comparedValue) {
			if (value.key < comparedValue.key) { return -1; }
			if (value.key > comparedValue.key) { return 1; }

			return 0;
		});
	},

	getFieldToColumnMap = function (rows) {
		var headerIndex = 0;
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].columns[0].value.match(jobDiaryHeaderFormats.tableHeaderFormats.workloadSummaryFormats[0]) !== null) {
				headerIndex = i + 1;
				break;
			}
		}

		return jobDiaryColumnMapper.getFieldToColumnMap(rows[headerIndex]);
	},

	getJobDiaryEntryRows = function (rows) {
		var headerIndex = 0;
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].columns[0].value.match(jobDiaryHeaderFormats.tableHeaderFormats.workloadSummaryFormats[0]) !== null) {
				headerIndex = i + 2;
				break;
			}
		}

		return rows.slice(headerIndex);
	};

	function Workbook() {
		if(!(this instanceof Workbook)) return new Workbook();
		
		this.SheetNames = [];
		this.Sheets = {};
	}

module.exports = {
	getJobDiaryEntries: function (writingSpecialist) {
		try {
			var worksheet = getJobDiaryWorksheet(writingSpecialist.JobDiaryFilename),
				cellToEntryMap = getCellToEntryMap(worksheet),
				rows = getEntryRows(cellToEntryMap),
				fieldToColumnMap = getFieldToColumnMap(rows);

			return jobDiaryProcessor.getJobDiaryEntries(getJobDiaryEntryRows(rows), fieldToColumnMap);
		}
		catch (ex) {
			console.log('unable to process job diary for writing specialist "' + writingSpecialist.Name + '." Error: ' + ex.toString() + '\n');
		}
	},

	getCreditSummaries: function (writingSpecialist, calculationDate, entries) {
		var commencementDate = writingSpecialist.CommencementDate,
			currentStartDate = commencementDate.getDate() < 15 ?
				new Date(commencementDate.getFullYear(), commencementDate.getMonth(), 1) :
				new Date(commencementDate.getFullYear(), commencementDate.getMonth(), 16),
			
			currentEndDate = commencementDate.getDate() < 15 ?
				new Date(commencementDate.getFullYear(), commencementDate.getMonth(), 15) :
				new Date(commencementDate.getFullYear(), commencementDate.getMonth() + 1, 0),

			creditSummaries = [],

			previousCreditTotal = 0,
			totalRawCredits = 0;

		while (currentEndDate <= calculationDate) {
			creditSummaries.push(jobDiaryProcessor.getCreditSummaryForPeriod(entries, currentStartDate, currentEndDate));
			
			totalRawCredits += creditSummaries[creditSummaries.length - 1].RawTotalCredits;
			creditSummaries[creditSummaries.length - 1].TotalCredits = Math.round(totalRawCredits / 3000);
			creditSummaries[creditSummaries.length - 1].TotalCreditCurrentPeriod = creditSummaries[creditSummaries.length - 1].TotalCredits - previousCreditTotal;

			currentStartDate = currentStartDate.getDate() === 16 ?
				new Date(currentStartDate.getFullYear(), currentStartDate.getMonth() + 1, 1) :
				new Date(currentStartDate.getFullYear(), currentStartDate.getMonth(), 16);
			
			currentEndDate = currentEndDate.getDate() !== 15 ?
				new Date(currentEndDate.getFullYear(), currentEndDate.getMonth() + 1, 15) :
				new Date(currentEndDate.getFullYear(), currentEndDate.getMonth() + 1, 0);
		
			previousCreditTotal = creditSummaries[creditSummaries.length - 1].TotalCredits;
		}

		var j = 0;
		for (var i = 0; i < creditSummaries.length; i++) {
			creditSummaries[i].TotalCredits += writingSpecialist.InitialCredits;
		
			while (j < thinktownCreditLevels.length && creditSummaries[i].TotalCredits > thinktownCreditLevels[j]) j++;

			if (j === 0) { j = 1; }

			creditSummaries[i].Specialist = writingSpecialist.Name;
			creditSummaries[i].CurrentLevel = 'Level ' + j;
			creditSummaries[i].NextLevel = 'Level ' + (j + 1);
			creditSummaries[i].TotalCreditsForNextLevel = thinktownCreditLevels[j];
			creditSummaries[i].CreditNeededForUpgrading = creditSummaries[i].TotalCredits - thinktownCreditLevels[j];
			creditSummaries[i].CommencementDate = writingSpecialist.CommencementDate;
			creditSummaries[i].SpecialistName = writingSpecialist.Name;
			creditSummaries[i].Office = writingSpecialist.Office;
			creditSummaries[i].Memo = '';
		}

		return creditSummaries;
	},

	getEfficiencySummaries: function (writingSpecialist, calculationDate, entries) {
		var commencementDate = writingSpecialist.CommencementDate,
			currentStartDate = commencementDate.getDate() < 15 ?
				new Date(commencementDate.getFullYear(), commencementDate.getMonth(), 1) :
				new Date(commencementDate.getFullYear(), commencementDate.getMonth(), 16),
			
			currentEndDate = commencementDate.getDate() < 15 ?
				new Date(commencementDate.getFullYear(), commencementDate.getMonth(), 15) :
				new Date(commencementDate.getFullYear(), commencementDate.getMonth() + 1, 0),

			efficiencySummaries = [];

		while (currentEndDate <= calculationDate) {
			efficiencySummaries.push(jobDiaryProcessor.getEfficiencySummaryForPeriod(entries, currentStartDate, currentEndDate));

			currentStartDate = currentStartDate.getDate() === 16 ?
				new Date(currentStartDate.getFullYear(), currentStartDate.getMonth() + 1, 1) :
				new Date(currentStartDate.getFullYear(), currentStartDate.getMonth(), 16);
			
			currentEndDate = currentEndDate.getDate() !== 15 ?
				new Date(currentEndDate.getFullYear(), currentEndDate.getMonth() + 1, 15) :
				new Date(currentEndDate.getFullYear(), currentEndDate.getMonth() + 1, 0);
		}

		var totalWordCount = 0,  
			totalEditingHours = 0;
		for (var i = 0; i < efficiencySummaries.length; i++) {
			totalWordCount += efficiencySummaries[i].TotalWordCountCurrentPeriod;
			totalEditingHours += efficiencySummaries[i].TotalEditingHoursCurrentPeriod;

			efficiencySummaries[i].Specialist = writingSpecialist.Name;
			efficiencySummaries[i].Office = writingSpecialist.Office;

			efficiencySummaries[i].WordPerHourAverage = totalEditingHours !== 0 ?
				parseFloat((totalWordCount / totalEditingHours).toFixed(2)) :
				0;
			efficiencySummaries[i].WordPerHourLastPeriod = i !== 0 ?
				efficiencySummaries[i - 1].WordsPerHourCurrentPeriod :
				0;
		}

		return efficiencySummaries;	
	},

	writeJobDiaryEntriesToWorksheet: function (specialistResults, calculationDate) {
		var specialist = specialistResults.Specialist,
			entries = specialistResults.Entries,
			workbook = xlsx.readFile(specialist.JobDiaryFilename),
			worksheet = getJobDiaryWorksheet(specialist.JobDiaryFilename),
			cellToEntryMap = getCellToEntryMap(worksheet),
			rows = getEntryRows(cellToEntryMap),
			fieldToColumnMap = getFieldToColumnMap(rows),
			headerIndex = 0,

			newWorkbook = new Workbook();

		for (var i = 0; i < rows.length; i++) {
			if (rows[i].columns[0].value.match(jobDiaryHeaderFormats.tableHeaderFormats.workloadSummaryFormats[0]) !== null) {
				headerIndex = i + 2;
				break;
			}
		}

		var fieldMapKeys = Object.keys(fieldToColumnMap),
			totalBaseCredits = 0,
			totalBonus1 = 0,
			totalBonus2 = 0,
			totalCredits = 0;

		for (var i = headerIndex, j = 0; j < entries.length; i++, j++) {
			fieldMapKeys.forEach(function (fieldMapKey) {
				var sheetKey = fieldToColumnMap[fieldMapKey] + rows[i].key,
					addedValue = entries[j][fieldMapKey];

				if (addedValue === undefined) {
					addedValue = '';
				}
				else if (fieldMapKey === 'DateReplied' ||
						 fieldMapKey === 'DateReceived') {
					addedValue = '' + (addedValue.getMonth() + 1) + '/' +
						addedValue.getDate() + '/' + addedValue.getFullYear();
				}

				worksheet[sheetKey] = { v: addedValue, t: typeof addedValue === 'number' ? 'n' : 's' }; 
			});

			totalBaseCredits += entries[j].BaseCredits;
			totalBonus1 += entries[j].Bonus1;
			totalBonus2 += entries[j].Bonus2;
		}

		totalCredits = Math.round((totalBaseCredits + totalBonus1 + totalBonus2) / 3000);

		var index = headerIndex + entries.length;
		while (index < rows.length)
		{
			fieldMapKeys.forEach(function (fieldMapKey) {
				var sheetKey = fieldToColumnMap[fieldMapKey] + rows[index].key;
				worksheet[sheetKey] = { v: '', t: 's' };
			});

			index++;
		}

		var totalsRow = (headerIndex + rows.length).toString();
		worksheet[fieldToColumnMap['Specialist'] + totalsRow] = { v: 'Total', t:'s' };
		worksheet[fieldToColumnMap['DateReplied'] + totalsRow] = { v: 'Total', t: 's' }; 
		worksheet[fieldToColumnMap['BaseCredits'] + totalsRow] = { v: totalBaseCredits, t: 'n' };
		worksheet[fieldToColumnMap['Bonus1'] + totalsRow] = { v: totalBonus1, t: 'n' };
		worksheet[fieldToColumnMap['Bonus2'] + totalsRow] = { v: totalBonus2, t: 'n' };
		worksheet[fieldToColumnMap['ArticleKeywords'] + totalsRow] = { v: totalCredits, t: 'n' };

		var creditSummaryRow = 0;
		var efficiencySummaryRow = 0
		for (var data in worksheet) {
			if (data[0] === '!') continue;

			var entry = worksheet[data].v.toString();

			if (entry.match(jobDiaryHeaderFormats.tableHeaderFormats.creditSummaryFormats[0]) !== null) {
				creditSummaryRow = parseInt(data.match(/\d+/i)[0], 10) + 2;
			}

			if (entry.match(jobDiaryHeaderFormats.tableHeaderFormats.efficiencySummaryFormats[0]) !== null) {
				efficiencySummaryRow = parseInt(data.match(/\d+/i)[0], 10) + 2;
			}
		}

		specialistResults.CreditSummaries.forEach(function (creditSummary) {
			if (creditSummary.Specialist === 'Feiye Wang') {
				creditSummary.CommencementDate = new Date(2013, 4, 1);
			}

			worksheet['A' + creditSummaryRow] = { v: creditSummary.Specialist, t: 's' };
			worksheet['B' + creditSummaryRow] = { v: creditSummary.Office, t: 's' };
			worksheet['C' + creditSummaryRow] = { v: creditSummary.CurrentLevel, t: 's' };
			worksheet['D' + creditSummaryRow] = { v: (creditSummary.CommencementDate.getMonth() + 1) + '/' + creditSummary.CommencementDate.getDate() + '/' + creditSummary.CommencementDate.getFullYear(), t: 's' };
			worksheet['E' + creditSummaryRow] = { v: (creditSummary.CalculationDate.getMonth() + 1) + '/' + creditSummary.CalculationDate.getDate() + '/' + creditSummary.CalculationDate.getFullYear(), t: 's' };
			worksheet['F' + creditSummaryRow] = { v: creditSummary.TotalCredits, t: 'n' };
			worksheet['G' + creditSummaryRow] = { v: creditSummary.TotalCreditCurrentPeriod, t: 'n' };
			worksheet['H' + creditSummaryRow] = { v: creditSummary.TotalCreditsForNextLevel, t: 'n' };
			worksheet['I' + creditSummaryRow] = { v: creditSummary.CreditNeededForUpgrading, t: 'n' };
			worksheet['J' + creditSummaryRow] = { v: creditSummary.NextLevel, t: 's' };
			worksheet['K' + creditSummaryRow] = { v: creditSummary.Memo, t: 's' };

			creditSummaryRow++;
		});

		specialistResults.EfficiencySummaries.forEach(function (efficiencySummary, index) {
			worksheet['A' + efficiencySummaryRow] = { v: efficiencySummary.Specialist, t: 's' };
			worksheet['B' + efficiencySummaryRow] = { v: efficiencySummary.Office, t: 's' };
			worksheet['C' + efficiencySummaryRow] = { v: specialistResults.CreditSummaries[index].CurrentLevel, t: 's' };
			worksheet['D' + efficiencySummaryRow] = { v: (efficiencySummary.CalculationDate.getMonth() + 1) + '/' + efficiencySummary.CalculationDate.getDate() + '/' + efficiencySummary.CalculationDate.getFullYear(), t: 's' };
			
			worksheet['E' + efficiencySummaryRow] = { v: efficiencySummary.NumberOfArticlesCurrentPeriod, t: 's' };
			worksheet['F' + efficiencySummaryRow] = { v: efficiencySummary.TotalWordCountCurrentPeriod, t: 'n' };
			worksheet['G' + efficiencySummaryRow] = { v: efficiencySummary.TotalEditingHoursCurrentPeriod, t: 'n' };
			worksheet['H' + efficiencySummaryRow] = { v: efficiencySummary.TotalWorkingHoursCurrentPeriod, t: 'n' };
			worksheet['I' + efficiencySummaryRow] = { v: efficiencySummary.WordsPerHourCurrentPeriod, t: 'n' };
			worksheet['J' + efficiencySummaryRow] = { v: efficiencySummary.WordPerHourLastPeriod, t: 's' };
			worksheet['K' + efficiencySummaryRow] = { v: efficiencySummary.WordPerHourAverage, t: 's' };

			efficiencySummaryRow++;
		});

		newWorkbook.SheetNames.push('Workload Summary');
		newWorkbook.Sheets['Workload Summary'] = worksheet;

		var outputFilename = './output/' + (calculationDate.getMonth() + 1) + '' + calculationDate.getDate() + '' + calculationDate.getFullYear() + ' ' +
			 specialist.Name + ' Job Diary v2 from Helen.xlsx';

		specialist.OutputFilename = outputFilename;
		xlsx.writeFile(newWorkbook, outputFilename);
	},

	writeEfficiencySummariesToWorksheet: function () {

	},

	writeCreditSummariesToWorksheet: function () {

	}
};