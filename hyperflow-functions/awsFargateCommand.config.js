exports.cluster_arn = {
  "fargate-512025": "fargate arn",
  "fargate-1050": "fargate arn",
  "fargate-21": "fargate arn",
  "fargate-42": "fargate arn"
}
exports.subnet_1 = {
  "fargate-512025": "subnet",
  "fargate-1050": "subnet",
  "fargate-21": "subnet",
  "fargate-42": "subnet"
};
exports.subnet_2 = {
  "fargate-512025": "subnet",
  "fargate-1050": "subnet",
  "fargate-21": "subnet",
  "fargate-42": "subnet"
};
exports.metrics = true;

exports.options = {
    "bucket": "hyperflow-soykb",
    "prefix": "example/input"
};

// task_executable_name : task_definition_name
exports.tasks_mapping = {
    "fargate-1050": "fargate-1050",
    "fargate-512025": "task512025",
    "fargate-21": "task18",//"task21",
    "fargate-42": "task42"
};


const FUNCTION_TYPE = process.env.FUNCTION_TYPE ? process.env.FUNCTION_TYPE : "fargate-21"; // default resource

exports.functionType = FUNCTION_TYPE;