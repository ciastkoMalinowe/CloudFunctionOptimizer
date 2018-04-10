const fs = require('fs');
const path = require('path');
const csvParser = require('fast-csv');

const resourceTimesString = "resourceTimes";

const dagPath = process.argv[2];
const csvPath = process.argv[3];

if(!csvPath || ! dagPath){
    throw new Error("Provide valid arguments: node time-decorator.js DAG_PATH CSV_PATH");
}

console.log(`DAG file path is ${dagPath}`);
console.log(`CSV file path is ${csvPath}`);

let dag = fs.readFileSync(dagPath);
dag = JSON.parse(dag);

if(!dag.tasks){
    throw new Error("There are no tasks in dag file");
}

let tasks = dag.tasks;
let resourceTimes = {};

csvParser
    .fromPath(csvPath, {delimiter: ' '})
    .on("data", data => {
        let id = data[1];
        let time = data[4];
        let type = data[5];
        if(!resourceTimes[id]) resourceTimes[id] = {};
        resourceTimes[id][type] = Number(time)/1000;
    })
    .on("end", function () {
        decorateTaskWithTime(tasks, resourceTimes);
        fs.writeFile("./output/" + path.basename(dagPath), JSON.stringify(dag, null, 2), (err) => {
            if (err) throw err;
        });
    });

function decorateTaskWithTime(tasks, times) {
    tasks.forEach(task => {
        let id = task.config.id;
        let resourceTimes = times[id];
        task[resourceTimesString] = resourceTimes;
    })

}

