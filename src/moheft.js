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
            this.K = 50;
        } else {
            this.K = K;
        }
        if (finalLogs === undefined) {
            this.finalLogs = true;
        } else {
            this.finalLogs = false;
        }
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

        let schedules = [];
        schedules.push(dag);
        let maxNumberOfSchedules = this.K;

        let num = 0;
        tasksSortedUpward.forEach(
            task => {
                console.log("Starting processing of task no: " + num++);
                let taskId = task.config.id;
                let newSchedules = [];

                for (const schedule of schedules) {
                    for (let functionType of this.config.functionTypes) {
                        let newAssignment = _.cloneDeep(schedule);
                        let taskToBeAssigned = newAssignment.tasks.filter(task => task.config.id === taskId)[0];
                        taskToBeAssigned.config.deploymentType = functionType;
                        newSchedules.push(newAssignment);
                    }
                }

                if (newSchedules.length > maxNumberOfSchedules) {
                    schedules = this.selectBestSchedulesAccordingToDistance(newSchedules, taskUtilities, maxNumberOfSchedules, schedules);
                } else {
                    schedules = newSchedules;
                }

            }
        );

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

        console.log("Size of pareto front: " + paretoPoints.length);
        console.log("Number of solutions: " + solutions.length);

        if (this.finalLogs) {
            let algorithm = 'moheft';

            //Output all the points
            // LogUtilities.outputLogsToFile(paretoPoints, userDeadline, userBudget, this.config, algorithm);

            //Output only one result
            this.outputOneResult(solutions, paretoPoints, userDeadline, userBudget, algorithm);
        }


        return paretoPoints;
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

    selectBestSchedulesAccordingToDistance(newSchedules, taskUtilities, maxNumberOfSchedules, schedules) {
        let i = 1;
        for (const newSchedule of newSchedules) {
            newSchedule.cost = taskUtilities.getExecutionCostOfScheduleIgnoringUnscheduledTasks(newSchedule);
            newSchedule.time = taskUtilities.getExecutionTimeOfScheduleIgnoringUnscheduledTasks(newSchedule);
            newSchedule.scheduleId = i++;
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
