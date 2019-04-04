#!/usr/bin/env bash

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`
configPath=$1
config=${appdir}/${configPath}
normalizer=${appdir}/dagscripts/normalizer.js
dagPath=`jq -r '.dag' ${config}`
provider=`jq -r '.provider' ${config}`
count=`jq '.count' ${config}`
functionTypesTitle=`jq -r '.functionTypes | join("_")' ${config}`

outputFolder=${appdir}/results/step1/${provider}_${functionTypesTitle}x${count}
outputFile=${outputFolder}/normalized_logs.csv

# Step 1
# Script responsible for running passed
# function types on lambdas a given number of times
# It returns normalized output all of functions
# Run with ./scripts/step1.sh configuration/config.json

mkdir -p ${outputFolder}
printf "task id resource start end time downloaded executed uploaded type\n" > ${outputFile}

for functionType in $(jq -r '.functionTypes[]' ${config}); do
	echo Executing workflow for type: ${functionType}
	export FUNCTION_TYPE=${functionType};
	folder=${appdir}/results/step1/${provider}_${functionType}x${count}
	# check if folder exists
#	if [ ! -d folder ]; then
#	    echo Results ${functionType}x${count} already exists in path: ${folder}
#	    echo Delete folder \"${folder}\" and try again
#    fi
	mkdir -p ${folder}
    for ((i = 1; i <= count; i++))
    do
        echo Saving to ${folder}
        # Run Hyperflow
        ${appdir}/node_modules/hyperflow/bin/hflow run ${dagPath} -s >> ${folder}/logs_${i}.txt
        echo Workflow finished! Parsing response...
        ${appdir}/scripts/parse_log.sh ${folder}/logs_${i}.txt ${functionType} ${provider} >> ${folder}/logs_${i}.csv
        # Normalize
        node ${normalizer} ${folder}/logs_${i}.csv ${outputFile}
    done
done