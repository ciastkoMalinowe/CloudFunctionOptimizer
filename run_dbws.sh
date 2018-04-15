#!/usr/bin/env bash
# ./run_dbws.sh ./dag.json ./results.json

timeDecorator=/home/piotr/WebstormProjects/CloudFunctionOptimizer/dagscripts/time-decorator.js
dbwsDecorator=/home/piotr/WebstormProjects/CloudFunctionOptimizer/app.js

dagPath=$1
csvPath=$2
outputPath=$3

dagDirPath=$(dirname "${dagPath}")
dagBaseName=$(basename "${dagPath}" .json)
tmp=tmp-times.json

node ${timeDecorator} ${dagPath} ${csvPath} ./${tmp}
node --harmony ${dbwsDecorator}  ./${tmp} ${outputPath}
rm ./${tmp}
