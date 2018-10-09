# CloudFunctionOptimizer

What will be needed:
- Node.js (https://nodejs.org)
- Redis (http://redis.io/)
- Application DAG
- Application binaries

## Montage - Example application

Check how to generate DAG, Montage data and binaries
```
https://github.com/malawski/hyperflow-gcf-executor
```
After those steps we should have:
1. dag.json
2. Montage inputs
3. Montage binaries

## Hyperflow - Lightweight execution engine

Install Hyperflow (https://github.com/hyperflow-wms/hyperflow):
```
npm install git://github.com/piotrek722/hyperflow.git#develop --save
```
Make sure that `hyperflow/bin` is added to your path.
`hyperflow/functions` directory contains the functions that will be executed by hyperflow.

## AWS

We are using serverless framework to deploy cloud functions.
To deploy functions we need to:

Install serverless (https://serverless.com/framework/docs/providers/aws/guide/installation/).

Copy application binaries to `CloudFunctionOptimizer/hflow_functions/aws/aws-executor`.

Change `aws-bucket` in `serverless.yml` to your S3 bucket name.

Run:
```
npm install
serverless deploy
```

Copy application binaries and inputs to S3 bucket.

Complete `hyperflow/functions/awsCommand.config.js`, put urls to your functions and path to S3 bucket.


## SDBWS

Running SDBWS consists of several steps:
- decorating DAG with ids,
- executing DAG on selected homogeneous resources,
- parsing logs from executions to obtain task times on al resources,
- normalizing task times,
- running SDBWS algorithm to produce decorated DAG,
- executing decorated DAG on resources assigned by the algorithm.

Current version is prepared to run on AWS Lambda.

1. In `configuration/config.js`, set your cloud provider, resource memory sizes and their pricing:
```
const FUNCTION_TYPES = ["256", "512", "1024", "1536"];
const PROVIDER = "AWS";

const PRICES = {
    "AWS" : {
        "256": 0.000000417,
        "512": 0.000000834,
        "1024": 0.000001667,
        "1536": 0.000002501
    }
}
```

2. Decorate DAG with task ids:
```
node dagscripts/id-decorator.js DAG_PATH OUTPUT_PATH
```

3. Run decorated DAG on all resources specified in `config.js`:
```
cd scripts
./run_workflow.sh DAG_PATH LOGS_DIR PROVIDER MEMORY_SIZE
```

4. Normalize timestamps from parsed logs:
```
node dagscripts/normalizer.js PARSED_LOGS_DIR NORMALIZED_CSV_PATH
```

5. Decorate DAG with times on resources:
```
node dagscripts/time-decorator.js DAG_PATH NORMALIZED_CSV_PATH OUTPUT_PATH
```
6. Run SDBWS algorithm to decorate DAG with planned deployment type:
```
node app.js DAG_PATH DECORATED_DAG_OUTPUT_PATH
```
DAG decorated with deployment type is ready to be executed.