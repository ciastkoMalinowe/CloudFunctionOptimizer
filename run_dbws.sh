#!/usr/bin/env bash
# ./run_dbws.sh ./dag.json ./results.json

taskDecorator=/home/asia/WebstormProjects/CloudFunctionOptimizer/dagscripts/time-decorator.js
dbwsDecorator=/home/asia/WebstormProjects/CloudFunctionOptimizer/app.js

dagPath=$1
csvPath=$2
outputPath=$3

dagDirPath=$(dirname "${dagPath}")
dagBaseName=$(basename "${dagPath}" .json)
csvPath=$2
outputPath=./output
outputFile=$3

mkdir ${outputPath}
node ${taskDecorator} ${dagPath} ${csvPath} ${outputPath}/${dagBaseName}-times.json
node ${dbwsDecorator} ${outputPath} ${outputFile}
rm -r ${outputPath}
