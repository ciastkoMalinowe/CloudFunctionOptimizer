const fs = require('fs');
const prices = require("./price.config");
const taskUtils = require('../strategies/task-utilities');

const dagPath = process.argv[2];
const csvPath = process.argv[3];

if(!dagPath || !csvPath){
    throw new Error("Provide valid arguments: node extractor.js DIR_PATH CSV_PATH");
}

console.log(`Path to DAG is ${dagPath}`);
console.log(`Output CSV path is ${csvPath}`);

const stats = fs.statSync(dagPath);

if(!stats.isFile()) {
    throw new Error("Given path is not a file");
}

fs.writeFileSync(csvPath, "type,time,price\n");
saveToCSV(dagPath);

function saveToCSV(file) {

    fs.readFile(file, (err, dag) => {
        dag = JSON.parse(dag);
        isDAGValid(dag);
        const tasks = dag.tasks;
        const functionTypes = Object.keys(prices);
        functionTypes.forEach(type => appendTimeAndPriceByType(tasks, type));
        decorateWithFinishTimeForReal(tasks);
        decorateWithFinishTimeForDeploymentType(tasks);
        appendTimeAndPriceForRealTimes(tasks);
        appendTimeAndPriceByDeploymentType(tasks);
    });
}

function isDAGValid(dag) {

    const tasks = dag.tasks;

    if(!tasks){
        throw  new Error("There are no tasks in DAG!");
    }

    tasks.forEach(task => {
        if(!task.resourceTimes){
            throw new Error("There are no resourceTimes in DAG!");
        }

        if(!task.resourceTimes['real']){
            throw new Error("There are no real times in tasks")
        }

        if(!task.config.deploymentType){
            throw new Error("There is no deploymentType in task");
        }
    })
}

function appendTimeAndPriceByType(tasks, type) {

    let price = 0;

    let maxLevel = taskUtils.findTasksMaxLevel(tasks);
    let maxLevelTasks = taskUtils.findTasksFromLevel(tasks, maxLevel);
    let finishTime = Math.max(...maxLevelTasks.map(task => task.finishTime[type]));

    tasks.forEach(task => {
      let taskTime = task.resourceTimes[type];
      let timeSlots = Math.ceil(taskTime * 10);
      price += timeSlots * prices[type];
    });

    finishTime = normalizeDouble(finishTime);
    price = normalizeDouble(price, 10);

    console.log(`${type} ${finishTime} ${price}`);

    fs.appendFile(csvPath,`${type},${finishTime},${price}\n`, console.err)
}

function decorateWithFinishTimeForReal(tasks) {

  let time = 0.0;

  for (let level = 1; level <= taskUtils.findTasksMaxLevel(tasks); level++) {
    let tasksFromLevel = taskUtils.findTasksFromLevel(tasks, level);

    tasksFromLevel.forEach(task => {
      let predecessors = taskUtils.findPredecessorForTask(tasks, task);

      if(!predecessors || predecessors.length === 0){
        time = task.resourceTimes['real'];
        task.finishTime['real'] = time;
      } else {
        let predMaxFinishTime = Math.max(...predecessors.map(ptask => ptask.finishTime['real']));
        time = task.resourceTimes['real'] + predMaxFinishTime;
        task.finishTime['real'] = time;
      }
    });
  }
}


function decorateWithFinishTimeForDeploymentType(tasks) {

  let time = 0.0;

  for (let level = 1; level <= taskUtils.findTasksMaxLevel(tasks); level++) {
    let tasksFromLevel = taskUtils.findTasksFromLevel(tasks, level);

    tasksFromLevel.forEach(task => {
      let predecessors = taskUtils.findPredecessorForTask(tasks, task);

      if(!predecessors || predecessors.length === 0){
        time = taskUtils.findTaskExecutionTimeOnResource(task, task.config.deploymentType);
        task.finishTime['dbws'] = time;
      } else {
        let predMaxFinishTime = Math.max(...predecessors.map(ptask => ptask.finishTime['dbws']));
        time = taskUtils.findTaskExecutionTimeOnResource(task, task.config.deploymentType) + predMaxFinishTime;
        task.finishTime['dbws'] = time;
      }
    });
  }
}

function appendTimeAndPriceForRealTimes(tasks) {

    let time = 0;
    let price = 0;

    let maxLevel = taskUtils.findTasksMaxLevel(tasks);
    let maxLevelTasks = taskUtils.findTasksFromLevel(tasks, maxLevel);
    let finishTime = Math.max(...maxLevelTasks.map(task => task.finishTime['real']));

    tasks.forEach(task => {
        let taskTime = task.resourceTimes['real'];
        let timeSlots = Math.ceil(taskTime * 10);
        price += timeSlots * prices[task.config.deploymentType];
    });

    time = normalizeDouble(finishTime);
    price = normalizeDouble(price, 10);

    console.log(`real ${time} ${price}`);

    fs.appendFile(csvPath,`real,${time},${price}\n`, console.err)

}

function appendTimeAndPriceByDeploymentType(tasks) {

    let time = 0;
    let price = 0;

    let maxLevel = taskUtils.findTasksMaxLevel(tasks);
    let maxLevelTasks = taskUtils.findTasksFromLevel(tasks, maxLevel);
    let finishTime = Math.max(...maxLevelTasks.map(task => task.finishTime['dbws']));


    tasks.forEach(task => {
        let taskTime = task.resourceTimes[task.config.deploymentType];
        let timeSlots = Math.ceil(taskTime * 10);
        price += timeSlots * prices[task.config.deploymentType];
    });

    time = normalizeDouble(finishTime);
    price = normalizeDouble(price, 10);

    console.log(`dbws ${time} ${price}`);

    fs.appendFile(csvPath,`dbws,${time},${price}\n`, console.err)
}


function normalizeDouble(number, n = 3) {
    return Math.round(number * Math.pow(10, n)) / Math.pow(10, n);
}

