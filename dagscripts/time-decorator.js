const fs = require('fs');
const path = require('path');
const csvParser = require('fast-csv');

const startTimesString = "startTime";
const endTimesString = "endTime";

const dagPath = process.argv[2];
const csvPath = process.argv[3];
const outputPath = process.argv[4];

if(!csvPath || !dagPath || !outputPath){
    throw new Error("Provide valid arguments: node time-decorator.js DAG_PATH CSV_PATH OUTPUT_PATH");
}

console.log(`DAG file path is ${dagPath}`);
console.log(`CSV file path is ${csvPath}`);

let dag = fs.readFileSync(dagPath);
dag = JSON.parse(dag);

if(!dag.tasks){
    throw new Error("There are no tasks in dag file");
}

let tasks = dag.tasks;

let idTypeMap = new Map();

csvParser
    .fromPath(csvPath, {delimiter: ' '})
    .on("data", data => {
        let task = data[0];
        let id = data[1];
        let resource = data[2];
        let start = data[3];
        let end = data[4];
        let time = data[5];
        let type = data[6];
        if(!idTypeMap.has(id)) idTypeMap.set(id, new Map());
        let typeTimeMap = idTypeMap.get(id);
        if(!typeTimeMap.get(type)) typeTimeMap.set(type, []);
        typeTimeMap.get(type).push( { startTime: Number(start), endTime: Number(end) } );
    })
    .on("end", function () {
        let resourceTimes = calculateResourceTimes(idTypeMap);
        decorateTaskWithTime(tasks, resourceTimes);
        fs.writeFile(outputPath, JSON.stringify(dag, null, 2), (err) => {
            if (err) throw err;
        });
    });

function calculateResourceTimes(idTimeMap) {
    let startTimes = {};
    let endTimes = {};

    for(let id of idTimeMap.keys()){
      let typeTimeMap = idTimeMap.get(id);
      for(let type of typeTimeMap.keys()){
        let timestamps = typeTimeMap.get(type);
        let average = calculateAverage(timestamps);
        if (!startTimes[id]) startTimes[id] = {};
        if (!endTimes[id]) endTimes[id] = {};
          startTimes[id][type] = average.startTime;
          endTimes[id][type] = average.endTime;
      }
    }
    return { startTimes: startTimes, endTimes: endTimes };
}

function calculateAverage(times) {

    let startSum = 0;
    let endSum = 0;
    for(let i=0; i< times.length; i++){
        startSum += times[i].startTime;
        endSum += times[i].endTime;
    }
    let avgTimestamps = { startTime: Math.round(startSum / times.length), endTime: Math.round(endSum / times.length) };
    return avgTimestamps;
}

function decorateTaskWithTime(tasks, times) {
    tasks.forEach(task => {
        let id = task.config.id;
        let startTimes = times.startTimes[id];
        let endTimes = times.endTimes[id];
        task[startTimesString] = startTimes;
        task[endTimesString] = endTimes;
    })
}
