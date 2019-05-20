#!/usr/bin/env bash

# usage: script.sh config_template.json dag_input_dir dag_output_dir
# usage: ./scripts/schedule_test_package.sh configuration/test_package/config_test_package.json.template tests/montage_test_package_decorated tests/montage_test_package_scheduled

scriptdir=`dirname "$0"`
appdir=`dirname "${scriptdir}"`
schedulingDecorator=${appdir}/app.js

configTemplatePath=$1
configTemplate=${appdir}/${configTemplatePath}

inputDAGDir=$2
outputDAGDir=$3

algorithms=( sdbws sdbcs )
budgets=(0.3 0.5 0.7)
deadlines=(0.3 0.5 0.7)

for alg in "${algorithms[@]}"
do
    mkdir -p ${appdir}/${outputDAGDir}/${alg}

    for budget in "${budgets[@]}"
    do
        for deadline in "${deadlines[@]}"
        do
            outputFolder=${appdir}/${outputDAGDir}/${alg}/B_${budget}xD_${deadline}
            mkdir -p ${outputFolder}
            for dag in ${appdir}/${inputDAGDir}/*
            do

                baseFileName=$(basename -s .json ${dag})
                outputDAG=${outputFolder}/${baseFileName}.scheduled.json
                config=${outputFolder}/configs/${baseFileName}.config.json
                mkdir -p ${outputFolder}/configs/

                echo "Processing ${baseFileName}"

                # prepare config for given dag

                cp ${configTemplate} ${config}
                sed -e "s/BUDGET/${budget}/" -i "" ${config}
                sed -e "s/DEADLINE/${deadline}/" -i "" ${config}
                sed -e "s/ALGORITHM/${alg}/" -i "" ${config}

                echo "Scheduling DAG: ${dag}"
                echo node ${schedulingDecorator} ${dag} ${outputDAG} ${config}
                node ${schedulingDecorator} ${dag} ${outputDAG} ${config}
            done
        done
    done
done
