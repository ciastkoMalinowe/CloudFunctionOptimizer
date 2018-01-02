const DAG_PATH = "dag.json";
const RESULT_DAG_PATH = "decorated-dag.json";
const STRATEGY_MODULE_PATH = './strategies/montage-strategy';
const FUNCTION_EXECUTION_TIMES = '0.25.csv';
const EXECUTION_DATA = 'grafana_data_export.csv';
const PRICING_DATA = 'gcf_pricing.csv';

module.exports = {
    "path" : DAG_PATH,
    "resultPath" : RESULT_DAG_PATH,
    "strategyPath" : STRATEGY_MODULE_PATH,
    "functionExecutionTimes" : FUNCTION_EXECUTION_TIMES,
    "executionData": EXECUTION_DATA,
    "pricingData": PRICING_DATA
};