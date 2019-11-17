class CostFunctions {
  constructor(config, taskUtils) {
    this.config = config;
    this.taskUtils = taskUtils;
  }

  //minimum cost for task
  minBudget(tasks) {
    let costs = [];

    this.config.functionTypes.forEach(functionType => {
      let times = tasks.map(task => task.finishTime[functionType] - task.startTime[functionType]);
      let workflowCost = 0;
      times
        .map(time => Math.ceil(time / 100) * this.config.prices[this.config.provider][functionType])
        .forEach(cost => workflowCost += cost);
      costs.push(workflowCost);
    });

    return Math.min(...costs);
  }

  //maximum cost of task
  maxBudget(tasks) {
    let costs = [];

    this.config.functionTypes.forEach(functionType => {
      let times = tasks.map(task => task.finishTime[functionType] - task.startTime[functionType]);
      let workflowCost = 0;
      times
        .map(time => Math.ceil(time / 100) * this.config.prices[this.config.provider][functionType])
        .forEach(cost => workflowCost += cost);
      costs.push(workflowCost);
    });

    return Math.max(...costs);
  }

  minDeadline(tasks) {
    var allExecutionTimes = [];
    for(let i = 1; i < 10; i++){
      let minimumForLevel = Math.min(...tasks.filter(task => task.level === i).map(task => this.taskUtils.findMinTaskExecutionTime(task)));
      allExecutionTimes.push(minimumForLevel);
    }
    return allExecutionTimes.reduce(function(a,b){return a + b})
  }

  //task with biggest finish time
  maxDeadline(tasks) {
    // let maxLevel = this.taskUtils.findTasksMaxLevel(tasks);
    // let tasksFromMaxLevel = this.taskUtils.findTasksFromLevel(tasks, maxLevel);
    // let finishTimes = [];
    //
    // this.config.functionTypes.forEach(
    //   functionType => {
    //     finishTimes.push(
    //       Math.max(...tasksFromMaxLevel.map(task => task.finishTime[functionType]))
    //     )
    //   }
    // );
    //
    // return Math.max(...finishTimes);
    //

    var allExecutionTimes = [];
    for(let i = 1; i < 10; i++){
      let maximumForLevel = Math.max(...tasks.filter(task => task.level === i).map(task => this.taskUtils.findMaxTaskExecutionTime(task)));
      allExecutionTimes.push(maximumForLevel);
    }
    return allExecutionTimes.reduce(function(a,b){return a + b})

  }
}

module.exports = CostFunctions;
