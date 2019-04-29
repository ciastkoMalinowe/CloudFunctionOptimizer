#!/usr/bin/env bash

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`
configPath=$1
config=${appdir}/${configPath}
timeDecorator=${appdir}/dagscripts/time-decorator.js
extractor=${appdir}/dagscripts/extractor.js
averageResult=${appdir}/dagscripts/extract-real-avg.js

provider=`jq -r '.provider' ${config}`
count=`jq '.count' ${config}`
algorithm=`jq -r '.algorithm' ${config}`
functionTypesTitle=`jq -r '.functionTypes | join("_")' ${config}`

folder=${provider}_${functionTypesTitle}x${count}
dagPath=${appdir}/results/step2/${folder}/dag-${algorithm}.json
normalizedLogs=${appdir}/results/step3/${algorithm}-${folder}/normalized_logs.csv

# Step 3
# Script responsible for extracting results from
# prepared DAG and normalized logs
# Run with ./scripts/step4.sh configuration/config.json

outputFolder=${appdir}/results/step4/${algorithm}-${folder}
outputDag=${outputFolder}/dag-extracted.json
outputResults=${outputFolder}/extracted_results.csv
outputExecution=${outputFolder}/planned_execution.csv
outputAverage=${outputFolder}/average_execution.csv

mkdir -p ${outputFolder}

#Extracting times and prices...
echo node ${timeDecorator} ${dagPath} ${normalizedLogs} ${outputDag}
node ${timeDecorator} ${dagPath} ${normalizedLogs} ${outputDag}

echo node ${extractor} ${outputDag} ${outputResults} ${outputExecution}
node ${extractor} ${outputDag} ${outputResults} ${outputExecution} ${configPath}

echo node ${averageResult} ${outputDag} ${outputAverage}
node ${averageResult} ${outputDag} ${outputAverage}