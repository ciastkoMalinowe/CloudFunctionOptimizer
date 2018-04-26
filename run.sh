#!/bin/bash

# run 10 times on default resource
DAG_PATH=$1
OUTPUT_DIR=$2
TYPE=$3

echo Output path: ${TYPE}

mkdir ${OUTPUT_DIR}/parsed

for i in `seq 10`
do
    echo Saving to ${OUTPUT_DIR}/logs_${TYPE}_${i}.txt
    hflow run ${DAG_PATH} -s >> ${OUTPUT_DIR}/logs_${TYPE}_${i}.txt
    ./parse_log_aws.sh ${OUTPUT_DIR}/logs_${TYPE}_${i}.txt ${TYPE} >> ${OUTPUT_DIR}/parsed/logs_${TYPE}_${i}.csv
done