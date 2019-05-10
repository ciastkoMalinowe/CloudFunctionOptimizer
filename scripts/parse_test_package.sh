#!/usr/bin/env bash

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`

dir=$1
outputFolder=$2
directory=${dir}/*

normalizedLogs="./results/step1/montage_AWS_256_512_1024_1536_2048_2560_3008x5/normalized_logs.csv"


parser=${appdir}/dagscripts/test_workflows/avereage_execution_times_decorator.js

mkdir -p ${outputFolder}

for f in $directory
do
    file="$(basename -- $f)"
    outputFile=${outputFolder}/${file}
    echo "Parsing file: $file"
    echo node ${parser} ${f} ${normalizedLogs} ${outputFile}
#    node ${parser} ${f} ${normalizedLogs} ${outputFile}
done