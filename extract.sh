#!/usr/bin/env bash
#./extract.sh ./dag.json ./logs_10.csv ./output.json ./output.csv

timeDecorator=/home/asia/WebstormProjects/CloudFunctionOptimizer/dagscripts/time-decorator.js
extractor=/home/asia/WebstormProjects/CloudFunctionOptimizer/extractor/extractor.js

dagPath=$1
csvPath=$2
outputDag=$3
outputCsv=$4

echo parameters: $@

node ${timeDecorator} ${dagPath} ${csvPath} ${outputDag}
node ${extractor} ${outputDag} ${outputCsv}
