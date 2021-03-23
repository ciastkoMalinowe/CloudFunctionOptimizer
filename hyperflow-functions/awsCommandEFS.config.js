const FUNCTION_TYPE = process.env.FUNCTION_TYPE ? process.env.FUNCTION_TYPE : "lambda-1024"; // default resource

const AWS_BUCKET = "hyperflow-ellipsoids";
const AWS_PATH =  "data";//"data/2mass/0.15"; //e.g.data/0.25 data for ellipsoids

exports.functionType = FUNCTION_TYPE;

exports.resources = {
    "lambda-1024": "https://al28m6k9cd.execute-api.eu-west-1.amazonaws.com/dev/aws-executor-1024",
    "lambda-128":  "https://mifnm22ftk.execute-api.us-east-1.amazonaws.com/dev/aws-executor-128",
};

exports.options = {
     "storage": "aws",
     "bucket": AWS_BUCKET,
     "prefix": AWS_PATH
 };


