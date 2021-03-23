const FUNCTION_TYPE = process.env.FUNCTION_TYPE ? process.env.FUNCTION_TYPE : "lambda-2048"; // default resource

const AWS_BUCKET = "hyperflow-montage";
const AWS_PATH =  "data/2mass/0.5"; //e.g.data/0.25 data for ellipsoids

exports.functionType = FUNCTION_TYPE;

exports.resources = {
    "lambda-128": "aws-executor-ellipsoids-dev-aws-executor-128",
    "lambda-256": "aws-executor-ellipsoids-dev-aws-executor-256",
    "lambda-512": "aws-executor-ellipsoids-dev-aws-executor-512",
    "lambda-768": "aws-executor-ellipsoids-dev-aws-executor-768",
    "lambda-1024": "aws-executor-ellipsoids-dev-aws-executor-1024",
    "lambda-1280": "aws-executor-ellipsoids-dev-aws-executor-1280",
    "lambda-1536": "aws-executor-ellipsoids-dev-aws-executor-1536",
    "lambda-1792": "aws-executor-ellipsoids-dev-aws-executor-1792", 
    "lambda-2048": "aws-executor-montage-dev-aws-executor-2048",
    "lambda-2560": "aws-executor-ellipsoids-dev-aws-executor-2560",
    "lambda-3072": "aws-executor-ellipsoids-dev-aws-executor-3072",
    "lambda-4096": "aws-executor-ellipsoids-dev-aws-executor-4096",
    "lambda-5120": "aws-executor-ellipsoids-dev-aws-executor-5120",
    "lambda-6144": "aws-executor-ellipsoids-dev-aws-executor-6144"
};

exports.options = {
     "storage": "aws",
     "bucket": AWS_BUCKET,
     "prefix": AWS_PATH
 };

