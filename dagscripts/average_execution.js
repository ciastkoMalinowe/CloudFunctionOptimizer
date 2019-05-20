const fs = require('fs');
const path = require('path');
const csvParser = require('fast-csv');

// Normalized logs from step 1
const csvPath = process.argv[2];
const outputCSV = process.argv[3];

if(!csvPath || !outputCSV){
  throw new Error("Provide valid arguments: node average_execution.js CSV_PATH OUTPUT_CSV");
}

console.log(`CSV file path is ${csvPath}`);

let idTypeMap = new Map();


csvParser
  .fromPath(csvPath, {delimiter: ' ', headers: true})
  .on("data", data => {
    // Setting times from normalized logs

    // Average by task
    if(!idTypeMap.has(data.task)) idTypeMap.set(data.task, new Map());
    let typeTimeMap = idTypeMap.get(data.task);

    if(!typeTimeMap.get(data.type)) typeTimeMap.set(data.type, []);
    typeTimeMap.get(data.type).push(
      {
        startTime: Number(data.start),
        finishTime: Number(data.end),
        downloadedTime: Number(data.downloaded),
        executedTime: Number(data.executed),
        uploadedTime: Number(data.uploaded)
      }
    );
  })
  .on("end", function () {
    calculateResourceTimes(idTypeMap);
  });

function calculateResourceTimes(idTimeMap) {
  let startTimes = {};
  let finishTimes = {};
  let downloadedTimes = {};
  let executedTimes = {};
  let uploadedTimes = {};

  fs.writeFileSync(outputCSV, "task type start end downloaded executed uploaded\n", console.err);

  for(let task of idTimeMap.keys()){
    let typeTimeMap = idTimeMap.get(task);
    for(let type of typeTimeMap.keys()){
      let timestamps = typeTimeMap.get(type);
      let average = calculateAverage(timestamps);

      if (!startTimes[task]) startTimes[task] = {};
      if (!finishTimes[task]) finishTimes[task] = {};
      if (!downloadedTimes[task]) downloadedTimes[task] = {};
      if (!executedTimes[task]) executedTimes[task] = {};
      if (!uploadedTimes[task]) uploadedTimes[task] = {};

      startTimes[task][type] = average.startTime;
      finishTimes[task][type] = average.finishTime;
      downloadedTimes[task][type] = average.downloadedTime;
      executedTimes[task][type] = average.executedTime;
      uploadedTimes[task][type] = average.uploadedTime;

      fs.appendFileSync(outputCSV,`${task} ${type} ${average.startTime} ${average.finishTime} `
        +`${average.downloadedTime} ${average.executedTime} ${average.uploadedTime}\n`);
    }
  }
  return { startTimes, finishTimes, downloadedTimes, executedTimes, uploadedTimes };
}

function calculateAverage(times) {

  let startSum = 0;
  let finishSum = 0;
  let downloadedSum = 0;
  let executedSum = 0;
  let uploadedSum = 0;

  for(let i=0; i< times.length; i++){
    startSum += times[i].startTime;
    finishSum += times[i].finishTime;
    downloadedSum += times[i].downloadedTime;
    executedSum += times[i].executedTime;
    uploadedSum += times[i].uploadedTime;
  }
  return {
    startTime: Math.round(startSum / times.length),
    finishTime: Math.round(finishSum / times.length),
    downloadedTime: Math.round(downloadedSum / times.length),
    executedTime: Math.round(executedSum / times.length),
    uploadedTime: Math.round(uploadedSum / times.length),
  };
}