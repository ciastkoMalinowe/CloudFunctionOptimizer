const toposort = require('toposort');

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

function findTaskExecutionTime(task){
    return {
        "128" : 1,
        "256" : 2,
        "512" : 4,
        "1024" : 8,
        "2048" : 16
    }
}

function findTaskExecutionTimeOnResource(task, resourceType) {
    return findTaskExecutionTime(task)[resourceType];
}

function findMaxTaskExecutionTime(task){
    return 16;
}

function findMinTaskExecutionTime(task){
    return 1;
}

function findTaskExecutionCost(task){
    return {
        "128" : 0.000001,
        "256" : 0.000002,
        "512" : 0.000004,
        "1024" : 0.000008,
        "2048" : 0.000016
    }
}

function findTaskExecutionCostOnResource(task, resourceType) {
    return findTaskExecutionTime(task)[resourceType];
}

function findMaxTaskExecutionCost(task){
    return 0.000016;
}

function findMinTaskExecutionCost(task){
    return 0.000001;
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