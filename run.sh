#!/bin/bash

# run 10 times on default resource
DAG_PATH=~/Programming/magisterka/data/0.25/workdir/dag.json
OUTPUT=$1
echo Output path: ${OUTPUT}

for i in `seq 10`
do
    echo ${i}
    hflow run ${DAG_PATH} -s >> ${OUTPUT}
done