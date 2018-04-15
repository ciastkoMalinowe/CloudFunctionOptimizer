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

    let time = 0.0;
    let price = 0;

    for (let level = 1; level <= taskUtils.findTasksMaxLevel(tasks); level++) {
      time = time + Math.max(...taskUtils.findTasksFromLevel(tasks, level)
          .map(task => task.resourceTimes[type]))
    }

    tasks.forEach(task => {
      let taskTime = task.resourceTimes[type];
      let timeSlots = Math.ceil(taskTime * 10);
      price += timeSlots * prices[type];
    });

    time = normalizeDouble(time);
    price = normalizeDouble(price, 10);

    console.log(`${type} ${time} ${price}`);

    fs.appendFile(csvPath,`${type},${time},${price}\n`, console.err)
}

function appendTimeAndPriceForRealTimes(tasks) {

    let time = 0;
    let price = 0;

    for (let level = 1; level <= taskUtils.findTasksMaxLevel(tasks); level++) {
        time = time + Math.max(...taskUtils.findTasksFromLevel(tasks, level)
            .map(task => task.resourceTimes['real']))

    }

    tasks.forEach(task => {
        let taskTime = task.resourceTimes['real'];
        let timeSlots = Math.ceil(taskTime * 10);
        price += timeSlots * prices[task.config.deploymentType];
    });

    time = normalizeDouble(time);
    price = normalizeDouble(price, 10);

    console.log(`real ${time} ${price}`);

    fs.appendFile(csvPath,`real,${time},${price}\n`, console.err)

}

function appendTimeAndPriceByDeploymentType(tasks) {

    let time = 0;
    let price = 0;

    for (let level = 1; level <= taskUtils.findTasksMaxLevel(tasks); level++) {
      time = time + Math.max(...taskUtils.findTasksFromLevel(tasks, level)
          .map(task => task.resourceTimes[task.config.deploymentType]))

    }

    tasks.forEach(task => {
        let taskTime = task.resourceTimes[task.config.deploymentType];
        let timeSlots = Math.ceil(taskTime * 10);
        price += timeSlots * prices[task.config.deploymentType];
    });

    time = normalizeDouble(time);
    price = normalizeDouble(price, 10);

    console.log(`dbws ${time} ${price}`);

    fs.appendFile(csvPath,`dbws,${time},${price}\n`, console.err)
}


function normalizeDouble(number, n = 3) {
    return Math.round(number * Math.pow(10, n)) / Math.pow(10, n);
}

