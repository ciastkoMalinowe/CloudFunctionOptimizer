#!/usr/bin/env bash

dagPath=$1
logs_dir=$2

parsedLogsPath=./${logs_dir}/logs_parsed.csv
dbwsDagPath=./${logs_dir}/dag-dbws.json
extractedDagPath=./${logs_dir}/dag-extracted.json
extractedResultsPath=./${logs_dir}/extracted_results.csv
dbwsPlannedExecutionPath=./${logs_dir}/dbws_planned_execution.csv

echo Dag path: ${dagPath}
echo Logs dir is: ${logs_dir}

echo Started parsing logs...

./parse_log_aws.sh ./${logs_dir}/logs_1536.txt 1536 >> ${parsedLogsPath}
./parse_log_aws.sh ./${logs_dir}/logs_1024.txt 1024 >> ${parsedLogsPath}
./parse_log_aws.sh ./${logs_dir}/logs_512.txt 512 >> ${parsedLogsPath}
./parse_log_aws.sh ./${logs_dir}/logs_256.txt 256 >> ${parsedLogsPath}
#./parse_log_aws.sh ./${logs_dir}/logs_128.txt 128 >> ${parsedLogsPath}

echo Logs parsed! Output file is: ${parsedLogsPath}
echo Preparing dbws dag...

./run_dbws.sh ${dagPath} ${parsedLogsPath} ${dbwsDagPath}

echo DBWS dag done! Path to dag: ${dbwsDagPath}

echo Executing dbws dag...

./run.sh ${dbwsDagPath} ./${logs_dir}/logs_real.txt

echo Execution done!
echo Parsing dbws logs...

./parse_log_aws.sh ./${logs_dir}/logs_real.txt real >> ${parsedLogsPath}

echo Extracting times and prices...

./extract.sh ${dbwsDagPath} ${parsedLogsPath} ${extractedDagPath} ${extractedResultsPath} ${dbwsPlannedExecutionPath}

echo Done! Extracted times and prices: ${extractedResultsPath}

#echo Extracting dbws planned timestamps
#
#./extract_dbws.sh ${extractedDagPath} ${dbwsPlannedExecutionPath}

echo Extracted planned dbws timestamps: ${dbwsPlannedExecutionPath}

echo DONE!!