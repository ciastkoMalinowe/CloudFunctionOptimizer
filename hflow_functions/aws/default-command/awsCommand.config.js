const FUNCTION_TYPE = process.env.FUNCTION_TYPE ? process.env.FUNCTION_TYPE : "1536";

const AWS_BUCKET = "hyperflow.ellipsoids";
const AWS_PATH = "run";

exports.functionType = FUNCTION_TYPE;

exports.resources = {
  "128": "aws-executor-ellipsoids-dev-aws-executor-128",
  "256": "aws-executor-ellipsoids-dev-aws-executor-256",
  "512": "aws-executor-ellipsoids-dev-aws-executor-512",
  "1024": "aws-executor-ellipsoids-dev-aws-executor-1024",
  "1536": "aws-executor-ellipsoids-dev-aws-executor-1536",
  "2048": "aws-executor-ellipsoids-dev-aws-executor-2048",
  "2560": "aws-executor-ellipsoids-dev-aws-executor-2560",
  "3008": "aws-executor-ellipsoids-dev-aws-executor-3008",
};

// Google cloud storage
exports.options = {
  "storage": "aws",
  "bucket": AWS_BUCKET,
  "prefix": AWS_PATH,
};

