const _ = require('lodash');
const SchedulingAlgorithm = require('./scheduling-algorithm.js');
const LinkedList = require('dbly-linked-list');
const pf = require('pareto-frontier');
const LogUtilities = require("./log-utilities");
const RankUtilities = require("./rank-utilities");
const TaskUtilities = require("./task-utilities");
fs = require('fs');

class MOHEFT extends SchedulingAlgorithm {
    constructor(config, K, finalLogs) {
        super(config);
        if (K === undefined) {
            this.K = 10;
        } else {
            this.K = K;
        }
        this.finalLogs = finalLogs === undefined;
    }

    decorateStrategy(dag) {
        const tasks = dag.tasks;
        const taskUtilities = new TaskUtilities(this.config);

        this.decorateTasksWithLevels(tasks);
        const sortedTasksByLevels = tasks.sort((task1, task2) => task1.level - task2.level);
        RankUtilities.decorateTasksWithUpwardRank(sortedTasksByLevels, this.config.functionTypes);

        const maxDeadline = this.costFunctions.maxDeadline(tasks);
        const minDeadline = this.costFunctions.minDeadline(tasks);

        const maxBudget = this.costFunctions.maxBudget(tasks);
        const minBudget = this.costFunctions.minBudget(tasks);

        const userDeadline = this.calculateUserDeadline(maxDeadline, minDeadline);
        const userBudget = this.calculateUserBudget(maxBudget, minBudget);

        console.log("Max budget: " + maxBudget);
        console.log("Min budget: " + minBudget);
        console.log("Max deadline: " + maxDeadline);
        console.log("Min deadline: " + minDeadline);
        console.log("User deadline: " + userDeadline);
        console.log("User budget: " + userBudget);

        const tasksSortedUpward = tasks.sort((task1, task2) => task2.upwardRank - task1.upwardRank);

        let backupDag = _.cloneDeep(dag);
        let backupTasks = _.cloneDeep(tasks);
        let schedules = [];
        schedules.push(dag);

        delete dag.signals;
        delete dag.ins;
        delete dag.outs;
        delete dag.tasks;
        dag.tasks = Array(tasks.length);

        let maxNumberOfSchedules = this.K;
        let num = 0;
        let startTime = Date.now();

        let idToIndexMap = new Map();
        let idToStartFinishTime = new Map();
        for (let i = 0; i < tasks.length; i++) {
            idToIndexMap.set(tasks[i].config.id, i);
            idToStartFinishTime.set(tasks[i].config.id, {
                startTime: _.cloneDeep(tasks[i].startTime),
                finishTime: _.cloneDeep(tasks[i].finishTime)
            });
            delete tasks[i].ins;
            delete tasks[i].outs;
            delete tasks[i].startTime;
            delete tasks[i].finishTime;
        }

        let currentIndex = 0;
        tasksSortedUpward.forEach(
            task => {

                console.log("Starting processing of task no: " + num++);
                let taskId = task.config.id;
                let newSchedules = [];

                for (const schedule of schedules) {
                    for (let functionType of this.config.functionTypes) {
                        // let newAssignment = schedule;
                        // for (let i = 0; i < newAssignment.tasks.length; i++) {
                        //     newAssignment.tasks[i].config = _.cloneDeep(schedule.tasks[i].config)
                        // newAssignment.tasks = _.cloneDeep(schedule.tasks);
                        // }
                        let newAssignment = _.cloneDeep(schedule);
                        //TODO to check
                        let indexOfTask = idToIndexMap.get(taskId);
                        newAssignment.tasks[currentIndex] = _.cloneDeep(task);
                        let taskToBeAssigned = newAssignment.tasks[indexOfTask];
                        taskToBeAssigned.config.deploymentType = functionType;
                        newSchedules.push(newAssignment);
                    }
                }

                // const oldSchedules = schedules;
                if (newSchedules.length > maxNumberOfSchedules) {
                    schedules = this.selectBestSchedulesAccordingToDistance(newSchedules, taskUtilities, maxNumberOfSchedules, idToStartFinishTime);
                } else {
                    schedules = newSchedules;
                }


                // let filteredOutSchedules = [];
                // let seenIds = new Set();
                // for (const schedule of schedules) {
                //     if(!seenIds.has(schedule.scheduleId)){
                //         seenIds.add(schedule.scheduleId);
                //         filteredOutSchedules.push(schedule);
                //     }
                // }


                // for (const oldSchedule of oldSchedules) {
                //     delete oldSchedule.tasks;
                //     delete oldSchedule.signals;
                //     delete oldSchedule.ins;
                //     delete oldSchedule.outs;
                // }
                currentIndex++;
            }
        );
        let endTime = Date.now();
        console.log("Time of moheft execution: " + (endTime - startTime) + 'ms');
        console.log("All points: ");
        for (const schedule of schedules) {
            console.log(schedule.time + ' ' + schedule.cost)
        }

        console.log("Pareto front:");
        let forPareto = [];
        for (const schedule of schedules) {
            forPareto.push([schedule.time, schedule.cost, schedule])
        }
        let paretoPoints = pf.getParetoFrontier(forPareto, {optimize: 'bottomLeft'});
        console.log(paretoPoints);

        console.log("Solutions: ");
        let solutions = [];
        for (const paretoPoint of paretoPoints) {
            if (paretoPoint[0] <= userDeadline && paretoPoint[1] <= userBudget) {
                solutions.push(paretoPoint[2]);
            }
        }

        for (const paretoPoint of paretoPoints) {
            let solution = paretoPoint[2];
            let tasks = solution.tasks;
            for (let i = 0; i < tasks.length; i++) {
                console.log(i);
                tasks[i].ins = _.cloneDeep(backupTasks[i].ins);
                tasks[i].outs = _.cloneDeep(backupTasks[i].outs);
                tasks[i].startTime = _.cloneDeep(backupTasks[i].startTime);
                tasks[i].finishTime = _.cloneDeep(backupTasks[i].finishTime);
            }

            solution.signals = _.cloneDeep(backupDag.signals);
            solution.ins = _.cloneDeep(backupDag.ins);
            solution.outs = _.cloneDeep(backupDag.outs);
        }

        console.log("Size of pareto front: " + paretoPoints.length);
        console.log("Number of solutions: " + solutions.length);

        if (this.finalLogs) {
            let algorithm = 'moheft';
            //
            //     //Output all the points
            //     // LogUtilities.outputLogsToFile(paretoPoints, userDeadline, userBudget, this.config, algorithm);
            //     //Output only one result
            //     this.outputOneResult(solutions, paretoPoints, userDeadline, userBudget, algorithm);
            //

            this.outputResultsForMultipleBudgetsAndDeadlines(maxDeadline, minDeadline, maxBudget, minBudget, solutions, paretoPoints);
        }

        return paretoPoints;
    }


    outputResultsForMultipleBudgetsAndDeadlines(maxDeadline, minDeadline, maxBudget, minBudget, solutions, paretoPoints,) {
        const budgets = [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95];
        const deadlines = [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95];
        for (const budget of budgets) {
            for (const deadline of deadlines) {
                this.config.deadlineParameter = deadline;
                this.config.budgetParameter = budget;
                let currDeadline = this.calculateUserDeadline(maxDeadline, minDeadline);
                let currBudget = this.calculateUserBudget(maxBudget, minBudget);

                solutions = [];
                for (const paretoPoint of paretoPoints) {
                    if (paretoPoint[0] <= currDeadline && paretoPoint[1] <= currBudget) {
                        solutions.push(paretoPoint[2]);
                    }
                }

                this.outputOneResult(solutions, paretoPoints, currDeadline, currBudget, 'moheft');
            }
        }
        return solutions;
    }

    outputOneResult(solutions, paretoPoints, userDeadline, userBudget, algorithm) {
        let points = [];
        if (solutions.length === 0) {
            points = [[paretoPoints[0][0], paretoPoints[0][1]]];
        } else {
            points = [[solutions[0].time, solutions[0].cost]];
        }
        LogUtilities.outputLogsToFile(points, userDeadline, userBudget, this.config, algorithm)
    }

    static scheduleId = 0;

    selectBestSchedulesAccordingToDistance(newSchedules, taskUtilities, maxNumberOfSchedules) {
        for (const newSchedule of newSchedules) {
            newSchedule.cost = taskUtilities.getExecutionCostOfScheduleIgnoringUnscheduledTasks(newSchedule);
            newSchedule.time = taskUtilities.getExecutionTimeOfScheduleIgnoringUnscheduledTasks(newSchedule);
            newSchedule.scheduleId = MOHEFT.scheduleId++;
            newSchedule.distance = 0;
        }
        let sortedByTime = this.sortByTime(newSchedules);
        let sortedByCost = this.sortByCost(newSchedules);

        this.saveCrowdingDistanceInTask(sortedByTime, 'time');
        this.saveCrowdingDistanceInTask(sortedByCost, 'cost');

        return newSchedules.sort((a, b) => b.distance - a.distance).slice(0, maxNumberOfSchedules);
    }

    selectBestSchedulesAccordingToDistance(newSchedules, taskUtilities, maxNumberOfSchedules, idToStartFinish) {
        for (const newSchedule of newSchedules) {
            newSchedule.cost = taskUtilities.getExecutionCostOfScheduleIgnoringUnscheduledTasks(newSchedule, idToStartFinish);
            newSchedule.time = taskUtilities.getExecutionTimeOfScheduleIgnoringUnscheduledTasks(newSchedule, idToStartFinish);
            newSchedule.scheduleId = MOHEFT.scheduleId++;
            newSchedule.distance = 0;
        }
        let sortedByTime = this.sortByTime(newSchedules);
        let sortedByCost = this.sortByCost(newSchedules);

        this.saveCrowdingDistanceInTask(sortedByTime, 'time');
        this.saveCrowdingDistanceInTask(sortedByCost, 'cost');

        return newSchedules.sort((a, b) => b.distance - a.distance).slice(0, maxNumberOfSchedules);
    }


    sortByCost(newSchedules) {
        let sortedByCost = new LinkedList();
        newSchedules.sort((a, b) => a.cost - b.cost).forEach(value => {
            sortedByCost.insert(value);
        });
        return sortedByCost;
    }

    sortByTime(newSchedules) {
        let sortedByTime = new LinkedList();
        newSchedules.sort((a, b) => a.time - b.time).forEach(value => {
            sortedByTime.insert(value);
        });
        return sortedByTime;
    }

    saveCrowdingDistanceInTask(sorted, property) {
        let maxValue = sorted.getTailNode().getData()[property];
        let minValue = sorted.getHeadNode().getData()[property];
        sorted.getTailNode().getData().distance = Infinity;
        sorted.getHeadNode().getData().distance = Infinity;
        let element = sorted.getHeadNode();
        while (element !== undefined && element.hasNext()) {
            if (element.getData().distance === Infinity) {
                element = element.next;
                continue;
            }

            let delta = element.next.getData()[property] - element.prev.getData()[property];
            element.getData().distance = delta / (maxValue - minValue);
            element = element.next;
        }
    }


    minDeadline(tasks) {
        let allExecutionTimes = [];
        let maximumLevel = this.taskUtils.findTasksMaxLevel(tasks);
        for (let i = 1; i <= maximumLevel; i++) {
            let minimumForLevel = Math.max(...tasks.filter(task => task.level === i).map(task => this.taskUtils.findMinTaskExecutionTime(task)));
            allExecutionTimes.push(minimumForLevel);
        }
        return allExecutionTimes.reduce(function (a, b) {
            return a + b
        }, 0)
    }


}

module.exports = MOHEFT;
