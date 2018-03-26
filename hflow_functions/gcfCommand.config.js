var DEFAULT_URL  = "https://us-central1-hello-173219.cloudfunctions.net/hyperflow_executor";

var GOOGLE_BUCKET = "gcf-test123";
var GOOGLE_PATH   = "data/0.25";

exports.default_url = DEFAULT_URL;

exports.resources = {
    "128": "url1",
    "256": "url2",
    "512": "url3",
    "1024": "url4",
    "2048": "url5"
};

// Google cloud storage
exports.options = {
     "storage": "google",
     "bucket": GOOGLE_BUCKET,
     "prefix": GOOGLE_PATH,
 };

