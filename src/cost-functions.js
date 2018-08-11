const taskUtils = require('./task-utilities');
const config = require(process.env.CONFIG_PATH ? process.env.CONFIG_PATH : '../configuration/config.js');

function minBudget(tasks) {

    let costs = [];

    config.functionTypes.forEach(functionType => {
        let times = tasks.map(task => task.finishTime[functionType] - task.startTime[functionType]);
        let workflowCost = 0;
        times
            .map(time => Math.ceil(time / 100) * config.prices[functionType])
            .forEach(cost => workflowCost += cost);
        costs.push(workflowCost);
    });

    return Math.min(...costs);
}

function maxBudget(tasks) {

    let costs = [];

    config.functionTypes.forEach(functionType => {
        let times = tasks.map(task => task.finishTime[functionType] - task.startTime[functionType]);
        let workflowCost = 0;
        times
            .map(time => Math.ceil(time / 100) * config.prices[functionType])
            .forEach(cost => workflowCost += cost);
        costs.push(workflowCost);
    });

    return Math.max(...costs);
}

function minDeadline(tasks) {
    let maxLevel = taskUtils.findTasksMaxLevel(tasks);
    let tasksFromMaxLevel = taskUtils.findTasksFromLevel(tasks, maxLevel);
    let finishTimes = [];

    config.functionTypes.forEach(
        functionType => {
            finishTimes.push(
                Math.max(...tasksFromMaxLevel.map(task => task.finishTime[functionType]))
            )
        }
    );

    return Math.min(...finishTimes);
}

function maxDeadline(tasks) {

    let maxLevel = taskUtils.findTasksMaxLevel(tasks);
    let tasksFromMaxLevel = taskUtils.findTasksFromLevel(tasks, maxLevel);
    let finishTimes = [];

    config.functionTypes.forEach(
        functionType => {
            finishTimes.push(
                Math.max(...tasksFromMaxLevel.map(task => task.finishTime[functionType]))
            )
        }
    );

    return Math.max(...finishTimes);
}

exports.minBudget = minBudget;
exports.maxBudget = maxBudget;
exports.minDeadline = minDeadline;
exports.maxDeadline = maxDeadline;
