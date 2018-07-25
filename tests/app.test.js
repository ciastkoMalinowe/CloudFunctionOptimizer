const fs = require('fs');
const assert = require('assert');
const taskUtils = require("../src/task-utilities");
const costUtils = require("../src/cost-functions");
const config = require(process.env.CONFIG_PATH ? process.env.CONFIG_PATH : "../configuration/config.js");

const dagPath = process.env.TEST_DAG_PATH;
if(!config || !dagPath){ throw new Error("Invalid inputs!")}

console.log(`Test config: ${JSON.stringify(config, null, 2)}`);
console.log(`Test dag path: ${dagPath}`);
const dag = JSON.parse(fs.readFileSync(dagPath, "utf-8"));
const tasks = dag.tasks;

tasks.forEach(task => console.log(task));

describe('Cost-utils', function() {
    describe('#minDeadline(tasks)', function() {
        it('should return makespan equal 35200ms for faster type1', function() {
            let makespan = costUtils.minDeadline(tasks);
            assert.equal(makespan, 35200);
        });
        it('should return makespan equal 70400ms for slower type2', function() {
            let makespan = costUtils.maxDeadline(tasks);
            assert.equal(makespan, 70400);
        });
        it('should return cost equal 84.2$ for more expensive type1', function() {
            let cost = costUtils.minBudget(tasks);
            assert.equal(cost, 84.2);
        });
        it('should return makespan equal 84.2$ for cheaper type2', function() {
            let cost = costUtils.maxBudget(tasks);
            assert.equal(cost, 84.2);
        });
    });
});










