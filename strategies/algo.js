const staticData = require('../csv_reader/read_csv');
const config = require('../configuration/config');

function costLow(tasks) {
  let functionNames = new Set(tasks.map(task => task.name));
  let execution_times_promise = staticData.avgExecutionTimes(functionNames, config.functionExecutionTimes);
  let price_promise = staticData.price(config.pricingData);

  return Promise.all([execution_times_promise, price_promise])
    .then(function([execution_times, price]) {

      let cheapest_resource = '128';
      let cost = 0.0;

      tasks.forEach(task => {
        let task_duration = execution_times[task.name];
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
  let execution_times_promise = staticData.avgExecutionTimes(functionNames, config.functionExecutionTimes);
  let price_promise = staticData.price(config.pricingData);


  return Promise.all([execution_times_promise, price_promise])
    .then(function([execution_times, price]) {

      let expensive_resource = '2048';
      let cost = 0.0;

      tasks.forEach(task => {
        let task_duration = execution_times[task.name];
        let time_slots = task_duration/100;   //check time format
        let resource_price = price[expensive_resource];
        let task_cost = time_slots * resource_price;
        cost = cost + task_cost;
      });
      return cost;
    });
}

exports.computeSchedule = computeSchedule;
exports.costLow = costLow;
exports.costHigh = costHigh;
