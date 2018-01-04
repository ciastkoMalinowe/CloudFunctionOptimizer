const staticData = require('../csv_reader/read_csv');
const config = require('../configuration/config');

function costLow(tasks) {
  let functionNames = new Set(tasks.map(task => task.name));
  let price_promise = staticData.price(config.pricingData);
  let resource_times_promise = staticData.functionResourceTimes(functionNames, config.functionResourceTimes);

  return Promise.all([resource_times_promise, price_promise])
    .then(function([resource_times, price]) {

      let cheapest_resource = '128';
      let cost = 0.0;

      tasks.forEach(task => {
        let task_duration = resource_times[task.name][cheapest_resource];
        let time_slots = task_duration/100;   //check time format
        let resource_price = price[cheapest_resource];
        let task_cost = time_slots * resource_price;
        cost = cost + task_cost;
      });
      return cost;
    });
}

function costHigh(tasks) {
  let functionNames = new Set(tasks.map(task => task.name));
  let resource_times_promise = staticData.functionResourceTimes(functionNames, config.functionResourceTimes);
  let price_promise = staticData.price(config.pricingData);


  return Promise.all([resource_times_promise, price_promise])
    .then(function([resource_times, price]) {

      let expensive_resource = '2048';
      let cost = 0.0;

      tasks.forEach(task => {
        let task_duration = resource_times[task.name][expensive_resource];
        let time_slots = task_duration/100;   //check time format
        let resource_price = price[expensive_resource];
        let task_cost = time_slots * resource_price;
        cost = cost + task_cost;
      });
      return cost;
    });
}

exports.costLow = costLow;
exports.costHigh = costHigh;
