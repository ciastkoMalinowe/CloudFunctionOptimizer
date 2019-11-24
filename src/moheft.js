const fs = require('fs');
const _ = require('lodash');
const SchedulingAlgorithm = require('./scheduling-algorithm.js');
const outputCSV = "./results.csv";
var LinkedList = require('dbly-linked-list');

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

        // if (userBudget < minBudget) { throw new Error("No possible schedule map") }

        this.decorateTasksWithUpwardRank(sortedTasks);
        const tasksSortedUpward = tasks.sort((task1, task2) => task2.upwardRank - task1.upwardRank);

        let schedules = [];
        schedules.push(dag);
        let maxNumberOfSchedules = 50;


        tasksSortedUpward.forEach(
            task => {
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


                //
                //
                //
                // task.config.deploymentType = selectedResource;
                //
                // // plannedExecutionCost += this.taskUtils.findTaskExecutionCostOnResource(task, selectedResource);
                //
                // Object.assign(task.config, this.getScheduldedTimesOnResource(tasks, task, selectedResource));
                // deltaCost = deltaCost - [this.taskUtils.findTaskExecutionCostOnResource(task, selectedResource) - this.taskUtils.findMinTaskExecutionCost(task)]
            }
        );


        for (const schedule of schedules) {
            console.log(schedule.time + ' , ' + schedule.cost)
            // console.log(this.getExecutionTimeOfSchedule(schedule));
            // console.log(schedule.tasks.map(task => task.config.deploymentType))
        }


        const plannedExecutionTime = this.taskUtils.findPlannedExecutionTime(sortedTasks);
        const inConstrains = (plannedExecutionCost < userBudget && plannedExecutionTime < userDeadline) ? 1 : 0;
        console.log("Planned execution time: " + plannedExecutionTime);
        console.log("Planned execution cost: " + plannedExecutionCost);
        console.log("In constrains? : " + inConstrains);

        tasksSortedUpward.forEach(task => {
                console.log(task.config.id + " : " + task.config.deploymentType)
            }
        );

        fs.appendFileSync(outputCSV, `${maxDeadline} ${minDeadline} ${userDeadline} ${plannedExecutionTime} ${maxBudget} ${minBudget} ${userBudget} ${plannedExecutionCost} ${inConstrains}\n`);
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


            if(timesForLevel.length > 0){
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
