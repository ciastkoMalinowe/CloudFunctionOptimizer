#!/usr/bin/env bash

dagPath=$1
logs_dir=$2
provider=$3
count=$4
functionTypes=(${@:5})

parsedLogsPath=./${logs_dir}/logs_parsed.csv
dbwsParsedLogsPath=./${logs_dir}/logs_parsed_with_dbws.csv
dbwsDagPath=./${logs_dir}/dag-dbws.json
extractedDagPath=./${logs_dir}/dag-extracted.json
extractedResultsPath=./${logs_dir}/extracted_results.csv
dbwsPlannedExecutionPath=./${logs_dir}/dbws_planned_execution.csv
realAvgExecutionPath=./${logs_dir}/real_avg_execution.csv

normalizer=../dagscripts/normalizer.js
realExtractor=../dagscripts/extract-real-avg.js

echo Dag path: ${dagPath}
echo Logs dir is: ${logs_dir}
echo Provider: ${provider}
echo Function types : ${functionTypes[@]}

mkdir ${logs_dir}/parsed

for functionType in "${functionTypes[@]}"
do
	echo Executing workflow for type: ${functionType}
	echo ./run_workflow.sh ${dagPath} ./${logs_dir} ${provider} ${functionType} ${count}
    ./run_workflow.sh ${dagPath} ./${logs_dir} ${provider} ${functionType} ${count}
done

echo Normalize timestamps

echo node ${normalizer} ${logs_dir}/parsed ${parsedLogsPath}
node ${normalizer} ${logs_dir}/parsed ${parsedLogsPath}

echo Logs parsed! Output file is: ${parsedLogsPath}
echo Preparing dbws dag...

echo ./run_dbws.sh ${dagPath} ${parsedLogsPath} ${dbwsDagPath}
./run_dbws.sh ${dagPath} ${parsedLogsPath} ${dbwsDagPath}

echo DBWS dag done! Path to dag: ${dbwsDagPath}

echo ./run_workflow.sh ${dbwsDagPath} ./${logs_dir} ${provider} real ${count}
./run_workflow.sh ${dbwsDagPath} ./${logs_dir} ${provider} real ${count}

echo Execution done!
echo Normalize real logs...

echo node ${normalizer} ${logs_dir}/parsed ${dbwsParsedLogsPath}
node ${normalizer} ${logs_dir}/parsed ${dbwsParsedLogsPath}

echo Extracting times and prices...

echo ./extract.sh ${dbwsDagPath} ${dbwsParsedLogsPath} ${extractedDagPath} ${extractedResultsPath} ${dbwsPlannedExecutionPath}
./extract.sh ${dbwsDagPath} ${dbwsParsedLogsPath} ${extractedDagPath} ${extractedResultsPath} ${dbwsPlannedExecutionPath}

echo Done! Extracted times and prices: ${extractedResultsPath}

echo Extracted planned dbws timestamps: ${dbwsPlannedExecutionPath}

echo Extracting real avg timestamps

echo node ${realExtractor} ${extractedDagPath} ${realAvgExecutionPath}
node ${realExtractor} ${extractedDagPath} ${realAvgExecutionPath}

echo DONE!