const DAG_PATH = "dags/dag.json";
const RESULT_DAG_PATH = "dags/output/decorated-dag.json";
const BUDGET_PARAMETER = 0.3;
const DEADLINE_PARAMETER = 0.1;
const FUNCTION_TYPES = ["256", "512", "1024", "1536"]; //"128",
const PROVIDER = "AWS"; // "AWS" "GCF" "IBM"

const GCF = {
  // "128": {
  //   cpu: 200,
  //   price: 0.000000231
  // },
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
  }
};

const AWS = {
  "256": {
    cpu: 400,
    price: 0.000000417
  },
  "512": {
    cpu: 800,
    price: 0.000000834
  },
  "1024": {
    cpu: 1400,
    price: 0.000001667
  },
  "1536": {
    cpu: 2400,
    price: 0.000002501
  }
};

const OVERHEADS = {
  "AWS": 0.043,
  "GCF": 0.15,
  "IBM": 0.13
};

module.exports = {
    "path" : DAG_PATH,
    "resultPath" : RESULT_DAG_PATH,
    "budgetParameter": BUDGET_PARAMETER,
    "deadlineParameter": DEADLINE_PARAMETER,
    "functionTypes"  : FUNCTION_TYPES,
    "provider" : PROVIDER,
    "overheads": OVERHEADS,
    "gcf": AWS
};