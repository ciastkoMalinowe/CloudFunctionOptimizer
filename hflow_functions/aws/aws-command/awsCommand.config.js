const FUNCTION_TYPE = process.env.FUNCTION_TYPE ? process.env.FUNCTION_TYPE : "1536";

const AWS_BUCKET = "asia-mgr";
const AWS_PATH = "data/0.25";

exports.functionType = FUNCTION_TYPE;

exports.resources = {
    "128": "https://tej6fdgafk.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-128",
    "256": "https://tej6fdgafk.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-256",
    "512": "https://tej6fdgafk.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-512",
    "1024": "https://tej6fdgafk.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-1024",
    "1536": "https://tej6fdgafk.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-1536",
    "2048": "https://tej6fdgafk.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-2048",
    "2560": "https://tej6fdgafk.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-2560",
    "3008": "https://tej6fdgafk.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-3008"
};

// Google cloud storage
exports.options = {
     "storage": "aws",
     "bucket": AWS_BUCKET,
     "prefix": AWS_PATH,
 };

