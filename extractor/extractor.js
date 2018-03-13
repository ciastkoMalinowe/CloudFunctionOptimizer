const fs = require('fs');
const prices = require("./price.config");

const dirPath = process.argv[2];
const csvPath = process.argv[3];

if(!dirPath || !csvPath){
    throw new Error("Provide valid arguments: node extractor.js DIR_PATH CSV_PATH");
}

console.log(`Path to folder with DAG is ${dirPath}`);
console.log(`Output CSV path is ${csvPath}`);

const stats = fs.statSync(dirPath);

if(!stats.isDirectory()) {
    throw new Error("Given path is not directory");
}

fs.writeFileSync(csvPath, "type,time,price\n");

fs.readdir(dirPath, (err,files) => files.forEach(
    file => saveToCSV(dirPath + "/" + file)
));

function saveToCSV(file) {

    fs.readFile(file, (err, dag) => {
        dag = JSON.parse(dag);
        isDAGValid(dag);
        const tasks = dag.tasks;
        Object.keys(prices).forEach(type => appendTimeAndPriceByType(tasks, type));
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
    })
}

function appendTimeAndPriceByType(tasks, type) {

    let time = 0;
    tasks.forEach(task => time += task.resourceTimes[type]);
    let price = time * prices[type];

    time = normalizeDouble(time);
    price = normalizeDouble(price, 10);

    console.log(`${type} ${time} ${price}`);

    fs.appendFile(csvPath,`${type},${time},${price}\n`, console.err)
}

function appendTimeAndPriceByDeploymentType(tasks) {

    let time = 0;
    let price = 0;

    tasks.forEach(task => {
        let taskTime = task.resourceTimes[task.deploymentType];
        time += taskTime;
        price += taskTime * prices[task.deploymentType];
    });

    time = normalizeDouble(time);
    price = normalizeDouble(price, 10);

    console.log(`dbws ${time} ${price}`);

    fs.appendFile(csvPath,`dbws,${time},${price}\n`, console.err)
}


function normalizeDouble(number, n = 3) {
    return Math.round(number * Math.pow(10, n)) / Math.pow(10, n);
}

