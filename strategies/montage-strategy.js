const config = require('../configuration/config');
const algorithm = require('./algo');
const taskUtils = require('./task-utilities');

function dbwsDecorateStrategy(dag, data) {

    const tasks = dag.tasks;

    const maxDeadline = 3;
    const minDeadline = 1;

    const maxBudget = algorithm.costHigh(tasks, data);
    const minBudget = algorithm.costLow(tasks, data);


    const userDeadline = calculateUserDeadline(maxDeadline, minDeadline);
    const userBudget = calculateUserBudget(maxBudget, minBudget);


    if (userBudget < minBudget) {
        throw new Error("No possible schedule map")
    } else if(userBudget > maxBudget){
        tasks.forEach(task => {
            task.deploymentType = "2048";
        });
        return;
    }

    const sortedTasks = taskUtils.findTopologySortedList(tasks);
    decorateTasksWithLevels(sortedTasks);
    decorateTasksWithSubdeadline(sortedTasks, userDeadline, data);
    decorateTaskWithRank(sortedTasks, data);
    sortedTasks.sort((task1, task2) => task2.rank - task1.rank); //descending

    const costEfficientFactor = minBudget / userBudget;
    sortedTasks.forEach(
        task => {

            let resourceMap = new Map();

            config.functionTypes.forEach(
                functionType => resourceMap.set(
                    functionType,
                    computeQualityMeasureForResource(task, functionType, costEfficientFactor, data)
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

function computeQualityMeasureForResource(task, functionType, costEfficientFactor, data) {

    let timeQuality = computeTimeQuality(task, functionType, data);
    let costQuality = computeCostQuality(task, functionType, data);

    let taskQuality = timeQuality * (1 - costEfficientFactor) + costQuality * costEfficientFactor;

    return taskQuality;
}

function computeTimeQuality(task, functionType, data) {

    let taskFinishTime = taskUtils.findTaskExecutionTimeOnResource(task, functionType, data);
    let inSubdeadline =  taskFinishTime < task.subDeadline ? 1 : 0;

    let taskMaxFinishTime = taskUtils.findMaxTaskExecutionTime(task, data);
    let taskMinFinishTime = taskUtils.findMinTaskExecutionTime(task, data);

    let timeQuality = (inSubdeadline * task.subDeadline - taskFinishTime) / (taskMaxFinishTime - taskMinFinishTime);
    return timeQuality;
}

function computeCostQuality(task, functionType, data) {

    let taskFinishTime = taskUtils.findTaskExecutionTimeOnResource(task, functionType, data);
    let inSubdeadline =  taskFinishTime < task.subDeadline ? 1 : 0;

    let taskCost = taskUtils.findTaskExecutionCostOnResource(task, functionType, data);
    let taskMaxCost = taskUtils.findMaxTaskExecutionCost(task, data);
    let taskMinCost = taskUtils.findMinTaskExecutionCost(task, data);

    let costQuality = ((taskMaxCost - taskCost) / (taskMaxCost - taskMinCost)) * inSubdeadline;
    return costQuality;
}

function decorateTaskWithRank(tasks, data) {
    tasks.forEach(task => task.rank = computeRank(tasks, task, data));
}

function computeRank(tasks, task, data) {

    let successors = taskUtils.findSuccessorsForTask(tasks, task);
    if (successors.length === 0){
        return computeAverageExecutionTime(task, data);
    }
    let successorsExecutionTimes = successors.map(sTask => computeRank(tasks, sTask, data));

    return computeAverageExecutionTime(task, data) + Math.max(...successorsExecutionTimes);
}

function computeAverageExecutionTime(task, data) {
    let executionTimes = taskUtils.findTaskExecutionTime(task, data);

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

function decorateTasksWithSubdeadline(tasks, userDeadline, data) {

    let levelExecutionTimeMap = findLevelExecutionTimeMap(tasks, data);

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

function findLevelExecutionTimeMap(tasks, data) {

    let levelExecutionTimeMap = new Map();

    for(let i=1; i <= taskUtils.findTasksMaxLevel(tasks); i++){

        let levelTasks = taskUtils.findTasksFromLevel(tasks, i);

        let maxTasksTime = levelTasks.map(ltask => taskUtils.findMaxTaskExecutionTime(ltask, data));
        let levelExecutionTime = Math.max(...maxTasksTime);

        levelExecutionTimeMap.set(i, levelExecutionTime);
    }

    return levelExecutionTimeMap;
}

function calculateSubdeadline(prevLevelDeadline, levelExecutionTime, totalLevelExecutionTime, userDeadline) {
    //maybe use Math.round(num * 100) / 100 to cut double to 2 decimal places
    return prevLevelDeadline + userDeadline * ( levelExecutionTime / totalLevelExecutionTime);
}

function calculateUserDeadline(maxDeadline, minDeadline) {
    return minDeadline + config.deadlineParameter * (maxDeadline - minDeadline);
}

function calculateUserBudget(maxBudget, minBudget) {
    return minBudget + config.budgetParameter * (maxBudget - minBudget);
}

module.exports = dbwsDecorateStrategy;
