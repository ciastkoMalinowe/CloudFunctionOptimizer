const fs = require('fs');
const assert = require('assert');
const taskUtils = require("../src/task-utilities");
const costUtils = require("../src/cost-functions");
const config = require(process.env.CONFIG_PATH ? process.env.CONFIG_PATH : "../configuration/config.js");

const dagPath = process.env.TEST_DAG_PATH;
if (!config || !dagPath) {
    throw new Error("Invalid inputs!")
}

const dag = JSON.parse(fs.readFileSync(dagPath, "utf-8"));
const tasks = dag.tasks;
const firstTask = tasks[0];
const lastTask = tasks[tasks.length - 1];

describe('Cost-utils', function () {
    it('should return makespan equal 35200ms for faster type1', function () {
        let makespan = costUtils.minDeadline(tasks);
        assert.equal(makespan, 35200);
    });
    it('should return makespan equal 70400ms for slower type2', function () {
        let makespan = costUtils.maxDeadline(tasks);
        assert.equal(makespan, 70400);
    });
    it('should return cost equal 84.2$ for more expensive type1', function () {
        let cost = costUtils.minBudget(tasks);
        assert.equal(cost, 84.2);
    });
    it('should return makespan equal 105.25$ for cheaper type2', function () {
        let cost = costUtils.maxBudget(tasks);
        assert.equal(cost, 105.25);
    });
});

describe('Task-utils', function () {
    it('should find task predecessors', function () {
        let firstTaskPredecessors = taskUtils.findPredecessorForTask(tasks, firstTask);
        assert.equal(firstTaskPredecessors.length, 0);

        let lastTaskPredecessors = taskUtils.findPredecessorForTask(tasks, lastTask);
        assert.equal(lastTaskPredecessors.length, 2);
        assert.equal(lastTaskPredecessors[0].name, "level4");
        assert.equal(lastTaskPredecessors[1].name, "level4");
    });
    it('should find task successors', function () {
        let firstTaskSuccessors = taskUtils.findSuccessorsForTask(tasks, firstTask);
        assert.equal(firstTaskSuccessors.length, 3);
        assert.equal(firstTaskSuccessors[0].name, "level2");
        assert.equal(firstTaskSuccessors[1].name, "level2");
        assert.equal(firstTaskSuccessors[2].name, "level2");

        let lastTaskSuccessors = taskUtils.findSuccessorsForTask(tasks, lastTask);
        assert.equal(lastTaskSuccessors.length, 0);
    });
    it('should find tasks from given level', function () {
        let entryTasks = taskUtils.findTasksFromLevel(tasks, 1);
        assert.equal(entryTasks.length, 1);
        assert.equal(entryTasks[0].name, "level1");

        let secondLevelTasks = taskUtils.findTasksFromLevel(tasks, 2);
        assert.equal(secondLevelTasks.length, 3);
        assert.equal(secondLevelTasks[0].name, "level2");
        assert.equal(secondLevelTasks[1].name, "level2");
        assert.equal(secondLevelTasks[2].name, "level2");

        let lastLevelTasks = taskUtils.findTasksFromLevel(tasks, 5);
        assert.equal(lastLevelTasks.length, 1);
        assert.equal(lastLevelTasks[0].name, "level5");
    });
    it('should return max level equal to 5', function () {
        let maxLevel = taskUtils.findTasksMaxLevel(tasks);
        assert.equal(maxLevel, 5)
    });
    it('should return the biggest execution time for given task', function () {
        let firstTaskExecutionTime = taskUtils.findMaxTaskExecutionTime(firstTask);
        assert.equal(firstTaskExecutionTime, 10000);
        let secondLevelTaskExecutionTime = taskUtils.findMaxTaskExecutionTime(tasks[1]);
        assert.equal(secondLevelTaskExecutionTime, 4200);
        let lastTaskExeuctionTime = taskUtils.findMaxTaskExecutionTime(lastTask)
        assert.equal(lastTaskExeuctionTime, 20000);
    });
    it('should return the smallest execution time for given task', function () {
        let firstTaskExecutionTime = taskUtils.findMinTaskExecutionTime(firstTask);
        assert.equal(firstTaskExecutionTime, 5000);
        let secondLevelTaskExecutionTime = taskUtils.findMinTaskExecutionTime(tasks[1]);
        assert.equal(secondLevelTaskExecutionTime, 2100);
        let lastTaskExeuctionTime = taskUtils.findMinTaskExecutionTime(lastTask)
        assert.equal(lastTaskExeuctionTime, 10000);
    });
    it('should return the biggest cost for given task', function () {
        let firstTaskCost = taskUtils.findMaxTaskExecutionCost(firstTask);
        assert.equal(firstTaskCost, 12.5);
        let secondLevelTaskCost = taskUtils.findMaxTaskExecutionCost(tasks[1]);
        assert.equal(secondLevelTaskCost, 5.25);
        let lastTaskCost = taskUtils.findMaxTaskExecutionCost(lastTask)
        assert.equal(lastTaskCost, 25);
    });
    it('should return the smallest cost for given task', function () {
        let firstTaskExecutionTime = taskUtils.findMinTaskExecutionCost(firstTask);
        assert.equal(firstTaskExecutionTime, 10);
        let secondLevelTaskExecutionTime = taskUtils.findMinTaskExecutionCost(tasks[1]);
        assert.equal(secondLevelTaskExecutionTime, 4.2);
        let lastTaskExeuctionTime = taskUtils.findMinTaskExecutionCost(lastTask)
        assert.equal(lastTaskExeuctionTime, 20);
    });
    it('should return task execution cost on given function type', function () {
        let firstTaskCostOnType1 = taskUtils.findTaskExecutionCostOnResource(firstTask, "type1");
        let firstTaskCostOnType2 = taskUtils.findTaskExecutionCostOnResource(firstTask, "type2");
        assert.equal(firstTaskCostOnType1, 12.5);
        assert.equal(firstTaskCostOnType2, 10);
        let lastTaskCostOnType1 = taskUtils.findTaskExecutionCostOnResource(lastTask, "type1");
        let lastTaskCostOnType2 = taskUtils.findTaskExecutionCostOnResource(lastTask, "type2");
        assert.equal(lastTaskCostOnType1, 25);
        assert.equal(lastTaskCostOnType2, 20);
    });
    it('should return predecessor with the longest finish time', function () {
        let predecessor1 = taskUtils.findPredecessorWithLongestFinishTime(tasks, lastTask, "type1");
        assert.equal(predecessor1.finishTime["type1"], 25200);
        assert.equal(predecessor1.name, "level4");
        let predecessor2 = taskUtils.findPredecessorWithLongestFinishTime(tasks, lastTask, "type2");
        assert.equal(predecessor2.finishTime["type2"], 50400);
        assert.equal(predecessor2.name, "level4");
    });
});






