var XLSX = require('xlsx');
var workbook = XLSX.readFile('013015 Job Diary v1 from David Dunham.xlsx');

console.log(workbook.SheetNames);
console.log(XLSX.utils.sheet_to_json(workbook.Sheets['Workload Summary']));
var worksheet = workbook.Sheets['Workload Summary'];
var count = 0, initCount = false;


for (var data in worksheet) {
	if (data[0] === '!') continue;
	console.log(data + '=' + worksheet[data].v.toString());

	if (worksheet[data].v.toString() === 'Total') {
		initCount = true;
	}

	if (initCount) {
		count++;
	}

	if (count > 10)
		break;
}