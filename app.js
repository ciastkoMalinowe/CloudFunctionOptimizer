const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const config = require('./configuration/config');
const decorateStrategy = require('./strategies/dbws-strategy');

console.log("Starting Application");
console.log("Configuration " + JSON.stringify(config));

// read dag file
fs.readFileAsync(config.path)
    .then(data => JSON.parse(data))
    .then(dag => scaleTimes(dag, config))
    .then(dag => decorateDag(dag, decorateStrategy))
    .then(dag => savePrettifyDag(dag))
    .then(() => console.log("Saved decorated DAG file as " + config.resultPath))
    .catch(console.error);

function scaleTimes(dag, config) {
    dag.tasks.forEach(task => {
        task.resourceTimes = {};
        const bestTime = task.runtime;
        const bestResource = "2048";

        config.functionTypes.forEach(type => {
            assignResourceTimes(task, type, bestResource, bestTime);
        })
    });
    return dag;
}

function assignResourceTimes(task, type, bestResource, bestTime) {
    if (type === bestResource) {
        task.resourceTimes[type] = parseFloat(bestTime);
    } else {
        let resource = config.gcf[type];
        let time = bestTime / resource.cpu * config.gcf[bestResource].cpu;
        task.resourceTimes[type] = Math.round(time * 1000) / 1000;
    }
}

function decorateDag(dag, decorateStrategy) {
    if (!dag.tasks) {
        throw new Error("DAG file doesn't contain tasks within.")
    }
    decorateStrategy(dag);
    return dag;
}

function savePrettifyDag(dag) {
    let path = config.resultPath;
    let objectToSave = JSON.stringify(dag, null, 2);
    return fs.writeFileAsync(path, objectToSave);
}
