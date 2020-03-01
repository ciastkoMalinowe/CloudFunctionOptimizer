#!/usr/bin/env bash

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`
configPath=$1
config=${appdir}/${configPath}
normalizer=${appdir}/dagscripts/normalizer.js
dagPath=`jq -r '.dag' ${config}`
provider=`jq -r '.provider' ${config}`
count=`jq '.count' ${config}`
workflow=`jq -r '.workflow' ${config}`
functionTypesTitle=`jq -r '.functionTypes | join("_")' ${config}`

outputFolder=${appdir}/results/step1/${workflow}_${provider}_${functionTypesTitle}x${count}
outputFile=${outputFolder}/normalized_logs.csv

for functionType in $(jq -r '.functionTypes[]' ${config}); do

    folder=${appdir}/results/step1/${workflow}_${provider}_${functionType}x${count}

    echo Saving to ${folder}
    for ((i = 1; i <= count; i++))
    do
        if [[ ! -d "$folder/logs_$i.txt" ]] ;then
            node ${normalizer} ${folder}/logs_${i}.json ${outputFile}
        fi
    done
done