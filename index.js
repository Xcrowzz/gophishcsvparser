const csvParser = require("csv-parse");
const p = require("ua-parser");
const fs = require("fs");

const csvToBuff = () => {
	return new Promise((resolve, reject) => {
		const buff = [];
		fs.createReadStream('data.csv').pipe(csvParser()).on('data', (row) => {
			buff.push(row);
		}).on('error', () => {
			console.log('Something fucky just happened.');
			reject();
		}).on('end', () => {
			console.log('CSV file successfully processed');
			resolve(buff);
		});
	});
}

const onlyUnique = (value, index, self) => {
	return self.indexOf(value) === index;
}

const clearDupes = (hitMap) => hitMap.map((e) => e[0]).filter(onlyUnique);

const cleanBuff = (buff) => {
	return new Promise(async (resolve) => {
		buff.splice(0, 2);
		const totalHits = buff.filter((entry) => entry[3] === 'Clicked Link' && entry[4] !== '');
		const hitMap = totalHits
			.map((e) => [e[1], e[4]])
			.filter((entry) => (p.parse(entry[1]).os.family === 'Android' || p.parse(entry[1]).device.family === 'iPhone'));
		resolve(clearDupes(hitMap));
	});
}

const start = () => {
	csvToBuff().then((buff) => {
		cleanBuff(buff).then((buff) => {
			console.log(`Unique mobile hits: ${buff.length}`);
		})
	}).catch((e) => {
		console.error(`Nope: ${e}`);
	});
}

start();
