#!/usr/bin/env bash

#sample usage:
# ./scripts/parse_test_package.sh tests/montage_test_package/ tests/montage_test_package_decorated/ configuration/config.json

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`

inputDir=$1
outputDir=$2
config=$3
inputFiles=${inputDir}/*

normalizedLogs="./results-request-duration/montage/sdbcs_x5/step1/montage_AWS_256_512_1024_1536_2048_2560_3008x5/normalized_logs.csv"

parser=${appdir}/dagscripts/test_workflows/average_execution_times_decorator.js
averageExecution=${outputDir}average_execution.csv
mkdir -p ${outputDir}

for f in ${inputFiles}
do
    file="$(basename -- $f)"
    outputFile=${outputDir}${file}
    echo "Processing file: $file"
    echo node ${parser} ${f} ${normalizedLogs} ${outputFile} ${averageExecution} ${config}
    node ${parser} ${f} ${normalizedLogs} ${outputFile} ${averageExecution} ${config}
    echo "Done!"
done