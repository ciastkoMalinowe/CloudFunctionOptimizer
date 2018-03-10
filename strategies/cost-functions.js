const taskUtils = require('./task-utilities');
const config = require('../configuration/config');

function costLow(tasks) {

    let cost = 0.0;

    tasks.forEach(task => {
      let resource = cheapestResource(task);
      let task_duration = task.resourceTimes[resource];
      let time_slots = task_duration/100;   //todo check time format
      let resource_price = config.gcf[resource].price;
      let task_cost = time_slots * resource_price;
      cost = cost + task_cost;
    });
    return cost;
}

function costHigh(tasks) {
    let cost = 0.0;

    tasks.forEach(task => {
      let resource = mostExpensiveResource(task);
      let task_duration = task.resourceTimes[resource];
      let time_slots = task_duration/100;   //todo check time format
      let resource_price = config.gcf[resource].price;
      let task_cost = time_slots * resource_price;
      cost = cost + task_cost;
    });
    return cost;
}

function cheapestResource(task) {

  let resourceCosts = config.functionTypes.map(resource => {
    let taskTimeOnResource = taskUtils.findTaskExecutionTimeOnResource(task, resource);
    let resourceCost = taskTimeOnResource * config.gcf[resource].price;
    return {
      resource: resource,
      cost: resourceCost
    }
  });

  let resource = '';
  let cost = Number.MAX_VALUE;
  resourceCosts.forEach(resourceCost => {
    if (resourceCost.cost < cost) {
      cost = resourceCost.cost;
      resource = resourceCost.resource;
    }
  });
  return resource;
}

function mostExpensiveResource(task) {
  let resourceCosts = config.functionTypes.map(resource => {
    let taskTimeOnResource = taskUtils.findTaskExecutionTimeOnResource(task, resource);
    let resourceCost = taskTimeOnResource * config.gcf[resource].price;
    return {
      resource: resource,
      cost: resourceCost
    }
  });

  let resource = '';
  let cost = Number.MIN_VALUE;
  resourceCosts.forEach(resourceCost => {
    if (resourceCost.cost > cost) {
      cost = resourceCost.cost;
      resource = resourceCost.resource;
    }
  });
  return resource;
}

function maxDeadline(tasks) {
  let time = 0.0;
  tasks.forEach(task => {
    time = time + taskUtils.findMaxTaskExecutionTime(task);
  });
  return time;
}

function minDeadline(tasks) {
  let time = 0.0;
  tasks.forEach(task => {
    time = time + taskUtils.findMinTaskExecutionTime(task);
  });
  return time;
}

exports.costLow = costLow;
exports.costHigh = costHigh;
exports.maxDeadline = maxDeadline;
exports.minDeadline = minDeadline;
