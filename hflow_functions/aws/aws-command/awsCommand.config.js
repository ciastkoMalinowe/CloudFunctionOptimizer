const DEFAULT_URL = "https://5evnffsdb6.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-1536";
const DEFAULT_RESOURCE = "1536";

const AWS_BUCKET = "aws-montage";
const AWS_PATH = "data/0.25";

exports.default_url = DEFAULT_URL;
exports.default_resource = DEFAULT_RESOURCE;

exports.resources = {
    "128": "https://5evnffsdb6.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-128",
    "256": "https://5evnffsdb6.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-256",
    "512": "https://5evnffsdb6.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-512",
    "1024": "https://5evnffsdb6.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-1024",
    "1536": "https://1tuz9skfr4.execute-api.eu-central-1.amazonaws.com/dev/aws-executor-1536"
};

// Google cloud storage
exports.options = {
     "storage": "google",
     "bucket": AWS_BUCKET,
     "prefix": AWS_PATH,
 };

