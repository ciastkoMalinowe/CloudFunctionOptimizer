const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const config = require(process.env.CONFIG_PATH ? process.env.CONFIG_PATH : '../configuration/config');
const decorateStrategy = require('./src/sdbws').decorateStrategy;

const dagPath = process.argv[2];
const outputPath = process.argv[3];

if(!dagPath || !outputPath){
  throw new Error("Provide valid arguments: node app.js DAG_PATH OUTPUT_PATH");
}

console.log("Starting Application");
console.log("Configuration " + JSON.stringify(config));

const stats = fs.statSync(dagPath);
if(!stats.isFile()) {
  throw new Error("Given path is not a file");
}

decorate(dagPath, outputPath);

// read dag file
function decorate(inputPath, outputPath) {
    fs.readFileAsync(inputPath)
      .then(data => JSON.parse(data))
      .then(dag => decorateDag(dag, decorateStrategy))
      .then(dag => savePrettifyDag(dag, outputPath))
      .then(() => console.log("Saved decorated DAG file as " + outputPath))
      .catch(console.error);
}

function decorateDag(dag, decorateStrategy) {
    if (!dag.tasks) {
        throw new Error("DAG file doesn't contain tasks within.")
    }
    decorateStrategy(dag);
    return dag;
}

function savePrettifyDag(dag, outputPath) {
    let objectToSave = JSON.stringify(dag, null, 2);
    return fs.writeFileAsync(outputPath, objectToSave);
}
