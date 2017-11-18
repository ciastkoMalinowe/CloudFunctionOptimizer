const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const config = require('./configuration/config');
const decorateStrategy = require('./strategies/montage-strategy');

console.log("Starting Application");
console.log("Configuration " + JSON.stringify(config));

// read dag file
fs.readFileAsync(config.path)
    .then(data => JSON.parse(data))
    .then(dag => decorateTasks(dag, decorateStrategy))
    .then(dag => savePrettifyDag(dag))
    .then(() => console.log("Saved decorated DAG file as " + config.resultPath))
    .catch(console.error);

function decorateTasks(dag, decorateStrategy) {
    let tasks = dag.tasks;
    if(!tasks) {
        throw new Error("DAG file doesn't contain tasks within.")
    }
    decorateStrategy(tasks);
    return dag;
}

function savePrettifyDag(dag) {
    let path = config.resultPath;
    let objectToSave = JSON.stringify(dag, null, 2);
    return fs.writeFileAsync(path, objectToSave);
}