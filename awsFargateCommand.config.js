exports.cluster_arn = "arn:aws:ecs:eu-central-1:896714888603:cluster/default";
exports.subnet_1 = "subnet-0d1d210791df9b52c";
exports.subnet_2 = "string";
exports.metrics = true || false;

exports.options = {
    "bucket": "hyperflow.workflow.test.sdwbs",
    "prefix": "0.10"
};

// task_executable_name : task_definition_name
exports.tasks_mapping = {
    "mProjectPP" :  "arn:aws:ecs:eu-central-1:896714888603:task-definition/taskName:2"
};
