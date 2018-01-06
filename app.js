const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const config = require('./configuration/config');
const decorateStrategy = require('./strategies/montage-strategy');
const staticData = require('./csv_reader/read_csv');

console.log("Starting Application");
console.log("Configuration " + JSON.stringify(config));

// read dag file
fs.readFileAsync(config.path)
    .then(data => JSON.parse(data))
    .then(dag => initData(dag, config))
    .then(dag => decorateDag(dag, decorateStrategy))
    .then(dag => savePrettifyDag(dag))
    .then(() => console.log("Saved decorated DAG file as " + config.resultPath))
    .catch(console.error);

function decorateDag(dag, decorateStrategy) {
    if(!dag.tasks) {
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

function initData(dag, config) {
    return staticData.init(dag, config);
}