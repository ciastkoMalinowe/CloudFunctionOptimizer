#!/bin/bash

DAG_PATH=$1
OUTPUT_DIR=$2
PROVIDER=$3
TYPE=$4
COUNT=$5

# export env variable for hyperflow command
export FUNCTION_TYPE=${TYPE};

for ((i = 1; i <= COUNT; i++))
do
    echo Saving to ${OUTPUT_DIR}/logs_${TYPE}_${i}.txt
    hflow run ${DAG_PATH} -s >> ${OUTPUT_DIR}/logs_${TYPE}_${i}.txt
    ./parse_log.sh ${OUTPUT_DIR}/logs_${TYPE}_${i}.txt ${TYPE} ${PROVIDER} >> ${OUTPUT_DIR}/parsed/logs_${TYPE}_${i}.csv
done
