const Promise = require('bluebird');
const fs = require('fs');
const parse = require('csv-parse');

function init(dag, config) {

  let tasks = dag.tasks;

  let functionNames = new Set(tasks.map(task => task.name));
  let price_promise = price(config.pricingData);
  let resource_times_promise = functionResourceTimes(functionNames, config.functionResourceTimes);
  let execution_times_promise = avgExecutionTimes(functionNames, config.functionExecutionTimes);
  let total_cost_promise = totalCost(config.pricingData, config.executionData);

  return Promise.all([resource_times_promise, price_promise, execution_times_promise, total_cost_promise])
    .then(function([resource_times, price, execution_times, total_cost]) {
      return {
        resources: ['128', '256', '512', '1024', '2048'],
        resourceTimes: resource_times,
        price: price,
        executionTimes: execution_times,
        totalCost: total_cost
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

function totalCost(pricingData, executionData) {
  let parsePrices = parseFile(pricingData, ';')
    .then(data => {
      let price = {};
      data.forEach(line => price[line[0]] = line[1]);
      return price;
    });


  let parsedTimes = parseFile(executionData, ';')
    .then(data => {

      let times = {"1024": 0, "128": 0, "2048": 0, "256": 0, "512": 0};
      let count = 0;

      data.forEach(function (line) {
        if (!(line.indexOf("undefined") > -1)) {
          times["1024"] += parseFloat(line[1]);
          times["128"] += parseFloat(line[2]);
          times["2048"] += parseFloat(line[3]);
          times["256"] += parseFloat(line[4]);
          times["512"] += parseFloat(line[5]);
          count++;
        }
      });

      return {
        "128": times["128"] / count,
        "256": times["256"] / count,
        "512": times["512"] / count,
        "1024": times["1024"] / count,
        "2048": times["2048"] / count
      };
    });

  return parsedTimes.then(mean_times => {
    return parsePrices.then(prices => {
      return {
        "128": prices["128"] * (mean_times["128"] * 10),
        "256": prices["256"] * (mean_times["256"] * 10),
        "512": prices["512"] * (mean_times["512"] * 10),
        "1024": prices["1024"] * (mean_times["1024"] * 10),
        "2048": prices["2048"] * (mean_times["2048"] * 10)
      };
    })
  });
}

function avgExecutionTimes(functionNames, executionTimes) {
  return parseFile(executionTimes, ' ')
    .then(data => {
      let functionTimes = {};
      functionNames.forEach(functionName => functionTimes[functionName] = {time: 0, count: 0});

      data.forEach(function (line) {
        functionTimes[line[0]].time += parseFloat(line[3]);
        functionTimes[line[0]].count += 1;
      });

      let avgTimes = {};
      Object.keys(functionTimes).forEach(key => {
          avgTimes[key] = functionTimes[key].time/functionTimes[key].count;
      });

      return avgTimes;
    });
}

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

exports.totalCost = totalCost;
exports.avgExecutionTimes = avgExecutionTimes;
exports.price = price;
exports.functionResourceTimes = functionResourceTimes;
exports.init = init;
