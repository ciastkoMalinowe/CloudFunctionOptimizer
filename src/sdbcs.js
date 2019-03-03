const config = require(process.env.CONFIG_PATH ? process.env.CONFIG_PATH : '../configuration/config.js');
const costFunctions = require('./cost-functions');
const taskUtils = require('./task-utilities');

function dbwsDecorateStrategy(dag) {
  const tasks = dag.tasks;

  decorateTasksWithLevels(tasks);
  const sortedTasks = tasks.sort((task1, task2) => task1.level - task2.level);

  const maxDeadline = costFunctions.maxDeadline(tasks);
  const minDeadline = costFunctions.minDeadline(tasks);

  const maxBudget = costFunctions.maxBudget(tasks);
  const minBudget = costFunctions.minBudget(tasks);

  const userDeadline = calculateUserDeadline(maxDeadline, minDeadline);
  const userBudget = calculateUserBudget(maxBudget, minBudget);

  console.log("userDeadline: " + userDeadline);
  console.log("userBudget: " + userBudget);

  if (userBudget < minBudget) {
    throw new Error("No possible schedule map")
  }

  decorateTasksWithUpwardRank(sortedTasks);
  decorateTasksWithSubdeadline(sortedTasks, userDeadline);

  const tasksSortedUpward = tasks.sort((task1, task2) => task2.upwardRank - task1.upwardRank);
  const costEfficientFactor = minBudget / userBudget;
  let deltaCost = userBudget - minBudget;
  tasksSortedUpward.forEach(
    task => {
      let maximumAvailableBudget = deltaCost + taskUtils.findMinTaskExecutionCost(task);
      let resourceMap = new Map();
      const admissibleProcesors = config.functionTypes.filter(p => isProcesorAdmisible(task, p, maximumAvailableBudget));
      if(admissibleProcesors.length ===0) throw new Error("No possible schedule map");
      admissibleProcesors.forEach(
        functionType => resourceMap.set(
          functionType,
          computeQualityMeasureForResource(tasks, task, functionType, costEfficientFactor)
        )
      );

      let maxQuality = Number.NEGATIVE_INFINITY;
      let selectedResource;

      for (let [functionType, quality] of resourceMap.entries()) {
        if (maxQuality < quality) {
          maxQuality = quality;
          selectedResource = functionType;
        }
      }

      task.config.deploymentType = selectedResource;
      // copy schedulded times to config
      Object.assign(task.config, getScheduldedTimesOnResource(tasks, task, selectedResource));
      deltaCost = deltaCost - [taskUtils.findTaskExecutionCostOnResource(task, selectedResource) - taskUtils.findMinTaskExecutionCost(task)]
    }
  );
}

function isProcesorAdmisible(task, procesor, maxBudget) {
  return taskUtils.findTaskExecutionCostOnResource(task, procesor) <= maxBudget;
}

function decorateTasksWithSubdeadline(tasks, userDeadline) {
  tasks.forEach(task => {
    if(task.subDeadline === undefined) computeSubDeadline(tasks, task, userDeadline);
  });
}

function computeSubDeadline(tasks, task, userDeadline) {
  let successors = tasks.filter( x => x.level === task.level + 1);

  if(successors.length === 0) {
    task.subDeadline = userDeadline;
  } else {
    let successorSubDeadlines = successors.map( x => findOrComputeSubDeadline(tasks, x, userDeadline));
    task.subDeadline = Math.min(...successorSubDeadlines);
  }

  return task.subDeadline;
}

function findOrComputeSubDeadline(tasks, task, userDeadline) {
  let minExecutionTime = taskUtils.findMinTaskExecutionTime(task);
  let subDeadline;
  let originalTask = tasks.find( x => x.config.id === task.config.id);
  if(originalTask.subDeadline === undefined) {
    subDeadline = computeSubDeadline(tasks, originalTask, userDeadline);
  } else {
    subDeadline = originalTask.subDeadline;
  }
  // Average communication time = 0
  return (subDeadline - minExecutionTime);
}

function decorateTasksWithUpwardRank(tasks) {
  tasks.forEach(task => {
    if(task.upwardRank === undefined) computeUpwardRank(tasks, task);
  });
}

function computeUpwardRank(tasks, task) {
  let averageExecutionTime = computeAverageExecutionTime(task);
  let successors = tasks.filter( x => x.level === task.level + 1);

  if(successors.length === 0) {
    task.upwardRank = averageExecutionTime;
  } else {
    let successorRanks = successors.map( x => findOrComputeRank(tasks, x));
    task.upwardRank = averageExecutionTime + Math.max(...successorRanks);
  }

  return task.upwardRank;
}

function findOrComputeRank(tasks, task) {
  // Average communication time = 0
  let originalTask = tasks.find( x => x.config.id === task.config.id);
  if(originalTask.upwardRank === undefined) {
    return computeUpwardRank(tasks, originalTask);
  } else {
    return originalTask.upwardRank;
  }
}

function decorateTasksWithLevels(tasks) {
  tasks.forEach(
    task => {
      let predecessors = taskUtils.findPredecessorForTask(tasks, task);
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

function addOverheads(tasks) {
  tasks.forEach(task => {
    config.functionTypes.forEach(resourceType => {
      task.resourceTimes[resourceType] += config.overheads[config.provider];
    })
  })
}

function computeQualityMeasureForResource(tasks, task, functionType, costEfficientFactor) {
  let timeQuality = computeTimeQuality(tasks, task, functionType);
  let costQuality = computeCostQuality(tasks, task, functionType);

  return timeQuality + costQuality * costEfficientFactor;
}

function computeTimeQuality(tasks, task, functionType) {
  let taskFinishTime = getScheduldedTimesOnResource(tasks, task, functionType).scheduledFinishTime;
  let inSubdeadline = taskFinishTime < task.subDeadline ? 1 : 0;

  let taskMaxFinishTime = taskUtils.findMaxTaskFinishTime(task);
  let taskMinFinishTime = taskUtils.findMinTaskFinishTime(task);

  if(taskMaxFinishTime === taskMinFinishTime) return 0;
  return (inSubdeadline * task.subDeadline - taskFinishTime) / (taskMaxFinishTime - taskMinFinishTime);
}

function computeCostQuality(tasks, task, functionType) {
  let taskFinishTime = getScheduldedTimesOnResource(tasks, task, functionType).scheduledFinishTime;
  let inSubdeadline = taskFinishTime < task.subDeadline ? 1 : 0;

  let taskCost = taskUtils.findTaskExecutionCostOnResource(task, functionType);
  let taskMaxCost = taskUtils.findMaxTaskExecutionCost(task);
  let taskMinCost = taskUtils.findMinTaskExecutionCost(task);

  if(taskMaxCost === taskMinCost) return 0;
  return ((taskMaxCost - taskCost) / (taskMaxCost - taskMinCost)) * inSubdeadline;
}

function getScheduldedTimesOnResource(tasks, task, functionType) {
  let predecessors = taskUtils.findPredecessorForTask(tasks, task);
  let delay = 0;
  let predecessorsMaxFinishTime = 0;

  if (predecessors.length > 0) {
    let pTask = taskUtils.findPredecessorWithLongestFinishTime(predecessors, functionType);
    delay = task.startTime[functionType] - pTask.finishTime[functionType];

    let predecessorsScheduldedFinishTimes = predecessors.map(pTask => pTask.config.scheduledFinishTime);
    predecessorsMaxFinishTime = Math.max(...predecessorsScheduldedFinishTimes);
  } else {
    //level 1 executor delay
    delay = task.startTime[functionType];
  }

  let newStartTime = predecessorsMaxFinishTime + delay;

  let executionTime = task.finishTime[functionType] - task.startTime[functionType];
  let newFinishTime = newStartTime + executionTime;

  return {
    "scheduledStartTime": newStartTime,
    "scheduledFinishTime": newFinishTime
  }
}

function computeAverageExecutionTime(task) {

  let total = 0;
  let times = config.functionTypes.map(functionType => {
    return task.finishTime[functionType] - task.startTime[functionType];
  });

  times.forEach(time => total += time);
  return total / times.length;
}

function calculateUserDeadline(maxDeadline, minDeadline) {
  return minDeadline + config.deadlineParameter * (maxDeadline - minDeadline);
}

function calculateUserBudget(maxBudget, minBudget) {
  return minBudget + config.budgetParameter * (maxBudget - minBudget);
}

function getMostExpensiveResourceType() {
  let prices = config.prices;
  let sortedByPrice = Object.keys(prices).sort((p1, p2) => prices[p1] - prices[p2]);

  return sortedByPrice[sortedByPrice.length - 1]; // return the most expensive resource
}

module.exports = {
  computeAverageExecutionTime,
  calculateUserDeadline,
  calculateUserBudget,
  getMostExpensiveResourceType,
  computeTimeQuality,
  computeCostQuality,
  computeQualityMeasureForResource,
  decorateStrategy: dbwsDecorateStrategy
};
