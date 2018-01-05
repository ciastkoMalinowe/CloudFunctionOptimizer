const staticData = require('../csv_reader/read_csv');
const config = require('../configuration/config');
const algorithm = require('./algo');
const taskUtils = require('./task-utilities');

function dbwsDecorateStrategy(dag) {

    const tasks = dag.tasks;

    const maxDeadline = 3;
    const minDeadline = 1;

    const maxBudget = 3;
    const minBudget = 1;


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
    decorateTasksWithSubdeadline(sortedTasks, userDeadline);
    decorateTaskWithRank(sortedTasks);
    //while part
}

function decorateTaskWithRank(tasks) {
    tasks.forEach(task => task.rank = computeRank(tasks, task));
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
    return prevLevelDeadline + userDeadline * ( levelExecutionTime / totalLevelExecutionTime);
}

function calculateUserDeadline(maxDeadline, minDeadline) {
    return minDeadline + config.deadlineParameter * (maxDeadline - minDeadline);
}

function calculateUserBudget(maxBudget, minBudget) {
    return minBudget + config.budgetParameter * (maxBudget - minBudget);
}

module.exports = dbwsDecorateStrategy;
