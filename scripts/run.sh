#!/bin/bash

# run 10 times on default resource
function run_homogeneous_dag(){
    for i in `seq 10`
    do
        echo Saving to ${OUTPUT_DIR}/logs_${TYPE}_${i}.txt
        hflow run ${DAG_PATH} -s >> ${OUTPUT_DIR}/logs_${TYPE}_${i}.txt
        ./parse_log.sh ${OUTPUT_DIR}/logs_${TYPE}_${i}.txt ${TYPE} ${PROVIDER} >> ${OUTPUT_DIR}/parsed/logs_${TYPE}_${i}.csv
    done
}

DAG_PATH=$1
OUTPUT_DIR=$2
TYPE=$3
PROVIDER=$4

#echo Output path: ${TYPE}
#mkdir ${OUTPUT_DIR}/parsed

export DEFAULT_URL="https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_256";
export DEFAULT_RESOURCE="256";
run_homogeneous_dag

export DEFAULT_URL="https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_512";
export DEFAULT_RESOURCE="512";
run_homogeneous_dag

export DEFAULT_URL="https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_1024";
export DEFAULT_RESOURCE="1024";
run_homogeneous_dag

export DEFAULT_URL="https://us-central1-asia-172718.cloudfunctions.net/hyperflow_executor_2048";
export DEFAULT_RESOURCE="2048";
run_homogeneous_dag




