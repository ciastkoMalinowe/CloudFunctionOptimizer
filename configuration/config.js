const DAG_PATH = "dag.json";
const RESULT_DAG_PATH = "decorated-dag.json";
const STRATEGY_MODULE_PATH = './strategies/montage-strategy';
const FUNCTION_EXECUTION_TIMES = '0.25.csv';
const PRICING_DATA = 'gcf_pricing.csv';
const FUNCTION_RESOURCE_TIMES_DATA = 'function_resource_times.csv';
const BUDGET_PARAMETER = 0.1;
const DEADLINE_PARAMETER = 0.3;
const FUNCTION_TYPES = ["128", "256", "512", "1024", "2048"];

module.exports = {
    "path" : DAG_PATH,
    "resultPath" : RESULT_DAG_PATH,
    "strategyPath" : STRATEGY_MODULE_PATH,
    "functionExecutionTimes" : FUNCTION_EXECUTION_TIMES,
    "pricingData": PRICING_DATA,
    "functionResourceTimes" : FUNCTION_RESOURCE_TIMES_DATA,
    "budgetParameter": BUDGET_PARAMETER,
    "deadlineParameter": DEADLINE_PARAMETER,
    "functionTypes"  : FUNCTION_TYPES
};