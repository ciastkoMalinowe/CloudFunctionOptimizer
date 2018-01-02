const staticData = require('../csv_reader/read_csv');
const config = require('../configuration/config');

function montageDecorateStrategy(tasks) {

    // prepare data
    let functionNames = new Set(tasks.map(task => task.name));
    let avgExecutionTimes = staticData.avgExecutionTimes(functionNames, config.functionExecutionTimes);
    // avgExecutionTimes.then(times => console.log(times));

    let totalCost = staticData.totalCost(config.pricingData, config.executionData);
    totalCost.then(times => console.log(times));


    let deadline = 10;
    let budget = 10;

    //algorithm

    //compute each task rank

    //add levels to tasks
    let leveledTasks = decorateWithLevels(tasks);



    tasks.forEach(task => {
        task.deploymentType = "2048";
    });
}
function getInitialEdges(tasks) {
  let edges = new Set();
  tasks.forEach(task => {
    if (task.name === "mProjectPP") {
      task.ins.forEach(ins => {
        edges.add(ins);
      });
    }
  });
  return edges;
}

function getEdges(tasks, level) {
  let edges = new Set();
  tasks.forEach(task => {
    if (task.level === level) {
      task.ins.forEach(ins => {
        edges.add(ins);
      });
    }
  });
  return edges;
}

function decorateWithLevels(tasks) {

  let level = 0;
  let sortedTasks = [];
  let currentLevelTaskOuts = [];

  let startNode = {
    "name": "start",
    "level": level,
    "outs": []
  };

  startNode.outs = getInitialEdges(tasks);
  sortedTasks[0] = startNode;
  console.log(sortedTasks);

  //get all tasks that have initial edges as ins
  let nextLevelTasks = new Set();
  tasks.forEach(task => {
    task.ins.forEach(ins => {
      if (startNode.outs.has(ins)) {
        nextLevelTasks.add(task);
      }
    })
  });
  // console.log(nextLevelTasks);
  //add levels
  level += 1;
  nextLevelTasks.forEach(task => {
    task.level = level;
  });

  //put tasks from that level to sortedTasks
  sortedTasks[level] = nextLevelTasks;

  //get outs from nextLevelTasks
  currentLevelTaskOuts = getEdges(nextLevelTasks, level);
  console.log(sortedTasks);

  //TODO make it in a loop



  // let currentIns = [];
  // let currentOuts = [];
  //
  // tasks.forEach(task => {
  //
  //   let taskIns = task.ins;
  //   let dependant = false;
  //
  //   taskIns.forEach(taskIn => {
  //     if (currentOuts.includes(taskIn)) {
  //       dependant = true;
  //     }
  //   });
  //   // console.log(dependant);
  //
  //   currentIns = task.ins;
  //   currentOuts = task.outs;
  // });

  return tasks;
}

module.exports = montageDecorateStrategy;
