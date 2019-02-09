#!/usr/bin/env bash
#./extract.sh ./dag.json ./logs_10.csv ./output.json ./output.csv

timeDecorator=../dagscripts/time-decorator.js
extractor=../dagscripts/extractor.js

dagPath=$1
csvPath=$2
outputDag=$3
outputCsv=$4
outputTimestampsCSV=$5

echo parameters: $@
echo node ${timeDecorator} ${dagPath} ${csvPath} ${outputDag}
node ${timeDecorator} ${dagPath} ${csvPath} ${outputDag}
echo ${extractor} ${outputDag} ${outputCsv} ${outputTimestampsCSV}
node ${extractor} ${outputDag} ${outputCsv} ${outputTimestampsCSV}
