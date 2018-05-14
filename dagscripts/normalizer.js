const fs = require('fs');
const csvParser = require('fast-csv');

const csvDir = process.argv[2];
const outputPath = process.argv[3];

if(!csvDir || !outputPath){
  throw new Error("Provide valid arguments: node normalizer.js DIR_PATH CSV_PATH ");
}

const stats = fs.statSync(csvDir);

if(!stats.isDirectory()) {
  throw new Error("Given path is not a directory");
}

// fs.writeFileSync(outputPath, "task id resource start end time type\n");

fs.readdir(csvDir, (err,files) =>
  files
    .filter(file => file.endsWith(".csv"))
    .forEach(file => normalize(csvDir + "/" + file)
    ));

function normalize(file) {

  let dataArr = [];
  let minTimestamp = Number.MAX_SAFE_INTEGER;

  csvParser
    .fromPath(file, {delimiter: ' '})
    .on("data", data => {
      let start = data[3];
      let end = data[4];
      dataArr.push(data);

      if (start < minTimestamp) {
        minTimestamp = start;
      }
    })
    .on("end", function () {
      dataArr.forEach(data => {
        let task = data[0];
        let id = data[1];
        let resource = data[2];
        let start = data[3];
        let end = data[4];
        let time = data[5];
        let type = data[6];

        let normalized_start = start - minTimestamp;
        let normalized_end = end - minTimestamp;
        fs.appendFileSync(outputPath,`${task} ${id} ${resource} ${normalized_start} ${normalized_end} ${time} ${type}\n`, console.err);
      })
    });
}
