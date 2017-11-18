const staticData = require('../csv_reader/read_csv');
const executionTimesFile = '0.25.csv';
const executionData = 'grafana_data_export.csv';
const pricingData = 'gcf_pricing.csv';

function montageDecorateStrategy(tasks) {
    tasks.forEach(task => {
        task.deploymentType = "2048";
    });

    let functionNames = new Set(tasks.map(task => task.name));
    let avgExecutionTimes = staticData.avgExecutionTimes(functionNames, executionTimesFile);
    avgExecutionTimes.then(times => console.log(times));

    let totalCost = staticData.totalCost(pricingData, executionData);
    totalCost.then(times => console.log(times));
}

module.exports = montageDecorateStrategy;