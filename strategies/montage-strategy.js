const staticData = require('../csv_reader/read_csv');
const config = require('../configuration/config');
const taskUtils = require('./task-utilities');

function montageDecorateStrategy(dag) {

    const tasks = dag.tasks;

    const sortedTask = taskUtils.findTopologySortedList(tasks);
    decorateTasksWithLevels(sortedTask);
    decorateTasksWithSubDeadline(sortedTask);

    tasks.forEach(task => {
        task.deploymentType = "2048";
    });
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

function decorateTasksWithSubDeadline(tasks) {

    let levelExecutionTimeMap = findLevelExecutionTimeMap(tasks);

    let totalLevelExecutionTime = 0;
    for(let value of levelExecutionTimeMap.values()){
        totalLevelExecutionTime += value
    }

    let prevLevelDeadline = 0;
    for(let i=1; i <= taskUtils.findTasksMaxLevel(tasks); i++){

        //calculate deadline based on prevDeadline, levelExecutionTime and userParameter
        let levelExecutionTime = levelExecutionTimeMap.get(i);
        let subDeadline = calculateSubdeadline(prevLevelDeadline, levelExecutionTime, totalLevelExecutionTime);

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

        let maxTasksTime = levelTasks.map(
            ltask => {
                //todo
                //get max time for tasks + communication time
                // if communication time will be in maxTime return just maxTime
                //ltask.maxTime + Math.max(...findPredecessorForTask(levelTasks, ltask).map(task => task.comTime))
                return i;
            }
        );

        let levelExecutionTime = Math.max(...maxTasksTime);
        levelExecutionTimeMap.set(i, levelExecutionTime);
    }

    return levelExecutionTimeMap;
}

function calculateSubdeadline(prevLevelDeadline, levelExecutionTime, totalLevelExecutionTime) {
    //maybe use Math.round(num * 100) / 100 to cut double to 2 decimal places
    let userDeadlineParameter = 1; //todo get from config
    return prevLevelDeadline + userDeadlineParameter * ( levelExecutionTime / totalLevelExecutionTime);
}

module.exports = montageDecorateStrategy;
