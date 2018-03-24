const toposort = require('toposort');
const config = require('../configuration/config');

function findTopologySortedList(tasks) {

    const graph = [];

    tasks.forEach(task => {
        let successors = findSuccessorsForTask(tasks, task);
        successors.forEach(successorTask => graph.push([task, successorTask]))
    });

    return toposort(graph);
}

function decorateWithFinishTime(tasks, task, resourceType) {

  let predecessors = findPredecessorsForTask(tasks, task);

  if(!predecessors || predecessors.length === 0){
    let time = findTaskExecutionTimeOnResource(task, resourceType);
    task.finishTime[resourceType] = time;
    return time;
  }

  let predMaxTime = Math.max(...predecessors.map(ptask => decorateWithFinishTime(tasks, ptask, resourceType)));
  let time = findTaskExecutionTimeOnResource(task, resourceType) + predMaxTime;
  task.finishTime[resourceType] = time;
  return time;
}

function findTaskFinishTimeOnResource(task, resourceType) {
    return task.finishTime[resourceType];
}

function findPredecessorsForTask(tasks, task) {
    return tasks.filter(
        filteredTask => task.ins.some(
            input => filteredTask.outs.includes(input)
        )
    )
}

function findSuccessorsForTask(tasks, task) {
    return tasks.filter(
        filteredTask => filteredTask.ins.some(
            input => task.outs.includes(input)
        )
    )
}

function findFirstTasks(tasks, ins) {
    return tasks.filter(
        task => task.ins.every(
            input => ins.includes(input)
        )
    );
}

function findTasksFromLevel(tasks, level) {
    return tasks.filter(task => task.level === level);
}

function findTasksMaxLevel(tasks) {
    return Math.max(...tasks.map(task => task.level));
}

function findTaskExecutionTimes(task) {
    return task.resourceTimes;
}

function findTaskExecutionTimeOnResource(task, resourceType) {
    return findTaskExecutionTimes(task)[resourceType];
}

function findMaxTaskExecutionTime(task) {
    let times = findTaskExecutionTimes(task);
    return Math.max(...Object.values(times));
}

function findMinTaskExecutionTime(task){
  let times = findTaskExecutionTimes(task);
  return Math.min(...Object.values(times));
}

function findTaskExecutionCost(task) {
  let cost = {};
  config.functionTypes.forEach(resourceType => {
    let slotTimes = Math.ceil(findTaskExecutionTimeOnResource(task, resourceType) * 10);
    cost[resourceType] = slotTimes * config.gcf[resourceType].price;
  });
  return cost;
}

function findTaskExecutionCostOnResource(task, resourceType) {
    return findTaskExecutionCost(task)[resourceType];
}

function findMaxTaskExecutionCost(task) {
    let cost = findTaskExecutionCost(task);
    return Math.max(...Object.values(cost));
}

function findMinTaskExecutionCost(task){
  let cost = findTaskExecutionCost(task);
  return Math.min(...Object.values(cost));
}


module.exports = {
    findTopologySortedList: findTopologySortedList,
    findSuccessorsForTask: findSuccessorsForTask,
    findPredecessorForTask: findPredecessorsForTask,
    findFirstTasks: findFirstTasks,
    findTasksFromLevel: findTasksFromLevel,
    findTasksMaxLevel: findTasksMaxLevel,
    findTaskExecutionTime: findTaskExecutionTimes,
    findMaxTaskExecutionTime: findMaxTaskExecutionTime,
    findMinTaskExecutionTime: findMinTaskExecutionTime,
    findTaskExecutionTimeOnResource: findTaskExecutionTimeOnResource,
    findTaskExecutionCost: findTaskExecutionCost,
    findMaxTaskExecutionCost: findMaxTaskExecutionCost,
    findMinTaskExecutionCost: findMinTaskExecutionCost,
    findTaskExecutionCostOnResource: findTaskExecutionCostOnResource,
    decorateWithFinishTime: decorateWithFinishTime,
    findTaskFinishTimeOnResource: findTaskFinishTimeOnResource
};