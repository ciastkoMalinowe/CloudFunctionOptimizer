const FUNCTION_TYPE = process.env.FUNCTION_TYPE ? process.env.FUNCTION_TYPE : "lambda-2048"; // default resource

const AWS_BUCKET = "hyperflow-ellipsoids";
const AWS_PATH =  "data"//"data/2mass/0.5"; //e.g.data/2mass/0.25 data for ellipsoids

exports.functionType = FUNCTION_TYPE;

exports.resources = {
    "lambda-128": "queue url",
    "lambda-2048": "queue url"
};

exports.options = {
     "storage": "aws",
     "bucket": AWS_BUCKET,
     "prefix": AWS_PATH
 };

