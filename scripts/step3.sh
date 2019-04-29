#!/usr/bin/env bash

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`
configPath=$1
config=${appdir}/${configPath}
normalizer=${appdir}/dagscripts/normalizer.js
provider=`jq -r '.provider' ${config}`
count=`jq '.count' ${config}`
algorithm=`jq -r '.algorithm' ${config}`
functionTypesTitle=`jq -r '.functionTypes | join("_")' ${config}`

folder=${provider}_${functionTypesTitle}x${count}
dagPath=${appdir}/results/step2/${folder}/dag-${algorithm}.json
outputFolder=${appdir}/results/step3/${algorithm}-${folder}
outputFile=${outputFolder}/normalized_logs.csv

# Step 3
# Script responsible for running prepared DAG
# parsing and normalizing logs
# Run with ./scripts/step3.sh configuration/config.json

mkdir -p ${outputFolder}
printf "task id resource start end time downloaded executed uploaded type\n" > ${outputFile}

for ((i = 1; i <= count; i++))
do
    echo Saving to ${folder}
    # Run Hyperflow

    # Uncomment when workflow other than ellipsoids
    # ${appdir}/node_modules/hyperflow/bin/hflow run ${dagPath} -s >> ${outputFolder}/logs_${i}.txt

    # !!! Temporary HACK for running ellipsoids workflow !!!
    # Because hyperflow for some reason doesn't reach post-processing tasks during ellipsoids
    # workflow execution, the program must be terminated manually -> same hack used in step 3
    expect -c "set timeout 360; spawn ${appdir}/node_modules/hyperflow/bin/hflow run ${dagPath} -s; expect \", executable: summary.js\" {close}" >> ${outputFolder}/logs_${i}.txt

    echo Workflow finished! Parsing response...
    ${appdir}/scripts/parse_log.sh ${outputFolder}/logs_${i}.txt ${algorithm} ${provider} >> ${outputFolder}/logs_${i}.csv
    # Normalize
    node ${normalizer} ${outputFolder}/logs_${i}.csv ${outputFile}
done
