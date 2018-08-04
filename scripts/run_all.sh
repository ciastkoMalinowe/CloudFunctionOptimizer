#!/usr/bin/env bash

dagPath=$1
logs_dir=$2
provider=$3

parsedLogsPath=./${logs_dir}/logs_parsed.csv
dbwsParsedLogsPath=./${logs_dir}/logs_parsed_with_dbws.csv
dbwsDagPath=./${logs_dir}/dag-dbws.json
extractedDagPath=./${logs_dir}/dag-extracted.json
extractedResultsPath=./${logs_dir}/extracted_results.csv
dbwsPlannedExecutionPath=./${logs_dir}/dbws_planned_execution.csv
realAvgExecutionPath=./${logs_dir}/real_avg_execution.csv

normalizer=/home/asia/WebstormProjects/CloudFunctionOptimizer/dagscripts/normalizer.js
realExtractor=/home/asia/WebstormProjects/CloudFunctionOptimizer/dagscripts/extract-real-avg.js

echo Dag path: ${dagPath}
echo Logs dir is: ${logs_dir}

echo Normalize timestamps

node ${normalizer} ${logs_dir}/parsed ${parsedLogsPath}

echo Logs parsed! Output file is: ${parsedLogsPath}
echo Preparing dbws dag...

./run_dbws.sh ${dagPath} ${parsedLogsPath} ${dbwsDagPath}

echo DBWS dag done! Path to dag: ${dbwsDagPath}

echo Executing dbws dag...

./run.sh ${dbwsDagPath} ./${logs_dir} real ${provider}

echo Execution done!
echo Normalize real logs...

node ${normalizer} ${logs_dir}/parsed ${dbwsParsedLogsPath}

echo Extracting times and prices...

./extract.sh ${dbwsDagPath} ${dbwsParsedLogsPath} ${extractedDagPath} ${extractedResultsPath} ${dbwsPlannedExecutionPath}

echo Done! Extracted times and prices: ${extractedResultsPath}

#echo Extracting dbws planned timestamps
#
#./extract_dbws.sh ${extractedDagPath} ${dbwsPlannedExecutionPath}

echo Extracted planned dbws timestamps: ${dbwsPlannedExecutionPath}

echo Extracting real avg timestamps

node ${realExtractor} ${extractedDagPath} ${realAvgExecutionPath}

echo DONE!!