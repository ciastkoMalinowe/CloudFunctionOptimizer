const Promise = require('bluebird');
const fs = require('fs');
const parse = require('csv-parse');

function init(dag, config) {

  let tasks = dag.tasks;

  let functionNames = new Set(tasks.map(task => task.name));
  let price_promise = price(config.pricingData);
  let resource_times_promise = functionResourceTimes(functionNames, config.functionResourceTimes);

  return Promise.all([resource_times_promise, price_promise])
    .then(function([resource_times, price]) {
      return {
        resources: ['128', '256', '512', '1024', '2048'],
        resourceTimes: resource_times,
        price: price
      }
    });
}

let parseFile = function (file, delimiter) {
  return new Promise(function (resolve, reject) {
    let parser = parse({delimiter: delimiter, from: 2},
      function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
        parser.end();
      });
    fs.createReadStream(file).pipe(parser);
  })
};


function price(pricingData) {
  return parseFile(pricingData, ';')
    .then(data => {
      let price = {};
      data.forEach(line => price[line[0]] = line[1]);
      return price;
    });
}

function functionResourceTimes(functionNames, resourceTimes) {
  return parseFile(resourceTimes, ';')
    .then(data => {
      let functionTimes = {};
      functionNames.forEach(functionName => {
        functionTimes[functionName] = {"128": 0, "256": 0, "512": 0, "1024": 0, "2048": 0};
      });

      data.forEach(function (line) {
        functionTimes[line[0]]["128"] = parseFloat(line[1]);
        functionTimes[line[0]]["256"] = parseFloat(line[2]);
        functionTimes[line[0]]["512"] = parseFloat(line[3]);
        functionTimes[line[0]]["1024"] = parseFloat(line[4]);
        functionTimes[line[0]]["2048"] = parseFloat(line[5]);

      });

      return functionTimes;
    });
}

exports.price = price;
exports.functionResourceTimes = functionResourceTimes;
exports.init = init;
