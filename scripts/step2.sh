#!/usr/bin/env bash

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`
timeDecorator=${appdir}/dagscripts/time-decorator.js
dbwsDecorator=${appdir}/app.js
configPath=$1
config=${appdir}/${configPath}
dagPath=`jq -r '.dag' ${config}`
provider=`jq -r '.provider' ${config}`
algorithm=`jq -r '.algorithm' ${config}`
count=`jq '.count' ${config}`
functionTypesTitle=`jq -r '.functionTypes | join("_")' ${config}`

# Step 2
# Script responsible for preparing DBWS dag
# new DBWS dag will be created
# Run with .scripts/step2.sh configuration/config.json

folder=${provider}_${functionTypesTitle}x${count}
folderPath=${appdir}/results/step2/${folder}

mkdir -p ${folderPath}
echo Preparing DAG:

inputFile=${appdir}/results/step1/${folder}/normalized_logs.csv
outputFile=${appdir}/results/step2/${folder}/tmp-times.json
outputDag=${appdir}/results/step2/${folder}/dag-${algorithm}.json

echo Will decorate with times
echo node ${timeDecorator} ${dagPath} ${inputFile} ${outputFile}
node ${timeDecorator} ${dagPath} ${inputFile} ${outputFile}

echo Decorated with times
echo node ${dbwsDecorator} ${outputFile} ${outputDag}
node ${dbwsDecorator} ${outputFile} ${outputDag} ${config}

echo DAG ready
