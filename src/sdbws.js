const config = require(process.env.CONFIG_PATH ? process.env.CONFIG_PATH : '../configuration/config');
const costFunctions = require('./cost-functions');
const taskUtils = require('./task-utilities');

function dbwsDecorateStrategy(dag) {

    const tasks = dag.tasks;

    decorateTasksWithLevels(tasks);
    const sortedTasks = tasks.sort((task1, task2) => task1.level - task2.level);

    const maxDeadline = costFunctions.maxDeadline(tasks);
    const minDeadline = costFunctions.minDeadline(tasks);

    const maxBudget = costFunctions.maxBudget(tasks);
    const minBudget = costFunctions.minBudget(tasks);

    const userDeadline = calculateUserDeadline(maxDeadline, minDeadline);
    const userBudget = calculateUserBudget(maxBudget, minBudget);

    console.log("userDeadline: " + userDeadline);
    console.log("userBudget: " + userBudget);

    if (userBudget < minBudget) {
        throw new Error("No possible schedule map")
    } else if (userBudget >= maxBudget) {
        tasks.forEach(task => {
            task.config.deploymentType = getMostExpensiveResource();
        });
        return;
    }

    decorateTasksWithSubdeadline(sortedTasks, userDeadline);

    const costEfficientFactor = minBudget / userBudget;
    sortedTasks.forEach(
        task => {

            let resourceMap = new Map();

            config.functionTypes.forEach(
                functionType => resourceMap.set(
                    functionType,
                    computeQualityMeasureForResource(tasks, task, functionType, costEfficientFactor)
                )
            );

            let maxQuality = Number.NEGATIVE_INFINITY;
            let selectedResource;

            for (let [functionType, quality] of resourceMap.entries()) {
                if (maxQuality < quality) {
                    maxQuality = quality;
                    selectedResource = functionType;
                }
            }

            task.config.deploymentType = selectedResource;
            // copy schedulded times to config
            Object.assign(task.config, getScheduldedTimesOnResource(tasks, task, selectedResource))
        }
    )
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

function addOverheads(tasks) {
    tasks.forEach(task => {
        config.functionTypes.forEach(resourceType => {
            task.resourceTimes[resourceType] += config.overheads[config.provider];
        })
    })
}

function computeQualityMeasureForResource(tasks, task, functionType, costEfficientFactor) {

    let timeQuality = computeTimeQuality(tasks, task, functionType);
    let costQuality = computeCostQuality(tasks, task, functionType);

    let taskQuality = timeQuality * (1 - costEfficientFactor) + costQuality * costEfficientFactor;

    return taskQuality;
}

function computeTimeQuality(tasks, task, functionType) {

    let taskFinishTime = getScheduldedTimesOnResource(tasks, task, functionType).scheduledFinishTime;
    let inSubdeadline = taskFinishTime < task.subDeadline ? 1 : 0;

    let taskMaxFinishTime = taskUtils.findMaxTaskExecutionTime(task);
    let taskMinFinishTime = taskUtils.findMinTaskExecutionTime(task);

    let timeQuality = (inSubdeadline * task.subDeadline - taskFinishTime) / (taskMaxFinishTime - taskMinFinishTime);
    return timeQuality;
}

function computeCostQuality(tasks, task, functionType) {

    let taskFinishTime = getScheduldedTimesOnResource(tasks, task, functionType).scheduledFinishTime;
    let inSubdeadline = taskFinishTime < task.subDeadline ? 1 : 0;

    let taskCost = taskUtils.findTaskExecutionCostOnResource(task, functionType);
    let taskMaxCost = taskUtils.findMaxTaskExecutionCost(task);
    let taskMinCost = taskUtils.findMinTaskExecutionCost(task);

    let costQuality = ((taskMaxCost - taskCost) / (taskMaxCost - taskMinCost)) * inSubdeadline;
    return costQuality;
}

function getScheduldedTimesOnResource(tasks, task, functionType) {

    let predecessors = taskUtils.findPredecessorForTask(tasks, task);
    let delay = 0;
    let predecessorsMaxFinishTime = 0;

    if (predecessors.length > 0) {
        let pTask = taskUtils.findPredecessorWithLongestFinishTime(tasks, task, functionType);
        delay = task.startTime[functionType] - pTask.finishTime[functionType];

        let predecessorsScheduldedFinishTimes = predecessors.map(pTask => pTask.config.scheduledFinishTime);
        predecessorsMaxFinishTime = Math.max(...predecessorsScheduldedFinishTimes);
    } else {
        //level 1 executor delay
        delay = task.startTime[functionType];
    }

    let newStartTime = predecessorsMaxFinishTime + delay;

    let executionTime = task.finishTime[functionType] - task.startTime[functionType];
    let newFinishTime = newStartTime + executionTime;

    return {
        "scheduledStartTime": newStartTime,
        "scheduledFinishTime": newFinishTime
    }
}

function computeAverageExecutionTime(task) {

    let total = 0;
    let times = config.functionTypes.map(functionType => {
        return task.finishTime[functionType] - task.startTime[functionType];
    });

    times.forEach(time => total += time);
    return total / times.length;
}

function decorateTasksWithSubdeadline(tasks, userDeadline) {

    let levelExecutionTimeMap = findLevelExecutionTimeMap(tasks);

    let totalLevelExecutionTime = 0;
    for (let value of levelExecutionTimeMap.values()) {
        totalLevelExecutionTime += value
    }

    let prevLevelDeadline = 0;
    for (let i = 1; i <= taskUtils.findTasksMaxLevel(tasks); i++) {

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

    for (let i = 1; i <= taskUtils.findTasksMaxLevel(tasks); i++) {

        let levelTasks = taskUtils.findTasksFromLevel(tasks, i);

        let maxTasksTime = levelTasks.map(task => taskUtils.findMaxTaskExecutionTime(task));
        let levelExecutionTime = Math.max(...maxTasksTime);

        levelExecutionTimeMap.set(i, levelExecutionTime);
    }

    return levelExecutionTimeMap;
}

function calculateSubdeadline(prevLevelDeadline, levelExecutionTime, totalLevelExecutionTime, userDeadline) {
    let subdeadline = prevLevelDeadline + userDeadline * (levelExecutionTime / totalLevelExecutionTime);
    return Math.round(subdeadline * 100) / 100;
}

function calculateUserDeadline(maxDeadline, minDeadline) {
    return minDeadline + config.deadlineParameter * (maxDeadline - minDeadline);
}

function calculateUserBudget(maxBudget, minBudget) {
    return minBudget + config.budgetParameter * (maxBudget - minBudget);
}

function getMostExpensiveResource() {
    let prices = config.prices;
    let sortedByPrice = Object.keys(prices).sort((p1, p2) => prices[p1] - prices[p2]);
    return sortedByPrice[sortedByPrice.length - 1]; // return the most expensive resource
}

module.exports = dbwsDecorateStrategy;
