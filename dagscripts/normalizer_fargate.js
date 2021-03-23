const fs = require('fs');
const csvParser = require('fast-csv');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

normalize(inputFile);

function normalize(file) {

  let dataArr = [];
  let minTimestamp = Number.MAX_SAFE_INTEGER;

  csvParser
    .fromPath(file, {delimiter: ' '})
    .on("data", data => {
      let start = data[2]; //fire
      if (start < minTimestamp) minTimestamp = start;
      dataArr.push(data);
    })
    .on("end", function () {
      dataArr.forEach(data => {
        let task = data[0];
        let id = data[1];
        let fire = data[2]
        let resource = data[3];
        let start = data[4];
        let end = data[5];
        let time = end-start;
        let downloaded = data[7] - data[6];
        let executed = data[9] - data[8];
        let uploaded = data[11] - data[10];
        let cpu = data[12]
        let memory = data[13]

        let normalized_start = start - minTimestamp;
        let normalized_end = end - minTimestamp;
        let normalized_fire = fire - minTimestamp
        fs.appendFileSync(outputFile,`${task} ${id} ${resource} ${normalized_fire} ${normalized_start} ${normalized_end}`
        + ` ${time} ${downloaded} ${executed} ${uploaded} ${cpu} ${memory}\n`, console.err);
      })
    });
}
