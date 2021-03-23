const FUNCTION_TYPE = process.env.FUNCTION_TYPE ? process.env.FUNCTION_TYPE : "lambda-2048"; // default resource

const AWS_BUCKET = "hyperflow-montage";
const AWS_PATH =  "data/2mass/0.5"; //e.g.data/2mass/0.25 data for ellipsoids

exports.functionType = FUNCTION_TYPE;

exports.resources = {
    "lambda-128": "aws-executor-ellipsoids-dev-aws-executor-128",
    "lambda-2048": "aws-executor-montage-dev-aws-executor-2048",
    "lambda-1024": "aws-executor-montage-dev-aws-executor-1024"
};

exports.options = {
     "storage": "aws",
     "bucket": AWS_BUCKET,
     "prefix": AWS_PATH
 };

