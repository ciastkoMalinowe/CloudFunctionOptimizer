const config = require('../configuration/config');
const costFunctions = require('./cost-functions');
const taskUtils = require('./task-utilities');

function dbwsDecorateStrategy(dag) {

    const tasks = dag.tasks;

    const sortedTasks = taskUtils.findTopologySortedList(tasks);
    decorateTasksWithLevels(sortedTasks);

    const maxDeadline = costFunctions.maxDeadline(tasks);
    const minDeadline = costFunctions.minDeadline(tasks);

    const maxBudget = costFunctions.costHigh(tasks);
    const minBudget = costFunctions.costLow(tasks);

    const userDeadline = calculateUserDeadline(maxDeadline, minDeadline);
    const userBudget = calculateUserBudget(maxBudget, minBudget);

    console.log("userDeadline: " + userDeadline);
    console.log("userBudget: " + userBudget);


    if (userBudget < minBudget) {
        throw new Error("No possible schedule map")
    } else if(userBudget >= maxBudget){
        tasks.forEach(task => {
            task.deploymentType = "2048";
        });
        return;
    }

    decorateTasksWithSubdeadline(sortedTasks, userDeadline);
    decorateTaskWithRank(sortedTasks);
    sortedTasks.sort((task1, task2) => task2.rank - task1.rank); //descending

    const costEfficientFactor = minBudget / userBudget;
    sortedTasks.forEach(
        task => {

            let resourceMap = new Map();

            config.functionTypes.forEach(
                functionType => resourceMap.set(
                    functionType,
                    computeQualityMeasureForResource(sortedTasks, task, functionType, costEfficientFactor)
                )
            );

            let maxQuality = Number.NEGATIVE_INFINITY;
            let selectedResource;

            for(let [functionType, quality] of resourceMap.entries()) {
                if (maxQuality < quality){
                    maxQuality = quality;
                    selectedResource = functionType;
                }
            }

            task.deploymentType = selectedResource;
        }
    )
}

function computeQualityMeasureForResource(tasks, task, functionType, costEfficientFactor) {

    let timeQuality = computeTimeQuality(tasks, task, functionType);
    let costQuality = computeCostQuality(tasks, task, functionType);

    let taskQuality = timeQuality * (1 - costEfficientFactor) + costQuality * costEfficientFactor;

    return taskQuality;
}

function computeTimeQuality(tasks, task, functionType) {

    let taskFinishTime = taskUtils.findTaskFinishTime(tasks, task, functionType);
    let inSubdeadline =  taskFinishTime < task.subDeadline ? 1 : 0;

    let taskMaxFinishTime = taskUtils.findMaxTaskExecutionTime(task);
    let taskMinFinishTime = taskUtils.findMinTaskExecutionTime(task);

    let timeQuality = (inSubdeadline * task.subDeadline - taskFinishTime) / (taskMaxFinishTime - taskMinFinishTime);
    return timeQuality;
}

function computeCostQuality(tasks, task, functionType) {

    let taskFinishTime = taskUtils.findTaskFinishTime(tasks, task, functionType);
    let inSubdeadline =  taskFinishTime < task.subDeadline ? 1 : 0;

    let taskCost = taskUtils.findTaskExecutionCostOnResource(task, functionType);
    let taskMaxCost = taskUtils.findMaxTaskExecutionCost(task);
    let taskMinCost = taskUtils.findMinTaskExecutionCost(task);

    let costQuality = ((taskMaxCost - taskCost) / (taskMaxCost - taskMinCost)) * inSubdeadline;
    return costQuality;
}

function decorateTaskWithRank(tasks) {
    tasks.forEach(task => task.rank = Math.round(computeRank(tasks, task) * 100)/100);
}

function computeRank(tasks, task) {

    let successors = taskUtils.findSuccessorsForTask(tasks, task);
    if (successors.length === 0){
        return computeAverageExecutionTime(task);
    }
    let successorsExecutionTimes = successors.map(sTask => computeRank(tasks, sTask));

    return computeAverageExecutionTime(task) + Math.max(...successorsExecutionTimes);
}

function computeAverageExecutionTime(task) {
    let executionTimes = taskUtils.findTaskExecutionTime(task);

    let total = 0;
    Object.keys(executionTimes).forEach(functionType => total += parseInt(executionTimes[functionType]));

    let average = total / Object.keys(executionTimes).length;
    return average;
}

function decorateTasksWithLevels(tasks) {
    tasks.forEach(
        task => {
            let predecessors = taskUtils.findPredecessorForTask(tasks, task);
            if (predecessors.length === 0) {
                task.level = 1
            } else {
                let levels = predecessors.map(pTask => pTask.level);
                let maxLevel = Math.max(...levels);
                task.level = maxLevel + 1;
            }
        }
    );
}

function decorateTasksWithSubdeadline(tasks, userDeadline) {

    let levelExecutionTimeMap = findLevelExecutionTimeMap(tasks);

    let totalLevelExecutionTime = 0;
    for(let value of levelExecutionTimeMap.values()){
        totalLevelExecutionTime += value
    }

    let prevLevelDeadline = 0;
    for(let i=1; i <= taskUtils.findTasksMaxLevel(tasks); i++){

        //calculate deadline based on prevDeadline, levelExecutionTime and userParameter
        let levelExecutionTime = levelExecutionTimeMap.get(i);
        let subDeadline = calculateSubdeadline(prevLevelDeadline, levelExecutionTime, totalLevelExecutionTime, userDeadline);

        //decorate task at i-th level
        let levelTasks = taskUtils.findTasksFromLevel(tasks, i);
        levelTasks.forEach(task => task.subDeadline = subDeadline);

        prevLevelDeadline = subDeadline;
    }
}

function findLevelExecutionTimeMap(tasks) {

    let levelExecutionTimeMap = new Map();

    for(let i=1; i <= taskUtils.findTasksMaxLevel(tasks); i++){

        let levelTasks = taskUtils.findTasksFromLevel(tasks, i);

        let maxTasksTime = levelTasks.map(ltask => taskUtils.findMaxTaskExecutionTime(ltask));
        let levelExecutionTime = Math.max(...maxTasksTime);

        levelExecutionTimeMap.set(i, levelExecutionTime);
    }

    return levelExecutionTimeMap;
}

function calculateSubdeadline(prevLevelDeadline, levelExecutionTime, totalLevelExecutionTime, userDeadline) {
    //maybe use Math.round(num * 100) / 100 to cut double to 2 decimal places
    let subdeadline = prevLevelDeadline + userDeadline * ( levelExecutionTime / totalLevelExecutionTime);
    return Math.round(subdeadline * 100) / 100;
}

function calculateUserDeadline(maxDeadline, minDeadline) {
    return minDeadline + config.deadlineParameter * (maxDeadline - minDeadline);
}

function calculateUserBudget(maxBudget, minBudget) {
    return minBudget + config.budgetParameter * (maxBudget - minBudget);
}

module.exports = dbwsDecorateStrategy;
