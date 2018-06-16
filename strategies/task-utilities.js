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

function findTasksFromLevel(tasks, level) {
    return tasks.filter(task => task.level === level);
}

function findTasksMaxLevel(tasks) {
    return Math.max(...tasks.map(task => task.level));
}

function findMaxTaskExecutionTime(task) {

    let times = config.functionTypes.map(functionType => {
        return task.finishTime[functionType] - task.startTime[functionType];
    });
    return Math.max(...times);
}

function findMinTaskExecutionTime(task){
    let times = config.functionTypes.map(functionType => {
        return task.finishTime[functionType] - task.startTime[functionType];
    });
    return Math.min(...times);
}

function findTaskExecutionCostOnResource(task, resourceType) {
    let time = task.finishTime[resourceType] - task.startTime[resourceType];
    let cost = Math.ceil(time / 100) * config.prices[resourceType];
    return cost;
}

function findMaxTaskExecutionCost(task) {
    let costs = config.functionTypes.map(functionType => findTaskExecutionCostOnResource(task, functionType));
    return Math.max(...costs);
}

function findMinTaskExecutionCost(task){
    let costs = config.functionTypes.map(functionType => findTaskExecutionCostOnResource(task, functionType));
    return Math.min(...costs);
}

function findPredecessorWithLongestFinishTime(task, resourceType){
    let predecessors = findPredecessorsForTask(task);
    let finishTime = 0;
    let resultTask;
    predecessors.forEach(ptask => {
        if (finishTime < ptask.finishTime[resourceType]) {
            finishTime = ptask.finishTime[resourceType];
            resultTask = ptask;
        }
    });

    return resultTask;
}


module.exports = {
    findTopologySortedList: findTopologySortedList,
    findSuccessorsForTask: findSuccessorsForTask,
    findPredecessorForTask: findPredecessorsForTask,
    findTasksFromLevel: findTasksFromLevel,
    findTasksMaxLevel: findTasksMaxLevel,
    findMaxTaskExecutionTime: findMaxTaskExecutionTime,
    findMinTaskExecutionTime: findMinTaskExecutionTime,
    findMaxTaskExecutionCost: findMaxTaskExecutionCost,
    findMinTaskExecutionCost: findMinTaskExecutionCost,
    findTaskExecutionCostOnResource: findTaskExecutionCostOnResource,
    findPredecessorWithLongestFinishTime: findPredecessorWithLongestFinishTime
};