const BUDGET_PARAMETER = 0.3;
const DEADLINE_PARAMETER = 0.7;
// TODO: Nafixuj żeby nie było potrzeby komentowania/odkomentowywania
// Zawsze ustaw tyle typów ile wywołujesz później
// const FUNCTION_TYPES = ["256", "512", "1024", "1536"];
// const FUNCTION_TYPES = ["512", "1024"];
// const FUNCTION_TYPES = ["3008"];
// const FUNCTION_TYPES = ["2560"];
// const FUNCTION_TYPES = ["2048"];
// const FUNCTION_TYPES = ["1536"];
const FUNCTION_TYPES = ["1024"];
// const FUNCTION_TYPES = ["512"];
// const FUNCTION_TYPES = ["256"];
// const FUNCTION_TYPES = ["128"];
const PROVIDER = "AWS";

const PRICES = {
  "AWS" : {
    // "128": 0.000000208,
    // "256": 0.000000417,
    // "512": 0.000000834,
    "1024": 0.000001667,
    // "1536": 0.000002501,
    // "2048": 0.000003334,
    // "2560": 0.000004168,
    // "3008": 0.000004897,
  },
  // "GCF" : {
  // "256": 0.000000463,
  // "512": 0.000000925,
  // "1024": 0.000001650,
  //     // "2048": 0.000002900
  // }
};

const OVERHEADS = {
  "AWS": 0.043,
  "GCF": 0.15,
  "IBM": 0.13
};

module.exports = {
  "budgetParameter": BUDGET_PARAMETER,
  "deadlineParameter": DEADLINE_PARAMETER,
  "functionTypes": FUNCTION_TYPES,
  "overhead": OVERHEADS[PROVIDER],
  "prices": PRICES[PROVIDER]
};