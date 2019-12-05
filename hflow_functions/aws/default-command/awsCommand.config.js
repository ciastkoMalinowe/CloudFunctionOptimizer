const FUNCTION_TYPE = process.env.FUNCTION_TYPE ? process.env.FUNCTION_TYPE : "1536";

const AWS_BUCKET = "hyperflow.workflow.test";
const AWS_PATH = "results";

exports.functionType = FUNCTION_TYPE;

exports.resources = {
  "256": "https://tm8yi4eva1.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-256"
};

// Google cloud storage
exports.options = {
  "storage": "aws",
  "bucket": AWS_BUCKET,
  "prefix": AWS_PATH,
};

