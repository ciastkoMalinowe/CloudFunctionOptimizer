const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const config = require('./configuration/config');
const decorateStrategy = require('./strategies/dbws-strategy');
const staticData = require('./csv_reader/csv-reader');

console.log("Starting Application");
console.log("Configuration " + JSON.stringify(config));

// read dag file
fs.readFileAsync(config.path)
    .then(data => JSON.parse(data))
    .then(dag => scaleTimes(dag, config))
    .then(dag => initData(dag, config))
    .then(data => decorateDag(data.dag, data.data, decorateStrategy))
    .then(dag => savePrettifyDag(dag))
    .then(() => console.log("Saved decorated DAG file as " + config.resultPath))
    .catch(console.error);

function decorateDag(dag, data, decorateStrategy) {
    if(!dag.tasks) {
        throw new Error("DAG file doesn't contain tasks within.")
    }
    decorateStrategy(dag, data);
    return dag;
}

function savePrettifyDag(dag) {
    let path = config.resultPath;
    let objectToSave = JSON.stringify(dag, null, 2);
    return fs.writeFileAsync(path, objectToSave);
}

function initData(dag, config) {
    return staticData.init(dag, config)
      .then(data => {
          return {
            data: data,
            dag: dag
          }
    });
}

function scaleTimes(dag, config) {
  dag.tasks.forEach(task => {
    task.resourceTimes = {};
    let bestTime = task.runtime;
    let bestResource = "2048";
    config.functionTypes.forEach(type => {
      if (type === bestResource) {
        task.resourceTimes[type] = parseFloat(bestTime);
      } else {
        let resource = config.gcf[type];
        task.resourceTimes[type] = (bestTime/resource.cpu) * config.gcf[bestResource].cpu;
      }
    })
  });
  return dag;
}