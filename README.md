# CloudFunctionOptimizer

## Hyperflow

Install Hyperflow (https://github.com/hyperflow-wms/hyperflow):
```
npm install git://github.com/piotrek722/hyperflow.git#develop --save
```

## Montage

Check how to generate DAG, Montage data and run it on Google Cloud Functions here:
```
https://github.com/malawski/hyperflow-gcf-executor
```

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