#!/bin/bash

# run 10 times on default resource
DAG_PATH=$1
OUTPUT=$2
echo Output path: ${OUTPUT}

for i in `seq 10`
do
    echo ${i}
    hflow run ${DAG_PATH} -s >> ${OUTPUT}
done