const fs = require('fs');
const _ = require('lodash');
const SchedulingAlgorithm = require('./scheduling-algorithm.js');
const outputCSV = "./results.csv";
const Combinatorics = require('js-combinatorics');

class SDBCS extends SchedulingAlgorithm {

    constructor(config) {
        super(config);
    }

    decorateStrategy(dag) {
        const tasks = dag.tasks;

        this.decorateTasksWithLevels(tasks);
        const sortedTasks = tasks.sort((task1, task2) => task1.level - task2.level);

        const maxDeadline = this.costFunctions.maxDeadline(tasks);
        const minDeadline = this.costFunctions.minDeadline(tasks);
        console.log("maxDeadline: " + maxDeadline);
        console.log("minDeadline: " + minDeadline);

        const maxBudget = this.costFunctions.maxBudget(tasks);
        const minBudget = this.costFunctions.minBudget(tasks);

        const userDeadline = this.calculateUserDeadline(maxDeadline, minDeadline);
        const userBudget = this.calculateUserBudget(maxBudget, minBudget);

        console.log("userDeadline: " + userDeadline);
        console.log("userBudget: " + userBudget);

        // if (userBudget < minBudget) { throw new Error("No possible schedule map") }

        this.decorateTasksWithUpwardRank(sortedTasks);
        this.decorateTasksWithSubdeadline(sortedTasks, userDeadline);

        const tasksSortedUpward = tasks.sort((task1, task2) => task2.upwardRank - task1.upwardRank);
        const costEfficientFactor = minBudget / userBudget;
        let deltaCost = userBudget - minBudget;


        let numberOfTasks = tasksSortedUpward.length;
        let resources = this.config.functionTypes;
        let combination = Combinatorics.baseN(resources, numberOfTasks);
        let numberOfAllCombinations = combination.length;
        let bestCost = 10e5;

        let starting = Number(this.config.starting);
        let everyN = Number(this.config.nth);
        console.log("Starting: " + starting);
        console.log("Nth: " + everyN);

        for (let i = 0; i < numberOfAllCombinations / everyN; i++) {
            // console.log("i: " + i);
            // console.log("everyN * i: " + everyN * i);
            let currentIndexOfComb = starting + everyN * i;
            let currentCombination = combination.nth(currentIndexOfComb);
            if(i * everyN === 0){
                currentCombination = starting;
            }

            const resultOfSimulation = this.performSimulation(tasksSortedUpward, deltaCost, tasks, costEfficientFactor, currentCombination, sortedTasks);

            if (i % 100000 === 0) {
                console.log("-----------");
                console.log("Combinations so far: " + i);
                console.log("Time : " + new Date());
                console.log("Best cost so far: " + bestCost)
            }

            tasksSortedUpward.forEach(x => {
                x.config.deploymentType = undefined;
                x.config.scheduledStartTime = undefined;
                x.config.scheduledFinishTime = undefined
            });

            // console.log("Cost: " + resultOfSimulation.cost + "\tTime: " + resultOfSimulation.time + "Constrain: " + userBudget + " " + userDeadline);
            const inConstrains = (resultOfSimulation.cost < userBudget && resultOfSimulation.time < userDeadline) ? 1 : 0;

            if (inConstrains) {
                bestCost = resultOfSimulation.cost < bestCost ? resultOfSimulation.cost : bestCost;
            }

        }

        console.log("It is not possible to schedule!")
    }

    performSimulation(tasksSortedUpward, deltaCost, tasks, costEfficientFactor, currentCombination, sortedTasks) {
        return this.getPlannedExectuionTime(tasksSortedUpward, deltaCost, tasks, costEfficientFactor, currentCombination, sortedTasks);
    }

    getPlannedExectuionTime(tasksSortedUpward, deltaCost, tasks, costEfficientFactor, currentCombination, sortedTasks) {
        let plannedExecutionCost = 0;
        let cannotSchedule = false;
        tasksSortedUpward.forEach(
            task => {
                let maximumAvailableBudget = deltaCost + this.taskUtils.findMinTaskExecutionCost(task);
                const admissibleProcesors = this.config.functionTypes.filter(p => this.isProcesorAdmisible(task, p, maximumAvailableBudget));
                if (admissibleProcesors.length === 0) {
                    cannotSchedule = true;
                } else {
                    let selectedResource;

                    selectedResource = currentCombination[task.config.id - 1];
                    task.config.deploymentType = selectedResource;

                    plannedExecutionCost += this.taskUtils.findTaskExecutionCostOnResource(task, selectedResource);
                    Object.assign(task.config, this.getScheduldedTimesOnResource(tasks, task, selectedResource));
                    deltaCost = deltaCost - [this.taskUtils.findTaskExecutionCostOnResource(task, selectedResource) - this.taskUtils.findMinTaskExecutionCost(task)]
                }
            }
        );

        const plannedExecutionTime = this.taskUtils.findPlannedExecutionTime(sortedTasks);
        if (cannotSchedule) {
            return {"time": Infinity, "cost": Infinity}
        }
        return {"time": plannedExecutionTime, "cost": plannedExecutionCost};
    }

    isProcesorAdmisible(task, procesor, maxBudget) {
        return this.taskUtils.findTaskExecutionCostOnResource(task, procesor) <= maxBudget;
    }

    decorateTasksWithSubdeadline(tasks, userDeadline) {
        tasks.forEach(task => {
            if (task.subDeadline === undefined) this.computeSubDeadline(tasks, task, userDeadline);
        });
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

    computeQualityMeasureForResource(tasks, task, functionType, costEfficientFactor) {
        let timeQuality = this.computeTimeQuality(tasks, task, functionType);
        let costQuality = this.computeCostQuality(tasks, task, functionType);

        return timeQuality + costQuality * costEfficientFactor;
    }
}

module.exports = SDBCS;

