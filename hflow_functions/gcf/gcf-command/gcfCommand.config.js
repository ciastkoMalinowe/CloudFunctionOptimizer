const DEFAULT_URL  = process.env.DEFAULT_URL ? process.env.DEFAULT_URL : "https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_128";
const DEFAULT_RESOURCE = process.env.DEFAULT_RESOURCE ? process.env.DEFAULT_RESOURCE : "128";

const GOOGLE_BUCKET = "gcf-test123";
const GOOGLE_PATH   = "data/0.25";

exports.default_url = DEFAULT_URL;
exports.default_resource = DEFAULT_RESOURCE;

exports.resources = {
    "128": "https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_128",
    "256": "https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_256",
    "512": "https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_512",
    "1024": "https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_1024",
    "2048": "https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_2048"
};

// Google cloud storage
exports.options = {
     "storage": "google",
     "bucket": GOOGLE_BUCKET,
     "prefix": GOOGLE_PATH,
 };

