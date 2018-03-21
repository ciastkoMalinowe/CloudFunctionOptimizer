const taskUtils = require('./task-utilities');
const config = require('../configuration/config');

function costLow(tasks) {

    let cost = 0.0;

    tasks.forEach(task => {
      let task_cost = findSmallestCost(task);
      cost = cost + task_cost;
    });

    return cost;
}

function findSmallestCost(task) {

    let resourceCosts = config.functionTypes.map(resource => {
        let taskTimeOnResource = taskUtils.findTaskExecutionTimeOnResource(task, resource);
        let resourceCost =  Math.ceil(taskTimeOnResource * 10) * config.gcf[resource].price;
        return resourceCost;
    });

    let minCost = Number.MAX_VALUE;
    resourceCosts.forEach(resourceCost => {
        if (resourceCost < minCost) {
            minCost = resourceCost;
        }
    });

    return minCost;
}

function costHigh(tasks) {

    let cost = 0.0;

    tasks.forEach(task => {
      let taskCost = findBiggestCost(task);
      cost = cost + taskCost;
    });

    return cost;
}

function findBiggestCost(task) {
  let resourceCosts = config.functionTypes.map(resource => {
    let taskTimeOnResource = taskUtils.findTaskExecutionTimeOnResource(task, resource);
    let resourceCost = Math.ceil(taskTimeOnResource * 10) * config.gcf[resource].price;
    return resourceCost;
  });

  let maxCost = Number.MIN_VALUE;
  resourceCosts.forEach(resourceCost => {
    if (resourceCost > maxCost) {
      maxCost = resourceCost;
    }
  });

  return maxCost;
}

function maxDeadline(tasks) {
  let time = 0.0;
  for (let level = 1; level <= taskUtils.findTasksMaxLevel(tasks); level++) {
    time = time + Math.max(...taskUtils.findTasksFromLevel(tasks, level).map(task =>
        taskUtils.findMaxTaskExecutionTime(task)));
  }

  return time;
}

function minDeadline(tasks) {
  let time = 0.0;
  for (let level = 1; level <= taskUtils.findTasksMaxLevel(tasks); level++) {
    time = time + Math.max(...taskUtils.findTasksFromLevel(tasks, level).map(task =>
      taskUtils.findMinTaskExecutionTime(task)));
  }

  return time;
}

exports.costLow = costLow;
exports.costHigh = costHigh;
exports.maxDeadline = maxDeadline;
exports.minDeadline = minDeadline;
