#!/usr/bin/env bash
# ./run_dbws.sh ./dag.json ./results.csv

taskDecorator=/home/asia/WebstormProjects/CloudFunctionOptimizer/dagscripts/time-decorator.js
dbwsDecorator=/home/asia/WebstormProjects/CloudFunctionOptimizer/app.js

dagPath=$1
dagDirPath=$(dirname "${dagPath}")
dagBaseName=$(basename "${dagPath}" .json)
csvPath=$2
outputPath=./output

mkdir ${outputPath}
node ${taskDecorator} ${dagPath} ${csvPath} ${outputPath}/${dagBaseName}-times.json
node ${dbwsDecorator} ${outputPath} ./${dagBaseName}-dbws.json
rm -r ${outputPath}
