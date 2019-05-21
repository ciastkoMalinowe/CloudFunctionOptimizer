const fs = require('fs');
const csvParser = require('fast-csv');

const startTimesString = "startTime";
const finishTimesString = "finishTime";

const dagPath = process.argv[2];
const averageTimesPath = process.argv[3];
const configPath = process.argv[4];
const config = JSON.parse(fs.readFileSync(configPath));
const outputDag = process.argv[5];

if(!dagPath || !averageTimesPath || !configPath || !outputDag){
  throw new Error("Provide valid arguments: node time-decorator.js DAG_PATH AVERAGE_TIMES_CSV CONFIG OUTPUT_DAG");
}

console.log(`DAG file path is ${dagPath}`);

let dag = fs.readFileSync(dagPath);
dag = JSON.parse(dag);

if(!dag.tasks) throw new Error("There are no tasks in dag file");
let tasks = dag.tasks;
let functionTypesMap = {};

csvParser
  .fromPath(averageTimesPath, {delimiter: ' ', headers: true})
  .on("data", data => {
    if(!functionTypesMap[data.type]) functionTypesMap[data.type] = {};
    let idTypeMap = functionTypesMap[data.type];
    idTypeMap[data.task] = {
      startTime: Number(data.start),
      finishTime: Number(data.end),
      downloadedTime: Number(data.downloaded),
      executedTime: Number(data.executed),
      uploadedTime: Number(data.uploaded)
    };
  })
  .on("end", function () {
    decorateTaskWithTime(tasks, functionTypesMap);
    fs.writeFile(outputDag, JSON.stringify(dag, null, 2), (err) => { if (err) throw err; });
  });

function generateZeroStartTimes() {
  let output = {};

  const functionTypes = config.functionTypes;
  functionTypes.forEach(functionType => output[functionType] = 0);

  return output;
}

function calculateExecutionTimes(taskType, times, syntheticTime, startTimesDelay) {
  let output = {};

  const functionTypes = config.functionTypes;
  functionTypes.forEach( functionType => {

    const startTime = times[functionType][taskType][startTimesString];
    const finishTime = times[functionType][taskType][finishTimesString];
    const duration = finishTime - startTime;

    const baseStartTime = times['256'][taskType][startTimesString];
    const baseFinishTime = times['256'][taskType][finishTimesString];
    const baseDuration = baseFinishTime - baseStartTime;

    output[functionType] = startTimesDelay[functionType] + Math.round(syntheticTime * duration/baseDuration);
  });

  return output;
}

function decorateTaskWithTime(tasks, times) {
  let taskType;
  let startTimesDelay = {};
  let count = 1;
  let maxSynthenticRuntime;
  let ancestors;
  let syntheticRuntime;
  let decoratedTasks = [];

  tasks.forEach(task => {
    task.config.id = count;
    count++;

    taskType = task.name;
    if (taskType === "mImgTbl") taskType = "mImgtbl";

    maxSynthenticRuntime = 0;
    syntheticRuntime = task.config.synthetic_runtime * 1000;

    // Get all task ancestors
    ancestors = decoratedTasks.filter(t => task.ins.some(input => t.outs.includes(input)));
    startTimesDelay = generateZeroStartTimes();

    // Get finish times from ancestor with the longest execution
    ancestors.forEach(t => {
      if(maxSynthenticRuntime < syntheticRuntime) {
        maxSynthenticRuntime = syntheticRuntime;
        startTimesDelay = t[finishTimesString];
      }
    });

    // Add ancestor time execution to start/finish times
    task[startTimesString] = startTimesDelay;
    task[finishTimesString] = calculateExecutionTimes(taskType, times, syntheticRuntime, startTimesDelay);
    decoratedTasks.push(task);
  })
}
