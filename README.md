# CloudFunctionOptimizer

1. Clone project
2. npm install
3. npm start

# SDBWS

Current version is prepared to run on AWS Lambda.

1. In `configuration/config.js`, set your cloud provider and resource memory sizes:
```
const FUNCTION_TYPES = ["256", "512", "1024", "1536"];
const PROVIDER = "AWS";
```
2. In `extractor/price.config.js` set pricing data.

3. Decorate DAG with task ids:
```
node dagscripts/id-decorator.js DAG_PATH OUTPUT_PATH
```

4. Run decorated DAG on all resources specified in `config.js`:
```
./run.sh DAG_PATH LOGS_DIR MEMORY_SIZE
```

5. Normalize timestamps from parsed logs:
```
node dagscripts/normalizer.js PARSED_LOGS_DIR NORMALIZED_CSV_PATH
```

6. Decorate DAG with times on resources:
```
node dagscripts/time-decorator.js DAG_PATH NORMALIZED_CSV_PATH OUTPUT_PATH
```
7. Run SDBWS algorithm to decorate DAG with planned deployment type:
```
node app.js DAG_PATH DECORATED_DAG_OUTPUT_PATH
```
DAG decorated with deployment type is ready to be executed.