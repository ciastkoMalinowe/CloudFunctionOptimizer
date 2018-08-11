const fs = require('fs');
const config = require(process.env.CONFIG_PATH ? process.env.CONFIG_PATH : '../configuration/config.js');
const taskUtils = require('../src/task-utilities');

const dagPath = process.argv[2];
const csvPath = process.argv[3];
const timestampsCSVPath = process.argv[4];

if(!dagPath || !csvPath || !timestampsCSVPath){
    throw new Error("Provide valid arguments: node extractor.js DIR_PATH CSV_PATH TIMESTAMPS_CSV_PATH");
}

console.log(`Path to DAG is ${dagPath}`);
console.log(`Output CSV path is ${csvPath}`);
console.log(`Output timestamps CSV path is ${timestampsCSVPath}`);

const stats = fs.statSync(dagPath);

if(!stats.isFile()) {
    throw new Error("Given path is not a file");
}

fs.writeFileSync(csvPath, "type time price\n");
fs.writeFileSync(timestampsCSVPath, "task id resource start end time type\n");

saveToCSV(dagPath);

function saveToCSV(file) {

    fs.readFile(file, (err, dag) => {
        dag = JSON.parse(dag);
        isDAGValid(dag);
        const tasks = dag.tasks;
        const functionTypes = Object.keys(config.prices);
        functionTypes.forEach(type => appendTimeAndPriceByType(tasks, type));
        appendFinishTimeAndPriceForReal(tasks);
        appendTimestampsForDBWS(tasks);
    });
}

function isDAGValid(dag) {

    const tasks = dag.tasks;

    if(!tasks){
        throw  new Error("There are no tasks in DAG!");
    }

    tasks.forEach(task => {
        // if(!task.resourceTimes){
        //     throw new Error("There are no resourceTimes in DAG!");
        // }
        //
        // if(!task.resourceTimes['real']){
        //     throw new Error("There are no real times in tasks")
        // }

        if(!task.config.deploymentType){
            throw new Error("There is no deploymentType in task");
        }
    })
}

function appendTimeAndPriceByType(tasks, type) {

    let price = 0;

    let maxLevel = taskUtils.findTasksMaxLevel(tasks);
    let maxLevelTasks = taskUtils.findTasksFromLevel(tasks, maxLevel);
    let maxFinishTime = Math.max(...maxLevelTasks.map(task => task.finishTime[type]));

    tasks.forEach(task => {
      let taskTime = task.finishTime[type] - task.startTime[type];
      let timeSlots = Math.ceil(taskTime/100);
      price += timeSlots * config.prices[type];
    });

    maxFinishTime = normalizeDouble(maxFinishTime);
    price = normalizeDouble(price, 10);

    console.log(`${type} ${maxFinishTime} ${price}`);

    fs.appendFile(csvPath,`${type} ${maxFinishTime} ${price}\n`, console.err)
}

function appendFinishTimeAndPriceForReal(tasks) {
    let price = 0;

    let maxLevel = taskUtils.findTasksMaxLevel(tasks);
    let maxLevelTasks = taskUtils.findTasksFromLevel(tasks, maxLevel);
    let maxFinishTime = Math.max(...maxLevelTasks.map(task => task.finishTime['real']));

    tasks.forEach(task => {
        let taskTime = task.finishTime['real'] - task.startTime['real'];
        let timeSlots = Math.ceil(taskTime/100);
        price += timeSlots * config.prices[task.config.deploymentType];
    });

    maxFinishTime = normalizeDouble(maxFinishTime);
    price = normalizeDouble(price, 10);

    console.log(`real ${maxFinishTime} ${price}`);

    fs.appendFile(csvPath,`real ${maxFinishTime} ${price}\n`, console.err)
}


function appendTimestampsForDBWS(tasks) {
    let maxLevel = taskUtils.findTasksMaxLevel(tasks);

    for (let level = 1; level <= maxLevel; level++) {
        let tasksFromLevel = taskUtils.findTasksFromLevel(tasks, level);
        tasksFromLevel.forEach(task => {

            let time = task.finishTime[task.config.deploymentType] - task.startTime[task.config.deploymentType];
            let predecessors = taskUtils.findPredecessorForTask(tasks, task);
            if(!predecessors || predecessors.length === 0) {
                task.startTime['dbws'] = 0;
            } else {
                task.startTime['dbws'] = Math.max(...predecessors.map(ptask => ptask.finishTime['dbws']));
            }
            task.finishTime['dbws'] = task.startTime['dbws'] + time;
            appendToTimestampsCSVfile(task, time);
        });
    }

    let price = 0;

    let maxLevelTasks = taskUtils.findTasksFromLevel(tasks, maxLevel);
    let maxFinishTime = Math.max(...maxLevelTasks.map(task => task.finishTime['dbws']));

    tasks.forEach(task => {
        let taskTime = task.finishTime['dbws'] - task.startTime['dbws'];
        let timeSlots = Math.ceil(taskTime/100);
        price += timeSlots * config.prices[task.config.deploymentType];
    });

    maxFinishTime = normalizeDouble(maxFinishTime);
    price = normalizeDouble(price, 10);

    console.log(`sdbws ${maxFinishTime} ${price}`);

    fs.appendFileSync(csvPath,`sdbws ${maxFinishTime} ${price}\n`)
}

function appendToTimestampsCSVfile(task, time) {
    fs.appendFileSync(timestampsCSVPath,`${task.name} ${task.config.id} ${task.config.deploymentType} ${task.startTime['dbws']} ${task.finishTime['dbws']} ${time} dbws \n`)
}

function normalizeDouble(number, n = 3) {
    return Math.round(number * Math.pow(10, n)) / Math.pow(10, n);
}

