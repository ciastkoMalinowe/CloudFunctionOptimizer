#!/usr/bin/env bash

#full path to config file
export CONFIG_PATH=

#ouput file name
export TEST_DAG_PATH=./sdbws-test-dag-decorated.json

node ../app.js ./sdbws-test-dag.json ${TEST_DAG_PATH}
node ../node_modules/mocha/bin/mocha app.test.js

rm ${TEST_DAG_PATH}