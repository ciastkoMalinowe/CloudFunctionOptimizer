#!/usr/bin/env bash
# ./run_dbws.sh ./dag.json ./results.json

timeDecorator=/home/asia/WebstormProjects/CloudFunctionOptimizer/dagscripts/time-decorator.js
dbwsDecorator=/home/asia/WebstormProjects/CloudFunctionOptimizer/app.js

dagPath=$1
csvPath=$2
outputPath=$3

dagDirPath=$(dirname "${dagPath}")
dagBaseName=$(basename "${dagPath}" .json)
tmp=tmp-times.json

echo args: $@
echo Will decorate with times

node ${timeDecorator} ${dagPath} ${csvPath} ./${tmp}

echo Decorated with times

node --harmony ${dbwsDecorator}  ./${tmp} ${outputPath}

echo Dbws dag ready

#rm ./${tmp}