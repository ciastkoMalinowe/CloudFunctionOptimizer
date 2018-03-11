const DAG_PATH = "dag.json";
const RESULT_DAG_PATH = "decorated-dag.json";
const BUDGET_PARAMETER = 0.1;
const DEADLINE_PARAMETER = 0.3;
const FUNCTION_TYPES = ["128", "256", "512", "1024", "2048"];
const GCF = {
  "128": {
    cpu: 200,
    price: 0.000000231
  },
  "256": {
    cpu: 400,
    price: 0.000000463
  },
  "512": {
    cpu: 800,
    price: 0.000000925
  },
  "1024": {
    cpu: 1400,
    price: 0.000001650
  },
  "2048": {
    cpu: 2400,
    price: 0.000002900
  },
};

module.exports = {
    "path" : DAG_PATH,
    "resultPath" : RESULT_DAG_PATH,
    "budgetParameter": BUDGET_PARAMETER,
    "deadlineParameter": DEADLINE_PARAMETER,
    "functionTypes"  : FUNCTION_TYPES,
    "gcf": GCF
};