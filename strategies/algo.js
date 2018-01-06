const taskUtils = require('./task-utilities');

function costLow(tasks, data) {

    let cost = 0.0;

    tasks.forEach(task => {
      let resource = cheapestResource(task, data);
      let task_duration = data.resourceTimes[task.name][resource];
      let time_slots = task_duration/100;   //check time format
      let resource_price = data.price[resource];
      let task_cost = time_slots * resource_price;
      cost = cost + task_cost;
    });
    return cost;
}

function costHigh(tasks, data) {
    let cost = 0.0;

    tasks.forEach(task => {
      let resource = mostExpensiveResource(task, data);
      let task_duration = data.resourceTimes[task.name][resource];
      let time_slots = task_duration/100;   //check time format
      let resource_price = data.price[resource];
      let task_cost = time_slots * resource_price;
      cost = cost + task_cost;
    });
    return cost;
}

function cheapestResource(task, data) {

  let resourceCosts = data.resources.map(resource => {
    let taskTimeOnResource = taskUtils.findTaskExecutionTimeOnResource(task, resource, data);
    let resourceCost = taskTimeOnResource * data.price[resource];
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

function mostExpensiveResource(task, data) {
  let resourceCosts = data.resources.map(resource => {
    let taskTimeOnResource = taskUtils.findTaskExecutionTimeOnResource(task, resource, data);
    let resourceCost = taskTimeOnResource * data.price[resource];
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

exports.costLow = costLow;
exports.costHigh = costHigh;
