const toposort = require('toposort');
const config = require('../configuration/config');

function findTopologySortedList(tasks) {

    const graph = [];

    tasks.forEach(task => {
        let connectedTasks = findSuccessorsForTask(tasks, task);
        connectedTasks.forEach(connectedTasks => graph.push([task, connectedTasks]))
    });

    return toposort(graph);
}

function findSuccessorsForTask(tasks, task) {
    return tasks.filter(
        filteredTask => filteredTask.ins.some(
            input => task.outs.includes(input)
        )
    )
}

function findPredecessorForTask(tasks, task) {
    return tasks.filter(
        filteredTask => task.ins.some(
            input => filteredTask.outs.includes(input)
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

function findTaskExecutionTime(task) {
    // todo what if csv file has more than one walue per function
    let times = {"128": 0, "256": 0, "512": 0, "1024": 0, "2048": 0};
    config.functionTypes.forEach(resource => {
        let timesForResource = task.resourceTimes[resource];
        // let sum = 0;
        // let count = 0;
        // console.log(data.resourceTimes[task.name]);
        // timesForResource.forEach(time => {
        //     sum += time;
        //     count += 1;
        // });
        // let avgTime = sum / count;
        // return { resource: avgTime }
        times[resource] = timesForResource;
    });
    return times;
}

function findTaskExecutionTimeOnResource(task, resourceType) {
    return findTaskExecutionTime(task)[resourceType];
}

function findMaxTaskExecutionTime(task) {
    let times = findTaskExecutionTime(task);
    return Math.max(...Object.values(times));
}

function findMinTaskExecutionTime(task){
  let times = findTaskExecutionTime(task);
  return Math.min(...Object.values(times));
}

function findTaskExecutionCost(task) {
    let cost = {"128": 0, "256": 0, "512": 0, "1024": 0, "2048": 0};
    config.functionTypes.forEach(resource => {
      cost[resource] = findTaskExecutionTimeOnResource(task, resource);
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
    findPredecessorForTask: findPredecessorForTask,
    findFirstTasks: findFirstTasks,
    findTasksFromLevel: findTasksFromLevel,
    findTasksMaxLevel: findTasksMaxLevel,
    findTaskExecutionTime: findTaskExecutionTime,
    findMaxTaskExecutionTime: findMaxTaskExecutionTime,
    findMinTaskExecutionTime: findMinTaskExecutionTime,
    findTaskExecutionTimeOnResource: findTaskExecutionTimeOnResource,
    findTaskExecutionCost: findTaskExecutionCost,
    findMaxTaskExecutionCost: findMaxTaskExecutionCost,
    findMinTaskExecutionCost: findMinTaskExecutionCost,
    findTaskExecutionCostOnResource: findTaskExecutionCostOnResource
};