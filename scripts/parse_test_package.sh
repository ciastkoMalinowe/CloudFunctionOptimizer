#!/usr/bin/env bash

# usage: script test_package_path_dir output_dir config
# usage: ./scripts/parse_test_package.sh ./tests/montage_test_package ./tests/montage_test_package_decorated ./configuration/config.json

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`

inputDir=$1
outputDir=$2
config=$3
inputFiles=${inputDir}/*

normalizedLogs="./results-request-duration/montage/sdbcs_x5/step1/montage_AWS_256_512_1024_1536_2048_2560_3008x5/normalized_logs.csv"

timesDecorator=${appdir}/dagscripts/test_workflows/times_decorator.js
averageExecution=${appdir}/dagscripts/average_execution.js

averageTimesOutput=${outputDir}/average_execution_times.csv

mkdir -p ${outputDir}

# calculate averages times
node ${averageExecution} ${normalizedLogs} ${averageTimesOutput}

for f in ${inputFiles}
do
    file="$(basename -- $f)"
    outputFile=${outputDir}/${file}
    echo "Processing file: $file"
    echo node ${timesDecorator} ${f} ${averageTimesOutput} ${config} ${outputFile}
    node ${timesDecorator} ${f} ${averageTimesOutput} ${config} ${outputFile}
    echo "Done!"
done