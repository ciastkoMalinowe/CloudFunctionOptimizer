const FUNCTION_TYPE = process.env.FUNCTION_TYPE ? process.env.FUNCTION_TYPE : "1536"; // default resource

const AWS_BUCKET = "hyperflow-montage-2";
const AWS_PATH = "data/2mass/0.15"; //e.g.data/0.25

exports.functionType = FUNCTION_TYPE;

exports.resources = {
    "128": "https://7sdi1c5aqe.execute-api.us-east-1.amazonaws.com/dev/aws-executor-128",
    "256": "https://7sdi1c5aqe.execute-api.us-east-1.amazonaws.com/dev/aws-executor-256",
    "512": "https://7sdi1c5aqe.execute-api.us-east-1.amazonaws.com/dev/aws-executor-512",
    "1024": "https://7sdi1c5aqe.execute-api.us-east-1.amazonaws.com/dev/aws-executor-1024",
    "1536": "https://7sdi1c5aqe.execute-api.us-east-1.amazonaws.com/dev/aws-executor-1536",
    "2048": "https://7sdi1c5aqe.execute-api.us-east-1.amazonaws.com/dev/aws-executor-2048",
    "2560": "https://7sdi1c5aqe.execute-api.us-east-1.amazonaws.com/dev/aws-executor-2560",
    "3008": "https://7sdi1c5aqe.execute-api.us-east-1.amazonaws.com/dev/aws-executor-3008"
};

exports.options = {
     "storage": "aws",
     "bucket": AWS_BUCKET,
     "prefix": AWS_PATH
 };

