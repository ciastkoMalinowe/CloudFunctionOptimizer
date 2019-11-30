const _ = require('lodash');
const SchedulingAlgorithm = require('./scheduling-algorithm.js');
const LinkedList = require('dbly-linked-list');
const pf = require('pareto-frontier');
const MultiMap = require("collections/multi-map");

class MOHEFT extends SchedulingAlgorithm {
    constructor(config) {
        super(config);
    }

    decorateStrategy(dag) {
        const tasks = dag.tasks;

        this.decorateTasksWithLevels(tasks);
        const sortedTasks = tasks.sort((task1, task2) => task1.level - task2.level);

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

        console.log("userDeadline: " + userDeadline);
        console.log("userBudget: " + userBudget);


        this.decorateTasksWithUpwardRank(sortedTasks);
        const tasksSortedUpward = tasks.sort((task1, task2) => task2.upwardRank - task1.upwardRank);

        let schedules = [];
        schedules.push(dag);
        let maxNumberOfSchedules = 10;

        let num = 0;
        tasksSortedUpward.forEach(
            task => {
                console.log(num++);
                let taskId = task.config.id;
                let newSchedules = [];

                for (const dag of schedules) {
                    for (let functionType of this.config.functionTypes) {
                        let newAssignment = _.cloneDeep(dag);
                        let taskToBeAssigned = newAssignment.tasks.filter(task => task.config.id === taskId)[0];
                        taskToBeAssigned.config.deploymentType = functionType;
                        newSchedules.push(newAssignment);
                    }
                }

                if (newSchedules.length > maxNumberOfSchedules) {
                    let i = 1;
                    for (const newSchedule of newSchedules) {
                        newSchedule.cost = this.getExecutionCostOfSchedule(newSchedule);
                        newSchedule.time = this.getExecutionTimeOfSchedule(newSchedule);
                        newSchedule.scheduleId = i++;
                        newSchedule.distance = 0;
                    }


                    let sortedByTime = new LinkedList();
                    newSchedules.sort((a, b) => a.time - b.time).forEach(value => {
                        sortedByTime.insert(value);
                    });
                    let sortedByCost = new LinkedList();
                    newSchedules.sort((a, b) => a.cost - b.cost).forEach(value => {
                        sortedByCost.insert(value);
                    });


                    this.addDistances(sortedByTime, 'time');
                    this.addDistances(sortedByCost, 'cost');

                    newSchedules = newSchedules.sort((a, b) => b.distance - a.distance).slice(0, maxNumberOfSchedules);
                    schedules = newSchedules;
                } else {
                    schedules = newSchedules;
                }

            }
        );

        console.log("All points: ");
        for (const schedule of schedules) {
            console.log(schedule.time + ' ' + schedule.cost)
        }

        console.log("Pareto front:")
        let forPareto = [];
        for (const schedule of schedules) {
            forPareto.push([schedule.time, schedule.cost, schedule])
        }
        let paretoPoints = pf.getParetoFrontier(forPareto, {optimize: 'bottomLeft'});
        console.log(paretoPoints);

        console.log("Solutions: ");
        let solutions = [];
        let timeSolutions = [];
        for (const paretoPoint of paretoPoints) {
            if (paretoPoint[0] <= userDeadline) {
                timeSolutions.push(paretoPoint[2]);
            }
            if (paretoPoint[0] <= userDeadline && paretoPoint[1] <= userBudget) {
                solutions.push(paretoPoint[2]);
            }
        }

        if(solutions.length > 0){

        }

        let map = this.createMapOfTaskResourceTimeCost(tasksSortedUpward);

        for (const timeSolution of timeSolutions) {
            let weights = this.createWeights(map, timeSolution);
            for (let i = 0; i < weights.length; i++) {
                let taskId = weights[i].taskId;
                let taskFromSchedule = timeSolution.tasks.filter(task => task.config.id === taskId)[0];
                taskFromSchedule.config.deploymentType = weights[i].functionType;
                let newCost = this.getExecutionCostOfSchedule(timeSolution);
                if (newCost < userBudget) {
                    console.log("Found!");
                    console.log(newCost);
                    console.log(this.getExecutionTimeOfSchedule(timeSolution));
                    break;
                }
            }
        }

    }

    createMapOfTaskResourceTimeCost(tasksSortedUpward) {
        let map = new Map();
        for (const task of tasksSortedUpward) {
            for (const functionType of this.config.functionTypes) {
                map.set([task.config.id, functionType], [task.finishTime[functionType] - task.startTime[functionType], this.taskUtils.findTaskExecutionCostOnResource(task, functionType)]);
            }
        }
        return map;
    }

    createWeights(map, timeSolution) {
        let weights = [];
        for (const mapElement of map) {
            let taskId = mapElement[0][0];
            let functionType = mapElement[0][1];
            let time = mapElement[1][0];
            let cost = mapElement[1][1];

            let taskFromSchedule = timeSolution.tasks.filter(task => task.config.id === taskId)[0];
            let deploymentType = taskFromSchedule.config.deploymentType;

            if (deploymentType === functionType) {
                weights.push({'functionType': functionType, 'weight': 0, 'taskId': taskId});
                continue;
            }

            let allTasksFromLevel = this.taskUtils.findTasksFromLevel(timeSolution.tasks, taskFromSchedule.level);
            let levelCost = allTasksFromLevel.map(task => this.taskUtils.findTaskExecutionCostOnResource(task, task.config.deploymentType)).reduce((a, b) => a + b);
            let allExecutionTimesFromLevel = allTasksFromLevel.map(task => this.taskUtils.findTaskExecutionTimeOnResource(task, task.config.deploymentType));
            let timeOfLevel = Math.max(...allExecutionTimesFromLevel);

            let newLevelCost = levelCost - this.taskUtils.findTaskExecutionCostOnResource(taskFromSchedule, taskFromSchedule.config.deploymentType) + cost;


            let tasksWithoutOneInQuestion = allTasksFromLevel.filter(task => task.config.id !== taskId);
            let levelTimeWithoutNewDeployment = Math.max(...tasksWithoutOneInQuestion.map(task => this.taskUtils.findTaskExecutionTimeOnResource(task, task.config.deploymentType)));
            let newLevelTime = Math.max(levelTimeWithoutNewDeployment, time);

            let weight = (timeOfLevel - newLevelTime) / (newLevelCost - levelCost);

            weights.push({'functionType': functionType, 'weight': weight, 'taskId': taskId});
        }
        return weights.sort((a, b) => (a.weight - b.weight));
    }

    addDistances(sorted, property) {
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

    getExecutionCostOfSchedule(newSchedule) {
        let totalCost = 0;
        let tasks = newSchedule.tasks;
        for (const task of tasks) {
            if (task.config.deploymentType !== undefined) {
                totalCost += this.taskUtils.findTaskExecutionCostOnResource(task, task.config.deploymentType)
            }
        }
        return totalCost;
    }

    computeSubDeadline(tasks, task, userDeadline) {
        // Path do exit task??
        let successors = tasks.filter(x => x.level === task.level + 1);

        if (successors.length === 0) {
            task.subDeadline = userDeadline;
        } else {
            let successorSubDeadlines = successors.map(x => this.findOrComputeSubDeadline(tasks, x, userDeadline));
            task.subDeadline = Math.min(...successorSubDeadlines);
        }

        return task.subDeadline;
    }

    findOrComputeSubDeadline(tasks, task, userDeadline) {
        let minExecutionTime = this.taskUtils.findMinTaskExecutionTime(task);
        let subDeadline;
        let originalTask = tasks.find(x => x.config.id === task.config.id);
        if (originalTask.subDeadline === undefined) {
            subDeadline = this.computeSubDeadline(tasks, originalTask, userDeadline);
        } else {
            subDeadline = originalTask.subDeadline;
        }
        // Average communication time = 0
        return (subDeadline - minExecutionTime);
    }

    decorateTasksWithUpwardRank(tasks) {
        tasks.forEach(task => {
            if (task.upwardRank === undefined) this.computeUpwardRank(tasks, task);
        });
    }

    computeUpwardRank(tasks, task) {
        let averageExecutionTime = this.computeAverageExecutionTime(task);
        let successors = tasks.filter(x => x.level === task.level + 1);

        if (successors.length === 0) {
            task.upwardRank = averageExecutionTime;
        } else {
            let successorRanks = successors.map(x => this.findOrComputeRank(tasks, x));
            task.upwardRank = averageExecutionTime + Math.max(...successorRanks);
        }

        return task.upwardRank;
    }

    findOrComputeRank(tasks, task) {
        // Average communication time = 0
        let originalTask = tasks.find(x => x.config.id === task.config.id);
        if (originalTask.upwardRank === undefined) {
            return this.computeUpwardRank(tasks, originalTask);
        } else {
            return originalTask.upwardRank;
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

    getExecutionTimeOfSchedule(newSchedule) {
        let allExecutionTimes = [];
        let tasks = newSchedule.tasks;
        let maximumLevel = this.taskUtils.findTasksMaxLevel(tasks);
        for (let i = 1; i <= maximumLevel; i++) {
            let timesForLevel = tasks.filter(task => task.level === i)
                .filter(task => task.config.deploymentType !== undefined)
                .map(task => task.finishTime[task.config.deploymentType] - task.startTime[task.config.deploymentType]);


            if (timesForLevel.length > 0) {
                let minimumForLevel = Math.max(...timesForLevel);
                allExecutionTimes.push(minimumForLevel);
            }
        }
        return allExecutionTimes.reduce(function (a, b) {
            return a + b
        }, 0);


        //
        //
        // const tasks = newSchedule.tasks;
        // let totalTime = 0;
        // let maximumLevel = this.taskUtils.findTasksMaxLevel(tasks);
        //
        // for (const level of _.range(maximumLevel)) {
        //     let timeOfLevel = 0;
        //     for (const task of this.taskUtils.findTasksFromLevel(tasks, level)) {
        //         let deploymentType = task.config.deploymentType;
        //         if (deploymentType !== undefined) {
        //             timeOfLevel = Math.max(timeOfLevel, task.finishTime[deploymentType] - task.startTime[deploymentType])
        //         }
        //     }
        //     totalTime += timeOfLevel;
        // }
        // return totalTime;
    }
}

module.exports = MOHEFT;
