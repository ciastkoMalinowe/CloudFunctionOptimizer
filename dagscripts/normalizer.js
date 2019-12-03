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
      let request_start = data[3];
      if (request_start < minTimestamp) minTimestamp = request_start;
      dataArr.push(data);
    })
    .on("end", function () {
      dataArr.forEach(data => {
        let task = data[0];
        let id = data[1];
        let resource = data[2];

        let request_start = data[3];
        let request_end = data[4];
        let request_duration = data[5];
        let start = request_start;
        let end = request_end;
        let time = request_duration;




        let downloaded = data[6];
        let executed = data[7];
        let uploaded = data[8];
        let type = resource;

        let normalized_start = start - minTimestamp;
        let normalized_end = end - minTimestamp;

        let normalized_request_start = request_start - minTimestamp;
        let normalized_request_end = request_end - minTimestamp;
        fs.appendFileSync(outputFile,`${task} ${id} ${resource} ${normalized_request_start}`
          + ` ${normalized_request_end} ${request_duration} ${normalized_start} ${normalized_end}`
          + ` ${time} ${downloaded} ${executed} ${uploaded} ${type}\n`, console.err);
      })
    });
}
