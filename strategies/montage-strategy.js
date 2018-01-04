const staticData = require('../csv_reader/read_csv');
const config = require('../configuration/config');
const toposort = require('toposort');

function montageDecorateStrategy(dag) {

    const tasks = dag.tasks;

    const sortedTask = findTopologySortedList(tasks);
    decorateTasksWithLevels(sortedTask);
    decorateTasksWithSubDeadline(sortedTask);

    // console.log(sortedTask);

    tasks.forEach(task => {
        task.deploymentType = "2048";
    });
}

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

function decorateTasksWithLevels(tasks) {
    tasks.forEach(
        task => {
            let predecessors = findPredecessorForTask(tasks, task);
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

    let levelExecutionsMap = new Map();

    for(let i=1; i <= findTasksMaxLevel(tasks); i++){

        let levelTasks = findTasksFromLevel(tasks, i);

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
        levelExecutionsMap.set(i, levelExecutionTime);
    }

    let totalLevelExecutionTime = 0;
    for(let value of levelExecutionsMap.values()){
        totalLevelExecutionTime += value
    }

    let prevLevelDeadline = 0;
    for(let i=1; i <= findTasksMaxLevel(tasks); i++){

        //calculate deadline based on prevDeadline, levelExecutionTime and userParameter
        let levelExecutionTime = levelExecutionsMap.get(i);
        let subDeadline = calculateSubdeadline(prevLevelDeadline, levelExecutionTime, totalLevelExecutionTime);

        //decorate task at i-th level
        let levelTasks = findTasksFromLevel(tasks, i);
        levelTasks.forEach(task => task.subDeadline = subDeadline);

        prevLevelDeadline = subDeadline;
    }
}

function calculateSubdeadline(prevLevelDeadline, levelExecutionTime, totalLevelExecutionTime) {
    //maybe use Math.round(num * 100) / 100 to cut double to 2 decimal places
    let userDeadlineParameter = 1; //todo get from config
    return prevLevelDeadline + userDeadlineParameter * ( levelExecutionTime / totalLevelExecutionTime);
}

function findTasksFromLevel(tasks, level) {
    return tasks.filter(task => task.level === level);
}

function findTasksMaxLevel(tasks) {
    return Math.max(...tasks.map(task => task.level));
}

module.exports = montageDecorateStrategy;
