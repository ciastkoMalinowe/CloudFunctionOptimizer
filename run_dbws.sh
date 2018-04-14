#!/usr/bin/env bash
# ./run_dbws.sh ./dag.json ./results.csv

taskDecorator=/home/piotr/WebstormProjects/CloudFunctionOptimizer/dagscripts/time-decorator.js
dbwsDecorator=/home/piotr/WebstormProjects/CloudFunctionOptimizer/app.js

dagPath=$1
dagDirPath=$(dirname "${dagPath}")
dagBaseName=$(basename "${dagPath}")
csvPath=$2
outputPath=${dagDirPath}/output

mkdir ${outputPath}
node ${taskDecorator} ${dagPath} ${csvPath} ${outputPath}/${dagBaseName}-times
node ${dbwsDecorator} ${outputPath} ${dagDirPath}-dbws
rm -r ${outputPath}
