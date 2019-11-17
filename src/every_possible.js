const pf = require('pareto-frontier');
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

        let bestCost = 10e8;
        let bestCostNotInConstrains = 10e8;
        let bestTime = 10e8;
        let bestTimeNotInConstrains = 10e8;

        let bestDagTime = _.cloneDeep(dag);
        let bestDagCost = _.cloneDeep(dag);
        let bestDagCostNotInConstrains = _.cloneDeep(dag);
        let bestDagTimeNotInConstrains = _.cloneDeep(dag);

        let starting = Number(this.config.starting);
        let everyN = Number(this.config.nth);

        console.log("Starting: " + starting);
        console.log("Nth: " + everyN);

        let numberOfIterations = (numberOfAllCombinations / 100) / everyN;
        console.log("Combinations to process: " + numberOfIterations);

        let paretoPoints = [];

        for (let i = 0; i <= numberOfIterations; i++) {
            let currentIndexOfComb = starting + everyN * i;
            if (i * everyN === 0) {
                currentIndexOfComb = starting;
            }

            let currentCombination = combination.nth(currentIndexOfComb);
            if (currentCombination === undefined) {
                break;
            }

            deltaCost = userBudget - minBudget;
            const resultOfSimulation = this.performSimulation(tasksSortedUpward, deltaCost, tasks, costEfficientFactor, currentCombination, sortedTasks);
            this.taskUtils.taskTimesCache = {};

            if (i % 100000 === 0) {
                console.log("-----------");
                console.log("Combinations so far: " + i);
                console.log("Finished: " + Math.round((i / numberOfIterations) * 100)+ "%");
                console.log("Time : " + new Date());
                console.log("Best cost so far: " + bestCost);
                console.log("Best time so far: " + bestTime);
                console.log("Best time so far: (not in constrains): " + bestTimeNotInConstrains);
                console.log("Best cost so far: (not in constrains): " + bestCostNotInConstrains);
                console.log("Pareto front length: " + paretoPoints.length);
            }

            // console.log("Cost: " + resultOfSimulation.cost + "\tTime: " + resultOfSimulation.time + "Constrain: " + userBudget + " " + userDeadline);
            // console.log(userDeadline);
            const inConstrains = (resultOfSimulation.cost < userBudget && resultOfSimulation.time < userDeadline) ? 1 : 0;

            // console.log(resultOfSimulation.time)

            if (inConstrains) {
                if (resultOfSimulation.cost < bestCost) {
                    bestCost = resultOfSimulation.cost;
                    bestDagCost = _.cloneDeep(dag);
                }

                if (resultOfSimulation.time < bestTime) {
                    bestTime = resultOfSimulation.time;
                    bestDagTime = _.cloneDeep(dag);
                }
            }

            if (resultOfSimulation.cost < bestCostNotInConstrains) {
                bestCostNotInConstrains = resultOfSimulation.cost;
                bestDagCostNotInConstrains = _.cloneDeep(dag);
            }

            if (resultOfSimulation.time < bestTimeNotInConstrains) {
                bestTimeNotInConstrains = resultOfSimulation.time;
                bestDagTimeNotInConstrains = _.cloneDeep(dag);
            }

            paretoPoints.push([resultOfSimulation.time, resultOfSimulation.cost])
            if (paretoPoints.length === 0) {
                paretoPoints.push([resultOfSimulation.time, resultOfSimulation.cost])
            } else {
                let newFront = pf.getParetoFrontier(paretoPoints);
                paretoPoints = newFront;
            }

            tasksSortedUpward.forEach(x => {
                x.config.deploymentType = undefined;
                x.config.scheduledStartTime = undefined;
                x.config.scheduledFinishTime = undefined
            });

        }

        console.log("Best const in constrains: " + bestCost + " Best time in constrains: : " + bestTime);

        let objectToSave = JSON.stringify(bestDagTime, null, 2);
        fs.writeFileSync("every_possible_output/bestDagTime" + starting + ".json", objectToSave);

        objectToSave = JSON.stringify(bestDagCost, null, 2);
        fs.writeFileSync("every_possible_output/bestDagCost" + starting + ".json", objectToSave);

        objectToSave = JSON.stringify(bestDagCostNotInConstrains, null, 2);
        fs.writeFileSync("every_possible_output/bestDagCostNotInConstrains" + starting + ".json", objectToSave);

        objectToSave = JSON.stringify(bestDagTimeNotInConstrains, null, 2);
        fs.writeFileSync("every_possible_output/bestDagTimeNotInConstrains" + starting + ".json", objectToSave);

        let paretoFrontWriteStream = fs.createWriteStream('every_possible_output/paretoFront' + starting + '.txt');
        paretoPoints.forEach(function (point) {
            paretoFrontWriteStream.write(point.join(', ') + '\n');
        });
        paretoFrontWriteStream.end();
    }

    performSimulation(tasksSortedUpward, deltaCost, tasks, costEfficientFactor, currentCombination, sortedTasks) {
        let plannedExecutionCost = 0;
        let cannotSchedule = false;
        tasksSortedUpward.forEach(
            task => {
                let selectedResource = currentCombination[task.config.id - 1];
                task.config.deploymentType = selectedResource;

                plannedExecutionCost += this.taskUtils.findTaskExecutionCostOnResource(task, selectedResource);
                Object.assign(task.config, this.getScheduldedTimesOnResource(tasks, task, selectedResource));
            }
        );

        const plannedExecutionTime = this.taskUtils.findPlannedExecutionTime(sortedTasks);
        if (cannotSchedule) {
            return {"time": Infinity, "cost": Infinity}
        }
        return {"time": plannedExecutionTime, "cost": plannedExecutionCost};
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

}

module.exports = SDBCS;

